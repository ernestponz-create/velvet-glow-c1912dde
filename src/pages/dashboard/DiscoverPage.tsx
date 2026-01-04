import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ProcedureCard from "@/components/discover/ProcedureCard";
import ProcedureFilter from "@/components/discover/ProcedureFilter";
import { Button } from "@/components/ui/button";

interface Procedure {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  benefit_phrase: string;
  investment_level: string;
  concerns: string[];
  duration_minutes: number | null;
  recovery_days: number | null;
  image_url: string | null;
  is_featured: boolean;
}

const concernOptions = [
  { value: "anti-aging", label: "Anti-Aging" },
  { value: "skin-texture", label: "Skin Texture" },
  { value: "volume-loss", label: "Volume Loss" },
  { value: "fine-lines", label: "Fine Lines" },
  { value: "skin-laxity", label: "Skin Tightening" },
  { value: "hyperpigmentation", label: "Hyperpigmentation" },
  { value: "acne-scarring", label: "Acne & Scarring" },
  { value: "preventative", label: "Preventative" },
];

const timeframeOptions = [
  { value: "no-downtime", label: "No Downtime" },
  { value: "weekend", label: "Weekend Recovery" },
  { value: "week-plus", label: "Week+ Recovery" },
];

const investmentOptions = [
  { value: "signature", label: "Signature" },
  { value: "premier", label: "Premier" },
  { value: "exclusive", label: "Exclusive" },
];

const DiscoverPage = () => {
  const { profile } = useAuth();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [concernFilter, setConcernFilter] = useState("");
  const [timeframeFilter, setTimeframeFilter] = useState("");
  const [investmentFilter, setInvestmentFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProcedures = async () => {
      const { data, error } = await supabase
        .from("procedures")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("name");

      if (!error && data) {
        setProcedures(data);
      }
      setIsLoading(false);
    };

    fetchProcedures();
  }, []);

  // Filter procedures
  const filteredProcedures = useMemo(() => {
    return procedures.filter((proc) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !proc.name.toLowerCase().includes(query) &&
          !proc.benefit_phrase.toLowerCase().includes(query) &&
          !proc.short_description.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Concern filter
      if (concernFilter && !proc.concerns.includes(concernFilter)) {
        return false;
      }

      // Investment filter
      if (investmentFilter && proc.investment_level !== investmentFilter) {
        return false;
      }

      // Timeframe filter
      if (timeframeFilter) {
        const recovery = proc.recovery_days || 0;
        if (timeframeFilter === "no-downtime" && recovery > 0) return false;
        if (timeframeFilter === "weekend" && (recovery < 1 || recovery > 3)) return false;
        if (timeframeFilter === "week-plus" && recovery < 5) return false;
      }

      return true;
    });
  }, [procedures, searchQuery, concernFilter, timeframeFilter, investmentFilter]);

  // Check if procedure matches user concerns
  const isRecommended = (procedure: Procedure) => {
    if (!profile?.main_concerns?.length) return false;
    return procedure.concerns.some((c) => profile.main_concerns?.includes(c));
  };

  const hasActiveFilters = concernFilter || timeframeFilter || investmentFilter;

  const clearFilters = () => {
    setConcernFilter("");
    setTimeframeFilter("");
    setInvestmentFilter("");
    setSearchQuery("");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight mb-2">
          Discover Procedures
        </h1>
        <p className="text-muted-foreground">
          Explore our curated selection of premium aesthetic treatments
          {profile?.location_city && (
            <span className="text-foreground"> in {profile.location_city}</span>
          )}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        {/* Search bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search treatments..."
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-glass/60 border border-glass-border backdrop-blur-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
            />
          </div>
          <Button
            variant="glass"
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters row */}
        <div className={`flex flex-wrap gap-3 ${showFilters ? "block" : "hidden lg:flex"}`}>
          <ProcedureFilter
            label="Concern"
            options={concernOptions}
            value={concernFilter}
            onChange={setConcernFilter}
          />
          <ProcedureFilter
            label="Recovery Time"
            options={timeframeOptions}
            value={timeframeFilter}
            onChange={setTimeframeFilter}
          />
          <ProcedureFilter
            label="Investment"
            options={investmentOptions}
            value={investmentFilter}
            onChange={setInvestmentFilter}
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {filteredProcedures.length} treatment{filteredProcedures.length !== 1 && "s"} available
        </p>
      </div>

      {/* Procedures grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProcedures.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProcedures.map((procedure) => (
            <ProcedureCard
              key={procedure.id}
              procedure={procedure}
              isRecommended={isRecommended(procedure)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">
            No treatments match your criteria
          </p>
          <Button variant="glass" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
