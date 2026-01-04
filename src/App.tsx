import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProviderAuthProvider } from "@/hooks/useProviderAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProviderProtectedRoute from "@/components/provider/ProviderProtectedRoute";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";

// Dashboard
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import DiscoverPage from "@/pages/dashboard/DiscoverPage";
import ProcedureDetailPage from "@/pages/dashboard/ProcedureDetailPage";
import ConciergePage from "@/pages/dashboard/ConciergePage";
import BookingsPage from "@/pages/dashboard/BookingsPage";
import AftercarePage from "@/pages/dashboard/AftercarePage";
import ProfilePage from "@/pages/dashboard/ProfilePage";
import QuickBookPage from "@/pages/dashboard/QuickBookPage";
import BenefitsPage from "@/pages/dashboard/BenefitsPage";

// Provider
import ProviderSignup from "@/pages/ProviderSignup";
import ProviderPending from "@/pages/ProviderPending";
import ProviderRejected from "@/pages/ProviderRejected";
import ProviderDashboardLayout from "@/components/provider/ProviderDashboardLayout";
import ProviderDashboardHome from "@/pages/provider/ProviderDashboardHome";
import ProviderAvailabilityPage from "@/pages/provider/ProviderAvailabilityPage";
import ProviderBookingsPage from "@/pages/provider/ProviderBookingsPage";
import ProviderProfilePage from "@/pages/provider/ProviderProfilePage";
import ProviderSettingsPage from "@/pages/provider/ProviderSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProviderAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/signin" element={<SignIn />} />

              {/* Provider public routes */}
              <Route path="/provider-signup" element={<ProviderSignup />} />
              <Route path="/provider-pending" element={<ProviderPending />} />
              <Route path="/provider-rejected" element={<ProviderRejected />} />

              {/* Protected dashboard routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="discover" element={<DiscoverPage />} />
                <Route path="discover/:slug" element={<ProcedureDetailPage />} />
                <Route path="concierge" element={<ConciergePage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="aftercare" element={<AftercarePage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="quick-book" element={<QuickBookPage />} />
                <Route path="benefits" element={<BenefitsPage />} />
              </Route>

              {/* Protected provider dashboard routes */}
              <Route
                path="/provider-dashboard"
                element={
                  <ProviderProtectedRoute>
                    <ProviderDashboardLayout />
                  </ProviderProtectedRoute>
                }
              >
                <Route index element={<ProviderDashboardHome />} />
                <Route path="availability" element={<ProviderAvailabilityPage />} />
                <Route path="bookings" element={<ProviderBookingsPage />} />
                <Route path="profile" element={<ProviderProfilePage />} />
                <Route path="settings" element={<ProviderSettingsPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProviderAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
