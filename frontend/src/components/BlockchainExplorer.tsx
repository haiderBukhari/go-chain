import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Blocks, Hash, Clock, Layers } from "lucide-react";
import { useState } from "react";
import type { Block } from "@/types/blockchain";

interface BlockchainExplorerProps {
  blocks: Block[];
}

export function BlockchainExplorer({ blocks }: BlockchainExplorerProps) {
  // Ensure blocks is always an array
  const safeBlocks = blocks || [];
  const [openBlocks, setOpenBlocks] = useState<Set<number>>(new Set());

  const toggleBlock = (blockIndex: number) => {
    const newOpenBlocks = new Set(openBlocks);
    if (newOpenBlocks.has(blockIndex)) {
      newOpenBlocks.delete(blockIndex);
    } else {
      newOpenBlocks.add(blockIndex);
    }
    setOpenBlocks(newOpenBlocks);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatHash = (hash: string, maxLength: number = 16) => {
    if (hash.length <= maxLength) return hash;
    return `${hash.substring(0, maxLength)}...${hash.substring(hash.length - 4)}`;
  };

  return (
    <Card className="gradient-card shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Blocks className="h-5 w-5 text-primary" />
          Full Blockchain
          <Badge variant="outline" className="ml-auto">
            {safeBlocks.length} block{safeBlocks.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {safeBlocks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No blocks in the chain yet. Mine your first block!
          </p>
        ) : (
          <div className="space-y-3">
            {safeBlocks.map((block) => (
              <Collapsible 
                key={block.index}
                open={openBlocks.has(block.index)}
                onOpenChange={() => toggleBlock(block.index)}
              >
                <div className="border border-border/50 rounded-lg overflow-hidden bg-background/30">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto text-left hover:bg-muted/30 transition-smooth"
                    >
                      <div className="flex items-center gap-3">
                        {openBlocks.has(block.index) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-primary">
                            Block #{block.index}
                          </span>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {formatTimestamp(block.timestamp)}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {(block.transactions || []).length} tx{(block.transactions || []).length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {formatHash(block.hash)}
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="block-expand">
                    <div className="p-4 pt-0 space-y-4 border-t border-border/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-sm">Previous Hash:</span>
                          </div>
                          <code className="hash-text text-muted-foreground bg-background/50 p-2 rounded block break-all">
                            {block.prevHash}
                          </code>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-sm">Current Hash:</span>
                          </div>
                          <code className="hash-text text-primary bg-background/50 p-2 rounded block break-all">
                            {block.hash}
                          </code>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-accent" />
                            <span className="font-semibold text-sm">Nonce:</span>
                          </div>
                          <Badge variant="outline" className="font-mono text-gray-700">
                            {block.nonce.toLocaleString()}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-secondary" />
                            <span className="font-semibold text-sm">Merkle Root:</span>
                          </div>
                          <code className="hash-text text-primary bg-background/50 p-2 rounded block break-all">
                            {block.merkleRoot}
                          </code>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-foreground" />
                          <span className="font-semibold text-sm">Transactions:</span>
                          <Badge variant="default">
                            {(block.transactions || []).length}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {(block.transactions || []).map((tx, txIndex) => (
                            <div
                              key={txIndex}
                              className="p-3 bg-background/50 rounded border border-border/30"
                            >
                              <code className="hash-text text-foreground">
                                {tx}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}