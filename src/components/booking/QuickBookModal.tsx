import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, parseISO, isSameDay } from "date-fns";
import { Calendar, Clock, Check, ChevronRight, Sparkles, Loader2, AlertCircle } from "lucide-react";
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
  provider_profile_id?: string | null;
}

interface AvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  slot_type: string;
  staff_member_id: string | null;
}

interface QuickBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  procedureSlug: string;
  procedureName: string;
}

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
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Fetch real availability slots when provider changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!provider?.provider_profile_id) {
        setAvailabilitySlots([]);
        return;
      }

      setIsLoadingSlots(true);
      try {
        const { data, error } = await supabase
          .from("availability_slots")
          .select("*")
          .eq("provider_id", provider.provider_profile_id)
          .eq("slot_type", "available")
          .gte("start_time", new Date().toISOString())
          .order("start_time");

        if (error) throw error;
        setAvailabilitySlots(data || []);
      } catch (error) {
        console.error("Error fetching availability:", error);
        setAvailabilitySlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    if (isOpen && provider) {
      fetchAvailability();
    }
  }, [isOpen, provider]);

  // Check if we have real availability
  const hasRealAvailability = availabilitySlots.length > 0;

  // Get unique available dates from slots
  const availableDates = useMemo(() => {
    if (!hasRealAvailability) return [];
    
    const uniqueDates = new Set<string>();
    availabilitySlots.forEach(slot => {
      const dateStr = format(parseISO(slot.start_time), "yyyy-MM-dd");
      uniqueDates.add(dateStr);
    });
    
    return Array.from(uniqueDates).map(dateStr => parseISO(dateStr));
  }, [availabilitySlots, hasRealAvailability]);

  // Generate quick slots from real availability
  const quickSlots = useMemo(() => {
    if (!hasRealAvailability || availableDates.length === 0) {
      return [];
    }

    const slots: { date: Date; time: string; slotId: string; label: string }[] = [];
    
    // Get first 3 unique date/time combinations
    const seenDates = new Set<string>();
    
    for (const slot of availabilitySlots) {
      if (slots.length >= 3) break;
      
      const slotDate = parseISO(slot.start_time);
      const dateStr = format(slotDate, "yyyy-MM-dd");
      
      if (!seenDates.has(dateStr)) {
        seenDates.add(dateStr);
        const timeStr = format(slotDate, "h:mm a");
        
        let label = "Available";
        if (slots.length === 0) label = "Earliest";
        else if (slots.length === 1) label = "This Week";
        else label = "Next Available";
        
        slots.push({
          date: slotDate,
          time: timeStr,
          slotId: slot.id,
          label,
        });
      }
    }
    
    return slots;
  }, [availabilitySlots, availableDates, hasRealAvailability]);

  // Get available time slots for selected date
  const timeSlotsForDate = useMemo(() => {
    if (!selectedDate || !hasRealAvailability) return [];

    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const slotsForDay = availabilitySlots.filter(slot => {
      const slotDateStr = format(parseISO(slot.start_time), "yyyy-MM-dd");
      return slotDateStr === selectedDateStr;
    });

    // Generate hourly time slots from availability ranges
    const timeSlots: { time: string; slotId: string }[] = [];
    
    slotsForDay.forEach(slot => {
      const start = parseISO(slot.start_time);
      const end = parseISO(slot.end_time);
      let current = new Date(start);
      
      while (current < end) {
        const timeStr = format(current, "h:mm a");
        if (!timeSlots.find(s => s.time === timeStr)) {
          timeSlots.push({
            time: timeStr,
            slotId: slot.id,
          });
        }
        current.setHours(current.getHours() + 1);
      }
    });

    return timeSlots.sort((a, b) => {
      const parseTime = (t: string) => {
        const [time, period] = t.split(" ");
        const [hours, mins] = time.split(":").map(Number);
        return (period === "PM" && hours !== 12 ? hours + 12 : hours === 12 && period === "AM" ? 0 : hours) * 60 + mins;
      };
      return parseTime(a.time) - parseTime(b.time);
    });
  }, [selectedDate, availabilitySlots, hasRealAvailability]);

  const isDateAvailable = (date: Date) => {
    return availableDates.some(d => isSameDay(d, date));
  };

  const handleQuickSelect = (slot: typeof quickSlots[0]) => {
    setSelectedDate(slot.date);
    setSelectedTime(slot.time);
    setSelectedSlotId(slot.slotId);
    setShowCalendar(false);
  };

  const handleTimeSelect = (time: string, slotId: string) => {
    setSelectedTime(time);
    setSelectedSlotId(slotId);
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

      // If we have a real slot, mark it as booked
      if (selectedSlotId) {
        await supabase
          .from("availability_slots")
          .update({ 
            slot_type: "booked",
            booking_id: booking.id 
          })
          .eq("id", selectedSlotId);
      }

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
    setSelectedSlotId(null);
    setShowCalendar(false);
    setAvailabilitySlots([]);
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

            {/* Loading State */}
            {isLoadingSlots ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Loading availability...</p>
              </div>
            ) : !hasRealAvailability ? (
              /* No Availability State */
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">No Availability</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  This provider hasn't set up their availability yet. Please contact them directly or try another provider.
                </p>
                <Button variant="glass" onClick={() => handleClose()}>
                  Choose Another Provider
                </Button>
              </div>
            ) : (
              <>
                {/* Quick Slots */}
                {quickSlots.length > 0 && (
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
                )}

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
                          setSelectedSlotId(null);
                        }}
                        disabled={(date) => date < new Date() || !isDateAvailable(date)}
                        className="pointer-events-auto mx-auto"
                      />
                    </div>

                    {selectedDate && timeSlotsForDate.length > 0 && (
                      <div className="fade-up">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                          Available Times
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlotsForDate.map((slot) => (
                            <button
                              key={slot.time}
                              onClick={() => handleTimeSelect(slot.time, slot.slotId)}
                              className={cn(
                                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                selectedTime === slot.time
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted/50 text-foreground hover:bg-muted"
                              )}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDate && timeSlotsForDate.length === 0 && (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No times available for this date
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
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Confirm Booking
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickBookModal;