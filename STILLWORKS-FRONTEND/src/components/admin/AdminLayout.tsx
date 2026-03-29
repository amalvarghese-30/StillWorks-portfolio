import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, FolderOpen, Tag, Upload, Settings, LogOut, Menu, X, MessageSquare } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sidebarLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/projects", icon: FolderOpen, label: "Projects", end: false },
  { to: "/admin/categories", icon: Tag, label: "Categories", end: false },
  { to: "/admin/media", icon: Upload, label: "Media", end: false },
  { to: "/admin/testimonials", icon: MessageSquare, label: "Testimonials", end: false },
  { to: "/admin/settings", icon: Settings, label: "Settings", end: false },
];

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-display font-bold tracking-tight text-foreground">STILLWORKS</h2>
        <p className="text-xs text-muted-foreground font-body mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-3">
        {sidebarLinks.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body transition-all duration-200 ${isActive
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 w-full"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 border-r border-border bg-card flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-4">
        <h2 className="text-sm font-display font-bold tracking-tight text-foreground">STILLWORKS</h2>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden fixed inset-y-0 left-0 w-64 z-40 bg-card border-r border-border"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-background/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 md:p-8 p-4 pt-20 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;