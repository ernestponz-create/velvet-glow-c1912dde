import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import EmailStep from "@/components/onboarding/EmailStep";
import VerificationStep from "@/components/onboarding/VerificationStep";
import PreferencesStep from "@/components/onboarding/PreferencesStep";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import { useToast } from "@/hooks/use-toast";

type OnboardingStep = "email" | "verification" | "preferences" | "welcome";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("email");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && currentStep === "verification") {
          // User just verified, check if onboarding is complete
          setTimeout(() => {
            checkOnboardingStatus(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check if user has completed onboarding
        checkOnboardingStatus(session.user.id);
      } else {
        setCheckingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (profile?.onboarding_completed) {
        navigate("/dashboard");
      } else {
        setCurrentStep("preferences");
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setCurrentStep("preferences");
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setCurrentStep("verification");
  };

  const handleVerificationComplete = () => {
    setCurrentStep("preferences");
  };

  const handlePreferencesSubmit = async (preferences: {
    ageRange: string;
    concerns: string[];
    location: string;
    budget: string;
  }) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          age_range: preferences.ageRange,
          main_concerns: preferences.concerns,
          location_city: preferences.location,
          budget_tier: preferences.budget,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setCurrentStep("welcome");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIndex = () => {
    switch (currentStep) {
      case "email": return 0;
      case "verification": return 1;
      case "preferences": return 2;
      case "welcome": return 3;
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-primary/20 mb-4" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-medium tracking-tight text-foreground">
            Velvet<span className="text-primary">.</span>
          </span>
        </Link>
      </header>

      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-secondary/30 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg relative z-10">
          {currentStep !== "welcome" && (
            <OnboardingProgress currentStep={getStepIndex()} totalSteps={4} />
          )}

          <div className="glass-card p-8 md:p-10">
            {currentStep === "email" && (
              <EmailStep
                onNext={handleEmailSubmit}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}

            {currentStep === "verification" && (
              <VerificationStep
                email={email}
                onNext={handleVerificationComplete}
                onBack={() => setCurrentStep("email")}
              />
            )}

            {currentStep === "preferences" && (
              <PreferencesStep
                onNext={handlePreferencesSubmit}
                isLoading={isLoading}
              />
            )}

            {currentStep === "welcome" && (
              <WelcomeStep userName={user?.email?.split("@")[0]} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
