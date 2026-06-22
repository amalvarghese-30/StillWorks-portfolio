import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";

// Lazy load components for better initial load
const Index = lazy(() => import("./pages/Index.tsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout.tsx"));
const ProtectedRoute = lazy(() => import("./components/admin/ProtectedRoute.tsx"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard.tsx"));
const ProjectsManager = lazy(() => import("./pages/admin/ProjectsManager.tsx"));
const CategoriesManager = lazy(() => import("./pages/admin/CategoriesManager.tsx"));
const MediaManager = lazy(() => import("./pages/admin/MediaManager.tsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.tsx"));
const TestimonialsManager = lazy(() => import("./pages/admin/TestimonialsManager.tsx"));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;