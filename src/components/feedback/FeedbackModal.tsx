import { useState } from "react";
import { Star, Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  procedureName: string;
  onFeedbackSubmitted?: () => void;
}

const FeedbackModal = ({
  open,
  onOpenChange,
  bookingId,
  procedureName,
  onFeedbackSubmitted,
}: FeedbackModalProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        booking_id: bookingId,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast.success("Thank you for your feedback", {
        description: "Your experience helps us serve you better.",
      });
      onFeedbackSubmitted?.();
      onOpenChange(false);
      // Reset state
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Unable to submit feedback", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-gradient-to-b from-background to-background/95">
        {/* Decorative glow */}
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/10 blur-3xl" />
        </div>

        <DialogHeader className="relative text-center pb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="font-serif text-2xl font-medium">
            How was your experience?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {procedureName}
          </DialogDescription>
        </DialogHeader>

        <div className="relative space-y-6 pt-4">
          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="group relative p-1 transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`w-10 h-10 transition-all duration-200 ${
                    star <= displayRating
                      ? "fill-[#c9a87c] text-[#c9a87c] drop-shadow-[0_0_8px_rgba(201,168,124,0.5)]"
                      : "text-muted-foreground/30 hover:text-[#c9a87c]/50"
                  }`}
                />
                {/* Sparkle effect on hover */}
                {star <= displayRating && (
                  <span className="absolute inset-0 animate-pulse opacity-50">
                    <Star className="w-10 h-10 fill-[#c9a87c]/30 text-transparent" />
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Rating Label */}
          <div className="text-center h-6">
            {displayRating > 0 && (
              <span className="text-sm text-[#c9a87c] font-medium animate-in fade-in">
                {displayRating === 1 && "We'll do better next time"}
                {displayRating === 2 && "Room for improvement"}
                {displayRating === 3 && "Satisfactory experience"}
                {displayRating === 4 && "Wonderful experience"}
                {displayRating === 5 && "Absolutely perfect"}
              </span>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              What could we perfect next time?{" "}
              <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-[100px] resize-none bg-muted/30 border-muted focus:border-primary/30"
              maxLength={500}
            />
            <div className="text-right text-xs text-muted-foreground/60">
              {comment.length}/500
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            variant="velvet"
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
