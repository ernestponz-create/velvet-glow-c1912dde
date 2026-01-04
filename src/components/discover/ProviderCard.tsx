import { Star, MapPin, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Provider {
  id: string;
  name: string;
  display_name: string;
  specialty: string;
  neighborhood: string;
  city: string;
  rating: number;
  review_count: number;
  next_available_date: string | null;
  next_available_time?: string | null;
  recommendation_reason: string | null;
}

interface ProviderCardProps {
  provider: Provider;
  priceDisplay: string;
  isConciergePick?: boolean;
  isBestValue?: boolean;
  isSoonestAvailable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onBook: () => void;
}

export const ProviderCard = ({
  provider,
  priceDisplay,
  isConciergePick = false,
  isBestValue = false,
  isSoonestAvailable = false,
  isSelected = false,
  onToggleSelect,
  onBook,
}: ProviderCardProps) => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < fullStars
                ? "fill-[#d4af37] text-[#d4af37]"
                : i === fullStars && hasHalf
                ? "fill-[#d4af37]/50 text-[#d4af37]"
                : "text-white/20"
            }`}
          />
        ))}
        <span className="text-white text-sm ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const formatNextSlot = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-[20px] p-7 md:p-8
        transition-all duration-300
        ${isSelected ? "ring-2 ring-[#d4af37]" : ""}
      `}
      style={{
        background: "linear-gradient(135deg, rgba(40,40,45,0.6) 0%, rgba(30,30,35,0.6) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header Row */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[22px] md:text-[24px] font-semibold text-white leading-tight">
          {provider.display_name}
        </h3>
        
        {/* Badges & Compare Button */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end gap-1">
            {isConciergePick && (
              <span 
                className="font-serif text-[10px] md:text-[11px]"
                style={{ color: "#c9a961" }}
              >
                ⭐ Concierge Pick
              </span>
            )}
            {isBestValue && (
              <span 
                className="text-[10px] md:text-[11px]"
                style={{ color: "#5eead4" }}
              >
                Best Value
              </span>
            )}
            {isSoonestAvailable && !isBestValue && !isConciergePick && (
              <span 
                className="text-[10px] md:text-[11px]"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Soonest Available
              </span>
            )}
          </div>
          
          {onToggleSelect && (
            <button
              onClick={onToggleSelect}
              className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ml-2
                ${isSelected 
                  ? "bg-[#d4af37] border-[#d4af37] text-black" 
                  : "border-white/30 hover:border-[#d4af37]/50"
                }
              `}
            >
              {isSelected && <Check className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Specialty Tag */}
      <div className="mb-5">
        <span 
          className="inline-block px-3 py-1 rounded-full text-xs"
          style={{ 
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.6)" 
          }}
        >
          {provider.specialty}
        </span>
      </div>

      {/* Info Row */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-5">
        {renderStars(Number(provider.rating))}
        
        <span style={{ color: "#d4af37" }} className="text-sm font-medium">
          {priceDisplay}
        </span>
        
        <span 
          className="flex items-center gap-1.5 text-sm"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <MapPin className="w-3.5 h-3.5" />
          {provider.neighborhood}
        </span>
      </div>

      {/* Availability */}
      {provider.next_available_date && (
        <div 
          className="flex items-center gap-2 mb-5 text-sm"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Next slot:</span>
          <span className="text-white">
            {formatNextSlot(provider.next_available_date)}
          </span>
        </div>
      )}

      {/* Quote */}
      {provider.recommendation_reason && (
        <p 
          className="font-serif italic text-[12px] md:text-[13px] mb-6 mt-4"
          style={{ color: "rgba(201,169,97,0.6)" }}
        >
          "{provider.recommendation_reason}"
        </p>
      )}

      {/* CTA Button */}
      <Button 
        variant="outline"
        className="w-full h-12 rounded-xl text-sm font-medium transition-all duration-300
          bg-transparent border-[#d4af37]/60 text-[#d4af37]
          hover:bg-gradient-to-r hover:from-[#d4af37] hover:to-[#c9a961] hover:text-black hover:border-transparent"
        onClick={onBook}
      >
        Book Now
      </Button>
    </div>
  );
};
