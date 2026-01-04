import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Sparkles, ChevronRight, CheckCircle2, Clock3, XCircle, Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import FeedbackModal from "@/components/feedback/FeedbackModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  procedure_name: string;
  procedure_slug: string;
  preferred_date: string;
  preferred_time: string | null;
  wants_virtual_consult: boolean;
  consult_preferred_date: string | null;
  consult_preferred_time: string | null;
  investment_level: string;
  status: string;
  created_at: string;
  provider: {
    display_name: string;
    neighborhood: string;
    city: string;
  } | null;
  has_feedback?: boolean;
}

const investmentLabels: Record<string, { label: string; range: string }> = {
  signature: { label: "Signature", range: "$500 – $1,500" },
  premier: { label: "Premier", range: "$1,500 – $4,000" },
  exclusive: { label: "Exclusive", range: "$4,000+" },
};

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  pending: { label: "Pending", icon: Clock3, color: "text-amber-400" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-emerald-400" },
  completed: { label: "Done", icon: CheckCircle2, color: "text-primary" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-muted-foreground" },
};

const BookingsPage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState<{
    open: boolean;
    bookingId: string;
    procedureName: string;
  }>({ open: false, bookingId: "", procedureName: "" });
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          *,
          provider:providers(display_name, neighborhood, city)
        `)
        .eq("user_id", user.id)
        .order("preferred_date", { ascending: true });

      // Fetch existing feedback
      const { data: feedbackData } = await supabase
        .from("feedback")
        .select("booking_id")
        .eq("user_id", user.id);

      if (!bookingsError && bookingsData) {
        const feedbackBookingIds = new Set(feedbackData?.map(f => f.booking_id) || []);
        setFeedbackGiven(feedbackBookingIds);
        
        const bookingsWithFeedback = bookingsData.map(b => ({
          ...b,
          has_feedback: feedbackBookingIds.has(b.id),
        })) as Booking[];
        
        setBookings(bookingsWithFeedback);
      }
      setIsLoading(false);
    };

    fetchBookings();
  }, [user]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d, yyyy");
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return "past";
    if (isToday(date)) return "today";
    return "upcoming";
  };

  const openFeedbackModal = (bookingId: string, procedureName: string) => {
    setFeedbackModal({ open: true, bookingId, procedureName });
  };

  const handleFeedbackSubmitted = () => {
    setFeedbackGiven(prev => new Set([...prev, feedbackModal.bookingId]));
    setBookings(prev => 
      prev.map(b => 
        b.id === feedbackModal.bookingId ? { ...b, has_feedback: true } : b
      )
    );
  };

  // Separate upcoming and past bookings
  const upcomingBookings = bookings.filter(b => {
    const dateLabel = getDateLabel(b.preferred_date);
    return (dateLabel === "upcoming" || dateLabel === "today") && b.status !== "cancelled";
  });

  const pastBookings = bookings.filter(b => {
    const dateLabel = getDateLabel(b.preferred_date);
    return dateLabel === "past" || b.status === "cancelled";
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse" />
          <div className="h-5 bg-muted rounded w-64 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-6 bg-muted rounded w-1/3" />
                <div className="h-5 bg-muted rounded w-24" />
              </div>
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto", isMobile ? "max-w-full" : "max-w-4xl")}>
      {/* Header */}
      <div className={cn(isMobile ? "mb-4" : "mb-8")}>
        <h1 className={cn("font-serif font-medium tracking-tight", isMobile ? "text-xl mb-1" : "text-2xl md:text-3xl lg:text-4xl mb-2")}>
          My Bookings
        </h1>
        <p className={cn("text-muted-foreground", isMobile && "text-sm")}>
          {isMobile ? "Your appointments" : "Manage your upcoming appointments and view past treatments."}
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className={cn("glass-card text-center", isMobile ? "p-6" : "p-12")}>
          <div className={cn("rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4", isMobile ? "w-12 h-12" : "w-16 h-16 mb-6")}>
            <Calendar className={cn("text-primary", isMobile ? "w-6 h-6" : "w-8 h-8")} />
          </div>
          <h2 className={cn("font-serif font-medium text-foreground", isMobile ? "text-lg mb-2" : "text-xl mb-3")}>
            No Bookings Yet
          </h2>
          <p className={cn("text-muted-foreground mb-4 max-w-sm mx-auto", isMobile && "text-sm")}>
            {isMobile ? "Start your aesthetic journey" : "Start your aesthetic journey by exploring our curated selection of premium treatments."}
          </p>
          <Link to="/dashboard/discover">
            <Button variant="velvet" size={isMobile ? "sm" : "default"} className="group">
              Discover Procedures
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className={cn(isMobile ? "space-y-4" : "space-y-8")}>
          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <section>
              <h2 className={cn("uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2", isMobile ? "text-xs" : "text-sm mb-4")}>
                <Sparkles className={cn("text-primary", isMobile ? "w-3 h-3" : "w-4 h-4")} />
                Upcoming
              </h2>
              <div className={cn(isMobile ? "space-y-3" : "space-y-4 stagger-children")}>
                {upcomingBookings.map((booking, index) => {
                  const status = statusConfig[booking.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const investment = investmentLabels[booking.investment_level];
                  const dateLabel = getDateLabel(booking.preferred_date);

                  return (
                    <article
                      key={booking.id}
                      className={cn("glass-card transition-all duration-300", isMobile ? "p-4" : "p-6 hover:border-primary/30 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.15)]")}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={cn("flex justify-between gap-2", isMobile ? "mb-2" : "flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4")}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className={cn("font-serif font-medium text-foreground truncate", isMobile ? "text-base" : "text-xl")}>
                              {booking.procedure_name}
                            </h3>
                            {dateLabel === "today" && (
                              <span className={cn("px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium flex-shrink-0", isMobile ? "text-[10px]" : "text-xs")}>
                                Today
                              </span>
                            )}
                          </div>
                          {booking.provider && (
                            <div className={cn("flex items-center gap-1.5 text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                {isMobile ? booking.provider.display_name : `${booking.provider.display_name} · ${booking.provider.neighborhood}`}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className={cn("flex items-center gap-1 flex-shrink-0", status.color)}>
                          <StatusIcon className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
                          <span className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>{status.label}</span>
                        </div>
                      </div>

                      <div className={cn("flex flex-wrap gap-2", isMobile ? "mb-3" : "gap-4 mb-4")}>
                        <div className="flex items-center gap-1.5">
                          <Calendar className={cn("text-primary", isMobile ? "w-3 h-3" : "w-4 h-4")} />
                          <span className={cn("text-foreground", isMobile ? "text-xs" : "text-sm")}>
                            {formatDate(booking.preferred_date)}
                          </span>
                        </div>
                        {booking.preferred_time && (
                          <div className="flex items-center gap-1.5">
                            <Clock className={cn("text-primary", isMobile ? "w-3 h-3" : "w-4 h-4")} />
                            <span className={cn("text-foreground", isMobile ? "text-xs" : "text-sm")}>{booking.preferred_time}</span>
                          </div>
                        )}
                        {investment && !isMobile && (
                          <div className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {investment.label}
                          </div>
                        )}
                      </div>

                      {booking.wants_virtual_consult && booking.consult_preferred_date && !isMobile && (
                        <div className="text-sm text-muted-foreground mb-4 p-3 rounded-lg bg-muted/30">
                          <span className="text-primary">Virtual consult:</span>{" "}
                          {format(new Date(booking.consult_preferred_date), "MMM d")}
                          {booking.consult_preferred_time && ` at ${booking.consult_preferred_time}`}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link to={`/dashboard/discover/${booking.procedure_slug}`}>
                          <Button variant="glass" size="sm" className={cn(isMobile && "text-xs h-7 px-2")}>
                            Details
                          </Button>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <section>
              <h2 className={cn("uppercase tracking-wider text-muted-foreground", isMobile ? "text-xs mb-2" : "text-sm mb-4")}>
                Past
              </h2>
              <div className="space-y-2">
                {pastBookings.map((booking) => {
                  const status = statusConfig[booking.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const hasFeedback = feedbackGiven.has(booking.id);
                  const canGiveFeedback = booking.status !== "cancelled" && !hasFeedback;

                  return (
                    <article
                      key={booking.id}
                      className={cn("glass-card", isMobile ? "p-3" : "p-4")}
                    >
                      <div className={cn("flex gap-2", isMobile ? "flex-col" : "flex-col sm:flex-row sm:items-center sm:justify-between gap-3")}>
                        <div className="flex-1 min-w-0">
                          <h3 className={cn("font-medium text-foreground truncate", isMobile && "text-sm")}>
                            {booking.procedure_name}
                          </h3>
                          <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                            {format(new Date(booking.preferred_date), isMobile ? "MMM d, yyyy" : "MMMM d, yyyy")}
                            {booking.provider && ` · ${booking.provider.display_name}`}
                          </div>
                        </div>
                        <div className={cn("flex items-center gap-2", isMobile && "justify-between")}>
                          {hasFeedback && (
                            <div className="flex items-center gap-1 text-[#c9a87c]">
                              <Star className={cn(isMobile ? "w-3 h-3" : "w-4 h-4", "fill-current")} />
                              <span className={cn("font-medium", isMobile ? "text-[10px]" : "text-xs")}>Reviewed</span>
                            </div>
                          )}
                          {canGiveFeedback && (
                            <Button
                              variant="glass"
                              size="sm"
                              onClick={() => openFeedbackModal(booking.id, booking.procedure_name)}
                              className={cn("gap-1", isMobile && "text-xs h-7 px-2")}
                            >
                              <MessageSquare className={cn(isMobile ? "w-3 h-3" : "w-3.5 h-3.5")} />
                              {isMobile ? "Feedback" : "Leave Feedback"}
                            </Button>
                          )}
                          <div className={cn("flex items-center gap-1", status.color)}>
                            <StatusIcon className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
                            <span className={cn(isMobile ? "text-xs" : "text-sm")}>{status.label}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModal.open}
        onOpenChange={(open) => setFeedbackModal(prev => ({ ...prev, open }))}
        bookingId={feedbackModal.bookingId}
        procedureName={feedbackModal.procedureName}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />
    </div>
  );
};

export default BookingsPage;
