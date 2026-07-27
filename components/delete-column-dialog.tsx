"use client";

import { useState } from "react";
import { AlertTriangle, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteColumnDialogProps {
  columnName: string;
  jobCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<{ success: boolean; error?: string }>;
}

export default function DeleteColumnDialog({
  columnName,
  jobCount,
  open,
  onOpenChange,
  onConfirm,
}: DeleteColumnDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);

    try {
      const result = await onConfirm();
      if (result.success) onOpenChange(false);
      else setError(result.error ?? "Column deletion failed");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isDeleting) return;
    setError(null);
    onOpenChange(nextOpen);
  }

  const jobLabel =
    jobCount === 1 ? "1 job application" : `${jobCount} job applications`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogTitle>Delete “{columnName}”?</DialogTitle>
          <DialogDescription className="leading-6">
            This will permanently delete the column and {jobLabel}. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isDeleting} onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={isDeleting} onClick={handleDelete}>
            {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {isDeleting ? "Deleting…" : "Delete column"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
