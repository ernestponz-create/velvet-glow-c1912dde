import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProviderAuth } from "@/hooks/useProviderAuth";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users, Star, ArrowRight, Clock } from "lucide-react";
import { format } from "date-fns";

interface DashboardStats {
  upcomingAppointments: number;
  totalBookingsThisMonth: number;
  averageRating: number;
}

const ProviderDashboardHome = () => {
  const { providerProfile } = useProviderAuth();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    totalBookingsThisMonth: 0,
    averageRating: 4.8
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    // Placeholder for fetching real data
    // In a real implementation, you'd fetch from bookings table
  }, [providerProfile]);

  const statCards = [
    {
      icon: Calendar,
      label: "Upcoming Appointments",
      value: stats.upcomingAppointments,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      icon: Users,
      label: "Bookings This Month",
      value: stats.totalBookingsThisMonth,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10"
    },
    {
      icon: Star,
      label: "Average Rating",
      value: stats.averageRating.toFixed(1),
      color: "text-[#d4af37]",
      bgColor: "bg-[#d4af37]/10"
    }
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-white mb-2">
          Welcome to your Provider Hub
        </h1>
        <p className="text-white/60">
          {providerProfile?.clinic_name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-white/50 text-sm">{stat.label}</p>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Link
          to="/provider-dashboard/availability"
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#d4af37]/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#d4af37]" />
              </div>
              <div>
                <h3 className="text-white font-medium">Manage Availability</h3>
                <p className="text-white/50 text-sm">Set your schedule and block times</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#d4af37] group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          to="/provider-dashboard/profile"
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#d4af37]/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Update Profile</h3>
                <p className="text-white/50 text-sm">Edit your clinic information</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#d4af37] group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-medium mb-4">Recent Activity</h2>
        
        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No recent bookings</p>
            <p className="text-white/30 text-sm">Your upcoming appointments will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{booking.procedure_name}</p>
                  <p className="text-white/50 text-sm">
                    {format(new Date(booking.preferred_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboardHome;
