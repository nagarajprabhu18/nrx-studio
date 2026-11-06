import Link from "next/link";
import { ArrowUpRight, FolderKanban, MessageSquareText, Star, UsersRound } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
type ProjectRow = { id: string; title: string; category: string; published: boolean; created_at: string };
type ReviewRow = { id: string; name: string; rating: number; message: string; created_at: string };
type EnquiryRow = { id: string; name: string; email: string; interest: string; created_at: string };
export default async function Dashboard() {
  await requireAdmin();
  const db = await createClient();
  const stats = { projects: 0, published: 0, reviews: 0, pending: 0, rating: "—" };
  let projects: ProjectRow[] = [], reviews: ReviewRow[] = [], enquiries: EnquiryRow[] = [];
  if (db) {
    const [p, pub, r, pend, approved, recent, recentReviews, recentEnquiries] = await Promise.all([
      db.from("projects").select("id", { count: "exact", head: true }),
      db.from("projects").select("id", { count: "exact", head: true }).eq("published", true),
      db.from("reviews").select("id", { count: "exact", head: true }),
      db.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
      db.from("reviews").select("rating").eq("status", "approved"),
      db.from("projects").select("id,title,category,published,created_at").order("created_at", { ascending: false }).limit(5),
      db.from("reviews").select("id,name,rating,message,created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(4),
      db.from("enquiries").select("id,name,email,interest,created_at").order("created_at", { ascending: false }).limit(4)
    ]);
    projects = (recent.data ?? []) as ProjectRow[];
    reviews = (recentReviews.data ?? []) as ReviewRow[];
    enquiries = (recentEnquiries.data ?? []) as EnquiryRow[];
    const ratings = approved.data ?? [];
    Object.assign(stats, { projects: p.count ?? 0, published: pub.count ?? 0, reviews: r.count ?? 0, pending: pend.count ?? 0,
      rating: ratings.length ? (ratings.reduce((sum, row) => sum + row.rating, 0) / ratings.length).toFixed(1) : "—" });
  }
  const cards = [["Total projects", stats.projects, FolderKanban], ["Published", stats.published, ArrowUpRight], ["Total reviews", stats.reviews, MessageSquareText], ["Pending reviews", stats.pending, UsersRound], ["Approved average", stats.rating, Star]] as const;
  return <AdminShell>
    <div className="flex flex-wrap items-center justify-between gap-5"><div><div className="eyebrow">Your studio at a glance</div><h1 className="mt-2 text-3xl tracking-[-.04em]">Good to see you.</h1><p className="mt-2 text-sm text-[#9294a2]">Here’s what’s happening with NRX Studio today.</p></div><Link href="/" target="_blank" className="btn-quiet">View website <ArrowUpRight size={14}/></Link></div>
    {!db && <div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs text-amber-100">Supabase is not configured. Add your server environment values and run the database migration to enable dashboard data.</div>}
    <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([label, value, Icon]) => <div className="admin-card" key={label}><div className="flex items-center justify-between text-xs text-[#9698a7]">{label}<Icon size={15} className="text-[#b7a4ff]"/></div><div className="mt-4 text-3xl tracking-tight">{value}</div></div>)}</div>
    <div className="mt-7 grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><section className="admin-card"><div className="flex items-center justify-between"><h2 className="text-sm">Recent projects</h2><Link href="/admin/projects" className="text-[11px] text-[#bba9ff]">Manage <ArrowUpRight className="inline" size={12}/></Link></div>{projects.length ? <div className="mt-3 overflow-x-auto"><table className="table"><thead><tr><th>Project</th><th>Category</th><th>Status</th></tr></thead><tbody>{projects.map(p => <tr key={p.id}><td>{p.title}</td><td>{p.category}</td><td>{p.published ? "Published" : "Draft"}</td></tr>)}</tbody></table></div> : <p className="mt-5 text-xs text-[#828494]">No projects have been added yet.</p>}</section>
      <section className="admin-card"><div className="flex items-center justify-between"><h2 className="text-sm">Pending reviews</h2><Link href="/admin/reviews" className="text-[11px] text-[#bba9ff]">Moderate <ArrowUpRight className="inline" size={12}/></Link></div>{reviews.length ? reviews.map(r => <div key={r.id} className="mt-4 border-t border-white/10 pt-4"><div className="flex justify-between text-xs"><span>{r.name}</span><span className="text-[#f6cf78]">{"★".repeat(r.rating)}</span></div><p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#9294a2]">{r.message}</p></div>) : <p className="mt-5 text-xs text-[#828494]">No reviews waiting for approval.</p>}</section></div>
    <section className="admin-card mt-5"><h2 className="text-sm">Recent enquiries</h2>{enquiries.length ? <div className="mt-3 overflow-x-auto"><table className="table"><thead><tr><th>Name</th><th>Email</th><th>Interest</th><th>Received</th></tr></thead><tbody>{enquiries.map(e => <tr key={e.id}><td>{e.name}</td><td><a className="text-[#c6b8ff]" href={`mailto:${e.email}`}>{e.email}</a></td><td>{e.interest}</td><td>{new Date(e.created_at).toLocaleDateString("en-IN")}</td></tr>)}</tbody></table></div> : <p className="mt-4 text-xs text-[#828494]">No enquiries yet.</p>}</section>
  </AdminShell>;
}
