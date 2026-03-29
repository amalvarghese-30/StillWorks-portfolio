import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Check, Loader2, Trash2 } from "lucide-react";
import { fetchMediaFiles, deleteMediaFile, type MediaFile } from "@/lib/adminApi";
import { getImageUrl } from "@/lib/api";

interface UploadItem {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
}

const MediaManager = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    const files = await fetchMediaFiles();
    setMediaFiles(files);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: UploadItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file),
        status: "pending" as const,
      }));
    setUploads((prev) => [...prev, ...newItems]);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeItem = (id: string) => {
    setUploads((prev) => {
      const item = prev.find((u) => u.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((u) => u.id !== id);
    });
  };

  const simulateUpload = async (id: string, file: File) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: "uploading" } : u)));
    // Simulate upload delay
    await new Promise((r) => setTimeout(r, 1500));

    // In a real implementation, you'd upload to your backend here
    // For now, just mark as done and refresh the list
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: "done" } : u)));

    // Refresh media list after upload
    setTimeout(() => {
      loadMedia();
      // Remove from uploads after 2 seconds
      setTimeout(() => removeItem(id), 2000);
    }, 500);
  };

  const uploadAll = () => {
    uploads.filter((u) => u.status === "pending").forEach((u) => simulateUpload(u.id, u.file));
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;
    setDeleting(filename);
    await deleteMediaFile(filename);
    await loadMedia();
    setDeleting(null);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground mb-2">Media</h1>
        <p className="text-muted-foreground font-body text-sm mb-8">Upload and manage images</p>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${dragOver ? "border-foreground bg-accent/50" : "border-border hover:border-foreground/30"
          }`}
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
          id="media-upload"
        />
        <label
          htmlFor="media-upload"
          className="inline-block px-5 py-2.5 bg-foreground text-background rounded-lg text-sm font-display font-medium cursor-pointer hover:opacity-90 transition-opacity"
        >
          Browse Files
        </label>
      </motion.div>

      {/* Pending uploads */}
      {uploads.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground font-body">{uploads.filter(u => u.status !== "done").length} file(s) pending</p>
            <button
              onClick={uploadAll}
              className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-display font-medium hover:opacity-90 transition-opacity"
            >
              Upload All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {uploads.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group aspect-square rounded-xl overflow-hidden bg-muted border border-border"
                >
                  <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => removeItem(item.id)} className="p-2 bg-destructive text-destructive-foreground rounded-full" title="Remove file">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {item.status === "uploading" && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-foreground animate-spin" />
                    </div>
                  )}
                  {item.status === "done" && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <p className="absolute bottom-0 left-0 right-0 bg-background/80 px-2 py-1 text-xs text-foreground truncate font-body">
                    {item.file.name}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Existing media library */}
      <div className="mt-8">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Media Library</h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse aspect-square rounded-xl bg-muted" />
            ))}
          </div>
        ) : mediaFiles.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-body">No media files yet</p>
            <p className="text-xs text-muted-foreground font-body mt-1">Upload images above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mediaFiles.map((file) => (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group aspect-square rounded-xl overflow-hidden bg-muted border border-border"
              >
                <img
                  src={getImageUrl(file.name)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(file.name)}
                    disabled={deleting === file.name}
                    className="p-2 bg-destructive text-destructive-foreground rounded-full"
                  >
                    {deleting === file.name ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="absolute bottom-0 left-0 right-0 bg-background/80 px-2 py-1 text-xs text-foreground truncate font-body">
                  {file.name}
                </p>
                <p className="absolute top-2 right-2 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaManager;