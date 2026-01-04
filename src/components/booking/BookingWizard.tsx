import { useState } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { Calendar, Clock, MapPin, Star, Check, Shield, ChevronRight, ChevronLeft, Video, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
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
  next_available_time: string | null;
}

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  procedureSlug: string;
  procedureName: string;
  investmentLevel: string;
}

const investmentLabels: Record<string, { label: string; range: string }> = {
  signature: { label: "Signature", range: "$500 – $1,500" },
  premier: { label: "Premier", range: "$1,500 – $4,000" },
  exclusive: { label: "Exclusive", range: "$4,000+" },
};

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

const BookingWizard = ({
  isOpen,
  onClose,
  provider,
  procedureSlug,
  procedureName,
  investmentLevel,
}: BookingWizardProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [wantsVirtualConsult, setWantsVirtualConsult] = useState(false);
  const [consultDate, setConsultDate] = useState<Date | undefined>();
  const [consultTime, setConsultTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const investment = investmentLabels[investmentLevel] || investmentLabels.signature;

  // Generate available dates (next 14 days)
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  const isDateAvailable = (date: Date) => {
    return availableDates.some(d => isSameDay(d, date));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user || !provider || !selectedDate) return;

    setIsSubmitting(true);

    try {
      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          provider_id: provider.id,
          procedure_slug: procedureSlug,
          procedure_name: procedureName,
          preferred_date: format(selectedDate, "yyyy-MM-dd"),
          preferred_time: selectedTime || null,
          wants_virtual_consult: wantsVirtualConsult,
          consult_preferred_date: consultDate ? format(consultDate, "yyyy-MM-dd") : null,
          consult_preferred_time: consultTime || null,
          investment_level: investmentLevel,
          status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create confirmation call task (due in 24 hours)
      const dueAt = addDays(new Date(), 1);
      await supabase.from("tasks").insert({
        user_id: user.id,
        booking_id: booking.id,
        type: "confirmation_call",
        title: `Confirmation call for ${procedureName}`,
        description: `Follow up with client regarding their ${procedureName} booking with ${provider.display_name}`,
        due_at: dueAt.toISOString(),
        status: "pending",
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedDate(undefined);
    setSelectedTime("");
    setWantsVirtualConsult(false);
    setConsultDate(undefined);
    setConsultTime("");
    setIsSuccess(false);
    onClose();
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1.5 text-sm font-medium">{rating}</span>
    </div>
  );

  if (!provider) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto bg-[hsl(230_20%_10%)] border-glass-border p-0">
        {isSuccess ? (
          // Success Screen
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
              Reservation Secured
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your priority reservation has been confirmed. Our concierge team will reach out within 24 hours to finalize the details.
            </p>
            <div className="glass-card p-4 mb-6 text-left">
              <div className="text-sm text-muted-foreground mb-1">Appointment</div>
              <div className="font-medium text-foreground">
                {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                {selectedTime && ` at ${selectedTime}`}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {procedureName} with {provider.display_name}
              </div>
            </div>
            <Button variant="velvet" onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* Progress indicator */}
            <div className="px-6 pt-6 pb-4 border-b border-glass-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-widest text-primary font-medium">
                  Step {step} of 4
                </span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={cn(
                        "w-8 h-1 rounded-full transition-colors",
                        s <= step ? "bg-primary" : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Step content */}
            <div className="p-6">
              {step === 1 && (
                <div className="fade-up">
                  <h2 className="font-serif text-xl font-medium text-foreground mb-4">
                    Confirm Your Selection
                  </h2>
                  
                  {/* Provider card */}
                  <div className="glass-card p-5 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-serif text-lg font-medium text-foreground">
                          {provider.display_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{provider.neighborhood}, {provider.city}</span>
                        </div>
                      </div>
                      {renderStars(provider.rating)}
                    </div>
                  </div>

                  {/* Procedure card */}
                  <div className="glass-card p-5">
                    <div className="text-sm text-muted-foreground mb-1">Procedure</div>
                    <div className="font-serif text-lg font-medium text-foreground mb-2">
                      {procedureName}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {investment.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {investment.range}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="fade-up">
                  <h2 className="font-serif text-xl font-medium text-foreground mb-4">
                    Select Your Preferred Date
                  </h2>
                  
                  <div className="glass-card p-4 mb-4">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => !isDateAvailable(date)}
                      className="pointer-events-auto mx-auto"
                    />
                  </div>

                  {selectedDate && (
                    <div className="fade-up">
                      <div className="text-sm text-muted-foreground mb-3">Preferred time</div>
                      <div className="grid grid-cols-3 gap-2">
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

              {step === 3 && (
                <div className="fade-up">
                  <h2 className="font-serif text-xl font-medium text-foreground mb-4">
                    Virtual Consultation
                  </h2>
                  
                  <div className="glass-card p-5 mb-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        id="virtual-consult"
                        checked={wantsVirtualConsult}
                        onCheckedChange={(checked) => setWantsVirtualConsult(checked === true)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor="virtual-consult" className="font-medium text-foreground cursor-pointer flex items-center gap-2">
                          <Video className="w-4 h-4 text-primary" />
                          Request virtual consultation first
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Speak with your specialist before your in-person visit
                        </p>
                      </div>
                    </div>
                  </div>

                  {wantsVirtualConsult && (
                    <div className="fade-up space-y-4">
                      <div className="text-sm text-muted-foreground">Preferred consult date & time</div>
                      <div className="glass-card p-4">
                        <CalendarComponent
                          mode="single"
                          selected={consultDate}
                          onSelect={setConsultDate}
                          disabled={(date) => date < new Date()}
                          className="pointer-events-auto mx-auto"
                        />
                      </div>
                      {consultDate && (
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.slice(0, 6).map((time) => (
                            <button
                              key={time}
                              onClick={() => setConsultTime(time)}
                              className={cn(
                                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                consultTime === time
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted/50 text-foreground hover:bg-muted"
                              )}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="fade-up">
                  <h2 className="font-serif text-xl font-medium text-foreground mb-4">
                    Review & Confirm
                  </h2>
                  
                  {/* Summary */}
                  <div className="space-y-3 mb-6">
                    <div className="glass-card p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Appointment</span>
                      </div>
                      <div className="font-medium text-foreground">
                        {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                        {selectedTime && ` at ${selectedTime}`}
                      </div>
                    </div>

                    <div className="glass-card p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Estimated Investment</span>
                      </div>
                      <div className="font-medium text-foreground">
                        {investment.label} · {investment.range}
                      </div>
                    </div>

                    {wantsVirtualConsult && consultDate && (
                      <div className="glass-card p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Video className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">Virtual Consult</span>
                        </div>
                        <div className="font-medium text-foreground">
                          {format(consultDate, "EEEE, MMMM d")}
                          {consultTime && ` at ${consultTime}`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Privacy reminder */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-glass-border">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your information is protected with bank-level encryption. We never share your personal details without your explicit consent.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-glass-border flex gap-3">
              {step > 1 && (
                <Button variant="ghost" onClick={handleBack} className="flex-shrink-0">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              
              <div className="flex-1" />
              
              {step < 4 ? (
                <Button
                  variant="velvet"
                  onClick={handleNext}
                  disabled={step === 2 && !selectedDate}
                  className="group"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Button>
              ) : (
                <Button
                  variant="velvet"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="group"
                >
                  {isSubmitting ? (
                    "Securing..."
                  ) : (
                    <>
                      Secure Priority Reservation
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingWizard;
