import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminGate from "@/components/AdminGate";
import LandingPage from "./pages/LandingPage";
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
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />

          {/* Client Portal */}
          <Route path="/portal" element={<PortalOverview />} />
          <Route path="/portal/transactions" element={<PortalTransactions />} />
          <Route path="/portal/report" element={<ReportFraud />} />
          <Route path="/portal/chatbot" element={<Chatbot />} />
          <Route path="/portal/learn" element={<Learn />} />

          {/* Admin (password protected) */}
          <Route path="/admin" element={<AdminGate><AdminDashboard /></AdminGate>} />
          <Route path="/admin/transactions" element={<AdminGate><AdminTransactions /></AdminGate>} />
          <Route path="/admin/alerts" element={<AdminGate><AdminAlerts /></AdminGate>} />
          <Route path="/admin/reports" element={<AdminGate><AdminReports /></AdminGate>} />
          <Route path="/admin/analytics" element={<AdminGate><Analytics /></AdminGate>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
