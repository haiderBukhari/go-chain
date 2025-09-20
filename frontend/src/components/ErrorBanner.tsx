import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorBannerProps {
  error: string;
  onDismiss: () => void;
}

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-auto p-1 hover:bg-destructive/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}