import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle, Mail, LogOut } from "lucide-react";
import { useProviderAuth } from "@/hooks/useProviderAuth";

const ProviderRejected = () => {
  const { user, providerProfile, signOut } = useProviderAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-medium tracking-tight text-white">
            Dermica<span className="text-[#d4af37]">IQ</span>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-medium text-white mb-4">
            Application Not Approved
          </h1>

          <p className="text-white/60 mb-8">
            Unfortunately, we were unable to approve your provider application at this time.
          </p>

          {/* Reason Card */}
          {providerProfile?.rejection_reason && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 text-left">
              <h2 className="text-white font-medium mb-3">Reason</h2>
              <p className="text-white/70">{providerProfile.rejection_reason}</p>
            </div>
          )}

          {/* Support Note */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-center gap-2 text-white/60 mb-4">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <p className="text-white/50 text-sm">
              If you believe this was a mistake or have additional information to share, please contact us at{" "}
              <a href="mailto:support@dermicaiq.com" className="text-[#d4af37] hover:underline">
                support@dermicaiq.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderRejected;
