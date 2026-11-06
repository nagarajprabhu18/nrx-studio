export type Project = { id: string; title: string; description: string; category: string; image_url: string | null; live_url: string | null; featured: boolean; published: boolean; created_at?: string };
export type Template = { id: string; name: string; category: string; description: string; image_url: string | null; preview_url: string | null; price: number; published: boolean };
export type Review = { id: string; name: string; rating: number; message: string; status: "pending" | "approved" | "rejected"; created_at: string };
export type Settings = { phone: string; email: string; whatsapp: string; instagram: string; hero_title: string; hero_subtitle: string; prices: Record<string, string> };
