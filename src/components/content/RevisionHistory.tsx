"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  History,
  RotateCcw,
  ChevronRight,
  User,
  Calendar,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface Revision {
  id: string;
  version: number;
  contentType: string;
  contentId: string;
  changes: Record<string, unknown>;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface RevisionHistoryProps {
  contentType: "post" | "page" | "product";
  contentId: string;
  onRestore?: (revision: Revision) => void;
}

export function RevisionHistory({
  contentType,
  contentId,
  onRestore,
}: RevisionHistoryProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(
    null
  );
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchRevisions = useCallback(async () => {
    if (!contentId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/revisions?contentType=${contentType}&contentId=${contentId}`
      );
      if (response.ok) {
        const data = await response.json();
        setRevisions(data.revisions || []);
      }
    } catch (error) {
      console.error("Failed to fetch revisions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [contentType, contentId]);

  useEffect(() => {
    if (isOpen) {
      fetchRevisions();
    }
  }, [isOpen, fetchRevisions]);

  const handleRestoreClick = (revision: Revision) => {
    setSelectedRevision(revision);
    setShowRestoreDialog(true);
  };

  const handleRestore = async () => {
    if (!selectedRevision) return;

    setIsRestoring(true);
    try {
      const response = await fetch(
        `/api/admin/revisions/${selectedRevision.id}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        if (onRestore) {
          onRestore(selectedRevision);
        }
        // Refresh the page to show restored content
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to restore revision");
      }
    } catch (error) {
      console.error("Failed to restore revision:", error);
      alert("Failed to restore revision");
    } finally {
      setIsRestoring(false);
      setShowRestoreDialog(false);
    }
  };

  const getChangeSummary = (changes: Record<string, unknown>): string => {
    const keys = Object.keys(changes);
    if (keys.length === 0) return "No changes recorded";
    if (keys.length === 1) return `Changed: ${keys[0]}`;
    if (keys.length === 2) return `Changed: ${keys.join(", ")}`;
    return `Changed: ${keys.slice(0, 2).join(", ")} and ${keys.length - 2} more`;
  };

  const renderChangeValue = (value: unknown): string => {
    if (value === null || value === undefined) return "empty";
    if (typeof value === "string") {
      if (value.length > 100) return value.substring(0, 100) + "...";
      return value;
    }
    if (typeof value === "object") {
      return JSON.stringify(value).substring(0, 100) + "...";
    }
    return String(value);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            History
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Revision History
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : revisions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No revisions yet</p>
                <p className="text-sm">
                  Revisions are created automatically when you save changes.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {revisions.map((revision, index) => (
                  <div
                    key={revision.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">v{revision.version}</Badge>
                          {index === 0 && (
                            <Badge variant="secondary">Latest</Badge>
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(
                              new Date(revision.createdAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </div>
                          {revision.createdBy && (
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5" />
                              {revision.createdBy.name ||
                                revision.createdBy.email}
                            </div>
                          )}
                        </div>

                        <p className="text-sm mt-2 text-muted-foreground">
                          {getChangeSummary(revision.changes)}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestoreClick(revision)}
                        className="gap-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </Button>
                    </div>

                    {/* Expandable changes preview */}
                    <details className="mt-3">
                      <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <ChevronRight className="h-4 w-4 transition-transform details-open:rotate-90" />
                        View changes
                      </summary>
                      <div className="mt-2 space-y-2 pl-5">
                        {Object.entries(revision.changes).map(
                          ([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium text-muted-foreground">
                                {key}:
                              </span>
                              <span className="ml-2 text-foreground break-all">
                                {renderChangeValue(value)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Restore Revision
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to restore version {selectedRevision?.version}?
              This will overwrite the current content with the saved version.
              A new revision will be created before restoring.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRestoreDialog(false)}
              disabled={isRestoring}
            >
              Cancel
            </Button>
            <Button onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
