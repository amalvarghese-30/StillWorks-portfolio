import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Star, X, Loader2, MessageSquare, Eye, EyeOff } from "lucide-react";
import { getImageUrl } from "@/lib/api";

interface Testimonial {
    id: string;
    client_name: string;
    client_role: string;
    company: string;
    content: string;
    image: string;
    rating: number;
    featured: boolean;
    approved: boolean;
    metric: string;
    order: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN = () => localStorage.getItem("stillworks-admin-token");

const TestimonialsManager = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<Testimonial>>({});
    const [saving, setSaving] = useState(false);

    const loadTestimonials = async () => {
        setLoading(true);
        try {
            const url = API_BASE ? `${API_BASE}/api/testimonials/admin` : "/api/testimonials/admin";
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${TOKEN()}` },
            });
            const data = await res.json();
            setTestimonials(data);
        } catch (error) {
            console.error("Failed to load testimonials", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTestimonials();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm({
            client_name: "",
            client_role: "",
            company: "",
            content: "",
            image: "",
            rating: 5,
            featured: false,
            approved: true,
            metric: "",
            order: testimonials.length,
        });
        setModalOpen(true);
    };

    const openEdit = (t: Testimonial) => {
        setEditingId(t.id);
        setForm(t);
        setModalOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        const url = editingId
            ? `${API_BASE}/api/testimonials/${editingId}`
            : `${API_BASE}/api/testimonials`;

        const res = await fetch(url, {
            method: editingId ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN()}`,
            },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            await loadTestimonials();
            setModalOpen(false);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this testimonial?")) return;
        await fetch(`${API_BASE}/api/testimonials/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${TOKEN()}` },
        });
        await loadTestimonials();
    };

    const handleToggleApproved = async (id: string, current: boolean) => {
        await fetch(`${API_BASE}/api/testimonials/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN()}`,
            },
            body: JSON.stringify({ approved: !current }),
        });
        await loadTestimonials();
    };

    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
            />
        ));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Testimonials</h1>
                    <p className="text-muted-foreground font-body text-sm mt-1">Client reviews and success stories</p>
                </motion.div>
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-lg text-sm font-display font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    Add Testimonial
                </motion.button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse bg-card border border-border rounded-xl p-4 h-24" />
                    ))}
                </div>
            ) : testimonials.length === 0 ? (
                <div className="text-center py-20">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-body">No testimonials yet. Add your first client review.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`bg-card border rounded-xl p-4 ${!t.approved ? "border-yellow-500/30 opacity-70" : "border-border"
                                }`}
                        >
                            <div className="flex gap-4">
                                {t.image && (
                                    <img
                                        src={getImageUrl(t.image)}
                                        alt={t.client_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div>
                                            <h3 className="font-display font-semibold text-foreground">{t.client_name}</h3>
                                            <p className="text-xs text-muted-foreground font-body">
                                                {t.client_role} {t.company && `@ ${t.company}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {renderStars(t.rating)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-body mt-2 line-clamp-2">
                                        "{t.content}"
                                    </p>
                                    {t.metric && (
                                        <div className="mt-2 inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                            {t.metric}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleToggleApproved(t.id, t.approved)}
                                        className={`p-1.5 rounded-md transition-colors ${t.approved ? "text-green-500" : "text-muted-foreground"
                                            }`}
                                        title={t.approved ? "Approved (click to hide)" : "Hidden (click to approve)"}
                                    >
                                        {t.approved ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => openEdit(t)}
                                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
                                <h2 className="text-xl font-display font-bold text-foreground">
                                    {editingId ? "Edit Testimonial" : "New Testimonial"}
                                </h2>
                                <button onClick={() => setModalOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                        Client Name *
                                    </label>
                                    <input
                                        value={form.client_name || ""}
                                        onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                                        className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                            Role
                                        </label>
                                        <input
                                            value={form.client_role || ""}
                                            onChange={(e) => setForm({ ...form, client_role: e.target.value })}
                                            className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                            Company
                                        </label>
                                        <input
                                            value={form.company || ""}
                                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                                            className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                        Testimonial *
                                    </label>
                                    <textarea
                                        value={form.content || ""}
                                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                                        rows={4}
                                        className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                        Metric / Result (e.g., "+47% conversion")
                                    </label>
                                    <input
                                        value={form.metric || ""}
                                        onChange={(e) => setForm({ ...form, metric: e.target.value })}
                                        className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                        Client Image (URL or filename)
                                    </label>
                                    <input
                                        value={form.image || ""}
                                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                                        className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                        Rating (1-5)
                                    </label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setForm({ ...form, rating: star })}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-6 h-6 ${star <= (form.rating || 5) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.featured || false}
                                            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                                            className="w-4 h-4 rounded border-border"
                                        />
                                        <span className="text-sm text-foreground font-body">Featured (show on homepage)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.approved !== false}
                                            onChange={(e) => setForm({ ...form, approved: e.target.checked })}
                                            className="w-4 h-4 rounded border-border"
                                        />
                                        <span className="text-sm text-foreground font-body">Approved (visible on site)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 p-6 border-t border-border sticky bottom-0 bg-card">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-5 py-2.5 rounded-lg text-sm font-body text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !form.client_name || !form.content}
                                    className="px-5 py-2.5 rounded-lg text-sm font-display font-medium bg-foreground text-background hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingId ? "Update" : "Create"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TestimonialsManager;