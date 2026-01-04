import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Star, 
  MapPin, 
  Calendar,
  ChevronRight,
  Sparkles,
  RotateCcw,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPriceRange } from "@/lib/pricing";

interface Provider {
  id: string;
  name: string;
  display_name: string;
  specialty: string;
  neighborhood: string;
  city: string;
  rating: number;
  review_count: number;
  procedures: string[];
  recommendation_reason: string | null;
  image_url: string | null;
}

interface PastBooking {
  id: string;
  procedure_name: string;
  procedure_slug: string;
  preferred_date: string;
  status: string;
  provider_id: string;
  provider?: Provider;
}

const procedures = [
  { slug: "botox", name: "Botox", icon: "💉" },
  { slug: "dermal-fillers", name: "Dermal Fillers", icon: "✨" },
  { slug: "laser-resurfacing", name: "Laser Resurfacing", icon: "🔬" },
  { slug: "morpheus8", name: "Morpheus8", icon: "⚡" },
  { slug: "hydrafacial", name: "HydraFacial", icon: "💧" },
  { slug: "lip-enhancement", name: "Lip Enhancement", icon: "💋" },
];

const QuickBookPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [pastBookings, setPastBookings] = useState<PastBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user, selectedProcedure]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch providers
    let providerQuery = supabase.from("providers").select("*").limit(4);
    if (selectedProcedure) {
      providerQuery = providerQuery.contains("procedures", [selectedProcedure]);
    }
    const { data: providerData } = await providerQuery;
    setProviders(providerData || []);

    // Fetch past bookings for the user
    if (user) {
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["completed", "confirmed"])
        .order("preferred_date", { ascending: false })
        .limit(5);

      if (bookingData && bookingData.length > 0) {
        // Fetch provider details for each booking
        const providerIds = [...new Set(bookingData.map(b => b.provider_id))];
        const { data: bookingProviders } = await supabase
          .from("providers")
          .select("*")
          .in("id", providerIds);

        const bookingsWithProviders = bookingData.map(booking => ({
          ...booking,
          provider: bookingProviders?.find(p => p.id === booking.provider_id)
        }));
        setPastBookings(bookingsWithProviders);
      } else {
        setPastBookings([]);
      }
    }
    
    setLoading(false);
  };

  const toggleCompare = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const getComparisonItems = () => {
    const items: Array<{
      id: string;
      name: string;
      rating: number;
      priceRange: string;
      location: string;
      type: "new" | "past";
    }> = [];

    selectedForCompare.forEach(id => {
      const provider = providers.find(p => p.id === id);
      if (provider) {
        items.push({
          id: provider.id,
          name: provider.display_name,
          rating: Number(provider.rating),
          priceRange: selectedProcedure ? formatPriceRange(selectedProcedure) : "£400–£1,200",
          location: `${provider.neighborhood}, ${provider.city}`,
          type: "new"
        });
      }
      
      const booking = pastBookings.find(b => b.id === id);
      if (booking?.provider) {
        items.push({
          id: booking.id,
          name: booking.provider.display_name,
          rating: Number(booking.provider.rating),
          priceRange: formatPriceRange(booking.procedure_slug),
          location: `${booking.provider.neighborhood}, ${booking.provider.city}`,
          type: "past"
        });
      }
    });

    return items;
  };

  const filteredProcedures = procedures.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 px-6 mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            Book Your <span className="text-primary font-medium">Treatment</span>
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Fast path to your next appointment
          </p>
        </div>
      </section>

      {/* Procedure Selector */}
      <section className="px-6 mb-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Select Treatment
            </h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search treatments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-glass-border"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {filteredProcedures.map((proc) => (
                <button
                  key={proc.slug}
                  onClick={() => setSelectedProcedure(
                    selectedProcedure === proc.slug ? null : proc.slug
                  )}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-200 text-center",
                    selectedProcedure === proc.slug
                      ? "bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                      : "bg-background/30 border-glass-border hover:border-primary/30"
                  )}
                >
                  <span className="text-2xl mb-2 block">{proc.icon}</span>
                  <span className="text-sm font-medium">{proc.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Recommended Providers */}
            <div>
              <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Recommended Options
              </h2>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-6 animate-pulse">
                      <div className="h-6 bg-muted/20 rounded w-1/2 mb-3" />
                      <div className="h-4 bg-muted/20 rounded w-1/3 mb-2" />
                      <div className="h-4 bg-muted/20 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : providers.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-muted-foreground">No providers available for this treatment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {providers.map((provider) => (
                    <div
                      key={provider.id}
                      className={cn(
                        "glass-card p-5 transition-all duration-200",
                        selectedForCompare.includes(provider.id)
                          ? "border-primary/40 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                          : "hover:border-primary/20"
                      )}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-lg">{provider.display_name}</h3>
                          <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {selectedProcedure ? formatPriceRange(selectedProcedure) : "£400–£1,200"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          {provider.rating} ({provider.review_count})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {provider.neighborhood}
                        </span>
                      </div>
                      
                      {provider.recommendation_reason && (
                        <p className="text-sm text-muted-foreground mb-4 italic">
                          "{provider.recommendation_reason}"
                        </p>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          variant="velvet"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/dashboard/discover/${selectedProcedure || 'botox'}`)}
                        >
                          Book Now
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCompare(provider.id)}
                          className={cn(
                            "border-glass-border",
                            selectedForCompare.includes(provider.id) && "bg-primary/10 border-primary/40"
                          )}
                        >
                          {selectedForCompare.includes(provider.id) ? "Selected" : "Compare"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Past Bookings */}
            <div>
              <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-primary" />
                Your Past Treatments
              </h2>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="glass-card p-6 animate-pulse">
                      <div className="h-6 bg-muted/20 rounded w-1/2 mb-3" />
                      <div className="h-4 bg-muted/20 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : pastBookings.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-2">No past treatments yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    Your booking history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={cn(
                        "glass-card p-5 transition-all duration-200",
                        selectedForCompare.includes(booking.id)
                          ? "border-primary/40 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                          : "hover:border-primary/20"
                      )}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{booking.procedure_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.provider?.display_name || "Provider"}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {formatPriceRange(booking.procedure_slug)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {booking.provider && (
                          <>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-primary text-primary" />
                              {booking.provider.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {booking.provider.neighborhood}
                            </span>
                          </>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.preferred_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="velvet"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/dashboard/discover/${booking.procedure_slug}`)}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Rebook
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCompare(booking.id)}
                          className={cn(
                            "border-glass-border",
                            selectedForCompare.includes(booking.id) && "bg-primary/10 border-primary/40"
                          )}
                        >
                          {selectedForCompare.includes(booking.id) ? "Selected" : "Compare"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Comparison Bar */}
          {selectedForCompare.length >= 2 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
              <Button
                variant="velvet"
                size="lg"
                onClick={() => setShowComparison(true)}
                className="shadow-lg shadow-primary/20"
              >
                Compare {selectedForCompare.length} Options
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Comparison Modal */}
          {showComparison && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="glass-card p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium">Compare Options</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowComparison(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {getComparisonItems().map((item) => (
                    <div key={item.id} className="glass-card p-5 text-center">
                      <h3 className="font-medium text-lg mb-3">{item.name}</h3>
                      
                      <Badge className="bg-primary/10 text-primary border-primary/30 mb-3">
                        {item.priceRange}
                      </Badge>
                      
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Star className="w-5 h-5 fill-primary text-primary" />
                        <span className="font-medium">{item.rating}</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {item.location}
                      </p>
                      
                      <Button
                        variant="velvet"
                        className="w-full"
                        onClick={() => {
                          setShowComparison(false);
                          navigate(`/dashboard/discover/${selectedProcedure || 'botox'}`);
                        }}
                      >
                        {item.type === "past" ? "Rebook Now" : "Book Now"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Need help choosing? Explore our full treatment catalog
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/discover")}
              className="border-glass-border"
            >
              Browse All Treatments
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuickBookPage;
