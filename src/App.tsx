import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AgentHome from "./pages/AgentHome";
import CasesTab from "./pages/CasesTab";
import MoreMenu from "./pages/MoreMenu";
import CaseDetail from "./pages/CaseDetail";
import ConnectorsSettings from "./pages/ConnectorsSettings";
import RecoveryReport from "./pages/RecoveryReport";
import AppSettings from "./pages/AppSettings";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

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
          <Route path="/cases" element={<CasesTab />} />
          <Route path="/case/:id" element={<CaseDetail />} />
          <Route path="/more" element={<MoreMenu />} />
          <Route path="/connectors" element={<ConnectorsSettings />} />
          <Route path="/report" element={<RecoveryReport />} />
          <Route path="/app-settings" element={<AppSettings />} />
          <Route path="/onboarding" element={<Onboarding />} />
          {/* Redirects from old routes */}
          <Route path="/dashboard" element={<Navigate to="/agent" replace />} />
          <Route path="/claims" element={<Navigate to="/cases" replace />} />
          <Route path="/claims/:id" element={<Navigate to="/cases" replace />} />
          <Route path="/approvals" element={<Navigate to="/agent" replace />} />
          <Route path="/settings" element={<Navigate to="/app-settings" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
