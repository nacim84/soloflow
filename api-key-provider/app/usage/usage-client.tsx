"use client";

import {
  Activity,
  TrendingUp,
  Clock,
  CreditCard,
  Calendar,
  ArrowUp,
  AlertCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  getOrgUsageLogsAction,
  getUserTotalCredits,
} from "@/app/actions/api-key-actions";
import { useRouter } from "next/navigation";

interface UsageClientProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  orgId: string;
}

interface UsageLog {
  id: string;
  keyName: string;
  serviceName: string;
  endpoint: string | null;
  method: string | null;
  statusCode: number | null;
  creditsUsed: number;
  timestamp: Date;
  ipAddress: string | null;
}

interface Credits {
  totalBalance: number;
  testBalance: number;
  orgBalance: number;
  totalPurchased: number;
  totalUsed: number;
}

const timeFilters = [
  { id: "today", label: "24h" },
  { id: "week", label: "7j" },
  { id: "month", label: "30j" },
  { id: "all", label: "Tout" },
];

export function UsageClient({ user, orgId }: UsageClientProps) {
  const router = useRouter();
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [credits, setCredits] = useState<Credits>({
    totalBalance: 0,
    testBalance: 0,
    orgBalance: 0,
    totalPurchased: 0,
    totalUsed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Logs
      const logsResult = await getOrgUsageLogsAction(orgId, 100);
      if (logsResult.success && logsResult.data) {
        setLogs(logsResult.data);
      }

      // 2. Fetch Total Credits (test + org wallets)
      const creditsResult = await getUserTotalCredits();
      if (creditsResult.success && creditsResult.data) {
        setCredits({
          totalBalance: creditsResult.data.totalBalance,
          testBalance: creditsResult.data.testBalance,
          orgBalance: creditsResult.data.orgBalance,
          totalPurchased: 0, // TODO: Récupérer depuis le wallet org si nécessaire
          totalUsed: 0, // TODO: Calculer depuis les logs si nécessaire
        });
      }
    } catch (error) {
      console.error("Failed to load usage data", error);
    } finally {
      setLoading(false);
    }
  };

  const totalCreditsUsed = logs.reduce((acc, log) => acc + log.creditsUsed, 0);
  const totalCalls = logs.length;
  const successRate =
    totalCalls > 0
      ? (
          (logs.filter(
            (log) =>
              log.statusCode && log.statusCode >= 200 && log.statusCode < 300,
          ).length /
            totalCalls) *
          100
        ).toFixed(1)
      : "0.0";

  const getStatusBadge = (statusCode: number | null) => {
    if (!statusCode) return <Badge variant="outline" className="text-zinc-500 border-zinc-200">N/A</Badge>;
    if (statusCode >= 200 && statusCode < 300)
      return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">{statusCode}</Badge>;
    if (statusCode >= 400 && statusCode < 500)
      return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">{statusCode}</Badge>;
    return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">{statusCode}</Badge>;
  };

  const lowCreditsThreshold = 100;
  const showLowCreditsAlert = credits.totalBalance < lowCreditsThreshold;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Métriques & Logs
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Analysez la performance de vos intégrations et surveillez vos coûts.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
            {timeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  selectedFilter === filter.id
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600 dark:border-zinc-800"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              
              {/* Card 1: Crédits Utilisés */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl shrink-0">
                  <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Crédits Utilisés</p>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalCreditsUsed}</p>
                </div>
              </div>

              {/* Card 2: Total Requêtes */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex items-center gap-4">
                 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl shrink-0">
                    <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                 </div>
                 <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Requêtes</p>
                 <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalCalls}</p>
                </div>
              </div>

              {/* Card 3: Succès */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex items-center gap-4">
                 <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl shrink-0">
                    <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                 </div>
                 <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Succès (2xx)</p>
                 <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">{successRate}%</p>
                </div>
              </div>

              {/* Card 4: Coût Moyen */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex items-center gap-4">
                 <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl shrink-0">
                    <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                 </div>
                 <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Coût Moyen</p>
                 <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {totalCalls > 0 ? (totalCreditsUsed / totalCalls).toFixed(1) : "0.0"} <span className="text-sm font-normal text-zinc-400">cr/req</span>
                  </p>
                </div>
              </div>
            </div>

          {/* Credits Warning */}
          {showLowCreditsAlert && (
            <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/10">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                      Solde de crédits faible
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1 mb-3">
                      Il vous reste <strong>{credits.totalBalance} crédits</strong>.
                      Pour éviter toute interruption de service sur vos applications en production, pensez à recharger.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => router.push("/#pricing")}
                      className="bg-amber-600 hover:bg-amber-700 text-white border-none"
                    >
                      Recharger maintenant
                    </Button>
                  </div>
                </div>
              </div>
          )}

          {/* Usage Logs Table */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
              <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <h2 className="font-semibold text-zinc-900 dark:text-white">
                  Logs Détaillés
                </h2>
                <Button variant="outline" size="sm" disabled={logs.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
              
              {logs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Service</th>
                        <th className="px-6 py-3 font-medium">Clé</th>
                        <th className="px-6 py-3 font-medium">Endpoint</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Coût</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {logs.map((log) => (
                        <tr
                          key={log.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-medium text-zinc-900 dark:text-white">
                                {new Date(log.timestamp).toLocaleDateString("fr-FR")}
                              </span>
                              <span className="text-xs text-zinc-500">
                                {new Date(log.timestamp).toLocaleTimeString("fr-FR")}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                               <span className="font-medium text-zinc-700 dark:text-zinc-300">{log.serviceName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                            {log.keyName}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <Badge variant="secondary" className="text-[10px] font-mono uppercase text-zinc-500">
                                  {log.method || 'GET'}
                               </Badge>
                               <span className="text-zinc-600 dark:text-zinc-400 font-mono text-xs truncate max-w-[150px]" title={log.endpoint || ""}>
                                  {log.endpoint || "/"}
                               </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(log.statusCode)}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-white">
                            {log.creditsUsed} cr
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Aucune donnée disponible</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                    Les logs d'utilisation apparaîtront ici dès que vous commencerez à utiliser vos clés API.
                  </p>
                </div>
              )}
            </div>
        </>
      )}
    </div>
  );
}