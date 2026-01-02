"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Key,
  Trash2,
  Shield,
  Zap,
  Calendar,
  Eye,
  Server,
  TestTube2,
  MoreVertical,
  Copy,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { AddKeyModal } from "./add-key-modal";
import { DeleteKeyModal } from "./delete-key-modal";
import {
  getOrgApiKeys,
  revokeApiKeyAction,
  deleteApiKeyAction,
  type ApiKeyData,
} from "@/app/actions/api-key-actions";

// Use the exported type from actions
type ApiKey = ApiKeyData;

interface KeysClientProps {
  initialKeys: ApiKey[];
  orgId: string;
  orgName: string;
  purchaseSuccess?: boolean;
}

export function KeysClient({ initialKeys, orgId, orgName, purchaseSuccess = false }: KeysClientProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialKeys);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detect successful payment return from Stripe
  useEffect(() => {
    if (purchaseSuccess) {
      console.log("🎯 Purchase success detected, showing toast...");

      // Wait for Toaster to mount and page animations to settle (FadeIn animations take ~700ms)
      const timer = setTimeout(() => {
        console.log("🔔 Triggering toast now...");
        toast.success("🎉 Crédits ajoutés avec succès !", {
          description: "Vos crédits sont maintenant disponibles. Le badge se mettra à jour dans quelques secondes.",
          duration: 5000,
        });

        // Dispatch custom event to force CreditsBadge refresh
        window.dispatchEvent(new CustomEvent("credits-updated"));

        // Clean URL (remove ?success=true parameter)
        const url = new URL(window.location.href);
        url.searchParams.delete("success");
        window.history.replaceState({}, "", url.toString());
      }, 1000); // 1s delay to ensure FadeIn animations are complete

      return () => clearTimeout(timer);
    }
  }, [purchaseSuccess]);

  const refreshKeys = async () => {
    const result = await getOrgApiKeys(orgId);
    if (result.success && result.data) {
      setApiKeys(result.data);
    } else {
      toast.error("Échec de la mise à jour des clés API.");
    }
  };

  const handleRevoke = async (keyId: string) => {
    const promise = revokeApiKeyAction(keyId, "Révoqué par l'utilisateur");
    toast.promise(promise, {
      loading: "Révocation de la clé en cours...",
      success: () => {
        refreshKeys();
        return "Clé API révoquée avec succès.";
      },
      error: "Erreur lors de la révocation de la clé.",
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copié dans le presse-papier");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Jamais";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Clés API
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Gérez les accès pour l'organisation{" "}
              <span className="font-semibold text-zinc-900 dark:text-white">
                {orgName}
              </span>
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="h-11 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black hover:shadow-lg transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Générer une clé
          </Button>
        </div>

      <div className="grid gap-6 md:grid-cols-3 mb-10">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Total des clés
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <Key className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {apiKeys.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Clés actives
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {apiKeys.filter((key) => key.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Actives (30j)
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {
                  apiKeys.filter(
                    (key) =>
                      key.lastUsedAt &&
                      new Date(key.lastUsedAt) >
                        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  ).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

      <AddKeyModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          refreshKeys();
        }}
        orgId={orgId}
      />

      <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-white">
        Vos Clés API
      </h2>

        {apiKeys.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Key className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              Aucune clé API
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
              Vous n&apos;avez pas encore créé de clé API. Créez votre première
              clé pour commencer à utiliser nos services.
            </p>
            <Button onClick={() => setShowAddModal(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Générer une clé
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
                                                {apiKeys.map((apiKey) => (
                                                  <div 
                                                    key={apiKey.id} 
                                                    className="group relative flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50"
                                                  >
                                                    {/* Col 1-3: Icon & Name */}
                                                    <div className="w-full md:w-auto md:col-span-3 flex items-center gap-3 min-w-0">
                                                      <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${
                                                        apiKey.environment === 'production' 
                                                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
                                                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                                      }`}>
                                                        {apiKey.environment === 'production' ? <Server className="h-5 w-5" /> : <TestTube2 className="h-5 w-5" />}
                                                      </div>
                                                      <h3 className="font-semibold text-zinc-900 dark:text-white truncate" title={apiKey.keyName}>{apiKey.keyName}</h3>
                                                      {/* Actions Menu (Mobile Only - Absolute positioning to top right) */}
                                                      <div className="md:hidden ml-auto">
                                                         {/* We duplicate the menu here or use absolute positioning for the main menu. 
                                                             Let's use absolute positioning on the main Actions container instead if possible, 
                                                             or just accept it at the bottom. 
                                                             Actually, standard practice for cards is menu at top right. 
                                                             Let's keep the DOM order simple for now: Stacked.
                                                             If user wants menu top-right, we can add `absolute top-4 right-4 md:static` to the menu container.
                                                          */}
                                                      </div>
                                                    </div>
                                    
                                                    {/* Col 4-6: Key Display */}
                                                    <div className="w-full md:w-auto md:col-span-3 flex items-center min-w-0">
                                                      <div className="flex items-center gap-2 font-mono text-sm text-zinc-500 dark:text-zinc-400 bg-transparent px-2 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 w-full md:max-w-[280px]">
                                                        <span className="shrink-0">{apiKey.keyPrefix}</span>
                                                        <span className="tracking-widest flex-1 text-center truncate">••••••••</span>
                                                        <span className="shrink-0">{apiKey.keyHint}</span>
                                                        <button 
                                                          onClick={() => copyToClipboard(`${apiKey.keyPrefix}...${apiKey.keyHint}`, apiKey.id)}
                                                          className="ml-1 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors shrink-0"
                                                          title="Copier l'identifiant"
                                                        >
                                                          {copiedId === apiKey.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                                        </button>
                                                      </div>
                                                    </div>
                                    
                                                    {/* Col 7-9: Dates */}
                                                    <div className="w-full md:w-auto md:col-span-3 flex items-center justify-between md:justify-start gap-4 md:gap-6 text-[11px] text-zinc-500 dark:text-zinc-500 font-medium">
                                                      <div className="flex items-center gap-1.5 min-w-0">
                                                        <Calendar className="h-3.5 w-3.5 opacity-70 shrink-0" />
                                                        <span className="truncate">Créée le {formatDate(apiKey.createdAt)}</span>
                                                      </div>
                                                      <div className="flex items-center gap-1.5 min-w-0">
                                                        <Zap className="h-3.5 w-3.5 opacity-70 shrink-0" />
                                                        <span className="truncate">Utilisée: {formatDate(apiKey.lastUsedAt)}</span>
                                                      </div>
                                                    </div>
                                    
                                                    {/* Col 10-12: Badges & Actions */}
                                                    <div className="w-full md:w-auto md:col-span-3 flex items-center justify-between md:justify-end gap-3">
                                                      <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] font-normal text-zinc-500 border-zinc-200 dark:border-zinc-800 bg-transparent whitespace-nowrap">
                                                          {apiKey.environment === 'production' ? 'Production' : 'Test'}
                                                        </Badge>
                                                        <Badge 
                                                          variant="secondary" 
                                                          className={`text-[10px] px-2 h-5 font-medium whitespace-nowrap ${apiKey.isActive 
                                                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" 
                                                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}
                                                        >
                                                          {apiKey.isActive ? "Active" : "Révoquée"}
                                                        </Badge>
                                                      </div>
                                                      
                                                      {/* Menu Button - Positioned absolutely on mobile for top-right access, relative on desktop */}
                                                      <div className="absolute top-2 right-2 md:static md:block">
                                                        <DropdownMenu>
                                                          <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-white shrink-0">
                                                              <MoreVertical className="h-4 w-4" />
                                                              <span className="sr-only">Actions</span>
                                                            </Button>
                                                          </DropdownMenuTrigger>
                                                          <DropdownMenuContent align="end" className="w-[160px]">
                                                            {apiKey.isActive && (
                                                              <DropdownMenuItem onClick={() => handleRevoke(apiKey.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Révoquer
                                                              </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                              onClick={() => {
                                                                setSelectedKey(apiKey);
                                                                setShowDeleteModal(true);
                                                              }}
                                                              className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                                                            >
                                                              <Trash2 className="mr-2 h-4 w-4" />
                                                              Supprimer
                                                            </DropdownMenuItem>
                                                          </DropdownMenuContent>
                                                        </DropdownMenu>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}          </div>
        )}

      {selectedKey && (
        <DeleteKeyModal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedKey(null);
          }}
          onConfirm={() => {
            const promise = deleteApiKeyAction(selectedKey.id);
            toast.promise(promise, {
              loading: "Suppression de la clé en cours...",
              success: () => {
                refreshKeys();
                return "Clé API supprimée avec succès.";
              },
              error: "Erreur lors de la suppression de la clé.",
            });
            setShowDeleteModal(false);
            setSelectedKey(null);
          }}
          keyName={selectedKey.keyName}
        />
      )}
    </div>
  );
}
