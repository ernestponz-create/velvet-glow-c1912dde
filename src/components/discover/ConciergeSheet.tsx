import { useEffect, useState } from "react";
import { Star, MapPin, Calendar, Sparkles, Info, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BookingWizard from "@/components/booking/BookingWizard";

interface Procedure {
  id: string;
  name: string;
  slug: string;
  benefit_phrase: string;
  investment_level: string;
}

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
  provider_profile_id: string | null;
}

interface ConciergeSheetProps {
  procedure: Procedure | null;
  isOpen: boolean;
  onClose: () => void;
}

const ConciergeSheet = ({ procedure, isOpen, onClose }: ConciergeSheetProps) => {
  const { profile } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsBookingOpen(true);
  };

  const handleBookingClose = () => {
    setIsBookingOpen(false);
    setSelectedProvider(null);
  };

  useEffect(() => {
    const fetchProviders = async () => {
      if (!procedure || !isOpen) return;

      setIsLoading(true);

      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .contains("procedures", [procedure.slug]);

      if (!error && data) {
        // Filter by user's city if available
        let filteredProviders = data;
        if (profile?.location_city) {
          const cityProviders = data.filter(
            (p) => p.city.toLowerCase() === profile.location_city?.toLowerCase()
          );
          filteredProviders = cityProviders.length > 0 ? cityProviders : data;
        }
        // Sort by rating and take top 4
        setProviders(
          filteredProviders
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4)
        );
      }

      setIsLoading(false);
    };

    fetchProviders();
  }, [procedure, isOpen, profile?.location_city]);

  const formatAvailability = (date: string | null, time: string | null) => {
    if (!date) return "Contact for availability";
    
    const dateObj = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateStr: string;
    if (dateObj.toDateString() === today.toDateString()) {
      dateStr = "Today";
    } else if (dateObj.toDateString() === tomorrow.toDateString()) {
      dateStr = "Tomorrow";
    } else {
      dateStr = format(dateObj, "EEE, MMM d");
    }
    
    if (time) {
      const [hours, minutes] = time.split(":");
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours), parseInt(minutes));
      const formattedTime = format(timeDate, "h:mm a");
      return `${dateStr} at ${formattedTime}`;
    }
    return dateStr;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < Math.floor(rating)
                ? "fill-primary text-primary"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
        <span className="ml-1.5 text-sm font-medium text-foreground">{rating}</span>
      </div>
    );
  };

  if (!procedure) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto bg-[hsl(230_20%_10%)] border-glass-border p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-[hsl(230_20%_10%)] via-[hsl(230_20%_10%)] to-[hsl(230_20%_10%/0.95)] backdrop-blur-xl px-6 pt-6 pb-4 border-b border-glass-border">
          <DialogHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs uppercase tracking-widest text-primary font-medium">
                    Velvet Concierge
                  </span>
                </div>
                <DialogTitle className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-foreground">
                  Your Personal Concierge Recommendations
                </DialogTitle>
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              We've curated the finest options for{" "}
              <span className="text-foreground font-medium">{procedure.name}</span>
              {profile?.location_city && (
                <>
                  {" "}near{" "}
                  <span className="text-foreground font-medium">{profile.location_city}</span>
                </>
              )}
            </p>

            {/* Why these info */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="w-3.5 h-3.5" />
                    Why these recommendations?
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-[hsl(230_20%_15%)] border-glass-border text-foreground">
                  <p className="text-sm">
                    Selected based on your preferences, location, our vetted network, and highest patient satisfaction scores.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="flex justify-between mb-4">
                    <div className="h-6 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-20" />
                  </div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-10 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : providers.length > 0 ? (
            <div className="grid gap-4 stagger-children">
              {providers.map((provider, index) => (
                <article
                  key={provider.id}
                  className="glass-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.2)] group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                    <h3 className="font-serif text-xl font-medium text-foreground group-hover:text-primary transition-colors">
                        {provider.display_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{provider.neighborhood} · {provider.city}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {renderStars(provider.rating)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground font-medium">
                      {formatAvailability(provider.next_available_date, provider.next_available_time)}
                    </span>
                  </div>

                  {provider.recommendation_reason && (
                    <p className="text-sm text-muted-foreground italic mb-5 pl-4 border-l-2 border-primary/30">
                      "{provider.recommendation_reason}"
                    </p>
                  )}

                  <Button
                    variant="velvet"
                    className="w-full sm:w-auto group/btn"
                    onClick={() => handleBookClick(provider)}
                  >
                    Book Priority Slot
                    <Sparkles className="w-4 h-4 ml-2 transition-transform group-hover/btn:scale-110" />
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No specialists currently available for this procedure in your area.
              </p>
              <Button variant="glass">
                Expand Search Area
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-[hsl(230_20%_10%)] via-[hsl(230_20%_10%)] to-[hsl(230_20%_10%/0.95)] backdrop-blur-xl px-6 py-4 border-t border-glass-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              Refine recommendations
            </button>
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              Continue browsing
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Booking Wizard */}
      {procedure && (
        <BookingWizard
          isOpen={isBookingOpen}
          onClose={handleBookingClose}
          provider={selectedProvider}
          procedureSlug={procedure.slug}
          procedureName={procedure.name}
          investmentLevel={procedure.investment_level}
        />
      )}
    </Dialog>
  );
};

export default ConciergeSheet;
