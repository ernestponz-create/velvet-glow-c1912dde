import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
      
      {/* Subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 container-elegant text-center">
        <div className="max-w-4xl mx-auto stagger-children">
          {/* Eyebrow */}
          <p className="text-primary/80 text-sm tracking-[0.3em] uppercase mb-6">
            Private Concierge Services
          </p>
          
          {/* Main headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight mb-6">
            Timeless Beauty,
            <br />
            <span className="text-gradient italic">Discreetly Yours</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Your private concierge to the finest cosmetic specialists worldwide. 
            Curated excellence, absolute discretion, personalized care.
          </p>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/onboarding">
              <Button variant="velvet" size="xl" className="group">
                Request Private Consultation
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-border/30">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-xs tracking-[0.2em] uppercase text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                Curated
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                Confidential
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                Concierge Care
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-primary/60" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
