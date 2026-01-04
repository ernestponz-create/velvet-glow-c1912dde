import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Mail, CheckCircle, FileSearch, Shield, LogOut } from "lucide-react";
import { useProviderAuth } from "@/hooks/useProviderAuth";

const ProviderPending = () => {
  const { user, signOut } = useProviderAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const steps = [
    { icon: FileSearch, title: "Application Review", desc: "Our team reviews your practice information" },
    { icon: CheckCircle, title: "Verification", desc: "We verify your credentials and certifications" },
    { icon: Shield, title: "Approval", desc: "Once approved, you'll get full dashboard access" }
  ];

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
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-[#d4af37]/20 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-[#d4af37]" />
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-medium text-white mb-4">
            Application Submitted
          </h1>

          <div className="flex items-center justify-center gap-2 text-white/60 mb-8">
            <Mail className="w-4 h-4" />
            <span>We'll notify you at {user?.email}</span>
          </div>

          {/* Timeline */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
            <h2 className="text-white font-medium mb-6">What happens next</h2>
            
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4 text-left">
                  <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{step.title}</p>
                    <p className="text-white/50 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/70 text-sm">
                Review typically takes <span className="text-[#d4af37] font-medium">24-48 hours</span>
              </p>
            </div>
          </div>

          {/* Support Note */}
          <p className="text-white/50 text-sm">
            Questions? Contact us at{" "}
            <a href="mailto:support@dermicaiq.com" className="text-[#d4af37] hover:underline">
              support@dermicaiq.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ProviderPending;
