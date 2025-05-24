
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { CasesPage } from "@/pages/CasesPage";
import { CaseDetailPage } from "@/pages/CaseDetailPage";
import { NewCasePage } from "@/pages/NewCasePage";
import { ChangePasswordPage } from "@/pages/ChangePasswordPage";
import { UserManagementPage } from "@/pages/UserManagementPage";
import { SettingsPage } from "@/pages/SettingsPage";
import NotFoundOverride from "@/pages/NotFoundOverride";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Route guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { authState, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        authState.isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/cases" element={
        <ProtectedRoute>
          <Layout>
            <CasesPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/case/:id" element={
        <ProtectedRoute>
          <Layout>
            <CaseDetailPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/new-case" element={
        <ProtectedRoute>
          <Layout>
            <NewCasePage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/change-password" element={
        <ProtectedRoute>
          <Layout>
            <ChangePasswordPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/user-management" element={
        <ProtectedRoute>
          <Layout>
            <UserManagementPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <SettingsPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFoundOverride />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
