import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, GripVertical, X, Loader2 } from "lucide-react";
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/adminApi";
import type { Category } from "@/lib/projects";

const CategoriesManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await fetchAdminCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const cat = await createCategory(newName.trim());
    setCategories((prev) => [...prev, cat]);
    setNewName("");
    setAdding(false);
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    const updated = await updateCategory(editingId, editName.trim());
    setCategories((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
    setEditingId(null);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Categories</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">{categories.length} categories</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-lg text-sm font-display font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </motion.button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name"
                autoFocus
                className="flex-1 bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <span className="text-xs text-muted-foreground font-body hidden sm:block">
                Slug: {slugify(newName || "example")}
              </span>
              <button
                onClick={handleAdd}
                disabled={saving || !newName.trim()}
                className="px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-display font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                Save
              </button>
              <button onClick={() => setAdding(false)} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-card border border-border rounded-xl p-4 h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 group hover:border-foreground/20 transition-colors duration-200"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />

              {editingId === cat.id ? (
                <div className="flex-1 flex items-center gap-3">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    className="flex-1 bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                  />
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="px-3 py-2 bg-foreground text-background rounded-lg text-xs font-display font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="font-display font-medium text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesManager;
