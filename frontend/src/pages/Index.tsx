import { useEffect, useState } from "react";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionSearch } from "@/components/TransactionSearch";
import { TransactionTable } from "@/components/TransactionTable";
import { BlockchainExplorer } from "@/components/BlockchainExplorer";
import { ErrorBanner } from "@/components/ErrorBanner";
import { getBlockchain, getAllTransactions } from "@/services/api";
import type { Block, TxRecord } from "@/types/blockchain";
import { Blocks, Cpu } from "lucide-react";

const Index = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactions, setTransactions] = useState<TxRecord[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const loadBlockchain = async () => {
    try {
      const chainData = await getBlockchain();
      setBlocks(chainData);
    } catch (err) {
      console.error("Failed to load blockchain:", err);
      setError(err instanceof Error ? err.message : "Failed to load blockchain");
    }
  };

  const loadTransactions = async () => {
    try {
      const txData = await getAllTransactions();
      setTransactions(txData);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      await Promise.all([loadBlockchain(), loadTransactions()]);
    } catch (err) {
      // Error handling is done in individual functions
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTransactionAdded = () => {
    loadTransactions();
  };

  const handleBlockMined = () => {
    loadBlockchain();
    loadTransactions();
  };

  const dismissError = () => {
    setError("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Blocks className="h-16 w-16 text-primary mx-auto mb-4" />
          </div>
          <h2 className="text-2xl font-semibold">Loading Blockchain...</h2>
          <p className="text-muted-foreground">Connecting to blockchain API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Blocks className="h-12 w-12 text-primary" />
              <Cpu className="h-6 w-6 text-accent absolute -bottom-1 -right-1" />
            </div>
            <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
              Haider Bukhari Blockchain
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Add transactions, mine blocks, and explore the chain.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <ErrorBanner error={error} onDismiss={dismissError} />
        )}

        {/* Transaction Form & Mining */}
        <TransactionForm 
          onTransactionAdded={handleTransactionAdded}
          onBlockMined={handleBlockMined}
          transactions={transactions}
        />

        {/* Search Transactions */}
        <TransactionSearch />

        {/* All Transactions Table */}
        <TransactionTable transactions={transactions} />

        {/* Blockchain Explorer */}
        <BlockchainExplorer blocks={blocks} />

        {/* Footer */}
        <div className="text-center pt-8 border-t border-border/30">
          <p className="text-sm text-muted-foreground">
            Connected to blockchain API at{" "}
            <code className="hash-text bg-muted px-2 py-1 rounded text-xs font-mono">
              go-chain-l878.vercel.app/api
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
