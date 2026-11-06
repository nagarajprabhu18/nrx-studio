import type { Project, Review, Settings, Template } from "@/lib/types";

export const defaults: Settings = {
  phone: "9035145703", email: "nrxstudio18@gmail.com", whatsapp: "919035145703",
  instagram: "https://www.instagram.com/the_nrxstudio?cplk=MXNnOXcxaHloMnA3dw==",
  hero_title: "Dream it. We Build it.", hero_subtitle: "Creative websites for life's special moments.",
  prices: { Birthday: "₹299", Anniversary: "₹399", Portfolio: "₹499", Custom: "₹699+" }
};
export const sampleProjects: Project[] = [
  { id: "p1", title: "A Little More Us", description: "An intimate anniversary experience, made for two.", category: "Anniversary", image_url: null, live_url: null, featured: true, published: true },
  { id: "p2", title: "The Birthday Edit", description: "A joyful surprise, wrapped in a little digital magic.", category: "Birthday", image_url: null, live_url: null, featured: true, published: true },
  { id: "p3", title: "Aarav Mehta", description: "A confident portfolio for a creator with a point of view.", category: "Portfolio", image_url: null, live_url: null, featured: true, published: true }
];
export const sampleTemplates: Template[] = [
  { id: "t1", name: "Made of Moments", category: "Birthday", description: "A bright, personal birthday reveal with a photo story and countdown.", image_url: null, preview_url: null, price: 299, published: true },
  { id: "t2", name: "Always, Us", category: "Anniversary", description: "A romantic digital keepsake for your favorite person.", image_url: null, preview_url: null, price: 399, published: true },
  { id: "t3", name: "Quietly Bold", category: "Portfolio", description: "A polished personal portfolio that lets your work lead.", image_url: null, preview_url: null, price: 499, published: true }
];
export const sampleReviews: Review[] = [
  { id: "r1", name: "Sana K.", rating: 5, message: "They turned our story into something we’ll keep coming back to. The little details were everything.", status: "approved", created_at: "2026-10-18" },
  { id: "r2", name: "Rohan M.", rating: 5, message: "Fast, thoughtful, and the final site felt completely like me. Couldn’t ask for more.", status: "approved", created_at: "2026-10-11" },
  { id: "r3", name: "Ananya P.", rating: 5, message: "The birthday surprise was a hit. Such a lovely experience from the first message to launch.", status: "approved", created_at: "2026-09-27" }
];
