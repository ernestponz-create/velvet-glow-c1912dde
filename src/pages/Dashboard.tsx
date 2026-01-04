import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Calendar, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Sparkles,
  Clock,
  Heart,
  ChevronRight
} from "lucide-react";

const Dashboard = () => {
  const menuItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Calendar, label: "Appointments" },
    { icon: Sparkles, label: "Treatments" },
    { icon: Heart, label: "Saved Clinics" },
    { icon: User, label: "Profile" },
    { icon: Settings, label: "Settings" },
  ];

  const upcomingAppointments = [
    {
      title: "Consultation with Dr. Laurent",
      clinic: "Swiss Aesthetic Institute",
      date: "Jan 15, 2026",
      time: "2:00 PM",
    },
  ];

  const recommendedTreatments = [
    {
      name: "Advanced Facial Rejuvenation",
      description: "Personalized anti-aging protocol",
      tag: "Recommended",
    },
    {
      name: "Precision Dermal Therapy",
      description: "Targeted treatment for radiant skin",
      tag: "New",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/50 bg-card/50">
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-medium tracking-tight text-foreground">
              Velvet<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border/50">
          <Link to="/">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            {/* Mobile logo */}
            <Link to="/" className="lg:hidden flex items-center gap-2">
              <span className="font-serif text-xl font-medium tracking-tight text-foreground">
                Velvet<span className="text-primary">.</span>
              </span>
            </Link>
            
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search treatments, clinics..."
                className="bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {/* Welcome */}
            <div className="mb-10">
              <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mb-2">
                Welcome back, <span className="text-gradient">Alexandra</span>
              </h1>
              <p className="text-muted-foreground">
                Your personal concierge awaits. Here's what's happening.
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Upcoming</span>
                </div>
                <p className="font-serif text-2xl font-medium">1</p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Treatments</span>
                </div>
                <p className="font-serif text-2xl font-medium">3</p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Member Since</span>
                </div>
                <p className="font-serif text-2xl font-medium">2024</p>
              </div>
            </div>

            {/* Two column layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Upcoming appointments */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-lg font-medium">Upcoming Appointments</h2>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View all
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {upcomingAppointments.map((apt, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <h3 className="font-medium mb-1">{apt.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{apt.clinic}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {apt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {apt.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended treatments */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-lg font-medium">For You</h2>
                  <Button variant="ghost" size="sm" className="text-primary">
                    Explore
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {recommendedTreatments.map((treatment, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {treatment.name}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {treatment.tag}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{treatment.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
