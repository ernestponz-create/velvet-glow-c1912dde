import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SavingsData {
  totalSavings: number;
  bookingCount: number;
  memberSince: number;
}

const SavingsIndicator = () => {
  const { user, profile } = useAuth();
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchSavings = async () => {
      try {
        // Fetch completed bookings with pricing
        const { data, error } = await supabase
          .from("bookings")
          .select("market_highest_price, price_paid")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .not("market_highest_price", "is", null)
          .not("price_paid", "is", null);

        if (error) throw error;

        if (data && data.length > 0) {
          const savings = data.reduce((acc, booking) => {
            const marketPrice = booking.market_highest_price || 0;
            const paidPrice = booking.price_paid || 0;
            return acc + Math.max(0, marketPrice - paidPrice);
          }, 0);

          // Get member since year from user created_at
          const memberYear = user.created_at 
            ? new Date(user.created_at).getFullYear() 
            : new Date().getFullYear();

          setSavingsData({
            totalSavings: savings,
            bookingCount: data.length,
            memberSince: memberYear,
          });
        } else {
          setSavingsData(null);
        }
      } catch (error) {
        console.error("Error fetching savings:", error);
        setSavingsData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavings();
  }, [user, profile]);

  // Don't show if loading, no user, or no savings
  if (isLoading || !user || !savingsData || savingsData.totalSavings <= 0) {
    return null;
  }

  const formattedSavings = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(savingsData.totalSavings);

  const hasHighSavings = savingsData.totalSavings > 500;
  const bookingText = savingsData.bookingCount === 1 ? "booking" : "bookings";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative flex items-center gap-2 px-3 py-1.5 rounded-full cursor-default transition-all duration-300",
              "border border-primary/30 bg-glass/40 backdrop-blur-sm",
              "hover:border-primary/50 hover:bg-primary/5",
              hasHighSavings && "savings-glow"
            )}
          >
            {/* Sparkle icon for high savings */}
            {hasHighSavings && (
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            )}
            
            {/* Member info */}
            <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
              <span className="text-muted-foreground">Member since {savingsData.memberSince}</span>
              <span className="text-primary/50">·</span>
              <span className="font-medium text-pearl">
                Saved {formattedSavings}
              </span>
              <span className="text-muted-foreground">
                on {savingsData.bookingCount} {bookingText}
              </span>
            </div>

            {/* Subtle gradient overlay for high savings */}
            {hasHighSavings && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 pointer-events-none" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="max-w-[260px] bg-[hsl(230_20%_12%)] border-glass-border text-center"
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your exclusive concierge savings compared to typical market rates at time of booking
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SavingsIndicator;
