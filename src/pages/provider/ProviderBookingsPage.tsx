import { useEffect, useState } from "react";
import { useProviderAuth } from "@/hooks/useProviderAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar, Clock, User, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Booking {
  id: string;
  procedure_name: string;
  preferred_date: string;
  preferred_time: string | null;
  status: string;
  notes: string | null;
  investment_level: string;
  created_at: string;
}

const ProviderBookingsPage = () => {
  const { providerProfile } = useProviderAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, you'd fetch bookings linked to this provider
    // For now, we'll show a placeholder state
    setIsLoading(false);
  }, [providerProfile]);

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'completed');

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-[#d4af37]/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-medium text-lg">{booking.procedure_name}</h3>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status] || statusColors.pending}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-sm">Investment</p>
          <p className="text-[#d4af37] font-medium">{booking.investment_level}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-white/60">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(booking.preferred_date), 'MMM d, yyyy')}</span>
        </div>
        {booking.preferred_time && (
          <div className="flex items-center gap-2 text-white/60">
            <Clock className="w-4 h-4" />
            <span>{booking.preferred_time}</span>
          </div>
        )}
      </div>

      {booking.notes && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <p className="text-white/50 text-xs mb-1">Notes</p>
          <p className="text-white/70 text-sm">{booking.notes}</p>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-white mb-2">
          Bookings & Requests
        </h1>
        <p className="text-white/60">
          Manage your client appointments and booking requests
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger 
            value="upcoming" 
            className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#1a1a2e]"
          >
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger 
            value="past"
            className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#1a1a2e]"
          >
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingBookings.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-white font-medium text-lg mb-2">No Upcoming Bookings</h3>
              <p className="text-white/50">
                When clients book appointments with you, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastBookings.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <Clock className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-white font-medium text-lg mb-2">No Past Bookings</h3>
              <p className="text-white/50">
                Completed appointments will be shown here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderBookingsPage;
