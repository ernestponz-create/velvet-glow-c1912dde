import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().trim().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

interface EmailStepProps {
  onNext: (email: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const EmailStep = ({ onNext, isLoading, setIsLoading }: EmailStepProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.errors[0].message);
      return;
    }

    // Validate password
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setError(passwordResult.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      // Sign up with email and password
      const { error: signUpError } = await supabase.auth.signUp({
        email: emailResult.data,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          throw new Error("This email is already registered. Please sign in instead.");
        }
        throw signUpError;
      }

      toast({
        title: "Verification sent",
        description: "Please check your email for the verification link.",
      });

      onNext(emailResult.data);
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
          Create your account to start your private consultation request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-muted-foreground">
            Create Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full h-14 px-5 pr-12 rounded-xl bg-glass/60 border border-glass-border backdrop-blur-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          variant="velvet"
          size="xl"
          className="w-full group"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create Account"}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link to="/signin" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        By continuing, you agree to our{" "}
        <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        {" "}and{" "}
        <a href="#" className="text-primary hover:underline">Terms of Service</a>
      </p>
    </div>
  );
};

export default EmailStep;
