import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Clock } from "lucide-react";

interface WelcomeStepProps {
  userName?: string;
}

const WelcomeStep = ({ userName }: WelcomeStepProps) => {
  const displayName = userName || "there";

  return (
    <div className="fade-up text-center">
      {/* Celebration accent */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto border border-primary/20">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
      </div>

      <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-4">
        Welcome, <span className="text-gradient italic">{displayName}</span>
      </h1>
      
      <p className="text-xl text-muted-foreground mb-2">
        Your Concierge Journey Begins
      </p>
      
      <p className="text-muted-foreground max-w-lg mx-auto mb-12">
        You're now part of an exclusive community dedicated to timeless beauty. 
        Your personal concierge will be in touch within 24 hours.
      </p>

      {/* Benefits */}
      <div className="glass-card p-8 mb-10">
        <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-6">
          What Happens Next
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-foreground font-medium mb-1">Personal Concierge</p>
            <p className="text-xs text-muted-foreground">Assigned to your account</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-foreground font-medium mb-1">Curated Matches</p>
            <p className="text-xs text-muted-foreground">Based on your preferences</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-foreground font-medium mb-1">Priority Booking</p>
            <p className="text-xs text-muted-foreground">Skip the waiting lists</p>
          </div>
        </div>
      </div>

      <Link to="/dashboard">
        <Button variant="velvet" size="xl" className="group">
          Enter Your Dashboard
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
};

export default WelcomeStep;
