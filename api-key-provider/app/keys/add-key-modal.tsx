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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createApiKeyAction } from "@/app/actions/api-key-actions";
import { Loader2, Copy, Check, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { CreateApiKeySchema } from "@/lib/validations/api-keys";
import { z } from "zod";

interface AddKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orgId: string;
}

// Infer the scope type from the Zod schema for type safety
type Scope = z.infer<typeof CreateApiKeySchema>["scopes"][number];

const DEFAULT_SCOPES: Scope[] = [
  "pdf:read",
  "pdf:write",
  "ai:read",
  "ai:write",
  "mileage:read",
  "mileage:calculate",
];

export function AddKeyModal({
  open,
  onClose,
  onSuccess,
  orgId,
}: AddKeyModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state for the form
  const [keyName, setKeyName] = useState("");
  const [environment, setEnvironment] = useState<"production" | "test">("production");
  
  // New state for success view
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setKeyName("");
    setEnvironment("production");
    setError(null);
    setSubmitting(false);
    setNewApiKey(null);
    setHasCopied(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await createApiKeyAction({
        orgId,
        keyName,
        environment,
        scopes: DEFAULT_SCOPES, // On envoie les scopes par défaut
      });

      if (result.success) {
        if ("data" in result && result.data?.apiKey) {
          setNewApiKey(result.data.apiKey); 
          // Do NOT call onSuccess() here, wait for user to close the modal
        }
      } else {
        setError(result.error || "Erreur lors de la création de la clé");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey);
      setHasCopied(true);
      toast.success("Clé API copiée dans le presse-papiers !");
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleSuccessClose = () => {
    onSuccess(); // Refresh parent list
    onClose();   // Close modal
  };

  // Empêcher la fermeture accidentelle si la clé est affichée
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && newApiKey) {
      if (confirm("Vous ne pourrez plus voir cette clé. Êtes-vous sûr de vouloir fermer ?")) {
        handleSuccessClose();
      }
    } else if (!isOpen) {
      onClose();
    }
  };

  if (newApiKey) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
              <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">Clé API générée !</DialogTitle>
            <DialogDescription className="text-center">
              Copiez cette clé maintenant. Pour des raisons de sécurité, elle ne sera plus jamais affichée.
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-6 w-full">
            <div className="relative grid grid-cols-[1fr_auto] w-full items-center rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="bg-zinc-50 p-3 font-mono text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 min-w-0 overflow-hidden">
                <span className="truncate block w-full select-all">{newApiKey}</span>
              </div>
              <Button 
                onClick={handleCopy}
                className="h-[46px] rounded-none bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-4"
              >
                {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="ml-2 sr-only">Copier</span>
              </Button>
            </div>
            <p className="mt-2 text-xs text-center text-zinc-500">
              Cette clé donne accès complet à tous les services activés.
            </p>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button onClick={handleSuccessClose} size="lg" className="w-full sm:w-auto min-w-[200px] bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black">
              C'est noté, fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-6 gap-0">
        <DialogHeader className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
              <KeyRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Nouvelle clé API</DialogTitle>
          </div>
          <DialogDescription className="text-base text-zinc-500 dark:text-zinc-400">
            Configurez votre nouvelle clé pour accéder à l'API.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-4">
            {/* Key Name */}
            <div>
              <Label htmlFor="keyName" className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Nom de la clé <span className="text-red-500">*</span>
              </Label>
              <Input
                id="keyName"
                type="text"
                required
                placeholder="Ex: Projet Dashboard Analytics"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="h-11 focus-visible:ring-indigo-500"
              />
            </div>
            
            {/* Environment */}
            <div>
              <Label htmlFor="environment" className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Environnement
              </Label>
              <Select
                value={environment}
                onValueChange={(v: "production" | "test") => setEnvironment(v)}
              >
                <SelectTrigger className="h-11 focus:ring-indigo-500">
                  <SelectValue placeholder="Sélectionnez un environnement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      Production
                    </span>
                  </SelectItem>
                  <SelectItem value="test">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-zinc-400" />
                      Test
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground pt-2">
                Les clés de test ne consomment pas de crédits réels.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="mt-2 gap-3 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="h-11 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || !keyName}
              className="h-11 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-medium"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                "Générer la clé"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}