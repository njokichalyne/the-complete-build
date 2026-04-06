import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import AdminGate from "@/components/AdminGate";
import ProtectedRoute from "@/components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PortalOverview from "./pages/portal/PortalOverview";
import PortalTransactions from "./pages/portal/PortalTransactions";
import ReportFraud from "./pages/portal/ReportFraud";
import Chatbot from "./pages/portal/Chatbot";
import Learn from "./pages/portal/Learn";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminAlerts from "./pages/admin/AdminAlerts";
import AdminReports from "./pages/admin/AdminReports";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Client Portal (auth protected) */}
            <Route path="/portal" element={<ProtectedRoute><PortalOverview /></ProtectedRoute>} />
            <Route path="/portal/transactions" element={<ProtectedRoute><PortalTransactions /></ProtectedRoute>} />
            <Route path="/portal/report" element={<ProtectedRoute><ReportFraud /></ProtectedRoute>} />
            <Route path="/portal/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
            <Route path="/portal/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />

            {/* Admin (password protected) */}
            <Route path="/admin" element={<AdminGate><AdminDashboard /></AdminGate>} />
            <Route path="/admin/transactions" element={<AdminGate><AdminTransactions /></AdminGate>} />
            <Route path="/admin/alerts" element={<AdminGate><AdminAlerts /></AdminGate>} />
            <Route path="/admin/reports" element={<AdminGate><AdminReports /></AdminGate>} />
            <Route path="/admin/analytics" element={<AdminGate><Analytics /></AdminGate>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
