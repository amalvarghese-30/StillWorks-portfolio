// STILLWORKS-FRONTEND/src/pages/admin/TestimonialsManager.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Pencil, Trash2, Star, X, Loader2, MessageSquare,
    Eye, EyeOff, Upload, Image as ImageIcon, GripVertical,
    ChevronUp, ChevronDown, Check, Video, ExternalLink, Globe, ToggleLeft, ToggleRight
} from "lucide-react";
import { getImageUrl } from "@/lib/api";

interface Testimonial {
    id: string;
    client_name: string;
    client_role: string;
    company: string;
    content: string;
    image: string;
    video_url: string;
    video_type: string;
    rating: number;
    featured: boolean;
    approved: boolean;
    visible: boolean;
    metric: string;
    order: number;
    project_name: string;
    project_link: string;
}

interface MediaFile {
    name: string;
    size: number;
    url: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getAuthHeaders() {
    const token = localStorage.getItem("stillworks-admin-token");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

const TestimonialsManager = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [sectionVisible, setSectionVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<Testimonial>>({});
    const [saving, setSaving] = useState(false);
    const [togglingSection, setTogglingSection] = useState(false);
    const [uploads, setUploads] = useState<{ id: string; file: File; preview: string; status: string }[]>([]);
    const [dragOver, setDragOver] = useState(false);

    const loadTestimonials = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("stillworks-admin-token");
            if (!token) {
                setLoading(false);
                return;
            }

            const url = `${API_BASE_URL}/api/testimonials/admin`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const sorted = (data || []).sort((a: Testimonial, b: Testimonial) => (a.order || 0) - (b.order || 0));
            setTestimonials(sorted);
        } catch (error) {
            console.error("Failed to load testimonials", error);
        } finally {
            setLoading(false);
        }
    };

    const loadSectionVisibility = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/testimonials/section-visibility`);
            const data = await res.json();
            setSectionVisible(data.visible);
        } catch (error) {
            console.error("Failed to load section visibility", error);
        }
    };

    const toggleSectionVisibility = async () => {
        setTogglingSection(true);
        try {
            const token = localStorage.getItem("stillworks-admin-token");
            const res = await fetch(`${API_BASE_URL}/api/testimonials/section-visibility`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ visible: !sectionVisible }),
            });
            const data = await res.json();
            setSectionVisible(data.visible);
        } catch (error) {
            console.error("Failed to toggle section visibility", error);
        } finally {
            setTogglingSection(false);
        }
    };

    const loadMedia = async () => {
        if (!API_BASE_URL) return;
        const token = localStorage.getItem("stillworks-admin-token");
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/media`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setMediaFiles(data);
            }
        } catch (error) {
            console.error("Failed to load media", error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("stillworks-admin-token");
        if (token) {
            loadTestimonials();
            loadMedia();
            loadSectionVisibility();
        } else {
            setLoading(false);
        }
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm({
            client_name: "",
            client_role: "",
            company: "",
            content: "",
            image: "",
            video_url: "",
            video_type: "youtube",
            rating: 5,
            featured: false,
            approved: true,
            visible: true,
            metric: "",
            order: testimonials.length,
            project_name: "",
            project_link: "",
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
            ? `${API_BASE_URL}/api/testimonials/${editingId}`
            : `${API_BASE_URL}/api/testimonials`;

        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(form),
            });

            if (res.ok) {
                await loadTestimonials();
                setModalOpen(false);
            } else {
                const error = await res.text();
                console.error("Save failed:", error);
                alert(`Failed to save: ${error}`);
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Network error while saving");
        }
        setSaving(false);
    };

    const toggleVisibility = async (id: string, current: boolean) => {
        try {
            await fetch(`${API_BASE_URL}/api/testimonials/toggle-visibility/${id}`, {
                method: "PATCH",
                headers: getAuthHeaders(),
            });
            await loadTestimonials();
        } catch (error) {
            console.error("Toggle visibility failed:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this testimonial?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/testimonials/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });
            await loadTestimonials();
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const handleToggleApproved = async (id: string, current: boolean) => {
        try {
            await fetch(`${API_BASE_URL}/api/testimonials/${id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({ approved: !current }),
            });
            await loadTestimonials();
        } catch (error) {
            console.error("Toggle approved failed:", error);
        }
    };

    const handleToggleFeatured = async (id: string, current: boolean) => {
        try {
            await fetch(`${API_BASE_URL}/api/testimonials/${id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({ featured: !current }),
            });
            await loadTestimonials();
        } catch (error) {
            console.error("Toggle featured failed:", error);
        }
    };

    const moveOrder = async (id: string, direction: "up" | "down") => {
        const index = testimonials.findIndex(t => t.id === id);
        if (direction === "up" && index > 0) {
            const newOrder = [...testimonials];
            [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

            for (let i = 0; i < newOrder.length; i++) {
                await fetch(`${API_BASE_URL}/api/testimonials/${newOrder[i].id}`, {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ order: i }),
                });
            }
            await loadTestimonials();
        } else if (direction === "down" && index < testimonials.length - 1) {
            const newOrder = [...testimonials];
            [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];

            for (let i = 0; i < newOrder.length; i++) {
                await fetch(`${API_BASE_URL}/api/testimonials/${newOrder[i].id}`, {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ order: i }),
                });
            }
            await loadTestimonials();
        }
    };

    const addFiles = (files: FileList | File[]) => {
        const newItems = Array.from(files)
            .filter((f) => f.type.startsWith("image/"))
            .map((file) => ({
                id: Date.now().toString() + Math.random().toString(36).slice(2),
                file,
                preview: URL.createObjectURL(file),
                status: "pending",
            }));
        setUploads((prev) => [...prev, ...newItems]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
    };

    const simulateUpload = async (id: string, file: File) => {
        setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: "uploading" } : u)));

        const fd = new FormData();
        fd.append("file", file);
        const token = localStorage.getItem("stillworks-admin-token");

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/media/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });

            if (res.ok) {
                setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: "done" } : u)));
                await loadMedia();
                setTimeout(() => removeUpload(id), 2000);
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("Upload failed", error);
            setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: "error" } : u)));
        }
    };

    const removeUpload = (id: string) => {
        setUploads((prev) => {
            const item = prev.find((u) => u.id === id);
            if (item) URL.revokeObjectURL(item.preview);
            return prev.filter((u) => u.id !== id);
        });
    };

    const uploadAll = () => {
        uploads.filter((u) => u.status === "pending").forEach((u) => simulateUpload(u.id, u.file));
    };

    const selectImage = (imageUrl: string) => {
        setForm({ ...form, image: imageUrl });
        setMediaModalOpen(false);
    };

    const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => interactive && onChange && onChange(star)}
                        className={`focus:outline-none ${!interactive && "cursor-default"}`}
                        disabled={!interactive}
                    >
                        <Star
                            className={`w-5 h-5 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const token = localStorage.getItem("stillworks-admin-token");
    if (!token && !loading) {
        return (
            <div className="text-center py-20">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-body">Please log in to manage testimonials.</p>
                <a href="/admin/login" className="mt-4 inline-block px-5 py-2.5 bg-foreground text-background rounded-lg text-sm font-display font-medium hover:opacity-90 transition-opacity">
                    Go to Login
                </a>
            </div>
        );
    }

    return (
        <div>
            {/* Section Visibility Toggle */}
            <div className="mb-8 p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                <div>
                    <h3 className="font-display font-semibold text-foreground">Testimonials Section</h3>
                    <p className="text-sm text-muted-foreground font-body">Show or hide the entire testimonials section on the homepage</p>
                </div>
                <button
                    onClick={toggleSectionVisibility}
                    disabled={togglingSection}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {togglingSection ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : sectionVisible ? (
                        <>
                            <ToggleRight className="w-5 h-5" />
                            <span>Section Visible</span>
                        </>
                    ) : (
                        <>
                            <ToggleLeft className="w-5 h-5" />
                            <span>Section Hidden</span>
                        </>
                    )}
                </button>
            </div>

            <div className="flex items-center justify-between mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Testimonials</h1>
                    <p className="text-muted-foreground font-body text-sm mt-1">
                        {testimonials.length} total testimonials • {testimonials.filter(t => t.visible !== false).length} visible on site
                    </p>
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
                            className={`bg-card border rounded-xl p-4 transition-all ${!t.visible ? "border-red-500/30 opacity-60" :
                                !t.approved ? "border-yellow-500/30 opacity-70" :
                                    "border-border"
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center justify-center gap-1">
                                    <button
                                        onClick={() => moveOrder(t.id, "up")}
                                        disabled={i === 0}
                                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs text-muted-foreground">{i + 1}</span>
                                    <button
                                        onClick={() => moveOrder(t.id, "down")}
                                        disabled={i === testimonials.length - 1}
                                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>

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
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {t.metric && (
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                📈 {t.metric}
                                            </span>
                                        )}
                                        {t.video_url && (
                                            <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Video className="w-3 h-3" /> Video
                                            </span>
                                        )}
                                        {!t.visible && (
                                            <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                                                Hidden from site
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {t.featured && (
                                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs rounded-full mr-1">
                                            Featured
                                        </span>
                                    )}
                                    <button
                                        onClick={() => toggleVisibility(t.id, t.visible)}
                                        className={`p-1.5 rounded-md transition-colors ${!t.visible ? "text-red-500" : "text-green-500"}`}
                                        title={t.visible ? "Hide from site" : "Show on site"}
                                    >
                                        {t.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleToggleFeatured(t.id, t.featured)}
                                        className={`p-1.5 rounded-md transition-colors ${t.featured ? "text-yellow-500" : "text-muted-foreground"}`}
                                        title={t.featured ? "Remove featured" : "Mark as featured"}
                                    >
                                        <Star className="w-4 h-4" fill={t.featured ? "currentColor" : "none"} />
                                    </button>
                                    <button
                                        onClick={() => handleToggleApproved(t.id, t.approved)}
                                        className={`p-1.5 rounded-md transition-colors ${t.approved ? "text-green-500" : "text-muted-foreground"}`}
                                        title={t.approved ? "Approved (click to hide)" : "Hidden (click to approve)"}
                                    >
                                        {t.approved ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
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

            {/* Add/Edit Modal */}
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
                            className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
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
                                {/* Client Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                            Client Name *
                                        </label>
                                        <input
                                            value={form.client_name || ""}
                                            onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                                            className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                            Role
                                        </label>
                                        <input
                                            value={form.client_role || ""}
                                            onChange={(e) => setForm({ ...form, client_role: e.target.value })}
                                            className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body"
                                            placeholder="CEO"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                            Company
                                        </label>
                                        <input
                                            value={form.company || ""}
                                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                                            className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body"
                                            placeholder="Company Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                            Rating (1-5)
                                        </label>
                                        {renderStars(form.rating || 5, true, (rating) => setForm({ ...form, rating }))}
                                    </div>
                                </div>

                                {/* Testimonial Content */}
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                        Testimonial *
                                    </label>
                                    <textarea
                                        value={form.content || ""}
                                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                                        rows={4}
                                        className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors resize-none"
                                        placeholder="What did your client say about working with you?"
                                    />
                                </div>

                                {/* Metric */}
                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                        Metric / Result
                                    </label>
                                    <input
                                        value={form.metric || ""}
                                        onChange={(e) => setForm({ ...form, metric: e.target.value })}
                                        className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body"
                                        placeholder="+47% conversion increase"
                                    />
                                </div>

                                {/* Project Link */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                            Project Name
                                        </label>
                                        <input
                                            value={form.project_name || ""}
                                            onChange={(e) => setForm({ ...form, project_name: e.target.value })}
                                            className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body"
                                            placeholder="E-Commerce Redesign"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                            Project Link
                                        </label>
                                        <input
                                            value={form.project_link || ""}
                                            onChange={(e) => setForm({ ...form, project_link: e.target.value })}
                                            className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body"
                                            placeholder="https://example.com/project"
                                        />
                                    </div>
                                </div>

                                {/* Media Section */}
                                <div className="border-t border-border pt-4">
                                    <h3 className="font-display font-semibold text-foreground mb-3">Media</h3>

                                    {/* Image */}
                                    <div className="mb-4">
                                        <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                            Client Image
                                        </label>
                                        <div className="flex gap-3">
                                            <input
                                                value={form.image || ""}
                                                onChange={(e) => setForm({ ...form, image: e.target.value })}
                                                className="flex-1 bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body"
                                                placeholder="Image URL or filename"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setMediaModalOpen(true)}
                                                className="px-4 py-2.5 bg-muted rounded-lg text-sm font-body hover:bg-accent transition-colors"
                                            >
                                                Browse Media
                                            </button>
                                        </div>
                                        {form.image && (
                                            <div className="mt-2">
                                                <img
                                                    src={getImageUrl(form.image)}
                                                    alt="Preview"
                                                    className="w-16 h-16 rounded-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Video */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                                Video URL (Optional)
                                            </label>
                                            <input
                                                value={form.video_url || ""}
                                                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                                                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body"
                                                placeholder="https://youtube.com/watch?v=..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">
                                                Video Type
                                            </label>
                                            <select
                                                value={form.video_type || "youtube"}
                                                onChange={(e) => setForm({ ...form, video_type: e.target.value })}
                                                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body"
                                            >
                                                <option value="youtube">YouTube</option>
                                                <option value="vimeo">Vimeo</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Toggles */}
                                <div className="border-t border-border pt-4">
                                    <h3 className="font-display font-semibold text-foreground mb-3">Status</h3>
                                    <div className="flex flex-wrap gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.featured || false}
                                                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                                                className="w-4 h-4 rounded border-border"
                                            />
                                            <span className="text-sm text-foreground font-body">Featured (highlight on carousel)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.approved !== false}
                                                onChange={(e) => setForm({ ...form, approved: e.target.checked })}
                                                className="w-4 h-4 rounded border-border"
                                            />
                                            <span className="text-sm text-foreground font-body">Approved</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.visible !== false}
                                                onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                                                className="w-4 h-4 rounded border-border"
                                            />
                                            <span className="text-sm text-foreground font-body">Visible on site</span>
                                        </label>
                                    </div>
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

            {/* Media Manager Modal - same as before */}
            <AnimatePresence>
                {mediaModalOpen && (
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
                            className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-xl font-display font-bold text-foreground">Media Library</h2>
                                <button onClick={() => setMediaModalOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1">
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 mb-6 ${dragOver ? "border-foreground bg-accent/50" : "border-border hover:border-foreground/30"}`}
                                >
                                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-foreground font-display font-medium mb-2">Drop images here</p>
                                    <p className="text-sm text-muted-foreground font-body mb-4">or click to browse</p>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => e.target.files && addFiles(e.target.files)}
                                        className="hidden"
                                        id="media-upload-modal"
                                    />
                                    <label htmlFor="media-upload-modal" className="inline-block px-5 py-2.5 bg-foreground text-background rounded-lg text-sm font-display font-medium cursor-pointer hover:opacity-90 transition-opacity">
                                        Browse Files
                                    </label>
                                </div>
                                {uploads.length > 0 && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm text-muted-foreground font-body">{uploads.filter(u => u.status !== "done").length} file(s) pending</p>
                                            <button onClick={uploadAll} className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-display font-medium hover:opacity-90 transition-opacity">
                                                Upload All
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                            {uploads.map((item) => (
                                                <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                                                    <img src={item.preview} alt="" className="w-full h-full object-cover" />
                                                    {item.status === "uploading" && (
                                                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                                            <Loader2 className="w-6 h-6 text-foreground animate-spin" />
                                                        </div>
                                                    )}
                                                    {item.status === "done" && (
                                                        <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center">
                                                            <Check className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {mediaFiles.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground font-body">No media files yet</p>
                                        <p className="text-xs text-muted-foreground font-body mt-1">Upload images above to get started</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                        {mediaFiles.map((file) => (
                                            <motion.div
                                                key={file.name}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-border cursor-pointer hover:ring-2 hover:ring-foreground transition-all"
                                                onClick={() => selectImage(file.name)}
                                            >
                                                <img src={getImageUrl(file.name)} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Check className="w-6 h-6 text-white" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TestimonialsManager;