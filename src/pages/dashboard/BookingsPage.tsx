import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Sparkles, ChevronRight, CheckCircle2, Clock3, XCircle, Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import FeedbackModal from "@/components/feedback/FeedbackModal";

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
  pending: { label: "Awaiting Confirmation", icon: Clock3, color: "text-amber-400" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-emerald-400" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-primary" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-muted-foreground" },
};

const BookingsPage = () => {
  const { user } = useAuth();
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight mb-2">
          My Bookings
        </h1>
        <p className="text-muted-foreground">
          Manage your upcoming appointments and view past treatments.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-serif text-xl font-medium text-foreground mb-3">
            No Bookings Yet
          </h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Start your aesthetic journey by exploring our curated selection of premium treatments.
          </p>
          <Link to="/dashboard/discover">
            <Button variant="velvet" className="group">
              Discover Procedures
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <section>
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Upcoming Appointments
              </h2>
              <div className="space-y-4 stagger-children">
                {upcomingBookings.map((booking, index) => {
                  const status = statusConfig[booking.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const investment = investmentLabels[booking.investment_level];
                  const dateLabel = getDateLabel(booking.preferred_date);

                  return (
                    <article
                      key={booking.id}
                      className="glass-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.15)]"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-serif text-xl font-medium text-foreground">
                              {booking.procedure_name}
                            </h3>
                            {dateLabel === "today" && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                                Today
                              </span>
                            )}
                          </div>
                          {booking.provider && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>
                                {booking.provider.display_name} · {booking.provider.neighborhood}, {booking.provider.city}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className={`flex items-center gap-1.5 ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{status.label}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground">
                            {formatDate(booking.preferred_date)}
                          </span>
                        </div>
                        {booking.preferred_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm text-foreground">{booking.preferred_time}</span>
                          </div>
                        )}
                        {investment && (
                          <div className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {investment.label}
                          </div>
                        )}
                      </div>

                      {booking.wants_virtual_consult && booking.consult_preferred_date && (
                        <div className="text-sm text-muted-foreground mb-4 p-3 rounded-lg bg-muted/30">
                          <span className="text-primary">Virtual consult requested:</span>{" "}
                          {format(new Date(booking.consult_preferred_date), "MMM d")}
                          {booking.consult_preferred_time && ` at ${booking.consult_preferred_time}`}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Link to={`/dashboard/discover/${booking.procedure_slug}`}>
                          <Button variant="glass" size="sm">
                            View Details
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
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                Past Appointments
              </h2>
              <div className="space-y-3">
                {pastBookings.map((booking) => {
                  const status = statusConfig[booking.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const hasFeedback = feedbackGiven.has(booking.id);
                  const canGiveFeedback = booking.status !== "cancelled" && !hasFeedback;

                  return (
                    <article
                      key={booking.id}
                      className="glass-card p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">
                            {booking.procedure_name}
                          </h3>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(booking.preferred_date), "MMMM d, yyyy")}
                            {booking.provider && ` · ${booking.provider.display_name}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {hasFeedback && (
                            <div className="flex items-center gap-1.5 text-[#c9a87c]">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-xs font-medium">Reviewed</span>
                            </div>
                          )}
                          {canGiveFeedback && (
                            <Button
                              variant="glass"
                              size="sm"
                              onClick={() => openFeedbackModal(booking.id, booking.procedure_name)}
                              className="gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Leave Feedback
                            </Button>
                          )}
                          <div className={`flex items-center gap-1.5 ${status.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-sm">{status.label}</span>
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
