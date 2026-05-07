import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { DataTable, DataTableColumnHeader } from "@workspace/ui/components/data-table";
import { Input } from "@workspace/ui/components/input";
import { Eye, EyeOff, Plus, RefreshCw, Trash2, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { admin } from "@/api/client.ts";
import { AdminLayout } from "../../components/layout/AdminLayout";
import type { AdminDocument, ApiError } from "@/types";
import { Card, CardContent, CardTitle } from "@workspace/ui/components/card";

function statusBadge(status: AdminDocument["_status"]) {
  const map = {
    PENDING: { variant: "outline", label: "En attente" },
    INDEXED: { variant: "success", label: "Indexé" },
    DISABLED: { variant: "pending", label: "Désactivé" },
    ERROR: { variant: "destructive", label: "Erreur" },
  } as const;
  const { variant, label } = map[status] ?? { variant: "outline", label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

function getApiMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: ApiError } };
  return e.response?.data?.message ?? fallback;
}

// ---- Add Document Modal ----
interface AddDocModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddDocModal({ onClose, onSuccess }: AddDocModalProps) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Le titre est requis.");
      return;
    }
    if (!file) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Le fichier dépasse la limite autorisée (10 Mo).");
      return;
    }

    const allowedExtensions = ["pdf", "docx", "txt"];
    const extMatch = file.name.split(".").pop()?.toLowerCase();
    if (!extMatch || !allowedExtensions.includes(extMatch)) {
      setError("Format non supporté. Utilisez PDF, DOCX ou TXT.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await admin.importDocument({ title: title.trim(), confidentiality: "PUBLIC", file });
      onSuccess();
      onClose();
    } catch (err) {
      setError(getApiMessage(err, "Erreur lors de l'ajout"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 font-semibold text-lg">Ajouter un document</h2>
        {error && (
          <div className="mb-3 rounded bg-destructive/10 p-2 text-sm text-destructive">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Fichier (PDF, DOCX, TXT - max 10 Mo) <span className="text-destructive">*</span>
            </label>
            <Input
              type="file"
              accept=".pdf,.docx,.txt"
              className="cursor-pointer file:text-foreground file:bg-muted file:border-0 file:mr-2 file:px-2 file:py-1 file:rounded"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null;
                setFile(selected);
                if (selected && !title) {
                  const nameParts = selected.name.split(".");
                  nameParts.pop();
                  setTitle(nameParts.join("."));
                }
              }}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Titre <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom du document"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Confirm Modal ----
interface ConfirmModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

function ConfirmModal({ title, description, onConfirm, onClose, loading }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-2 font-semibold">{title}</h2>
        <p className="mb-6 text-sm text-muted-foreground">{description}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "En cours..." : "Confirmer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----
export function DocumentsPage() {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [reindexConfirm, setReindexConfirm] = useState(false);
  const [reindexLoading, setReindexLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = () => {
    setIsLoading(true);
    admin
      .listDocuments()
      .then((docs) => {
        setDocuments(docs);
        setTotalCount(docs.length);
      })
      .catch((err) => setError(getApiMessage(err, "Erreur lors du chargement")))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleIndex = async (id: string) => {
    setActionLoading(id);
    try {
      await admin.indexDocument(id);
      showToast("Indexation lancée — la liste sera mise à jour dans quelques secondes.");
      setTimeout(load, 3000);
    } catch (err) {
      setError(getApiMessage(err, "Erreur lors de l'indexation"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisable = async (id: string) => {
    setActionLoading(id);
    try {
      await admin.disableDocument(id);
      load();
    } catch (err) {
      setError(getApiMessage(err, "Erreur lors de la désactivation"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnable = async (id: string) => {
    setActionLoading(id);
    try {
      await admin.enableDocument(id);
      showToast("Réactivation lancée — la liste sera mise à jour dans quelques secondes.");
      setTimeout(load, 3000);
    } catch (err) {
      setError(getApiMessage(err, "Erreur lors de la réactivation"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await admin.deleteDocument(id);
      load();
    } catch (err) {
      setError(getApiMessage(err, "Erreur lors de la suppression"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReindexAll = async () => {
    setReindexLoading(true);
    try {
      await admin.reindexAll();
      setReindexConfirm(false);
      showToast("Réindexation globale lancée.");
      setTimeout(load, 3000);
    } catch (err) {
      setError(getApiMessage(err, "Erreur lors de la réindexation"));
    } finally {
      setReindexLoading(false);
    }
  };

  // Transformer les documents pour ajouter le champ id
  const documentsWithId = documents.map((doc) => ({ ...doc, id: doc._id }));

  // Filtrer les documents localement selon la recherche
  const filteredDocuments = documentsWithId.filter(
    (doc) =>
      search === "" ||
      doc._title.toLowerCase().includes(search.toLowerCase()) ||
      doc._confidentiality.toLowerCase().includes(search.toLowerCase()) ||
      doc._status.toLowerCase().includes(search.toLowerCase())
  );

  // Paginer localement pour l'instant
  const paginatedDocuments = filteredDocuments.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  );

  // Colonnes du tableau
  const columns: ColumnDef<AdminDocument & { id: string }>[] = [
    {
      accessorKey: "_title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Titre" />,
      cell: (info) => (
        <div className="max-w-xs truncate font-medium">{info.getValue() as string}</div>
      ),
    },
    {
      accessorKey: "_status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      cell: (info) => statusBadge(info.getValue() as AdminDocument["_status"]),
    },
    {
      accessorKey: "_confidentiality",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Confidentialité" />,
      cell: (info) => (
        <span className="text-xs text-muted-foreground">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "_chunkCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Chunks" />,
      cell: (info) => (
        <span className="text-xs text-muted-foreground">{info.getValue() as number}</span>
      ),
    },
    {
      accessorKey: "_lastModified",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Modifié" />,
      cell: (info) => (
        <span className="text-xs text-muted-foreground">
          {new Date(info.getValue() as string).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const doc = info.row.original;
        return (
          <div className="flex gap-1">
            {(doc._status === "PENDING" || doc._status === "ERROR") && (
              <Button
                size="sm"
                variant="outline"
                title="Indexer"
                disabled={actionLoading === doc._id}
                onClick={() => handleIndex(doc._id)}
              >
                <Zap className="h-4 w-4" />
              </Button>
            )}
            {doc._status === "INDEXED" && (
              <Button
                size="sm"
                variant="outline"
                title="Désactiver"
                disabled={actionLoading === doc._id}
                onClick={() => handleDisable(doc._id)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            )}
            {doc._status === "DISABLED" && (
              <Button
                size="sm"
                variant="outline"
                title="Réactiver"
                disabled={actionLoading === doc._id}
                onClick={() => handleEnable(doc._id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {(doc._status === "INDEXED" || doc._status === "DISABLED") && (
              <Button
                size="sm"
                variant="outline"
                title="Supprimer"
                disabled={actionLoading === doc._id}
                onClick={() => handleDelete(doc._id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <AdminLayout currentPage="documents">
      {toast && (
        <div className="fixed right-4 bottom-4 z-50 rounded-lg bg-foreground px-4 py-3 text-sm text-background shadow-lg">
          {toast}
        </div>
      )}

      {showAddModal && <AddDocModal onClose={() => setShowAddModal(false)} onSuccess={load} />}

      {reindexConfirm && (
        <ConfirmModal
          title="Réindexer tous les documents ?"
          description="Cette opération peut prendre plusieurs minutes et affecter les performances."
          onConfirm={handleReindexAll}
          onClose={() => setReindexConfirm(false)}
          loading={reindexLoading}
        />
      )}

      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="gaps-2 mb-6 flex flex-col">
            <h1 className="title-lg text-3xl">Documents</h1>
            <span className="text-sm text-muted-foreground">
              Gérez et supervisez vos documents.
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setReindexConfirm(true)}>
              <RefreshCw className="h-4 w-4" />
              Réindexer tout
            </Button>
            <Button className="gap-2" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-destructive">{error}</div>
        )}
        <Card className="border-none shadow-sm">
          <CardTitle>
            <h1 className="title-lg text-3xl mb-4">Liste les documents</h1>
          </CardTitle>
          <CardContent>
            <DataTable
              columns={columns}
              data={paginatedDocuments}
              totalCount={filteredDocuments.length}
              pagination={pagination}
              onPaginationChange={setPagination}
              isLoading={isLoading}
              withSearch
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Rechercher par titre, statut, confidentialité..."
              emptyMessage="Aucun document"
              withSelection
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
