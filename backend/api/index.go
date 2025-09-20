package handler

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

/* ---------- Types & State (in-memory per instance) ---------- */

type Block struct {
	Index        int       `json:"index"`
	Timestamp    time.Time `json:"timestamp"`
	Transactions []string  `json:"transactions"`
	PrevHash     string    `json:"prevHash"`
	Hash         string    `json:"hash"`
	Nonce        uint64    `json:"nonce"`
	MerkleRoot   string    `json:"merkleRoot"`
}

var (
	mu      sync.Mutex
	chain   []Block
	mempool []string
)

func init() {
	// Cold-start init (serverless: not guaranteed across invocations)
	if len(chain) == 0 {
		genTxs := []string{"genesis"}
		gen := Block{
			Index:        0,
			Timestamp:    time.Now().UTC(),
			Transactions: genTxs,
			PrevHash:     strings.Repeat("0", 64),
			Nonce:        0,
			MerkleRoot:   buildMerkleRoot(genTxs),
		}
		gen.Hash = calcHash(gen.Index, gen.Timestamp, gen.MerkleRoot, gen.PrevHash, gen.Nonce)
		chain = []Block{gen}
	}
}

/* ---------- Helpers ---------- */

func allowAllCORS(w http.ResponseWriter, r *http.Request) bool {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return false
	}
	return true
}

func sha256Hex(b []byte) string {
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])
}

func buildMerkleRoot(txs []string) string {
	if len(txs) == 0 {
		return sha256Hex([]byte(""))
	}
	level := make([]string, 0, len(txs))
	for _, tx := range txs {
		level = append(level, sha256Hex([]byte(tx)))
	}
	for len(level) > 1 {
		var next []string
		for i := 0; i < len(level); i += 2 {
			if i+1 == len(level) {
				next = append(next, sha256Hex([]byte(level[i]+level[i])))
			} else {
				next = append(next, sha256Hex([]byte(level[i]+level[i+1])))
			}
		}
		level = next
	}
	return level[0]
}

func calcHash(index int, ts time.Time, mr, prev string, nonce uint64) string {
	header := fmt.Sprintf("%d|%d|%s|%s|%d", index, ts.UnixNano(), mr, prev, nonce)
	return sha256Hex([]byte(header))
}

func hasLeadingZerosHex(s string, n int) bool {
	if n > len(s) {
		return false
	}
	for i := 0; i < n; i++ {
		if s[i] != '0' {
			return false
		}
	}
	return true
}

/* ---------- Handlers (internal) ---------- */

func handleChain(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()
	writeJSON(w, http.StatusOK, chain)
}

func handleTx(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var body struct{ Tx string `json:"tx"` }
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest)
		return
	}
	tx := strings.TrimSpace(body.Tx)
	if tx == "" {
		http.Error(w, `{"error":"tx is required"}`, http.StatusBadRequest)
		return
	}
	mu.Lock()
	mempool = append(mempool, tx)
	mu.Unlock()
	writeJSON(w, http.StatusOK, map[string]string{"status": "queued"})
}

func handleMine(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	const difficulty = 4

	mu.Lock()
	defer mu.Unlock()

	prev := chain[len(chain)-1]
	txs := append([]string(nil), mempool...)
	nb := Block{
		Index:        prev.Index + 1,
		Timestamp:    time.Now().UTC(),
		Transactions: txs,
		PrevHash:     prev.Hash,
		MerkleRoot:   buildMerkleRoot(txs),
	}

	var nonce uint64
	for {
		h := calcHash(nb.Index, nb.Timestamp, nb.MerkleRoot, nb.PrevHash, nonce)
		if hasLeadingZerosHex(h, difficulty) {
			nb.Nonce = nonce
			nb.Hash = h
			break
		}
		nonce++
	}

	chain = append(chain, nb)
	mempool = nil
	writeJSON(w, http.StatusOK, nb)
}

func handleSearch(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	if q == "" {
		writeJSON(w, http.StatusOK, []any{})
		return
	}
	type hit struct {
		BlockIndex int    `json:"blockIndex"`
		Tx         string `json:"tx"`
	}

	mu.Lock()
	defer mu.Unlock()
	var out []hit
	for _, b := range chain {
		for _, tx := range b.Transactions {
			if strings.Contains(strings.ToLower(tx), q) {
				out = append(out, hit{BlockIndex: b.Index, Tx: tx})
			}
		}
	}
	writeJSON(w, http.StatusOK, out)
}

func handleTxs(w http.ResponseWriter, r *http.Request) {
	type TxRecord struct {
		Tx         string `json:"tx"`
		Status     string `json:"status"`
		BlockIndex *int   `json:"blockIndex"`
	}
	mu.Lock()
	defer mu.Unlock()

	var out []TxRecord
	for _, t := range mempool {
		out = append(out, TxRecord{Tx: t, Status: "mempool", BlockIndex: nil})
	}
	for _, b := range chain {
		for _, t := range b.Transactions {
			idx := b.Index
			out = append(out, TxRecord{Tx: t, Status: "confirmed", BlockIndex: &idx})
		}
	}
	writeJSON(w, http.StatusOK, out)
}

/* ---------- Router entrypoint ---------- */

func Handler(w http.ResponseWriter, r *http.Request) {
	if !allowAllCORS(w, r) { return }

	path := r.URL.Path
	// The function is mounted at /api/index (and /api via rewrite).
	// We'll route by the suffix after /api.
	switch {
	case strings.HasSuffix(path, "/chain"):
		handleChain(w, r)
	case strings.HasSuffix(path, "/tx"):
		handleTx(w, r)
	case strings.HasSuffix(path, "/mine"):
		handleMine(w, r)
	case strings.HasSuffix(path, "/search"):
		handleSearch(w, r)
	case strings.HasSuffix(path, "/txs"):
		handleTxs(w, r)
	default:
		// For /api (root), show a tiny index
		writeJSON(w, http.StatusOK, map[string]any{
			"endpoints": []string{"/api/chain", "/api/tx (POST)", "/api/mine (POST)", "/api/search?q=...", "/api/txs"},
		})
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}