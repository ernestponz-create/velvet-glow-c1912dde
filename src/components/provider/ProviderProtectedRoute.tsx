import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProviderAuth } from "@/hooks/useProviderAuth";

interface ProviderProtectedRouteProps {
  children: React.ReactNode;
  requireApproval?: boolean;
}

const ProviderProtectedRoute = ({ children, requireApproval = true }: ProviderProtectedRouteProps) => {
  const { user, isLoading, isProvider, isApproved, providerProfile } = useProviderAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      navigate("/provider-signup");
      return;
    }

    if (!isProvider) {
      navigate("/");
      return;
    }

    if (requireApproval) {
      if (providerProfile?.status === 'pending') {
        navigate("/provider-pending");
        return;
      }
      if (providerProfile?.status === 'rejected') {
        navigate("/provider-rejected");
        return;
      }
    }
  }, [user, isLoading, isProvider, isApproved, providerProfile, requireApproval, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isProvider) {
    return null;
  }

  if (requireApproval && !isApproved) {
    return null;
  }

  return <>{children}</>;
};

export default ProviderProtectedRoute;
