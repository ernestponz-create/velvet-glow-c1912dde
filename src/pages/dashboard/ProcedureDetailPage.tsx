import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Sparkles, ChevronRight, Star, MapPin, Check, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import BookingWizard from "@/components/booking/BookingWizard";
import AllProvidersModal from "@/components/discover/AllProvidersModal";
import { formatPriceRange } from "@/lib/pricing";

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

const investmentLabels: Record<string, { label: string; range: string }> = {
  signature: { label: "Signature", range: "$500 – $1,500" },
  premier: { label: "Premier", range: "$1,500 – $4,000" },
  exclusive: { label: "Exclusive", range: "$4,000+" },
};

const concernLabels: Record<string, string> = {
  "anti-aging": "Anti-Aging",
  "skin-texture": "Skin Texture",
  "volume-loss": "Volume Loss",
  "fine-lines": "Fine Lines",
  "skin-laxity": "Skin Tightening",
  "hyperpigmentation": "Hyperpigmentation",
  "acne-scarring": "Acne & Scarring",
  "preventative": "Preventative Care",
};

const whatToExpect = [
  { title: "Consultation", description: "Your specialist will assess your unique needs and create a personalized treatment plan." },
  { title: "Preparation", description: "Gentle cleansing and numbing to ensure your complete comfort throughout." },
  { title: "Treatment", description: "Expert application with precision techniques for optimal, natural-looking results." },
  { title: "Aftercare", description: "Detailed guidance and 24/7 concierge support for a smooth recovery." },
];

const benefits = [
  "Natural-looking, refined results",
  "Minimal to no downtime",
  "Long-lasting enhancement",
  "Personalized treatment approach",
  "Expert aftercare support",
];

const ProcedureDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { profile } = useAuth();
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAllProvidersOpen, setIsAllProvidersOpen] = useState(false);

  const handleBookClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsBookingOpen(true);
  };

  const handleBookingClose = () => {
    setIsBookingOpen(false);
    setSelectedProvider(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      // Fetch procedure and providers in parallel
      const [procedureResult, providersResult] = await Promise.all([
        supabase
          .from("procedures")
          .select("*")
          .eq("slug", slug)
          .maybeSingle(),
        supabase
          .from("providers")
          .select("*")
          .contains("procedures", [slug])
      ]);

      if (!procedureResult.error && procedureResult.data) {
        setProcedure(procedureResult.data);
      }

      if (!providersResult.error && providersResult.data) {
        // Filter by user's city if available, otherwise show top providers
        let filteredProviders = providersResult.data;
        if (profile?.location_city) {
          const cityProviders = providersResult.data.filter(
            (p) => p.city.toLowerCase() === profile.location_city?.toLowerCase()
          );
          filteredProviders = cityProviders.length > 0 ? cityProviders : providersResult.data;
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

    fetchData();
  }, [slug, profile?.location_city]);

  const isRecommended = procedure?.concerns.some((c) =>
    profile?.main_concerns?.includes(c)
  );

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
        <span className="ml-1.5 text-sm text-muted-foreground">{rating}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse">
        <div className="h-8 w-32 bg-muted rounded mb-8" />
        <div className="aspect-[21/9] bg-muted rounded-2xl mb-8" />
        <div className="h-10 w-2/3 bg-muted rounded mb-4" />
        <div className="h-6 w-full bg-muted rounded" />
      </div>
    );
  }

  if (!procedure) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <p className="text-muted-foreground mb-4">Procedure not found</p>
        <Link to="/dashboard/discover">
          <Button variant="glass">Back to Discover</Button>
        </Link>
      </div>
    );
  }

  const investment = investmentLabels[procedure.investment_level];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        to="/dashboard/discover"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Discover
      </Link>

      {/* Hero section */}
      <div className="relative aspect-[21/9] bg-gradient-to-br from-secondary via-muted to-secondary/50 rounded-3xl overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
        
        {/* Badges */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          {isRecommended && (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/90 backdrop-blur-sm shadow-lg">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-medium uppercase tracking-wider text-primary-foreground">
                Recommended for you
              </span>
            </div>
          )}
        </div>

        <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-background/70 backdrop-blur-md border border-glass-border shadow-lg">
          <span className="text-sm font-medium uppercase tracking-wider text-foreground">
            {investment.label}
          </span>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-3">
            {procedure.name}
          </h1>
          <p className="text-xl md:text-2xl text-primary italic font-light">
            "{procedure.benefit_phrase}"
          </p>
        </div>
      </div>

      {/* Concierge Recommendations Section */}
      {providers.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <h2 className="font-serif text-xl md:text-2xl text-center text-foreground">
              Your Velvet Concierge Recommendations
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>

          {profile?.location_city && (
            <p className="text-center text-muted-foreground text-sm mb-6">
              Top specialists near <span className="text-foreground font-medium">{profile.location_city}</span>
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="glass-card p-5 hover:border-primary/30 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.15)] transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
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
                  <div className="text-right">
                    {renderStars(provider.rating)}
                    {/* Investment range - under rating */}
                    <div className="mt-2">
                      <div className="inline-flex px-2.5 py-1 rounded-full border border-primary/30 bg-primary/5">
                        <span className="text-xs text-pearl">
                          {formatPriceRange(procedure.slug)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm text-foreground">
                    Next: {formatAvailability(provider.next_available_date, provider.next_available_time)}
                  </span>
                </div>

                {provider.recommendation_reason && (
                  <p className="text-sm text-primary/80 italic mb-4 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    "{provider.recommendation_reason}"
                  </p>
                )}

                <Button
                  variant="velvet"
                  size="sm"
                  className="w-full group"
                  onClick={() => handleBookClick(provider)}
                >
                  Book Priority Slot
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            ))}

            {/* Discover All Providers - 4th card */}
            <div className="glass-card p-5 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-all duration-300 min-h-[200px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-medium text-foreground mb-2">
                Discover More
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Browse all available specialists
              </p>
              <Button
                variant="glass"
                size="sm"
                className="group"
                onClick={() => setIsAllProvidersOpen(true)}
              >
                View All Providers
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Description */}
          <div>
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">
              About This Treatment
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {procedure.short_description}
            </p>
          </div>

          {/* What to Expect */}
          <div>
            <h2 className="font-serif text-2xl font-medium text-foreground mb-6">
              What to Expect
            </h2>
            <div className="space-y-4">
              {whatToExpect.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h2 className="font-serif text-2xl font-medium text-foreground mb-6">
              Benefits
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aftercare */}
          <div className="glass-card p-6">
            <h2 className="font-serif text-xl font-medium text-foreground mb-3">
              Aftercare & Support
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Your journey doesn't end with your treatment. Our dedicated aftercare team provides 24/7 concierge support, 
              personalized recovery guidance, and follow-up consultations to ensure your results exceed expectations.
            </p>
            <Link to="/dashboard/aftercare">
              <Button variant="glass" size="sm">
                Learn About Aftercare
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick facts */}
          <div className="glass-card p-6">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Quick Facts
            </h2>
            
            <div className="space-y-4">
              {procedure.duration_minutes && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-foreground font-medium">
                      {procedure.duration_minutes} minutes
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recovery</p>
                  <p className="text-foreground font-medium">
                    {procedure.recovery_days === 0
                      ? "No downtime"
                      : `${procedure.recovery_days} day${procedure.recovery_days !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Investment */}
          <div className="glass-card p-6">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
              Investment Level
            </h2>
            <p className="font-serif text-xl font-medium text-foreground">
              {investment.label}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {investment.range}
            </p>
          </div>

          {/* Concerns */}
          <div className="glass-card p-6">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
              Addresses
            </h2>
            <div className="flex flex-wrap gap-2">
              {procedure.concerns.map((concern) => (
                <span
                  key={concern}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                >
                  {concernLabels[concern] || concern}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link to="/dashboard/concierge" className="block">
            <Button variant="velvet" size="lg" className="group w-full">
              Request Consultation
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

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

      {/* All Providers Modal */}
      {procedure && (
        <AllProvidersModal
          isOpen={isAllProvidersOpen}
          onClose={() => setIsAllProvidersOpen(false)}
          procedureSlug={procedure.slug}
          procedureName={procedure.name}
          onSelectProvider={(provider) => {
            setSelectedProvider(provider);
            setIsBookingOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default ProcedureDetailPage;
