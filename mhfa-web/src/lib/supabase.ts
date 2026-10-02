import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mqjgejhhtrrcykgeqzho.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Y_X6Dls_AmygBoM4tZK4xQ_s6Sv6reC";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
