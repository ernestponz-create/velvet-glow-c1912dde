import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/signin" element={<SignIn />} />

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
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
