import { Crown, Star, Sparkles, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TierBenefit {
  tier: 'member' | 'premium' | 'luxury' | 'elite';
  spend_threshold: number;
  event_access_level: string;
  product_discount_percent: number;
  description: string;
}

interface MembershipTierCardProps {
  currentTier: 'member' | 'premium' | 'luxury' | 'elite' | null;
  totalSpend: number | null;
  compact?: boolean;
}

const tierConfig = {
  member: {
    label: "Member",
    icon: Star,
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
  },
  premium: {
    label: "Premium",
    icon: Sparkles,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  luxury: {
    label: "Luxury",
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  elite: {
    label: "Elite",
    icon: Crown,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
  },
};

const tierOrder: Array<'member' | 'premium' | 'luxury' | 'elite'> = ['member', 'premium', 'luxury', 'elite'];

const MembershipTierCard = ({ currentTier, totalSpend, compact = false }: MembershipTierCardProps) => {
  const [benefits, setBenefits] = useState<TierBenefit[]>([]);
  const tier = currentTier || 'member';
  const config = tierConfig[tier];
  const Icon = config.icon;
  const spend = totalSpend || 0;

  useEffect(() => {
    const fetchBenefits = async () => {
      const { data } = await supabase
        .from("member_benefits")
        .select("*")
        .order("spend_threshold", { ascending: true });
      
      if (data) {
        setBenefits(data as TierBenefit[]);
      }
    };
    fetchBenefits();
  }, []);

  const currentBenefit = benefits.find(b => b.tier === tier);
  const currentTierIndex = tierOrder.indexOf(tier);
  const nextTier = currentTierIndex < tierOrder.length - 1 ? tierOrder[currentTierIndex + 1] : null;
  const nextBenefit = nextTier ? benefits.find(b => b.tier === nextTier) : null;
  const spendToNext = nextBenefit ? nextBenefit.spend_threshold - spend : 0;
  const progressPercent = nextBenefit 
    ? ((spend - (currentBenefit?.spend_threshold || 0)) / (nextBenefit.spend_threshold - (currentBenefit?.spend_threshold || 0))) * 100
    : 100;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} border ${config.borderColor}`}>
        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
      </div>
    );
  }

  return (
    <div className={`glass-card p-4 md:p-5 border ${config.borderColor}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 md:w-6 md:h-6 ${config.color}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Membership Tier</p>
            <h3 className={`font-serif text-lg md:text-xl font-medium ${config.color}`}>{config.label}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total Spend</p>
          <p className="font-medium text-foreground">${spend.toLocaleString()}</p>
        </div>
      </div>

      {/* Current benefits */}
      {currentBenefit && (
        <div className="space-y-2 mb-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Your Benefits</p>
          <div className="flex flex-wrap gap-2">
            {currentBenefit.product_discount_percent > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs">
                <Gift className="w-3 h-3" />
                {currentBenefit.product_discount_percent}% Product Discount
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs capitalize">
              <Sparkles className="w-3 h-3" />
              {currentBenefit.event_access_level} Event Access
            </div>
          </div>
        </div>
      )}

      {/* Progress to next tier */}
      {nextTier && nextBenefit && (
        <div className="pt-3 border-t border-border/50">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">Progress to {tierConfig[nextTier].label}</span>
            <span className="text-foreground">${spendToNext.toLocaleString()} to go</span>
          </div>
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {tier === 'elite' && (
        <div className="pt-3 border-t border-border/50">
          <p className="text-xs text-center text-muted-foreground">
            You've reached the highest tier! Enjoy exclusive benefits.
          </p>
        </div>
      )}
    </div>
  );
};

export default MembershipTierCard;
