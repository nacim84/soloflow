"use client";

import {
  Server,
  Cloud,
  Code,
  Database,
  Cpu,
  Mail,
  Shield,
  Zap,
  Search,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getServicesAction } from "@/app/actions/api-key-actions";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";

interface ServicesClientProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Service {
  id: string;
  name: string;
  displayName: string;
  icon: string | null;
  category: string;
  description: string | null;
  baseCostPerCall: number;
}

// Mapping des icônes
const iconMap: Record<string, any> = {
  Code,
  Cloud,
  Cpu,
  Zap,
  Mail,
  Database,
  Shield,
  Server,
};

const categories = [
  { id: "all", label: "Tous", icon: Server },
  { id: "dev", label: "Développement", icon: Code },
  { id: "ai", label: "IA & ML", icon: Cpu },
  { id: "cloud", label: "Cloud", icon: Cloud },
  { id: "data", label: "Data", icon: Database },
];

export function ServicesClient({ user }: ServicesClientProps) {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    const result = await getServicesAction();
    if (result.success && result.data) {
      setServices(result.data);
    }
    setLoading(false);
  };

  const filteredServices = services.filter((service) => {
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      service.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddKey = (serviceId: string) => {
    router.push(`/keys?service=${serviceId}&action=add`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Catalogue de Services
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">
              Explorez notre catalogue d'APIs prêtes à l'emploi. Activez les services dont vous avez besoin et payez à l'usage.
            </p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher une API..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-full border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
        </div>

      <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-zinc-900 text-white shadow-md dark:bg-white dark:text-black"
                    : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </button>
            );
          })}
        </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600 dark:border-zinc-800"></div>
        </div>
      )}

      {/* Services Grid */}
      {!loading && filteredServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => {
            const Icon = service.icon
              ? iconMap[service.icon] || Server
              : Server;

            return (
              <div key={service.id} className="group flex h-full flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-indigo-500/30">
                  <div>
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 font-mono text-xs">
                        {service.baseCostPerCall} cr
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                      {service.displayName}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-6">
                      {service.description || "Aucune description disponible."}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full justify-between group-hover:border-indigo-200 group-hover:text-indigo-600 dark:group-hover:border-indigo-900 dark:group-hover:text-indigo-400 transition-colors"
                    onClick={() => handleAddKey(service.id)}
                  >
                    Créer une clé
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredServices.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
            <Search className="h-6 w-6 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
            Aucun service trouvé
          </h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Aucun service ne correspond à votre recherche "{searchQuery}"
          </p>
          <Button 
            variant="link" 
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-2 text-indigo-600 dark:text-indigo-400"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}