import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Star, MapPin, Search, X, Check, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPriceRange, getConciergePrice } from "@/lib/pricing";

interface Provider {
  id: string;
  name: string;
  display_name: string;
  rating: number;
  review_count: number;
  neighborhood: string;
  city: string;
  specialty: string;
  procedures: string[];
  recommendation_reason: string | null;
  image_url: string | null;
}

interface PastBooking {
  id: string;
  procedure_name: string;
  procedure_slug: string;
  provider_id: string;
  preferred_date: string;
  price_paid: number | null;
  investment_level: string;
  provider?: Provider;
}

const procedures = [
  { slug: "botox", name: "Botox" },
  { slug: "dermal-fillers", name: "Dermal Fillers" },
  { slug: "laser-resurfacing", name: "Laser Resurfacing" },
  { slug: "morpheus8", name: "Morpheus8" },
  { slug: "hydrafacial", name: "HydraFacial" },
  { slug: "chemical-peel", name: "Chemical Peel" },
  { slug: "microneedling", name: "Microneedling" },
  { slug: "prp-therapy", name: "PRP Therapy" },
  { slug: "thread-lift", name: "Thread Lift" },
  { slug: "ultherapy", name: "Ultherapy" },
  { slug: "lip-enhancement", name: "Lip Enhancement" },
  { slug: "ipl-photofacial", name: "IPL Photofacial" },
];

const QuickBookPage = () => {
  const { user } = useAuth();
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [pastBookings, setPastBookings] = useState<PastBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

  // Fetch providers and past bookings
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch providers
      const { data: providersData } = await supabase
        .from("providers")
        .select("*")
        .limit(20);
      
      if (providersData) {
        setProviders(providersData);
      }

      // Fetch past bookings if user is logged in
      if (user) {
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("preferred_date", { ascending: false })
          .limit(10);

        if (bookingsData) {
          // Fetch provider details for each booking
          const bookingsWithProviders = await Promise.all(
            bookingsData.map(async (booking) => {
              const { data: provider } = await supabase
                .from("providers")
                .select("*")
                .eq("id", booking.provider_id)
                .maybeSingle();
              return { ...booking, provider: provider || undefined };
            })
          );
          setPastBookings(bookingsWithProviders);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Determine most frequent procedure
  const mostFrequentProcedure = useMemo(() => {
    if (pastBookings.length === 0) return null;
    const counts: Record<string, number> = {};
    pastBookings.forEach((b) => {
      counts[b.procedure_slug] = (counts[b.procedure_slug] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || null;
  }, [pastBookings]);

  // Filter procedures by search
  const filteredProcedures = procedures.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter providers by selected procedure
  const filteredProviders = useMemo(() => {
    if (!selectedProcedure) return providers.slice(0, 4);
    return providers.filter((p) => p.procedures?.includes(selectedProcedure)).slice(0, 4);
  }, [providers, selectedProcedure]);

  // Find concierge's pick (highest rated provider)
  const conciergePickId = useMemo(() => {
    if (filteredProviders.length === 0) return null;
    
    const topProvider = filteredProviders.reduce((prev, curr) => 
      Number(curr.rating) > Number(prev.rating) ? curr : prev
    );
    
    return topProvider?.id || null;
  }, [filteredProviders]);

  // Filter past bookings by selected procedure
  const filteredPastBookings = useMemo(() => {
    if (!selectedProcedure) return pastBookings;
    return pastBookings.filter((b) => b.procedure_slug === selectedProcedure);
  }, [pastBookings, selectedProcedure]);

  // Get items for comparison
  const comparisonItems = useMemo(() => {
    const items: Array<{ type: "new" | "past"; provider: Provider; booking?: PastBooking }> = [];
    
    selectedForCompare.forEach((id) => {
      // Check if it's a provider
      const provider = providers.find((p) => p.id === id);
      if (provider) {
        items.push({ type: "new", provider });
        return;
      }
      // Check if it's a past booking
      const booking = pastBookings.find((b) => b.id === id);
      if (booking?.provider) {
        items.push({ type: "past", provider: booking.provider, booking });
      }
    });
    
    return items;
  }, [selectedForCompare, providers, pastBookings]);

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < Math.floor(rating) ? "text-primary fill-primary" : "text-muted-foreground/30"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Hero */}
      <div className="text-center py-12 md:py-16">
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-4">
          Book or <span className="text-gradient italic">Rebook</span> Your Treatment
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Select a treatment to see recommended providers and your past appointments
        </p>
      </div>

      {/* Procedure Selector */}
      <div className="mb-12">
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search treatments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 border-primary/20 focus:border-primary/50"
          />
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {filteredProcedures.map((proc) => {
            const isSelected = selectedProcedure === proc.slug;
            const isMostFrequent = mostFrequentProcedure === proc.slug;
            
            return (
              <button
                key={proc.slug}
                onClick={() => setSelectedProcedure(isSelected ? null : proc.slug)}
                className={`
                  px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300
                  ${isSelected 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "glass-card border-primary/10 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                  }
                  ${isMostFrequent && !isSelected ? "ring-2 ring-primary/30" : ""}
                `}
              >
                {proc.name}
                {isMostFrequent && !isSelected && (
                  <span className="ml-2 text-xs text-primary">★ Frequent</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recommended New Options */}
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-medium mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-primary" />
              </span>
              Recommended New Options
            </h2>
            
            {filteredProviders.length === 0 ? (
              <div className="glass-card p-8 text-center border-primary/10">
                <p className="text-muted-foreground">No providers found for this treatment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProviders.map((provider) => {
                  const isConciergePick = provider.id === conciergePickId;
                  
                  return (
                  <div
                    key={provider.id}
                    className={`
                      glass-card p-5 border-primary/10 transition-all duration-300 overflow-hidden
                      hover:border-primary/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]
                      ${selectedForCompare.has(provider.id) ? "ring-2 ring-primary" : ""}
                    `}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-medium text-lg">{provider.display_name}</h3>
                          {isConciergePick && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              Concierge's Pick
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                      </div>
                      <button
                        onClick={() => toggleCompare(provider.id)}
                        className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                          ${selectedForCompare.has(provider.id) 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "border-muted-foreground/30 hover:border-primary/50"
                          }
                        `}
                      >
                        {selectedForCompare.has(provider.id) && <Check className="w-3 h-3" />}
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {renderStars(Number(provider.rating))}
                      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {formatPriceRange(selectedProcedure || "botox")}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        {provider.neighborhood}
                      </span>
                    </div>
                    
                    {provider.recommendation_reason && (
                      <p className="text-sm text-muted-foreground italic mb-4">
                        "{provider.recommendation_reason}"
                      </p>
                    )}
                    
                    <Link to={`/dashboard/discover/${selectedProcedure || "botox"}`}>
                      <Button variant="velvet" size="sm" className="w-full">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Past Treatments */}
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-medium mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-primary" />
              </span>
              Your Past Treatments
            </h2>
            
            {filteredPastBookings.length === 0 ? (
              <div className="glass-card p-8 text-center border-primary/10">
                <p className="text-muted-foreground">
                  {pastBookings.length === 0 
                    ? "No past bookings yet" 
                    : "No past bookings for this treatment"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPastBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`
                      glass-card p-5 border-primary/10 transition-all duration-300
                      hover:border-primary/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]
                      ${selectedForCompare.has(booking.id) ? "ring-2 ring-primary" : ""}
                    `}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-lg">
                          {booking.provider?.display_name || "Provider"}
                        </h3>
                        <p className="text-sm text-muted-foreground">{booking.procedure_name}</p>
                      </div>
                      <button
                        onClick={() => toggleCompare(booking.id)}
                        className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                          ${selectedForCompare.has(booking.id) 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "border-muted-foreground/30 hover:border-primary/50"
                          }
                        `}
                      >
                        {selectedForCompare.has(booking.id) && <Check className="w-3 h-3" />}
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {booking.provider && renderStars(Number(booking.provider.rating))}
                      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {formatPriceRange(booking.procedure_slug)}
                      </span>
                      {booking.provider && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          {booking.provider.neighborhood}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      Last visited: {new Date(booking.preferred_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </p>
                    
                    <Link to={`/dashboard/discover/${booking.procedure_slug}`}>
                      <Button variant="velvet" size="sm" className="w-full">
                        Rebook with Same Provider
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Toggle */}
      {selectedForCompare.size >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            variant="velvet"
            size="lg"
            onClick={() => setShowComparison(true)}
            className="shadow-2xl shadow-primary/30"
          >
            Compare {selectedForCompare.size} Options
          </Button>
        </div>
      )}

      {/* Comparison Overlay */}
      {showComparison && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-auto">
          <div className="max-w-5xl mx-auto py-12 px-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-medium">
                Compare <span className="text-gradient">Options</span>
              </h2>
              <button
                onClick={() => setShowComparison(false)}
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisonItems.map((item) => (
                <div
                  key={item.booking?.id || item.provider.id}
                  className="glass-card p-6 border-primary/20"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-serif text-primary">
                        {item.provider.display_name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="font-medium text-lg mb-1">{item.provider.display_name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.type === "past" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                    }`}>
                      {item.type === "past" ? "Previous Provider" : "New Option"}
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Price Range</span>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {formatPriceRange(selectedProcedure || item.booking?.procedure_slug || "botox")}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Rating</span>
                      {renderStars(Number(item.provider.rating))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="text-sm flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        {item.provider.neighborhood}
                      </span>
                    </div>
                  </div>
                  
                  <Link to={`/dashboard/discover/${selectedProcedure || item.booking?.procedure_slug || "botox"}`}>
                    <Button variant="velvet" className="w-full">
                      {item.type === "past" ? "Rebook Now" : "Book Now"}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <Link to="/dashboard/discover">
          <Button variant="outline" size="lg" className="border-primary/30 hover:border-primary/60">
            Continue to Calendar & Confirm
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default QuickBookPage;
