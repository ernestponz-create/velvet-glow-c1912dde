import { useState } from "react";
import { Star, MapPin, Clock, Images, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  image_url?: string | null;
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <>
      <div
        className="relative overflow-hidden rounded-[20px] p-7 md:p-8 transition-all duration-300 hover:scale-[1.01] group"
        style={{
          background: "linear-gradient(135deg, rgba(40,40,45,0.6) 0%, rgba(30,30,35,0.6) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header Row */}
        <div className="flex justify-between items-start mb-4">
          <Link 
            to={procedureSlug ? `/dashboard/discover/${procedureSlug}` : "#"}
            className="text-[22px] md:text-[24px] font-semibold text-white leading-tight hover:text-[#d4af37] transition-colors story-link"
          >
            {provider.display_name}
          </Link>
          
          {/* Gallery Button */}
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all
              bg-white/5 border border-white/10 hover:bg-[#d4af37]/20 hover:border-[#d4af37]/40"
            aria-label="View gallery"
          >
            <Images className="w-4 h-4 text-white/70" />
          </button>
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

        {/* Badges - Below Button */}
        {(isConciergePick || isBestValue || isSoonestAvailable) && (
          <div className="flex items-center justify-center gap-3 mt-4">
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
        )}
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
