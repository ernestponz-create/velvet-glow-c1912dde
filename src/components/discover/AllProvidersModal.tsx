import { useState, useEffect, useMemo } from "react";
import { Star, MapPin, Calendar, Sparkles, ChevronRight, Search, X, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatPriceRange, getPriceRange } from "@/lib/pricing";

interface Provider {
  id: string;
  name: string;
  display_name: string;
  specialty: string;
  neighborhood: string;
  city: string;
  rating: number;
  review_count: number;
  next_available_date: string | null;
  next_available_time: string | null;
  recommendation_reason: string | null;
  procedures: string[];
  years_experience: number | null;
}

interface AllProvidersModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedureSlug: string;
  procedureName: string;
  onSelectProvider: (provider: Provider) => void;
}

type SortOption = "rating" | "price-low" | "price-high" | "availability";

const AllProvidersModal = ({
  isOpen,
  onClose,
  procedureSlug,
  procedureName,
  onSelectProvider,
}: AllProvidersModalProps) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([200, 5000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>("rating");

  // Get available cities from providers
  const cities = useMemo(() => {
    const uniqueCities = [...new Set(providers.map((p) => p.city))];
    return uniqueCities.sort();
  }, [providers]);

  const [selectedCity, setSelectedCity] = useState<string>("all");

  useEffect(() => {
    if (!isOpen) return;

    const fetchProviders = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .contains("procedures", [procedureSlug]);

      if (!error && data) {
        setProviders(data);
      }
      setIsLoading(false);
    };

    fetchProviders();
  }, [isOpen, procedureSlug]);

  const priceRangeForProcedure = getPriceRange(procedureSlug) || { min: 200, max: 2000 };

  const filteredAndSortedProviders = useMemo(() => {
    let filtered = providers.filter((provider) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          provider.display_name.toLowerCase().includes(query) ||
          provider.city.toLowerCase().includes(query) ||
          provider.neighborhood.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // City filter
      if (selectedCity !== "all" && provider.city !== selectedCity) {
        return false;
      }

      // Rating filter
      if (provider.rating < minRating) {
        return false;
      }

      return true;
    });

    // Sort
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "availability":
        filtered.sort((a, b) => {
          if (!a.next_available_date) return 1;
          if (!b.next_available_date) return -1;
          return new Date(a.next_available_date).getTime() - new Date(b.next_available_date).getTime();
        });
        break;
      case "price-low":
      case "price-high":
        // For MVP, sort by rating since we don't have individual provider prices
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  }, [providers, searchQuery, selectedCity, minRating, sortBy]);

  const formatAvailability = (date: string | null, time: string | null) => {
    if (!date) return "Contact for availability";
    const dateObj = new Date(date);
    const formattedDate = format(dateObj, "EEE, MMM d");
    if (time) {
      const [hours, minutes] = time.split(":");
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours), parseInt(minutes));
      const formattedTime = format(timeDate, "h:mm a");
      return `${formattedDate} at ${formattedTime}`;
    }
    return formattedDate;
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1.5 text-sm font-medium">{rating}</span>
    </div>
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCity("all");
    setMinRating(0);
    setPriceRange([200, 5000]);
    setSortBy("rating");
  };

  const hasActiveFilters = searchQuery || selectedCity !== "all" || minRating > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden bg-[hsl(230_20%_8%)] border-glass-border p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-glass-border">
          <DialogTitle className="font-serif text-2xl text-foreground">
            All Providers for {procedureName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredAndSortedProviders.length} specialists available
          </p>
        </DialogHeader>

        {/* Filters Bar */}
        <div className="px-6 py-4 border-b border-glass-border space-y-4">
          {/* Search and toggle */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-glass/40 border-glass-border"
              />
            </div>
            <Button
              variant="glass"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "border-primary/50")}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="grid sm:grid-cols-3 gap-4 pt-2 fade-up">
              {/* City */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Location
                </label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="bg-glass/40 border-glass-border">
                    <SelectValue placeholder="All cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Min Rating */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Minimum Rating
                </label>
                <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number(v))}>
                  <SelectTrigger className="bg-glass/40 border-glass-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any rating</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="bg-glass/40 border-glass-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="availability">Soonest Available</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active filters indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Active filters</span>
              <button
                onClick={clearFilters}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Clear all
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Providers list */}
        <div className="overflow-y-auto max-h-[60vh] p-6 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-5 animate-pulse">
                  <div className="h-5 w-48 bg-muted rounded mb-3" />
                  <div className="h-4 w-32 bg-muted rounded mb-2" />
                  <div className="h-4 w-40 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : filteredAndSortedProviders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No providers match your criteria</p>
              <Button variant="glass" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            filteredAndSortedProviders.map((provider) => (
              <div
                key={provider.id}
                className="glass-card p-5 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-serif text-lg font-medium text-foreground">
                          {provider.display_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {provider.neighborhood}, {provider.city}
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        {renderStars(provider.rating)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm text-foreground">
                          {formatAvailability(provider.next_available_date, provider.next_available_time)}
                        </span>
                      </div>

                      {/* Investment range */}
                      <div className="px-2.5 py-1 rounded-full border border-primary/30 bg-primary/5">
                        <span className="text-xs text-pearl">
                          Investment: {formatPriceRange(procedureSlug)}
                        </span>
                      </div>

                      <div className="sm:hidden">{renderStars(provider.rating)}</div>
                    </div>

                    {provider.recommendation_reason && (
                      <p className="text-sm text-primary/80 italic mt-3 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                        "{provider.recommendation_reason}"
                      </p>
                    )}
                  </div>

                  <div className="sm:flex-shrink-0">
                    <Button
                      variant="velvet"
                      size="sm"
                      className="w-full sm:w-auto group"
                      onClick={() => {
                        onSelectProvider(provider);
                        onClose();
                      }}
                    >
                      Book Priority Slot
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllProvidersModal;
