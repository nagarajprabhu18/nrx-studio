"use client";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";
export function createClient() {
  const env = getSupabaseEnv();
  return env ? createBrowserClient(env.url, env.key) : null;
}
