package handler

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

func sha256Hex(b []byte) string {
	sum := sha256.Sum256(b); return hex.EncodeToString(sum[:])
}

func buildMerkleRoot(txs []string) string {
	if len(txs) == 0 { return sha256Hex([]byte("")) }
	level := make([]string, 0, len(txs))
	for _, t := range txs { level = append(level, sha256Hex([]byte(t))) }
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

const difficulty = 4

func hasLeadingZerosHex(s string, n int) bool {
	if n > len(s) { return false }
	for i := 0; i < n; i++ { if s[i] != '0' { return false } }
	return true
}

func Handler(w http.ResponseWriter, r *http.Request) {
	// Allow all CORS requests
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed); return
	}
	mu.Lock()
	defer mu.Unlock()

	prev := chain[len(chain)-1]
	txs := append([]string(nil), mempool...)
	newBlock := Block{
		Index:        prev.Index + 1,
		Timestamp:    time.Now().UTC(),
		Transactions: txs,
		PrevHash:     prev.Hash,
		MerkleRoot:   buildMerkleRoot(txs),
	}
	var nonce uint64
	for {
		h := calcHash(newBlock.Index, newBlock.Timestamp, newBlock.MerkleRoot, newBlock.PrevHash, nonce)
		if hasLeadingZerosHex(h, difficulty) {
			newBlock.Nonce = nonce
			newBlock.Hash = h
			break
		}
		nonce++
	}
	chain = append(chain, newBlock)
	mempool = nil
	json.NewEncoder(w).Encode(newBlock)
}
