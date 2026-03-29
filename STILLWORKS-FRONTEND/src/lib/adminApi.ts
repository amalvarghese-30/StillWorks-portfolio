// STILLWORKS-FRONTEND/src/lib/adminApi.ts
import type { Project, Category, Section } from "@/lib/projects";
import { fallbackProjects } from "@/lib/projects";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function getToken() {
  return localStorage.getItem("stillworks-admin-token") || "";
}

function authHeaders(isJson = true): Record<string, string> {
  const h: Record<string, string> = { Authorization: `Bearer ${getToken()}` };
  if (isJson) h["Content-Type"] = "application/json";
  return h;
}

// Stats
export interface AdminStats {
  total_projects: number;
  featured_projects: number;
  visible_projects: number;
  total_categories: number;
}

export interface MediaFile {
  name: string;
  size: number;
  url: string;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  if (!API_BASE_URL) {
    return { total_projects: 8, featured_projects: 4, visible_projects: 6, total_categories: 6 };
  }
  const res = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers: authHeaders() });
  return res.json();
}

// Projects
export async function fetchAdminProjects(): Promise<Project[]> {
  if (!API_BASE_URL) return [...fallbackProjects];
  const res = await fetch(`${API_BASE_URL}/api/admin/projects`, { headers: authHeaders() });
  return res.json();
}

export async function createProject(data: FormData): Promise<Project> {
  if (!API_BASE_URL) {
    const p: Project = {
      id: Date.now().toString(),
      title: data.get("title") as string,
      category: data.get("category") as string,
      description: data.get("description") as string,
      cover_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
      year: data.get("year") as string,
      client: data.get("client") as string,
      featured: data.get("featured") === "true",
      visible: true,
      sections: []
    };
    return p;
  }
  const res = await fetch(`${API_BASE_URL}/api/projects`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: data,
  });
  return res.json();
}

export async function updateProject(id: string, data: FormData): Promise<Project> {
  if (!API_BASE_URL) return fallbackProjects[0];
  const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: data,
  });
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  if (!API_BASE_URL) return;
  await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function toggleProjectFeatured(id: string): Promise<void> {
  if (!API_BASE_URL) return;
  await fetch(`${API_BASE_URL}/api/projects/${id}/toggle-featured`, {
    method: "PATCH",
    headers: authHeaders(),
  });
}

export async function toggleProjectVisibility(id: string): Promise<void> {
  if (!API_BASE_URL) return;
  await fetch(`${API_BASE_URL}/api/projects/${id}/toggle-visibility`, {
    method: "PATCH",
    headers: authHeaders(),
  });
}

// Categories
export async function fetchAdminCategories(): Promise<Category[]> {
  if (!API_BASE_URL) {
    return [
      { id: "1", name: "Automation Systems", slug: "automation-systems", order: 0 },
      { id: "2", name: "Business Websites", slug: "business-websites", order: 1 },
      { id: "3", name: "Landing Pages", slug: "landing-pages", order: 2 },
      { id: "4", name: "Dashboards & Tools", slug: "dashboards-tools", order: 3 },
      { id: "5", name: "Branding", slug: "branding", order: 4 },
      { id: "6", name: "Performance Marketing", slug: "performance-marketing", order: 5 },
    ];
  }
  const res = await fetch(`${API_BASE_URL}/api/categories`, { headers: authHeaders() });
  return res.json();
}

export async function createCategory(name: string): Promise<Category> {
  if (!API_BASE_URL) {
    return { id: Date.now().toString(), name, slug: name.toLowerCase().replace(/\s+/g, "-"), order: 99 };
  }
  const res = await fetch(`${API_BASE_URL}/api/categories`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  if (!API_BASE_URL) {
    return { id, name, slug: name.toLowerCase().replace(/\s+/g, "-"), order: 0 };
  }
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  if (!API_BASE_URL) return;
  await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function fetchMediaFiles(): Promise<MediaFile[]> {
  if (!API_BASE_URL) {
    // Demo mode: return some sample images
    return [
      { name: "project-1.jpg", size: 245000, url: "/placeholder.svg" },
      { name: "project-2.jpg", size: 189000, url: "/placeholder.svg" },
      { name: "hero-bg.png", size: 512000, url: "/placeholder.svg" },
    ];
  }
  const res = await fetch(`${API_BASE_URL}/api/admin/media`, {
    headers: authHeaders(false)
  });
  return res.json();
}

export async function deleteMediaFile(filename: string): Promise<void> {
  if (!API_BASE_URL) return;
  await fetch(`${API_BASE_URL}/api/admin/media/${encodeURIComponent(filename)}`, {
    method: "DELETE",
    headers: authHeaders(false),
  });
}

// Reorder endpoints
export async function reorderProjects(orders: { id: string; order: number }[]): Promise<void> {
  if (!API_BASE_URL) return;
  await fetch(`${API_BASE_URL}/api/projects/reorder`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(orders),
  });
}

export async function reorderCategories(orders: { id: string; order: number }[]): Promise<void> {
  if (!API_BASE_URL) return;
  await fetch(`${API_BASE_URL}/api/categories/reorder`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(orders),
  });
}

// Settings
export interface AdminSettings {
  api_status: string;
  version: string;
  project: string;
  server_time: string;
  upload_folder: string;
  max_upload_size: string;
}

export async function fetchAdminSettings(): Promise<AdminSettings> {
  if (!API_BASE_URL) {
    return {
      api_status: "demo_mode",
      version: "1.0.0-dev",
      project: "Stillworks CMS",
      server_time: new Date().toISOString(),
      upload_folder: "uploads",
      max_upload_size: "16MB"
    };
  }
  const res = await fetch(`${API_BASE_URL}/api/admin/settings`, { headers: authHeaders() });
  return res.json();
}