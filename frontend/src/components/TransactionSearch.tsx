import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Hash } from "lucide-react";
import { searchTransactions } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { SearchHit } from "@/types/blockchain";

export function TransactionSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const searchResults = await searchTransactions(query.trim());
      setResults(searchResults);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search transactions",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="gradient-card shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-accent" />
          Search Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in confirmed transactions..."
            className="flex-1 bg-muted/50 border-border/50 focus:border-accent transition-smooth"
          />
          <Button 
            type="submit" 
            disabled={isSearching || !query.trim()}
            variant="secondary"
            className="bg-accent hover:bg-accent/90 text-accent-foreground transition-smooth"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>

        {hasSearched && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No results found for "{query}"
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}:
                </p>
                {(results || []).map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
                  >
                    <Hash className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="font-semibold text-primary">
                      Block #{result.blockIndex}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <code className="hash-text text-foreground bg-background/50 px-2 py-1 rounded flex-1">
                      {result.tx}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}