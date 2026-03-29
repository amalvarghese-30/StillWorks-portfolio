// STILLWORKS-FRONTEND/src/pages/AdminLogin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) {
      navigate("/admin");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
            STILLWORKS
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-body">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 font-body">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border border-border rounded-lg px-4 py-3 text-foreground font-body focus:outline-none focus:border-foreground transition-colors duration-300"
              placeholder="admin@stillworks.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 font-body">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border border-border rounded-lg px-4 py-3 text-foreground font-body focus:outline-none focus:border-foreground transition-colors duration-300 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive font-body"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-foreground text-background rounded-lg py-3 font-display font-semibold tracking-wide hover:opacity-90 transition-opacity duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8 font-body">
          Demo: admin@stillworks.com / admin123
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;