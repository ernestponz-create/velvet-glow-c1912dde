import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { Calendar, Clock, Check, ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getMarketHighestPrice, getConciergePrice } from "@/lib/pricing";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface Provider {
  id: string;
  display_name: string;
  neighborhood: string;
  city: string;
  rating: number;
  next_available_date: string | null;
}

interface QuickBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  procedureSlug: string;
  procedureName: string;
}

const timeSlots = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"];

const QuickBookModal = ({
  isOpen,
  onClose,
  provider,
  procedureSlug,
  procedureName,
}: QuickBookModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Generate next 3 quick slots
  const quickSlots = useMemo(() => {
    const baseDate = provider?.next_available_date 
      ? new Date(provider.next_available_date) 
      : addDays(new Date(), 1);
    
    return [
      { date: baseDate, time: "10:00 AM", label: "Earliest" },
      { date: addDays(baseDate, 2), time: "2:00 PM", label: "This Week" },
      { date: addDays(baseDate, 5), time: "11:00 AM", label: "Next Week" },
    ];
  }, [provider]);

  const handleQuickSelect = (slot: typeof quickSlots[0]) => {
    setSelectedDate(slot.date);
    setSelectedTime(slot.time);
    setShowCalendar(false);
  };

  const handleSubmit = async () => {
    if (!user || !provider || !selectedDate) return;

    setIsSubmitting(true);

    const marketPrice = getMarketHighestPrice(procedureSlug);
    const pricePaid = getConciergePrice(procedureSlug);

    try {
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          provider_id: provider.id,
          procedure_slug: procedureSlug,
          procedure_name: procedureName,
          preferred_date: format(selectedDate, "yyyy-MM-dd"),
          preferred_time: selectedTime || null,
          investment_level: "signature",
          market_highest_price: marketPrice,
          price_paid: pricePaid,
          status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create CRM tasks
      const confirmationDue = addDays(new Date(), 1);
      const followUpDue = addDays(selectedDate, 14);

      await supabase.from("tasks").insert([
        {
          user_id: user.id,
          booking_id: booking.id,
          type: "confirmation_call",
          title: `Confirmation call for ${procedureName}`,
          description: `Follow up with client regarding their ${procedureName} booking with ${provider.display_name}.`,
          due_at: confirmationDue.toISOString(),
          status: "pending",
        },
        {
          user_id: user.id,
          booking_id: booking.id,
          type: "follow_up_call",
          title: `Post-treatment follow-up for ${procedureName}`,
          description: `Check in with client after their ${procedureName} treatment.`,
          due_at: followUpDue.toISOString(),
          status: "pending",
        },
      ]);

      setIsSuccess(true);
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (goToBookings = false) => {
    setSelectedDate(undefined);
    setSelectedTime("");
    setShowCalendar(false);
    const wasSuccess = isSuccess;
    setIsSuccess(false);
    onClose();
    if (wasSuccess || goToBookings) {
      navigate("/dashboard/bookings");
    }
  };

  if (!provider) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto bg-[hsl(230_20%_10%)] border-glass-border p-0">
        {isSuccess ? (
          <div className="p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="relative z-10">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: "2s" }} />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
                  <Check className="w-8 h-8 text-primary" />
                </div>
              </div>

              <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
                Booking Confirmed
              </h2>
              <p className="text-muted-foreground mb-6">
                {format(selectedDate!, "EEEE, MMMM d")} at {selectedTime}
              </p>

              <Button variant="velvet" onClick={() => handleClose(true)} className="w-full">
                View My Bookings
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="font-serif text-xl font-medium text-foreground mb-1">
                Book {procedureName}
              </h2>
              <p className="text-sm text-muted-foreground">
                with {provider.display_name}
              </p>
            </div>

            {/* Quick Slots */}
            <div className="mb-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" />
                Quick Select
              </div>
              <div className="space-y-2">
                {quickSlots.map((slot, index) => {
                  const isSelected = selectedDate && 
                    format(selectedDate, "yyyy-MM-dd") === format(slot.date, "yyyy-MM-dd") &&
                    selectedTime === slot.time;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickSelect(slot)}
                      className={cn(
                        "w-full p-4 rounded-xl border transition-all duration-300 text-left",
                        isSelected
                          ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                          : "glass-card border-primary/10 hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10"
                          )}>
                            <Calendar className={cn("w-5 h-5", isSelected ? "" : "text-primary")} />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {format(slot.date, "EEE, MMM d")}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {slot.time}
                            </div>
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          index === 0 
                            ? "bg-emerald-500/15 text-emerald-400" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {slot.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Date Toggle */}
            <div className="mb-6">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {showCalendar ? "Hide calendar" : "Choose a different date"}
              </button>
            </div>

            {/* Calendar */}
            {showCalendar && (
              <div className="mb-6 fade-up">
                <div className="glass-card p-4 mb-4">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime("");
                    }}
                    disabled={(date) => date < new Date()}
                    className="pointer-events-auto mx-auto"
                  />
                </div>

                {selectedDate && (
                  <div className="fade-up">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      Select Time
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            selectedTime === time
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/50 text-foreground hover:bg-muted"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Book Button */}
            <Button
              variant="velvet"
              className="w-full"
              disabled={!selectedDate || !selectedTime || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Confirm Booking
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickBookModal;
