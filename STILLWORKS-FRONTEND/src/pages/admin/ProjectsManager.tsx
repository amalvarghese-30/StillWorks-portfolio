import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Star, Eye, EyeOff, X, Loader2, FolderOpen,
  Image, Type, LayoutGrid, Video, BarChart3, Clock, Quote,
  Megaphone, Columns, Code, Users, GripVertical, ChevronDown, ChevronUp,
  Copy, Trash
} from "lucide-react";
import {
  fetchAdminProjects,
  fetchAdminCategories,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectFeatured,
  toggleProjectVisibility,
} from "@/lib/adminApi";
import { getImageUrl } from "@/lib/api";
import type { Project, Category, Section, SectionType, SectionData, categoryTemplates } from "@/lib/projects";
import { categoryTemplates as templates } from "@/lib/projects";

interface ProjectForm {
  title: string;
  client: string;
  category_id: string;
  year: string;
  description: string;
  featured: boolean;
  video_url: string;
  sections: Section[];
}

const emptyForm: ProjectForm = {
  title: "",
  client: "",
  category_id: "",
  year: new Date().getFullYear().toString(),
  description: "",
  featured: false,
  video_url: "",
  sections: [],
};

const sectionTypes: { type: SectionType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: "hero", label: "Hero", icon: <Image className="w-4 h-4" />, description: "Full-width hero image with title and subtitle" },
  { type: "text", label: "Text", icon: <Type className="w-4 h-4" />, description: "Rich text content with heading" },
  { type: "gallery", label: "Gallery", icon: <LayoutGrid className="w-4 h-4" />, description: "Image gallery (grid or carousel)" },
  { type: "video", label: "Video", icon: <Video className="w-4 h-4" />, description: "YouTube/Vimeo embed" },
  { type: "stats", label: "Stats", icon: <BarChart3 className="w-4 h-4" />, description: "Key metrics and numbers" },
  { type: "timeline", label: "Timeline", icon: <Clock className="w-4 h-4" />, description: "Chronological events" },
  { type: "quote", label: "Quote", icon: <Quote className="w-4 h-4" />, description: "Testimonial or quote" },
  { type: "cta", label: "Call to Action", icon: <Megaphone className="w-4 h-4" />, description: "Button with link" },
  { type: "two-column", label: "Two Column", icon: <Columns className="w-4 h-4" />, description: "Side-by-side content" },
  { type: "tech-stack", label: "Tech Stack", icon: <Code className="w-4 h-4" />, description: "Technologies used" },
  { type: "testimonial", label: "Testimonial", icon: <Users className="w-4 h-4" />, description: "Client feedback" },
];

const ProjectsManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([fetchAdminProjects(), fetchAdminCategories()]);
    setProjects(p);
    setCategories(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setCoverImage(null);
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      client: p.client,
      category_id: p.category_id || "",
      year: p.year,
      description: p.description,
      featured: p.featured,
      video_url: p.video_url || "",
      sections: p.sections || [],
    });
    setCoverImage(null);
    setModalOpen(true);
  };

  const addSection = (type: SectionType) => {
    const newSection: Section = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      type,
      data: getDefaultDataForType(type),
    };
    setForm({ ...form, sections: [...form.sections, newSection] });
    setExpandedSection(newSection.id);
  };

  const getDefaultDataForType = (type: SectionType): SectionData => {
    switch (type) {
      case "hero":
        return { image: "", title: "", subtitle: "" };
      case "text":
        return { heading: "", body: "" };
      case "gallery":
        return { images: [], layout: "grid" };
      case "video":
        return { url: "", caption: "" };
      case "stats":
        return { stats: [] };
      case "timeline":
        return { heading: "Timeline", events: [] };
      case "quote":
        return { quote: "", author: "", role: "" };
      case "cta":
        return { heading: "", body: "", buttonText: "", buttonLink: "" };
      case "two-column":
        return { leftContent: "", rightContent: "" };
      case "tech-stack":
        return { heading: "Tech Stack", technologies: [] };
      case "testimonial":
        return { testimonial: "", clientName: "", clientRole: "", clientImage: "" };
      default:
        return {};
    }
  };

  const updateSectionData = (sectionId: string, data: Partial<SectionData>) => {
    setForm({
      ...form,
      sections: form.sections.map(s =>
        s.id === sectionId ? { ...s, data: { ...s.data, ...data } } : s
      ),
    });
  };

  const removeSection = (sectionId: string) => {
    setForm({
      ...form,
      sections: form.sections.filter(s => s.id !== sectionId),
    });
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    const index = form.sections.findIndex(s => s.id === sectionId);
    if (direction === "up" && index > 0) {
      const newSections = [...form.sections];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      setForm({ ...form, sections: newSections });
    } else if (direction === "down" && index < form.sections.length - 1) {
      const newSections = [...form.sections];
      [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
      setForm({ ...form, sections: newSections });
    }
  };

  const loadTemplate = (categoryName: string) => {
    const template = templates.find(t => t.category === categoryName);
    if (template) {
      setForm({
        ...form,
        sections: template.sections.map(s => ({ ...s, id: Date.now().toString() + Math.random().toString(36).slice(2) })),
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("client", form.client);
    fd.append("category_id", form.category_id);
    fd.append("year", form.year);
    fd.append("description", form.description);
    fd.append("featured", String(form.featured));
    fd.append("video_url", form.video_url);
    fd.append("sections", JSON.stringify(form.sections));
    if (coverImage) fd.append("cover_image", coverImage);

    if (editingId) {
      const updated = await updateProject(editingId, fd);
      setProjects((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...updated } : p)));
    } else {
      const created = await createProject(fd);
      setProjects((prev) => [created, ...prev]);
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleFeatured = async (id: string) => {
    await toggleProjectFeatured(id);
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
    );
  };

  const handleToggleVisibility = async (id: string) => {
    await toggleProjectVisibility(id);
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, visible: !(p.visible ?? true) } : p))
    );
  };

  const renderSectionEditor = (section: Section) => {
    const isExpanded = expandedSection === section.id;

    return (
      <div key={section.id} className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border cursor-pointer" onClick={() => setExpandedSection(isExpanded ? null : section.id)}>
          <div className="flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            <div className="flex items-center gap-2">
              {sectionTypes.find(t => t.type === section.type)?.icon}
              <span className="font-display font-medium text-foreground text-sm">
                {sectionTypes.find(t => t.type === section.type)?.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); moveSection(section.id, "up"); }}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); moveSection(section.id, "down"); }}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash className="w-4 h-4" />
            </button>
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {renderSectionFields(section)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderSectionFields = (section: Section) => {
    switch (section.type) {
      case "hero":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Image</label>
              <input
                type="text"
                value={section.data.image || ""}
                onChange={(e) => updateSectionData(section.id, { image: e.target.value })}
                placeholder="Image URL or filename"
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Title</label>
              <input
                type="text"
                value={section.data.title || ""}
                onChange={(e) => updateSectionData(section.id, { title: e.target.value })}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Subtitle</label>
              <input
                type="text"
                value={section.data.subtitle || ""}
                onChange={(e) => updateSectionData(section.id, { subtitle: e.target.value })}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Heading</label>
              <input
                type="text"
                value={section.data.heading || ""}
                onChange={(e) => updateSectionData(section.id, { heading: e.target.value })}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Body</label>
              <textarea
                value={section.data.body || ""}
                onChange={(e) => updateSectionData(section.id, { body: e.target.value })}
                rows={6}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors resize-none"
              />
            </div>
          </div>
        );

      case "gallery":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Layout</label>
              <select
                value={section.data.layout || "grid"}
                onChange={(e) => updateSectionData(section.id, { layout: e.target.value as "grid" | "carousel" | "masonry" })}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
              >
                <option value="grid">Grid</option>
                <option value="carousel">Carousel</option>
                <option value="masonry">Masonry</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Images (comma-separated URLs)</label>
              <textarea
                value={section.data.images?.join(", ") || ""}
                onChange={(e) => updateSectionData(section.id, { images: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                placeholder="image1.jpg, image2.jpg, image3.jpg"
                rows={3}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors resize-none"
              />
            </div>
          </div>
        );

      case "video":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Video URL</label>
              <input
                type="text"
                value={section.data.url || ""}
                onChange={(e) => updateSectionData(section.id, { url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Caption</label>
              <input
                type="text"
                value={section.data.caption || ""}
                onChange={(e) => updateSectionData(section.id, { caption: e.target.value })}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
          </div>
        );

      case "stats":
        return (
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Stats (JSON format)</label>
            <textarea
              value={JSON.stringify(section.data.stats || [], null, 2)}
              onChange={(e) => {
                try {
                  const stats = JSON.parse(e.target.value);
                  updateSectionData(section.id, { stats });
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              placeholder='[{"label": "Projects", "value": "50+"}, {"label": "Clients", "value": "30+"}]'
              rows={6}
              className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">Array of objects with label and value properties</p>
          </div>
        );

      case "timeline":
        return (
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Events (JSON format)</label>
            <textarea
              value={JSON.stringify(section.data.events || [], null, 2)}
              onChange={(e) => {
                try {
                  const events = JSON.parse(e.target.value);
                  updateSectionData(section.id, { events });
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              placeholder='[{"year": "2024", "title": "Project Started", "description": "..."}]'
              rows={8}
              className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors font-mono"
            />
          </div>
        );

      case "quote":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Quote</label>
              <textarea
                value={section.data.quote || ""}
                onChange={(e) => updateSectionData(section.id, { quote: e.target.value })}
                rows={3}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Author</label>
              <input
                type="text"
                value={section.data.author || ""}
                onChange={(e) => updateSectionData(section.id, { author: e.target.value })}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Role</label>
              <input
                type="text"
                value={section.data.role || ""}
                onChange={(e) => updateSectionData(section.id, { role: e.target.value })}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
          </div>
        );

      case "cta":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Heading</label>
              <input
                type="text"
                value={section.data.heading || ""}
                onChange={(e) => updateSectionData(section.id, { heading: e.target.value })}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Body</label>
              <textarea
                value={section.data.body || ""}
                onChange={(e) => updateSectionData(section.id, { body: e.target.value })}
                rows={2}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Button Text</label>
                <input
                  type="text"
                  value={section.data.buttonText || ""}
                  onChange={(e) => updateSectionData(section.id, { buttonText: e.target.value })}
                  className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Button Link</label>
                <input
                  type="text"
                  value={section.data.buttonLink || ""}
                  onChange={(e) => updateSectionData(section.id, { buttonLink: e.target.value })}
                  className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            </div>
          </div>
        );

      case "two-column":
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Left Content (HTML)</label>
              <textarea
                value={section.data.leftContent || ""}
                onChange={(e) => updateSectionData(section.id, { leftContent: e.target.value })}
                rows={6}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Right Content (HTML)</label>
              <textarea
                value={section.data.rightContent || ""}
                onChange={(e) => updateSectionData(section.id, { rightContent: e.target.value })}
                rows={6}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors font-mono"
              />
            </div>
          </div>
        );

      case "tech-stack":
        return (
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Technologies (JSON format)</label>
            <textarea
              value={JSON.stringify(section.data.technologies || [], null, 2)}
              onChange={(e) => {
                try {
                  const technologies = JSON.parse(e.target.value);
                  updateSectionData(section.id, { technologies });
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              placeholder='[{"name": "React"}, {"name": "TypeScript"}]'
              rows={6}
              className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors font-mono"
            />
          </div>
        );

      case "testimonial":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Testimonial</label>
              <textarea
                value={section.data.testimonial || ""}
                onChange={(e) => updateSectionData(section.id, { testimonial: e.target.value })}
                rows={3}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Client Name</label>
              <input
                type="text"
                value={section.data.clientName || ""}
                onChange={(e) => updateSectionData(section.id, { clientName: e.target.value })}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Client Role</label>
              <input
                type="text"
                value={section.data.clientRole || ""}
                onChange={(e) => updateSectionData(section.id, { clientRole: e.target.value })}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Client Image</label>
              <input
                type="text"
                value={section.data.clientImage || ""}
                onChange={(e) => updateSectionData(section.id, { clientImage: e.target.value })}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">{projects.length} total projects</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={openCreate}
          className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-lg text-sm font-display font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </motion.button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-card border border-border rounded-xl p-4">
              <div className="aspect-video bg-muted rounded-lg mb-3" />
              <div className="h-5 bg-muted rounded w-2/3 mb-2" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-body mt-4">No projects yet. Add your first project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/20 transition-colors duration-300"
            >
              <div className="aspect-video bg-muted overflow-hidden">
                <img
                  src={getImageUrl(project.cover_image)}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-foreground truncate">{project.title}</h3>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">
                      {project.category} · {project.year}
                    </p>
                    <p className="text-xs text-muted-foreground font-body mt-1">
                      {project.sections?.length || 0} sections
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleFeatured(project.id)}
                      className={`p-1.5 rounded-md transition-colors ${project.featured ? "text-yellow-500" : "text-muted-foreground hover:text-foreground"
                        }`}
                      title="Toggle featured"
                    >
                      <Star className="w-4 h-4" fill={project.featured ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(project.id)}
                      className={`p-1.5 rounded-md transition-colors ${project.visible === false ? "text-muted-foreground" : "text-foreground"
                        }`}
                      title="Toggle visibility"
                    >
                      {project.visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(project)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground">
                    {editingId ? "Edit Project" : "New Project"}
                  </h2>
                  <p className="text-sm text-muted-foreground font-body mt-0.5">
                    Build your project with dynamic sections
                  </p>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Title *</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Client</label>
                    <input
                      value={form.client}
                      onChange={(e) => setForm({ ...form, client: e.target.value })}
                      className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Category</label>
                    <select
                      value={form.category_id}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedCategory = categories.find(c => c.id === selectedId);

                        setForm({ ...form, category_id: selectedId });

                        if (!editingId && selectedCategory) {
                          loadTemplate(selectedCategory.name);
                        }
                      }}
                      className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Year</label>
                    <input
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Cover Image</label>
                  <div className="border border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                      className="hidden"
                      id="cover-upload"
                      aria-label="Upload cover image"
                    />
                    <label htmlFor="cover-upload" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                      {coverImage ? coverImage.name : "Click to upload cover image"}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5 font-body">Video URL (optional)</label>
                  <input
                    value={form.video_url}
                    onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground font-body">Featured project</span>
                </label>

                {/* Sections Builder */}
                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-display font-semibold text-foreground">Project Sections</h3>
                      <p className="text-xs text-muted-foreground font-body mt-0.5">Build your custom layout</p>
                    </div>
                    <div className="relative group">
                      <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-display font-medium hover:opacity-90 transition-opacity">
                        <Plus className="w-4 h-4" />
                        Add Section
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                        <div className="p-2 space-y-1">
                          {sectionTypes.map((type) => (
                            <button
                              key={type.type}
                              onClick={() => addSection(type.type)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left"
                            >
                              {type.icon}
                              <div>
                                <p className="text-sm font-body text-foreground">{type.label}</p>
                                <p className="text-xs text-muted-foreground">{type.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {form.sections.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-border rounded-xl">
                        <LayoutGrid className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground font-body">No sections yet</p>
                        <p className="text-xs text-muted-foreground font-body mt-1">Click "Add Section" to start building your layout</p>
                      </div>
                    ) : (
                      form.sections.map(renderSectionEditor)
                    )}
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
                  disabled={saving || !form.title}
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

export default ProjectsManager;