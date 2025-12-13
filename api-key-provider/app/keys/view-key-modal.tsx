"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// Note: getDecryptedApiKey n'existe plus avec le système de hash
// Les clés API ne peuvent être vues qu'à leur création
// import { getDecryptedApiKey } from '@/app/actions/api-key-actions';
import {
  Eye,
  EyeOff,
  Copy,
  CheckCheck,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface ViewKeyModalProps {
  open: boolean;
  onClose: () => void;
  keyId: string;
}

export function ViewKeyModal({ open, onClose, keyId }: ViewKeyModalProps) {
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && keyId) {
      loadKey();
    }
    return () => {
      setApiKey("");
      setShowKey(false);
      setCopied(false);
      setError(null);
    };
  }, [open, keyId]);

  const loadKey = async () => {
    setLoading(true);
    setError(
      "⚠️ Impossible de récupérer la clé API. Avec le système de sécurité actuel (hash SHA-256), les clés ne peuvent être vues qu'à leur création. Si vous avez perdu cette clé, vous devez en créer une nouvelle.",
    );
    setLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return "••••••••••••";
    return `${key.slice(0, 8)}${"•".repeat(20)}${key.slice(-4)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Voir la Clé API</DialogTitle>
          <DialogDescription>
            Clé déchiffrée en toute sécurité. Ne partagez jamais cette clé.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && apiKey && (
            <>
              {/* Warning Banner */}
              <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-orange-900 dark:text-orange-200">
                      ⚠️ Attention
                    </p>
                    <p className="text-orange-700 dark:text-orange-300 mt-1">
                      Ne partagez jamais votre clé API. Toute personne ayant
                      accès à cette clé peut effectuer des actions en votre nom.
                    </p>
                  </div>
                </div>
              </div>

              {/* API Key Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Clé API
                </label>
                <div className="relative">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <code className="break-all font-mono text-sm text-zinc-900 dark:text-zinc-50">
                      {showKey ? apiKey : maskKey(apiKey)}
                    </code>
                  </div>
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowKey(!showKey)}
                      className="h-8 w-8 p-0"
                    >
                      {showKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-8 w-8 p-0"
                    >
                      {copied ? (
                        <CheckCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                💡 Cette clé est chiffrée avec AES-256 dans notre base de
                données. Elle est déchiffrée uniquement lorsque vous la
                visualisez.
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
