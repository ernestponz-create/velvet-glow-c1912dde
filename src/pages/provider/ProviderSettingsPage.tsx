import { useState } from "react";
import { useProviderAuth } from "@/hooks/useProviderAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Shield, Bell, Trash2, LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProviderSettingsPage = () => {
  const { user, signOut } = useProviderAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-white mb-2">
          Settings
        </h1>
        <p className="text-white/60">
          Manage your account preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Account */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#d4af37]" />
            </div>
            <h2 className="text-white font-medium text-lg">Account</h2>
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

            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Change Password
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-white font-medium text-lg">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-white/50 text-sm">Receive booking updates via email</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">SMS Notifications</p>
                <p className="text-white/50 text-sm">Get text alerts for new bookings</p>
              </div>
              <Switch
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
          <h2 className="text-white font-medium text-lg mb-6">Danger Zone</h2>

          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#1a1a2e] border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Account</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/60">
                    This action cannot be undone. This will permanently delete your provider account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSettingsPage;
