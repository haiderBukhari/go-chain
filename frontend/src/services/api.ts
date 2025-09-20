// API service for Mini Blockchain backend communication

import type { Block, SearchHit, TxRecord, AddTransactionResponse } from "@/types/blockchain";

const BASE_URL = "https://go-chain-l878.vercel.app/api";

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function addTransaction(tx: string): Promise<AddTransactionResponse> {
  try {
    const response = await fetch(`${BASE_URL}/tx`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ tx })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error || "Failed to add transaction", response.status);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Network error: Could not connect to blockchain node");
  }
}

export async function mineBlock(): Promise<Block> {
  try {
    const response = await fetch(`${BASE_URL}/mine`, { 
      method: "POST" 
    });

    if (!response.ok) {
      throw new ApiError("Failed to mine block", response.status);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Network error: Could not connect to blockchain node");
  }
}

export async function getBlockchain(): Promise<Block[]> {
  try {
    const response = await fetch(`${BASE_URL}/chain`);

    if (!response.ok) {
      throw new ApiError("Failed to fetch blockchain", response.status);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Network error: Could not connect to blockchain node");
  }
}

export async function searchTransactions(query: string): Promise<SearchHit[]> {
  try {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new ApiError("Failed to search transactions", response.status);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Network error: Could not connect to blockchain node");
  }
}

export async function getAllTransactions(): Promise<TxRecord[]> {
  try {
    const response = await fetch(`${BASE_URL}/txs`);

    if (!response.ok) {
      throw new ApiError("Failed to fetch transactions", response.status);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Network error: Could not connect to blockchain node");
  }
}