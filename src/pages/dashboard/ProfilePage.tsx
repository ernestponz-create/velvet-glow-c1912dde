import { useState } from "react";
import { User, LogOut, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EditPreferencesModal from "@/components/profile/EditPreferencesModal";
import MembershipTierCard from "@/components/membership/MembershipTierCard";

const ProfilePage = () => {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSavePreferences = async (preferences: {
    ageRange: string;
    concerns: string[];
    location: string;
  }) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          age_range: preferences.ageRange,
          main_concerns: preferences.concerns,
          location_city: preferences.location,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      setEditModalOpen(false);
      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Guest";

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="pt-2">
        {/* Profile header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-xl font-medium tracking-tight mb-1">
            {displayName}
          </h1>
          <p className="text-muted-foreground text-xs">{user?.email}</p>
        </div>

        {/* Membership Tier Card */}
        <div className="mb-4">
          <MembershipTierCard 
            currentTier={profile?.computed_tier} 
            totalSpend={profile?.total_spend} 
          />
        </div>

        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
              Your Preferences
            </h2>
            <button
              onClick={() => setEditModalOpen(true)}
              className="flex items-center gap-1 text-xs text-primary"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
          </div>
          
          {profile?.age_range && (
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground text-sm">Age Range</span>
              <span className="text-foreground text-sm">{profile.age_range}</span>
            </div>
          )}
          
          {profile?.location_city && (
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground text-sm">Location</span>
              <span className="text-foreground text-sm">{profile.location_city}</span>
            </div>
          )}

          {profile?.main_concerns && profile.main_concerns.length > 0 && (
            <div className="py-2">
              <span className="text-muted-foreground block mb-2 text-sm">Main Concerns</span>
              <div className="flex flex-wrap gap-2">
                {profile.main_concerns.map((concern) => (
                  <span
                    key={concern}
                    className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {concern.replace("-", " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button
            variant="glass"
            size="default"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <EditPreferencesModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          currentPreferences={{
            ageRange: profile?.age_range || "",
            concerns: profile?.main_concerns || [],
            location: profile?.location_city || "",
          }}
          onSave={handleSavePreferences}
          isLoading={isSaving}
        />
      </div>
    );
  }

  // Desktop Layout
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

      {/* Membership Tier Card */}
      <div className="mb-6">
        <MembershipTierCard 
          currentTier={profile?.computed_tier} 
          totalSpend={profile?.total_spend} 
        />
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
            Your Preferences
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditModalOpen(true)}
            className="text-primary hover:text-primary/80"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        
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

      <EditPreferencesModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        currentPreferences={{
          ageRange: profile?.age_range || "",
          concerns: profile?.main_concerns || [],
          location: profile?.location_city || "",
        }}
        onSave={handleSavePreferences}
        isLoading={isSaving}
      />
    </div>
  );
};

export default ProfilePage;
