import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Clock, CheckCircle2 } from "lucide-react";
import type { TxRecord } from "@/types/blockchain";

interface TransactionTableProps {
  transactions: TxRecord[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  // Ensure transactions is always an array
  const safeTransactions = transactions || [];
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "mempool":
        return <Clock className="h-3 w-3" />;
      case "confirmed":
        return <CheckCircle2 className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "mempool":
        return "secondary";
      case "confirmed":
        return "default";
      default:
        return "destructive";
    }
  };

  return (
    <Card className="gradient-card shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-secondary" />
          All Transactions
          <Badge variant="outline" className="ml-auto">
            {safeTransactions.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {safeTransactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No transactions yet. Add your first transaction above!
          </p>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Transaction</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Block</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeTransactions.map((tx, index) => (
                  <TableRow 
                    key={index}
                    className="hover:bg-muted/20 transition-smooth"
                  >
                    <TableCell>
                      <code className="hash-text text-foreground bg-background/30 px-2 py-1 rounded">
                        {tx.tx}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(tx.status)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getStatusIcon(tx.status)}
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tx.blockIndex === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <Badge variant="outline" className="font-mono">
                          #{tx.blockIndex}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}