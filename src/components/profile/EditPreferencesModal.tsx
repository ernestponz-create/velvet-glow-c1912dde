import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X } from "lucide-react";

interface EditPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPreferences: {
    ageRange?: string;
    concerns?: string[];
    location?: string;
    budget?: string;
  };
  onSave: (preferences: {
    ageRange: string;
    concerns: string[];
    location: string;
    budget: string;
  }) => Promise<void>;
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

const EditPreferencesModal = ({
  open,
  onOpenChange,
  currentPreferences,
  onSave,
  isLoading,
}: EditPreferencesModalProps) => {
  const [ageRange, setAgeRange] = useState(currentPreferences.ageRange || "");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    currentPreferences.concerns || []
  );
  const [location, setLocation] = useState(currentPreferences.location || "");
  const [budget, setBudget] = useState(currentPreferences.budget || "");

  const toggleConcern = (value: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value]
    );
  };

  const handleSave = async () => {
    await onSave({
      ageRange,
      concerns: selectedConcerns,
      location: location.trim(),
      budget,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Edit Preferences</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Age Range */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Age Range</h3>
            <div className="grid grid-cols-4 gap-2">
              {ageRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setAgeRange(range.value)}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    ageRange === range.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Concerns */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Primary Concerns</h3>
            <div className="grid grid-cols-2 gap-2">
              {concerns.map((concern) => (
                <button
                  key={concern.value}
                  onClick={() => toggleConcern(concern.value)}
                  className={`p-2.5 text-sm rounded-lg border text-left transition-all flex items-center justify-between ${
                    selectedConcerns.includes(concern.value)
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <span className="truncate">{concern.label}</span>
                  {selectedConcerns.includes(concern.value) && (
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Location</h3>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your city"
              className="w-full h-11 px-4 rounded-lg bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              maxLength={100}
            />
          </div>

          {/* Budget */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Investment Preference</h3>
            <div className="space-y-2">
              {budgetTiers.map((tier) => (
                <button
                  key={tier.value}
                  onClick={() => setBudget(tier.value)}
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                    budget === tier.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:border-primary/30"
                  }`}
                >
                  <div>
                    <p className={`text-sm font-medium ${budget === tier.value ? "text-foreground" : "text-muted-foreground"}`}>
                      {tier.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{tier.desc}</p>
                  </div>
                  {budget === tier.value && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="velvet"
            className="flex-1"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPreferencesModal;
