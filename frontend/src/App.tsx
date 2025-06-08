import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import AdminLogin from "./components/AdminLogin";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import GovernmentDashboard from "./components/GovernmentDashboard";
import CommandDashboard from "./components/CommandDashboard";
import FieldDashboard from "./components/FieldDashboard";
import RegisterForm from "./components/RegisterForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/government-dashboard" element={<GovernmentDashboard />} />
          <Route path="/command-dashboard" element={<CommandDashboard />} />
          <Route path="/field-dashboard" element={<FieldDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
