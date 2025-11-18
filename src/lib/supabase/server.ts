import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.error("Supabase env missing:", {
      NEXT_PUBLIC_SUPABASE_URL: !!url,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!anon,
    });
    throw new Error("Supabase environment variables are missing. Verifique .env.local");
  }

  return createServerClient(
    url,
    anon,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    },
  );
}

/**
 * Cria um cliente Supabase com service role key para operações administrativas.
 * Use apenas em rotas de API do servidor.
 */
export function createSupabaseServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. Verifique .env.local"
    );
  }

  return createClient(url, serviceKey);
}


