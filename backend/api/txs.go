package handler

import (
	"encoding/json"
	"net/http"
)

type TxRecord struct {
	Tx         string `json:"tx"`
	Status     string `json:"status"`     // "mempool" | "confirmed"
	BlockIndex *int   `json:"blockIndex"` // nil if mempool
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
	
	w.Header().Set("Content-Type","application/json")
	mu.Lock(); defer mu.Unlock()

	var out []TxRecord
	for _, t := range mempool {
		out = append(out, TxRecord{Tx:t, Status:"mempool", BlockIndex:nil})
	}
	for _, b := range chain {
		for _, t := range b.Transactions {
			idx := b.Index
			out = append(out, TxRecord{Tx:t, Status:"confirmed", BlockIndex:&idx})
		}
	}
	json.NewEncoder(w).Encode(out)
}
