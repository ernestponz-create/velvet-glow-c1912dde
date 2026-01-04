import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminSettings = () => {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-white mb-2">
          Admin Settings
        </h1>
        <p className="text-white/60">
          Manage your admin account
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="text-white font-medium">Admin Account</h2>
              <p className="text-white/50 text-sm">You have full administrative access</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/80">Email</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-white/5 border-white/20 text-white/60"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-medium mb-4">Actions</h2>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
