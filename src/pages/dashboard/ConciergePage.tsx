import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Settings, 
  ChevronRight, 
  Clock, 
  MapPin,
  Phone,
  CheckCircle2,
  Circle,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  procedure_name: string;
  procedure_slug: string;
  preferred_date: string;
  preferred_time: string | null;
  status: string;
  market_highest_price: number | null;
  price_paid: number | null;
  provider_id: string;
}

interface Task {
  id: string;
  title: string;
  type: string;
  status: string;
  due_at: string;
  booking_id: string | null;
}

interface SavingsData {
  totalSavings: number;
  bookingCount: number;
  savingsBreakdown: { procedure: string; savings: number }[];
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Pending" },
  confirmed: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Confirmed" },
  completed: { bg: "bg-primary/10", text: "text-primary", label: "Completed" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-400", label: "Cancelled" },
};

const ConciergePage = () => {
  const { user, profile } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [recentProcedures, setRecentProcedures] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Guest";
  const memberSince = user?.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);

      // Fetch all data in parallel
      const [bookingsResult, tasksResult] = await Promise.all([
        supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("preferred_date", { ascending: true }),
        supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("due_at", { ascending: true })
          .limit(5),
      ]);

      if (!bookingsResult.error && bookingsResult.data) {
        const allBookings = bookingsResult.data;
        
        // Filter upcoming (pending/confirmed)
        const upcoming = allBookings.filter(
          (b) => b.status === "pending" || b.status === "confirmed"
        );
        setUpcomingBookings(upcoming);

        // Get recent procedure slugs for recommendations
        const recentSlugs = [...new Set(allBookings.slice(0, 3).map((b) => b.procedure_slug))];
        setRecentProcedures(recentSlugs);

        // Calculate savings from completed bookings
        const completedWithPricing = allBookings.filter(
          (b) => b.status === "completed" && b.market_highest_price && b.price_paid
        );

        if (completedWithPricing.length > 0) {
          const breakdown = completedWithPricing.map((b) => ({
            procedure: b.procedure_name,
            savings: Math.max(0, (b.market_highest_price || 0) - (b.price_paid || 0)),
          }));

          const total = breakdown.reduce((acc, item) => acc + item.savings, 0);

          setSavingsData({
            totalSavings: total,
            bookingCount: completedWithPricing.length,
            savingsBreakdown: breakdown,
          });
        }
      }

      if (!tasksResult.error && tasksResult.data) {
        setTasks(tasksResult.data);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const concernLabels: Record<string, string> = {
    "anti-aging": "Anti-Aging",
    "skin-texture": "Skin Texture",
    "volume-loss": "Volume Restoration",
    "fine-lines": "Fine Lines",
    "skin-laxity": "Skin Tightening",
    wrinkles: "Wrinkle Reduction",
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-48 bg-muted rounded-2xl" />
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Welcome back,</p>
              <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-foreground">
                {displayName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Member badge */}
              <div className="px-4 py-2 rounded-full border border-glass-border bg-glass/40">
                <span className="text-sm text-muted-foreground">
                  Member since <span className="text-foreground font-medium">{memberSince}</span>
                </span>
              </div>

              {/* Savings badge */}
              {savingsData && savingsData.totalSavings > 0 && (
                <div className="px-4 py-2 rounded-full border border-primary/30 bg-primary/5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-pearl">
                    {formatCurrency(savingsData.totalSavings)} saved
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-serif text-xl font-medium text-foreground">
                Upcoming Appointments
              </h2>
            </div>
            <Link to="/dashboard/bookings">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No upcoming appointments</p>
              <Link to="/dashboard/discover">
                <Button variant="velvet" size="sm">
                  Discover Treatments
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-xl bg-muted/30 border border-glass-border hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-foreground">{booking.procedure_name}</h3>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        statusColors[booking.status]?.bg,
                        statusColors[booking.status]?.text
                      )}
                    >
                      {statusColors[booking.status]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(booking.preferred_date), "MMM d, yyyy")}
                    </span>
                    {booking.preferred_time && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {booking.preferred_time}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Savings Journey */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-serif text-xl font-medium text-foreground">
              Your Savings Journey
            </h2>
          </div>

          {savingsData && savingsData.totalSavings > 0 ? (
            <div>
              {/* Large savings number */}
              <div className="text-center py-6 mb-4 rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Total Savings</p>
                <p className="font-serif text-4xl md:text-5xl font-medium text-primary">
                  {formatCurrency(savingsData.totalSavings)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  across {savingsData.bookingCount} treatment{savingsData.bookingCount !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Breakdown</p>
                {savingsData.savingsBreakdown.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-glass-border last:border-0"
                  >
                    <span className="text-sm text-foreground">{item.procedure}</span>
                    <span className="text-sm font-medium text-primary">
                      {formatCurrency(item.savings)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No savings yet</p>
              <p className="text-sm text-muted-foreground">
                Complete your first treatment to start tracking your exclusive savings
              </p>
            </div>
          )}
        </div>

        {/* Recent Recommendations */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-serif text-xl font-medium text-foreground">
              Recent Recommendations
            </h2>
          </div>

          {recentProcedures.length > 0 ? (
            <div className="space-y-3">
              {recentProcedures.map((slug) => (
                <Link
                  key={slug}
                  to={`/dashboard/discover/${slug}`}
                  className="block p-4 rounded-xl bg-muted/30 border border-glass-border hover:border-primary/20 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground capitalize group-hover:text-primary transition-colors">
                        {slug.replace(/-/g, " ")}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        View specialists and availability
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Explore treatments tailored to you</p>
              <Link to="/dashboard/discover">
                <Button variant="velvet" size="sm">
                  Browse Treatments
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Aftercare Tracker */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-serif text-xl font-medium text-foreground">
                Aftercare Tracker
              </h2>
            </div>
            <Link to="/dashboard/aftercare">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/20"
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due {format(new Date(task.due_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  {task.status !== "completed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                      onClick={async () => {
                        await supabase
                          .from("tasks")
                          .update({ status: "completed", completed_at: new Date().toISOString() })
                          .eq("id", task.id);
                        setTasks(prev => prev.map(t => 
                          t.id === task.id ? { ...t, status: "completed" } : t
                        ));
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Done
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No aftercare tasks yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tasks will appear after booking treatments
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Preferences */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-foreground">
                Quick Preferences
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Update your treatment preferences and profile
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Current concerns */}
            {profile?.main_concerns && profile.main_concerns.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.main_concerns.slice(0, 3).map((concern) => (
                  <span
                    key={concern}
                    className="px-3 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground"
                  >
                    {concernLabels[concern] || concern}
                  </span>
                ))}
              </div>
            )}

            <Link to="/dashboard/profile">
              <Button variant="glass" size="sm">
                Edit Preferences
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConciergePage;
