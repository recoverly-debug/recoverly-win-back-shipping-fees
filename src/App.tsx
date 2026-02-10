import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ClaimDetailPage from "./pages/ClaimDetail";
import AgentHome from "./pages/AgentHome";
import ApprovalQueue from "./pages/ApprovalQueue";
import CaseDetail from "./pages/CaseDetail";
import ConnectorsSettings from "./pages/ConnectorsSettings";
import RecoveryReport from "./pages/RecoveryReport";
import AppSettings from "./pages/AppSettings";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Claims from "./pages/Claims";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/agent" element={<AgentHome />} />
          <Route path="/approvals" element={<ApprovalQueue />} />
          <Route path="/case/:id" element={<CaseDetail />} />
          <Route path="/connectors" element={<ConnectorsSettings />} />
          <Route path="/report" element={<RecoveryReport />} />
          <Route path="/app-settings" element={<AppSettings />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Navigate to="/agent" replace />} />
          <Route path="/claims/:id" element={<ClaimDetailPage />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
