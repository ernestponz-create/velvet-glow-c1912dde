import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

interface PreferencesStepProps {
  onNext: (preferences: {
    ageRange: string;
    concerns: string[];
    location: string;
    budget: string;
  }) => void;
  isLoading: boolean;
}

const ageRanges = [
  { value: "30-35", label: "30–35" },
  { value: "36-40", label: "36–40" },
  { value: "41-45", label: "41–45" },
  { value: "46-50", label: "46–50" },
  { value: "51-55", label: "51–55" },
  { value: "56-60", label: "56–60" },
  { value: "60+", label: "60+" },
];

const concerns = [
  { value: "anti-aging", label: "Anti-Aging & Rejuvenation" },
  { value: "skin-texture", label: "Skin Texture & Tone" },
  { value: "volume-loss", label: "Volume Loss & Contouring" },
  { value: "fine-lines", label: "Fine Lines & Wrinkles" },
  { value: "skin-laxity", label: "Skin Laxity & Tightening" },
  { value: "hyperpigmentation", label: "Hyperpigmentation" },
  { value: "acne-scarring", label: "Acne & Scarring" },
  { value: "preventative", label: "Preventative Care" },
];

const budgetTiers = [
  { value: "premium", label: "Premium", desc: "$5K–$15K annually" },
  { value: "luxury", label: "Luxury", desc: "$15K–$50K annually" },
  { value: "elite", label: "Elite", desc: "$50K+ annually" },
];

const PreferencesStep = ({ onNext, isLoading }: PreferencesStepProps) => {
  const [step, setStep] = useState(0);
  const [ageRange, setAgeRange] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");

  const toggleConcern = (value: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value]
    );
  };

  const handleNext = () => {
    setError("");
    
    if (step === 0 && !ageRange) {
      setError("Please select your age range");
      return;
    }
    if (step === 1 && selectedConcerns.length === 0) {
      setError("Please select at least one concern");
      return;
    }
    if (step === 2 && !location.trim()) {
      setError("Please enter your city");
      return;
    }
    if (step === 3 && !budget) {
      setError("Please select your preferred tier");
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      onNext({
        ageRange,
        concerns: selectedConcerns,
        location: location.trim(),
        budget,
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="fade-up">
            <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mb-3 text-center">
              Your Age Range
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              This helps us recommend appropriate treatments
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ageRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setAgeRange(range.value)}
                  className={`p-4 rounded-xl border transition-all ${
                    ageRange === range.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-glass-border bg-glass/40 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="fade-up">
            <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mb-3 text-center">
              Primary Concerns
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Select all that apply to personalize your recommendations
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {concerns.map((concern) => (
                <button
                  key={concern.value}
                  onClick={() => toggleConcern(concern.value)}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedConcerns.includes(concern.value)
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-glass-border bg-glass/40 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <span>{concern.label}</span>
                  {selectedConcerns.includes(concern.value) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="fade-up">
            <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mb-3 text-center">
              Your Location
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              We'll match you with top specialists in your area
            </p>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your city (e.g., New York, London, Dubai)"
              className="w-full h-14 px-5 rounded-xl bg-glass/60 border border-glass-border backdrop-blur-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              maxLength={100}
            />
          </div>
        );

      case 3:
        return (
          <div className="fade-up">
            <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mb-3 text-center">
              Investment Preference
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Select your preferred annual treatment budget
            </p>
            <div className="space-y-3">
              {budgetTiers.map((tier) => (
                <button
                  key={tier.value}
                  onClick={() => setBudget(tier.value)}
                  className={`w-full p-5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    budget === tier.value
                      ? "border-primary bg-primary/10"
                      : "border-glass-border bg-glass/40 hover:border-primary/30"
                  }`}
                >
                  <div>
                    <p className={`font-medium ${budget === tier.value ? "text-foreground" : "text-muted-foreground"}`}>
                      {tier.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{tier.desc}</p>
                  </div>
                  {budget === tier.value && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {/* Mini progress for preferences */}
      <div className="flex justify-center gap-2 mb-8">
        {[0, 1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-all ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {renderStep()}

      {error && (
        <p className="text-sm text-destructive text-center mt-4">{error}</p>
      )}

      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button
            variant="glass"
            size="lg"
            onClick={() => setStep(step - 1)}
            className="flex-1"
          >
            Back
          </Button>
        )}
        <Button
          variant="velvet"
          size="lg"
          onClick={handleNext}
          className="flex-1 group"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : step === 3 ? "Complete" : "Continue"}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};

export default PreferencesStep;
