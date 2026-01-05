import { useState } from "react";
import { Star, MapPin, Clock, Images, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Provider {
  id: string;
  name: string; // Clinic name - shown to users
  display_name: string;
  specialty: string;
  neighborhood: string;
  city: string;
  rating: number;
  review_count: number;
  next_available_date: string | null;
  next_available_time?: string | null;
  recommendation_reason: string | null;
  image_url?: string | null;
  earliest_slot_date?: string | null; // Earliest staff availability
  earliest_slot_time?: string | null;
}

interface ProviderCardProps {
  provider: Provider;
  priceDisplay: string;
  isConciergePick?: boolean;
  isBestValue?: boolean;
  isSoonestAvailable?: boolean;
  onBook: () => void;
  procedureSlug?: string;
}

// Sample gallery images (in production these would come from the provider data)
const getGalleryImages = (providerId: string) => [
  `https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop`,
  `https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop`,
  `https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop`,
  `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop`,
];

export const ProviderCard = ({
  provider,
  priceDisplay,
  isConciergePick = false,
  isBestValue = false,
  isSoonestAvailable = false,
  onBook,
  procedureSlug,
}: ProviderCardProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const galleryImages = getGalleryImages(provider.id);
  const hasBadge = isConciergePick || isBestValue || isSoonestAvailable;

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < fullStars
                ? "fill-[#d4af37] text-[#d4af37]"
                : i === fullStars && hasHalf
                ? "fill-[#d4af37]/50 text-[#d4af37]"
                : "text-white/20"
            }`}
          />
        ))}
        <span className="text-white/90 text-xs ml-1.5 font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const formatNextSlot = (date: string | null, time?: string | null) => {
    // Handle NULL - show honest message instead of fake date
    if (!date) return "Contact for availability";
    
    const dateStr = new Date(date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    if (time) {
      // Format time from "14:00:00" to "2:00 PM"
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${dateStr} at ${hour12}:${minutes} ${ampm}`;
    }
    return dateStr;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const getBadgeConfig = () => {
    if (isConciergePick) {
      return {
        icon: "⭐",
        label: "Concierge Pick",
        style: {
          background: "linear-gradient(90deg, #d4af37 0%, #c9a961 100%)",
          color: "#1a1a1a",
        }
      };
    }
    if (isBestValue) {
      return {
        icon: "💎",
        label: "Best Value",
        style: {
          background: "linear-gradient(90deg, #5eead4 0%, #2dd4bf 100%)",
          color: "#1a1a1a",
        }
      };
    }
    if (isSoonestAvailable) {
      return {
        icon: "⚡",
        label: "Soonest",
        style: {
          background: "linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%)",
          color: "#1a1a1a",
        }
      };
    }
    return null;
  };

  const badge = getBadgeConfig();

  return (
    <>
      <div
        className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:translate-y-[-2px] group"
        style={{
          background: "linear-gradient(145deg, rgba(35,35,40,0.9) 0%, rgba(25,25,30,0.95) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Top Badge Bar */}
        {badge && (
          <div 
            className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase"
            style={badge.style}
          >
            <span className="text-sm">{badge.icon}</span>
            {badge.label}
          </div>
        )}

        {/* Card Content */}
        <div className={`p-5 md:p-6 ${!hasBadge ? 'pt-6 md:pt-7' : ''}`}>
          {/* Header: Clinic Name + Gallery */}
          <div className="flex justify-between items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <Link 
                to={procedureSlug ? `/dashboard/discover/${procedureSlug}` : "#"}
                className="block text-lg md:text-xl font-semibold text-white leading-snug hover:text-[#d4af37] transition-colors truncate"
              >
                {provider.display_name}
              </Link>
              <span 
                className="inline-block mt-1.5 text-[11px] uppercase tracking-wider font-medium"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {provider.specialty}
              </span>
            </div>
            
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all
                bg-white/5 hover:bg-[#d4af37]/20 border border-white/10 hover:border-[#d4af37]/40"
              aria-label="View gallery"
            >
              <Images className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {renderStars(Number(provider.rating))}
            
            <div className="w-px h-3 bg-white/10" />
            
            <span className="text-[#d4af37] text-sm font-semibold">
              {priceDisplay}
            </span>
            
            <div className="w-px h-3 bg-white/10" />
            
            <span className="flex items-center gap-1 text-xs text-white/50">
              <MapPin className="w-3 h-3" />
              {provider.neighborhood}
            </span>
          </div>

          {/* Earliest Available Slot - always show with NULL handling */}
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <Clock className={`w-3.5 h-3.5 ${(provider.earliest_slot_date || provider.next_available_date) ? "text-[#d4af37]" : "text-white/30"}`} />
            <span className="text-xs text-white/50">Next Available:</span>
            <span className={`text-xs font-medium ${(provider.earliest_slot_date || provider.next_available_date) ? "text-white" : "text-white/40"}`}>
              {provider.earliest_slot_date 
                ? formatNextSlot(provider.earliest_slot_date, provider.earliest_slot_time)
                : formatNextSlot(provider.next_available_date, provider.next_available_time)}
            </span>
          </div>


          {/* CTA Button */}
          <Button 
            className="w-full h-11 rounded-xl text-sm font-semibold transition-all duration-300
              bg-gradient-to-r from-[#d4af37] to-[#c9a961] text-black
              hover:from-[#e5c04a] hover:to-[#d4b872] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            onClick={onBook}
          >
            Book Now
          </Button>
        </div>
      </div>

      {/* Gallery Modal */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none overflow-hidden">
          <div 
            className="relative rounded-2xl overflow-hidden animate-scale-in"
            style={{
              background: "linear-gradient(135deg, rgba(30,30,35,0.95) 0%, rgba(20,20,25,0.95) 100%)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center
                hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Provider Info Header */}
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-semibold text-white">{provider.display_name}</h3>
              <p className="text-sm text-white/60 mt-1">{provider.specialty} • {provider.neighborhood}</p>
            </div>

            {/* Image Container */}
            <div className="relative aspect-[16/10]">
              <img
                src={galleryImages[currentImageIndex]}
                alt={`${provider.display_name} gallery image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover animate-fade-in"
              />
              
              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full 
                  bg-black/40 backdrop-blur-sm flex items-center justify-center
                  hover:bg-black/60 transition-all hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full 
                  bg-black/40 backdrop-blur-sm flex items-center justify-center
                  hover:bg-black/60 transition-all hover:scale-110"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
                <span className="text-white text-sm">
                  {currentImageIndex + 1} / {galleryImages.length}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="p-4 flex gap-2 overflow-x-auto">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all
                    ${index === currentImageIndex 
                      ? "ring-2 ring-[#d4af37] opacity-100" 
                      : "opacity-50 hover:opacity-80"
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
