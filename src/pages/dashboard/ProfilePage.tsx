import { User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Guest";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mb-2">
          {displayName}
        </h1>
        <p className="text-muted-foreground text-sm">{user?.email}</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Your Preferences
        </h2>
        
        {profile?.age_range && (
          <div className="flex justify-between py-3 border-b border-border/50">
            <span className="text-muted-foreground">Age Range</span>
            <span className="text-foreground">{profile.age_range}</span>
          </div>
        )}
        
        {profile?.location_city && (
          <div className="flex justify-between py-3 border-b border-border/50">
            <span className="text-muted-foreground">Location</span>
            <span className="text-foreground">{profile.location_city}</span>
          </div>
        )}
        
        {profile?.budget_tier && (
          <div className="flex justify-between py-3 border-b border-border/50">
            <span className="text-muted-foreground">Investment Tier</span>
            <span className="text-foreground capitalize">{profile.budget_tier}</span>
          </div>
        )}

        {profile?.main_concerns && profile.main_concerns.length > 0 && (
          <div className="py-3">
            <span className="text-muted-foreground block mb-2">Main Concerns</span>
            <div className="flex flex-wrap gap-2">
              {profile.main_concerns.map((concern) => (
                <span
                  key={concern}
                  className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary"
                >
                  {concern.replace("-", " ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button
          variant="glass"
          size="lg"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
