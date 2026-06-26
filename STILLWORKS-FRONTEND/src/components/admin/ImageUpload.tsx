import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, Link, Image, Check } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function ImageUpload({ value, onChange, placeholder = "Upload image or paste URL" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      const token = localStorage.getItem("stillworks-admin-token") || "";

      if (API_BASE_URL) {
        const res = await fetch(`${API_BASE_URL}/api/admin/media/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        onChange(data.url);
      }
    } catch {
      // Silent fail — user can retry
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) uploadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleClear = () => onChange("");

  return (
    <div className="space-y-2">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 w-fit">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-body transition-colors ${
            mode === "upload" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload className="w-3 h-3" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-body transition-colors ${
            mode === "url" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link className="w-3 h-3" />
          URL
        </button>
      </div>

      {/* Upload mode */}
      {mode === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 ${
            dragOver ? "border-foreground bg-accent/50" : "border-border hover:border-foreground/30"
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-body">Uploading...</span>
            </div>
          ) : value ? (
            <div className="relative inline-block">
              <img
                src={value}
                alt=""
                className="max-h-32 rounded-lg object-contain"
              />
              <div className="absolute inset-0 bg-background/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-foreground text-background rounded-full"
                  title="Replace image"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 bg-destructive text-destructive-foreground rounded-full"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload-input"
              />
              <label
                htmlFor="image-upload-input"
                className="cursor-pointer flex flex-col items-center gap-2 py-2"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Image className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground font-body">
                  {placeholder}
                </span>
              </label>
            </>
          )}
        </div>
      )}

      {/* URL mode */}
      {mode === "url" && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-transparent border border-border rounded-lg px-4 py-2.5 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Preview in URL mode when there's a value */}
      {mode === "url" && value && (
        <div className="relative inline-block">
          <img src={value} alt="" className="max-h-24 rounded-lg object-contain border border-border" />
        </div>
      )}
    </div>
  );
}

// Multi-image variant for galleries
interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function MultiImageUpload({ images, onChange }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    const newUrls: string[] = [];
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
    const token = localStorage.getItem("stillworks-admin-token") || "";

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (API_BASE_URL) {
          const res = await fetch(`${API_BASE_URL}/api/admin/media/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          if (!res.ok) throw new Error("Upload failed");
          const data = await res.json();
          newUrls.push(data.url);
        }
      } catch {
        // Skip failed uploads
      }
    }

    onChange([...images, ...newUrls]);
    setUploading(false);
  }, [images, onChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) uploadFiles(e.target.files);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Existing images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-destructive/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button + URL input */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="gallery-upload-input"
        />
        <label
          htmlFor="gallery-upload-input"
          className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body transition-colors ${
            uploading
              ? "bg-muted text-muted-foreground pointer-events-none"
              : "bg-foreground text-background hover:opacity-90"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Select Images
            </>
          )}
        </label>

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Or paste a URL and press Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                e.preventDefault();
                onChange([...images, e.currentTarget.value.trim()]);
                e.currentTarget.value = "";
              }
            }}
            className="w-full bg-transparent border border-border rounded-lg px-4 py-2 text-sm text-foreground font-body focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
