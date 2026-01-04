import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VerificationStepProps {
  email: string;
  onNext: () => void;
  onBack: () => void;
}

const VerificationStep = ({ email, onNext, onBack }: VerificationStepProps) => {
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          onNext();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [onNext]);

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (error) throw error;

      toast({
        title: "Email resent",
        description: "Please check your inbox for the new verification link.",
      });
      setCountdown(60);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to resend email",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fade-up text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-primary" />
      </div>
      
      <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-4">
        Check Your Inbox
      </h1>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        We've sent a verification link to{" "}
        <span className="text-foreground font-medium">{email}</span>. 
        Click the link to continue your onboarding.
      </p>

      <div className="glass-card p-8 mb-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Waiting for verification
          </span>
          <div className="w-12 h-px bg-border" />
        </div>
        
        <div className="animate-pulse flex justify-center">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-primary/60" />
            <div className="w-2 h-2 rounded-full bg-primary/30" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          variant="glass"
          size="lg"
          className="w-full group"
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
        >
          {isResending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Resending...
            </>
          ) : countdown > 0 ? (
            `Resend in ${countdown}s`
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Resend Email
            </>
          )}
        </Button>

        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-elegant"
        >
          Use a different email
        </button>
      </div>
    </div>
  );
};

export default VerificationStep;
