package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

var mempool []string

type txReq struct{ Tx string `json:"tx"` }

func Handler(w http.ResponseWriter, r *http.Request) {
	// Allow all CORS requests
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent); return
	}
	
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed); return
	}
	var body txReq
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest); return
	}
	tx := strings.TrimSpace(body.Tx)
	if tx == "" {
		http.Error(w, `{"error":"tx is required"}`, http.StatusBadRequest); return
	}
	mu.Lock()
	mempool = append(mempool, tx)
	mu.Unlock()
	json.NewEncoder(w).Encode(map[string]string{"status":"queued"})
}
