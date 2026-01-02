"use client";

import { useState } from "react";
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
import { Trash2 } from "lucide-react";

interface DeleteKeyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  keyName: string;
}

export function DeleteKeyModal({
  open,
  onClose,
  onConfirm,
  keyName,
}: DeleteKeyModalProps) {
  const [confirmationInput, setConfirmationInput] = useState("");
  const isConfirmed = confirmationInput === keyName;

  const handleClose = () => {
    setConfirmationInput("");
    onClose();
  };

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      setConfirmationInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-6 gap-0">
        <DialogHeader className="mb-6 text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Supprimer la clé API
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-zinc-500 dark:text-zinc-400 text-left">
            Cette action est <strong>irréversible</strong>. Cela révoquera
            immédiatement la clé
            <span className="font-semibold text-zinc-900 dark:text-white">
              {" "}
              {keyName}{" "}
            </span>
            et toutes les applications utilisant cette clé cesseront de
            fonctionner.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="confirmation" className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Veuillez taper <span className="font-mono select-all text-zinc-900 dark:text-white">{keyName}</span> pour confirmer
              </Label>
              <Input
                id="confirmation"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={keyName}
                className="h-11 focus-visible:ring-red-500"
                autoComplete="off"
              />
            </div>
          </div>

          <DialogFooter className="mt-2 gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleClose}
              className="h-11 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!isConfirmed}
              className="h-11 bg-red-600 hover:bg-red-700 font-medium"
            >
              Supprimer la clé
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
