import { Calendar } from "lucide-react";

const BookingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto text-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Calendar className="w-7 h-7 text-primary" />
      </div>
      <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mb-3">
        Bookings
      </h1>
      <p className="text-muted-foreground">
        Manage your upcoming appointments and consultations.
      </p>
    </div>
  );
};

export default BookingsPage;
