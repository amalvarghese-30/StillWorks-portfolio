// STILLWORKS-FRONTEND/src/lib/api.ts
import { Project, Category, fallbackProjects, defaultCategories } from "@/lib/projects";

// Configure your Flask API base URL here
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://stillworks-backend.onrender.com";

async function apiFetch<T>(path: string): Promise<T | null> {
  if (!API_BASE_URL) return null;
  try {
    const res = await fetch(`${API_BASE_URL}${path}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchProjects(category?: string): Promise<Project[]> {
  const params = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
  const data = await apiFetch<Project[]>(`/api/projects${params}`);
  if (data && data.length > 0) return data;

  // Fallback to static data
  if (category && category !== "All") {
    return fallbackProjects.filter((p) => p.category === category);
  }
  return fallbackProjects;
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  const data = await apiFetch<Project[]>("/api/projects?featured=true");
  if (data && data.length > 0) return data;
  return fallbackProjects.filter((p) => p.featured);
}

export async function fetchProject(id: string): Promise<Project | null> {
  const data = await apiFetch<Project>(`/api/projects/${id}`);
  if (data) return data;
  return fallbackProjects.find((p) => p.id === id) || null;
}

export async function fetchCategories(): Promise<string[]> {
  const data = await apiFetch<Category[]>("/api/categories");
  if (data && data.length > 0) {
    return ["All", ...data.map((c) => c.name)];
  }
  return [...defaultCategories];
}

// Updated getImageUrl function that handles both image and cover_image
export function getImageUrl(image?: string, cover?: string): string {
  const img = cover || image;
  if (!img) return "/placeholder.svg";
  if (img.startsWith("http")) return img;
  if (API_BASE_URL) return `${API_BASE_URL}/uploads/${img}`;
  return "/placeholder.svg";
}

// For section images that might be URLs or filenames
export function resolveImageUrl(img: string): string {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  if (API_BASE_URL) return `${API_BASE_URL}/uploads/${img}`;
  return img;
}