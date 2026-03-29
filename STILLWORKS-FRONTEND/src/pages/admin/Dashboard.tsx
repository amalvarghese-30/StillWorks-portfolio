import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Star, Eye, Tag } from "lucide-react";
import { fetchAdminStats, type AdminStats } from "@/lib/adminApi";

const statCards = [
  { key: "total_projects" as const, label: "Total Projects", icon: FolderOpen },
  { key: "featured_projects" as const, label: "Featured", icon: Star },
  { key: "visible_projects" as const, label: "Visible", icon: Eye },
  { key: "total_categories" as const, label: "Categories", icon: Tag },
];

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 30);
    const id = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(id);
      } else {
        setDisplay(start);
      }
    }, 30);
    return () => clearInterval(id);
  }, [value]);
  return <span>{display}</span>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetchAdminStats().then(setStats);
  }, []);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground font-body text-sm mb-8">Overview of your portfolio</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-6 hover:border-foreground/20 transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-body">
                {label}
              </span>
            </div>
            <p className="text-4xl font-display font-bold text-foreground">
              {stats ? <AnimatedCounter value={stats[key]} /> : "—"}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-card border border-border rounded-xl p-8"
      >
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Add New Project", href: "/admin/projects" },
            { label: "Manage Categories", href: "/admin/categories" },
            { label: "Upload Media", href: "/admin/media" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="px-4 py-3 border border-border rounded-lg text-sm font-body text-foreground hover:bg-accent transition-colors duration-200 text-center"
            >
              {action.label}
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
