import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getAdmin() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return profile?.role === "admin" ? user : null;
}
export async function requireAdmin() {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  const supabase = await createClient();
  const { data: profile } = await supabase!.from("profiles").select("must_change_password").eq("id", user.id).maybeSingle();
  if (profile?.must_change_password) redirect("/admin/password-reset");
  return user;
}
export async function isAdminForApi() {
  const user = await getAdmin();
  if (!user) return false;
  const supabase = await createClient();
  if (!supabase) return false;
  const { data: profile } = await supabase.from("profiles").select("must_change_password").eq("id", user.id).maybeSingle();
  return !profile?.must_change_password;
}
