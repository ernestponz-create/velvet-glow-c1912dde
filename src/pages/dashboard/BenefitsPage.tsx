import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Star, Sparkles, Gift, Lock, Calendar, ShoppingBag, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierBenefit {
  tier: 'member' | 'premium' | 'luxury' | 'elite';
  spend_threshold: number;
  event_access_level: string;
  product_discount_percent: number;
  description: string;
}

const tierOrder: Array<'member' | 'premium' | 'luxury' | 'elite'> = ['member', 'premium', 'luxury', 'elite'];

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

// Define all available benefits with their required tier
const allBenefits = [
  // Member benefits (available to all)
  {
    id: "welcome-kit",
    title: "Welcome Kit",
    description: "Complimentary skincare samples upon signup",
    icon: Gift,
    requiredTier: "member" as const,
    category: "Products",
  },
  {
    id: "newsletter",
    title: "Exclusive Newsletter",
    description: "Monthly beauty tips and treatment insights",
    icon: Sparkles,
    requiredTier: "member" as const,
    category: "Content",
  },
  // Premium benefits
  {
    id: "product-discount-5",
    title: "5% Product Discount",
    description: "Save on all skincare and beauty products",
    icon: ShoppingBag,
    requiredTier: "premium" as const,
    category: "Discounts",
  },
  {
    id: "priority-events",
    title: "Priority Event Access",
    description: "Early registration for workshops and events",
    icon: Calendar,
    requiredTier: "premium" as const,
    category: "Events",
  },
  {
    id: "seasonal-gifts",
    title: "Seasonal Gift Box",
    description: "Quarterly curated beauty box delivered to you",
    icon: Gift,
    requiredTier: "premium" as const,
    category: "Products",
  },
  // Luxury benefits
  {
    id: "product-discount-10",
    title: "10% Product Discount",
    description: "Enhanced savings on all products",
    icon: ShoppingBag,
    requiredTier: "luxury" as const,
    category: "Discounts",
  },
  {
    id: "vip-events",
    title: "VIP Event Access",
    description: "Exclusive invitations to private masterclasses",
    icon: Ticket,
    requiredTier: "luxury" as const,
    category: "Events",
  },
  {
    id: "luxury-gifts",
    title: "Luxury Welcome Package",
    description: "Premium skincare set worth $500",
    icon: Gift,
    requiredTier: "luxury" as const,
    category: "Products",
  },
  {
    id: "priority-booking",
    title: "Priority Booking",
    description: "Skip the waitlist for popular treatments",
    icon: Calendar,
    requiredTier: "luxury" as const,
    category: "Services",
  },
  // Elite benefits
  {
    id: "product-discount-15",
    title: "15% Product Discount",
    description: "Maximum savings on all products",
    icon: ShoppingBag,
    requiredTier: "elite" as const,
    category: "Discounts",
  },
  {
    id: "exclusive-events",
    title: "Exclusive Events",
    description: "Private events with celebrity aestheticians",
    icon: Ticket,
    requiredTier: "elite" as const,
    category: "Events",
  },
  {
    id: "annual-retreat",
    title: "Annual Wellness Retreat",
    description: "Complimentary luxury spa retreat experience",
    icon: Sparkles,
    requiredTier: "elite" as const,
    category: "Experiences",
  },
  {
    id: "dedicated-concierge",
    title: "Dedicated Concierge",
    description: "Personal beauty advisor at your service",
    icon: Crown,
    requiredTier: "elite" as const,
    category: "Services",
  },
  {
    id: "elite-gifts",
    title: "Elite Gift Collection",
    description: "Annual luxury gift box worth $2,000",
    icon: Gift,
    requiredTier: "elite" as const,
    category: "Products",
  },
];

const BenefitsPage = () => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const [benefits, setBenefits] = useState<TierBenefit[]>([]);
  
  const currentTier = profile?.computed_tier || 'member';
  const currentTierIndex = tierOrder.indexOf(currentTier);

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

  const isUnlocked = (requiredTier: 'member' | 'premium' | 'luxury' | 'elite') => {
    const requiredIndex = tierOrder.indexOf(requiredTier);
    return currentTierIndex >= requiredIndex;
  };

  const getSpendToUnlock = (requiredTier: 'member' | 'premium' | 'luxury' | 'elite') => {
    const benefit = benefits.find(b => b.tier === requiredTier);
    if (!benefit) return 0;
    const currentSpend = profile?.total_spend || 0;
    return Math.max(0, benefit.spend_threshold - currentSpend);
  };

  // Group benefits by tier
  const benefitsByTier = tierOrder.map(tier => ({
    tier,
    config: tierConfig[tier],
    items: allBenefits.filter(b => b.requiredTier === tier),
  }));

  if (isMobile) {
    return (
      <div className="pt-2 pb-4">
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl font-medium tracking-tight mb-2">
            Member Benefits
          </h1>
          <p className="text-muted-foreground text-sm">
            Unlock exclusive perks as you spend
          </p>
        </div>

        <div className="space-y-6">
          {benefitsByTier.map(({ tier, config, items }) => {
            const unlocked = isUnlocked(tier);
            const spendToUnlock = getSpendToUnlock(tier);
            const TierIcon = config.icon;
            
            return (
              <div key={tier}>
                {/* Tier header */}
                <div className={cn(
                  "flex items-center gap-2 mb-3 px-1",
                  !unlocked && "opacity-50"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    config.bgColor
                  )}>
                    <TierIcon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <div className="flex-1">
                    <h2 className={cn("font-medium text-sm", config.color)}>
                      {config.label}
                    </h2>
                    {!unlocked && spendToUnlock > 0 && (
                      <p className="text-xs text-muted-foreground">
                        ${spendToUnlock.toLocaleString()} to unlock
                      </p>
                    )}
                  </div>
                  {unlocked && (
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Unlocked
                    </span>
                  )}
                </div>

                {/* Benefits grid */}
                <div className="grid grid-cols-2 gap-2">
                  {items.map((benefit) => {
                    const BenefitIcon = benefit.icon;
                    return (
                      <div
                        key={benefit.id}
                        className={cn(
                          "glass-card p-3 relative overflow-hidden transition-all",
                          unlocked 
                            ? config.borderColor 
                            : "border-border opacity-50 grayscale"
                        )}
                      >
                        {!unlocked && (
                          <div className="absolute top-2 right-2">
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center mb-2",
                          unlocked ? config.bgColor : "bg-muted/30"
                        )}>
                          <BenefitIcon className={cn(
                            "w-4 h-4",
                            unlocked ? config.color : "text-muted-foreground"
                          )} />
                        </div>
                        <h3 className="font-medium text-xs mb-0.5">{benefit.title}</h3>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">
                          {benefit.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-3">
          Member Benefits
        </h1>
        <p className="text-muted-foreground text-lg">
          Unlock exclusive perks and rewards as you spend
        </p>
      </div>

      <div className="space-y-8">
        {benefitsByTier.map(({ tier, config, items }) => {
          const unlocked = isUnlocked(tier);
          const spendToUnlock = getSpendToUnlock(tier);
          const TierIcon = config.icon;
          
          return (
            <div key={tier}>
              {/* Tier header */}
              <div className={cn(
                "flex items-center gap-3 mb-4",
                !unlocked && "opacity-60"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  config.bgColor
                )}>
                  <TierIcon className={cn("w-5 h-5", config.color)} />
                </div>
                <div className="flex-1">
                  <h2 className={cn("font-serif text-xl font-medium", config.color)}>
                    {config.label} Tier
                  </h2>
                  {!unlocked && spendToUnlock > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Spend ${spendToUnlock.toLocaleString()} more to unlock
                    </p>
                  )}
                </div>
                {unlocked && (
                  <span className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-full font-medium">
                    ✓ Unlocked
                  </span>
                )}
              </div>

              {/* Benefits grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((benefit) => {
                  const BenefitIcon = benefit.icon;
                  return (
                    <div
                      key={benefit.id}
                      className={cn(
                        "glass-card p-5 relative overflow-hidden transition-all",
                        unlocked 
                          ? `${config.borderColor} hover:shadow-lg` 
                          : "border-border opacity-50 grayscale"
                      )}
                    >
                      {!unlocked && (
                        <div className="absolute top-3 right-3">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          unlocked ? config.bgColor : "bg-muted/30"
                        )}>
                          <BenefitIcon className={cn(
                            "w-5 h-5",
                            unlocked ? config.color : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {benefit.category}
                          </span>
                          <h3 className="font-medium text-sm mt-0.5">{benefit.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BenefitsPage;
