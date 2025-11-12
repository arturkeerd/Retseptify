import { supabase } from "../lib/supabase";

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function loginWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Login failed" };
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || "" } },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.user) return { ok: false, error: "Registration failed" };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Registration failed" };
  }
}
