import { createClient } from "@supabase/supabase-js";

// Service Role クライアントを作成
export default function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  // Service Role キーの形式確認
  if (!serviceRoleKey.startsWith("eyJ")) {
    throw new Error("Invalid service role key format");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
