import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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

const ProcedureDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { profile } = useAuth();
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProcedure = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("procedures")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        setProcedure(data);
      }
      setIsLoading(false);
    };

    fetchProcedure();
  }, [slug]);

  const isRecommended = procedure?.concerns.some((c) =>
    profile?.main_concerns?.includes(c)
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-8 w-32 bg-muted rounded mb-8" />
        <div className="aspect-video bg-muted rounded-2xl mb-8" />
        <div className="h-10 w-2/3 bg-muted rounded mb-4" />
        <div className="h-6 w-full bg-muted rounded" />
      </div>
    );
  }

  if (!procedure) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-muted-foreground mb-4">Procedure not found</p>
        <Link to="/dashboard/discover">
          <Button variant="glass">Back to Discover</Button>
        </Link>
      </div>
    );
  }

  const investment = investmentLabels[procedure.investment_level];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        to="/dashboard/discover"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Discover
      </Link>

      {/* Hero image */}
      <div className="relative aspect-video bg-gradient-to-br from-secondary to-muted rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {isRecommended && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-primary-foreground">
                Recommended for you
              </span>
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-glass-border">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {investment.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-4">
            {procedure.name}
          </h1>

          <p className="text-xl text-primary italic mb-6">
            "{procedure.benefit_phrase}"
          </p>

          <p className="text-muted-foreground leading-relaxed mb-8">
            {procedure.short_description}
          </p>

          {/* Concerns */}
          <div className="mb-8">
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
          <Link to="/dashboard/concierge">
            <Button variant="velvet" size="xl" className="group w-full sm:w-auto">
              Request Consultation
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
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
        </div>
      </div>
    </div>
  );
};

export default ProcedureDetailPage;
