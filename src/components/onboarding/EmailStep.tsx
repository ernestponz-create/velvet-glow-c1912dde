import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().trim().email("Please enter a valid email address");

interface EmailStepProps {
  onNext: (email: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const EmailStep = ({ onNext, isLoading, setIsLoading }: EmailStepProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      // Sign up with OTP (passwordless)
      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email: result.data,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      toast({
        title: "Verification sent",
        description: "Please check your email for the verification link.",
      });

      onNext(result.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-up">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-4">
          Begin Your Journey
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Enter your email to start your private consultation request. 
          We'll send you a secure verification link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-muted-foreground">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full h-14 px-5 rounded-xl bg-glass/60 border border-glass-border backdrop-blur-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            disabled={isLoading}
          />
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="velvet"
          size="xl"
          className="w-full group"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Continue"}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-8">
        By continuing, you agree to our{" "}
        <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        {" "}and{" "}
        <a href="#" className="text-primary hover:underline">Terms of Service</a>
      </p>
    </div>
  );
};

export default EmailStep;
