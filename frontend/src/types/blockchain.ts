// TypeScript types for the Mini Blockchain SPA

export type Block = {
  index: number;
  timestamp: string; // ISO
  transactions: string[] | null; // Can be null from API
  prevHash: string;
  hash: string;
  nonce: number;
  merkleRoot: string;
};

export type SearchHit = { 
  blockIndex: number; 
  tx: string; 
};

export type TxRecord = {
  tx: string;
  status: "mempool" | "confirmed";
  blockIndex: number | null;
};

export type ApiError = {
  error: string;
};

export type AddTransactionResponse = {
  status: "queued";
};