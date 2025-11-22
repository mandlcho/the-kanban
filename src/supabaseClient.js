import { createClient } from "@supabase/supabase-js";

// Fallbacks help when GitHub Pages builds do not inject env vars.
const DEFAULT_SUPABASE_URL = "https://sxgapwnjwraglnvjcqja.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "sb_publishable_WohowMQtpWgIyThqvwNZ9Q_IcBmdEcb";

const globalConfig =
  typeof window !== "undefined" && window.__SUPABASE_CONFIG__
    ? window.__SUPABASE_CONFIG__
    : {};

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  globalConfig.url ||
  DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  globalConfig.anonKey ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
