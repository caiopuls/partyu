import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

