import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrganizationProvider } from "@/context/OrganizationContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { AuthProvider } from "@/components/auth/AuthWrapper";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LoginPage from "@/components/auth/LoginPage";
import { AdminLoginPage } from "@/components/auth/AdminLoginPage";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { CreateOrganizationPage } from "@/components/org/CreateOrganizationPage";
import { initializeServices } from "@/infrastructure/di/ServiceRegistry";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { ThemeManager } from "@/components/ThemeManager";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';
import InvitationAccept from './pages/InvitationAccept';

const queryClient = new QueryClient();

// Initialize services on app start
initializeServices();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ThemeManager />
          <AuthProvider>
            <OrganizationProvider>
              <Routes>
                {/* Landing page */}
                <Route path="/" element={<Landing />} />

                {/* Static pages */}
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                
                {/* System admin routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Organization user authentication */}
                <Route path="/auth" element={<LoginPage />} />
                
                {/* Password reset page */}
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Invitation acceptance - NEW ROUTE */}
                <Route path="/invitation/accept/:token" element={<InvitationAccept />} />
                
                {/* Auth callback - FIXED route */}
                <Route path="/auth-callback" element={<AuthCallback />} />
                
                {/* Organization creation */}
                <Route 
                  path="/create-organization" 
                  element={
                    <ProtectedRoute>
                      <CreateOrganizationPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Organization admin routes - wrapped with DashboardProvider */}
                <Route 
                  path="/admin/:slug" 
                  element={
                    <ProtectedRoute requireOrgAdmin>
                      <DashboardProvider>
                        <Admin />
                      </DashboardProvider>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Organization feedback routes */}
                <Route path="/:orgSlug" element={<Index />} />
                
                {/* Legacy org routes for compatibility */}
                <Route path="/org/:slug" element={<Index />} />
                
                {/* Catch-all route - MUST be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </OrganizationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
