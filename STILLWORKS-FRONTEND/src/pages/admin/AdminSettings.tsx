import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Server, Database, HardDrive, Clock } from "lucide-react";
import { fetchAdminSettings, type AdminSettings as SettingsType } from "@/lib/adminApi";

const AdminSettings = () => {
  const { isDark, toggle } = useTheme();
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminSettings().then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground font-body text-sm mb-8">Configure your dashboard</p>
      </motion.div>

      <div className="space-y-6 max-w-xl">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Appearance
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground font-body">Dark Mode</p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">Toggle between light and dark themes</p>
            </div>
            <button
              onClick={toggle}
              className={`w-14 h-8 rounded-full flex items-center transition-colors duration-300 px-1 ${isDark ? "bg-foreground" : "bg-border"
                }`}
            >
              <motion.div
                layout
                className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? "bg-background ml-auto" : "bg-foreground"
                  }`}
              >
                {isDark ? <Moon className="w-3 h-3 text-foreground" /> : <Sun className="w-3 h-3 text-background" />}
              </motion.div>
            </button>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Server className="w-4 h-4" />
            System Status
          </h3>

          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          ) : settings ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-body">API Status</span>
                <span className="text-sm text-green-500 font-body flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  {settings.api_status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-body">Version</span>
                <span className="text-sm text-foreground font-body">{settings.version}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-body">Project</span>
                <span className="text-sm text-foreground font-body">{settings.project}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-body">Server Time</span>
                <span className="text-sm text-foreground font-body">
                  {new Date(settings.server_time).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Unable to fetch settings</p>
          )}
        </motion.div>

        {/* Storage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Storage
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-body">Upload Folder</span>
              <span className="text-sm text-foreground font-body">{settings?.upload_folder || "uploads/"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-body">Max Upload Size</span>
              <span className="text-sm text-foreground font-body">{settings?.max_upload_size || "16MB"}</span>
            </div>
          </div>
        </motion.div>

        {/* API Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" />
            API Configuration
          </h3>
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Backend URL</label>
            <input
              value={import.meta.env.VITE_API_URL || "Not configured (demo mode)"}
              readOnly
              placeholder="Backend URL"
              className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground font-body"
            />
            <p className="text-xs text-muted-foreground font-body mt-2">
              Set VITE_API_URL environment variable to connect to your Flask backend.
            </p>
            {!import.meta.env.VITE_API_URL && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-body">
                  ⚠️ Demo mode active. Set VITE_API_URL to your backend URL (e.g., http://localhost:5000)
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;