package handler

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"
)

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
	// WARNING: In serverless, memory doesn't persist reliably across invocations.
	// For a demo it's fine, but for persistence use a DB (Vercel KV/Redis, Postgres, etc).
	mu    sync.Mutex
	chain []Block
)

func init() {
	// Lazy init genesis only once per cold start
	if len(chain) == 0 {
		gen := Block{
			Index:        0,
			Timestamp:    time.Now().UTC(),
			Transactions: []string{"genesis"},
			PrevHash:     "0000000000000000000000000000000000000000000000000000000000000000",
			Hash:         "genesis-hash-demo",
			Nonce:        0,
			MerkleRoot:   "genesis-merkle-demo",
		}
		chain = []Block{gen}
	}
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
	
	mu.Lock()
	defer mu.Unlock()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chain)
}
