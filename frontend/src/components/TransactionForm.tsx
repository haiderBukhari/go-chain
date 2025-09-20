import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Pickaxe, Loader2 } from "lucide-react";
import { addTransaction, mineBlock } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface TransactionFormProps {
  onTransactionAdded: () => void;
  onBlockMined: () => void;
  transactions: any[]; // Add transactions prop to check mempool
}

export function TransactionForm({ onTransactionAdded, onBlockMined, transactions }: TransactionFormProps) {
  const [txInput, setTxInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const { toast } = useToast();

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txInput.trim()) return;

    setIsAdding(true);
    try {
      await addTransaction(txInput.trim());
      setTxInput("");
      onTransactionAdded();
      toast({
        title: "Transaction Added",
        description: "Transaction has been queued for mining",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add transaction",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleMineBlock = async () => {
    // Check if there are unconfirmed transactions in mempool
    const safeTransactions = transactions || [];
    const mempoolTxs = safeTransactions.filter(tx => tx.status === "mempool");
    
    if (mempoolTxs.length === 0) {
      toast({
        title: "No Transactions to Mine",
        description: "Add some transactions first before mining a block",
        variant: "destructive",
      });
      return;
    }

    setIsMining(true);
    try {
      const newBlock = await mineBlock();
      onBlockMined();
      toast({
        title: "Block Mined! 🎉",
        description: `Block #${newBlock.index} mined with ${newBlock.transactions?.length || 0} transactions`,
      });
    } catch (error) {
      toast({
        title: "Mining Failed",
        description: error instanceof Error ? error.message : "Failed to mine block",
        variant: "destructive",
      });
    } finally {
      setIsMining(false);
    }
  };

  return (
    <Card className="gradient-card shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-primary" />
          Add Transaction & Mine
        </CardTitle>
        <CardDescription>
          Add multiple transactions first, then mine to seal them in a block
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAddTransaction} className="flex gap-3">
          <Input
            value={txInput}
            onChange={(e) => setTxInput(e.target.value)}
            placeholder="Enter transaction (e.g., 'Alice pays Bob 10')"
            className="flex-1 bg-muted/50 border-border/50 focus:border-primary transition-smooth"
            disabled={isAdding}
          />
          <Button 
            type="submit" 
            disabled={isAdding || !txInput.trim()}
            className="bg-primary hover:bg-primary/90 transition-smooth"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </>
            )}
          </Button>
        </form>
        
        <Button
          onClick={handleMineBlock}
          disabled={isMining}
          size="lg"
          className={`w-full gradient-mining text-warning-foreground font-semibold transition-bounce ${
            isMining ? "mining-pulse" : "hover:shadow-mining"
          }`}
        >
          {isMining ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Mining Block...
            </>
          ) : (
            <>
              <Pickaxe className="h-5 w-5 mr-2" />
              ⛏️ Mine Block
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}