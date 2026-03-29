import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import ProjectDetail from "./pages/ProjectDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import ProjectsManager from "./pages/admin/ProjectsManager.tsx";
import CategoriesManager from "./pages/admin/CategoriesManager.tsx";
import MediaManager from "./pages/admin/MediaManager.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import TestimonialsManager from "./pages/admin/TestimonialsManager.tsx";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="projects" element={<ProjectsManager />} />
                <Route path="categories" element={<CategoriesManager />} />
                <Route path="media" element={<MediaManager />} />
                <Route path="testimonials" element={<TestimonialsManager />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;