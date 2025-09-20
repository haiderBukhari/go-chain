package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

type hit struct {
	BlockIndex int    `json:"blockIndex"`
	Tx         string `json:"tx"`
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
	
	q := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	w.Header().Set("Content-Type", "application/json")
	if q == "" { json.NewEncoder(w).Encode([]hit{}); return }

	mu.Lock(); defer mu.Unlock()
	var out []hit
	for _, b := range chain {
		for _, tx := range b.Transactions {
			if strings.Contains(strings.ToLower(tx), q) {
				out = append(out, hit{BlockIndex: b.Index, Tx: tx})
			}
		}
	}
	json.NewEncoder(w).Encode(out)
}
