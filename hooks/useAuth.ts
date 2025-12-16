import { supabase } from "../lib/supabase";

export type AuthResult = { ok: true } | { ok: false; error: string };

// väike util, et oleks ühes kohas
function normalizeSupabaseAuthError(message?: string) {
  const m = (message ?? "").toLowerCase().trim();

  // --- "tühjad väljad" / sisendi kontroll ---
  // (need võivad tulla ka Supabase'ist, aga me tahame oma teksti)
  if (m.includes("missing email or phone")) return "Palun sisesta e-mail.";
  if (m.includes("missing password")) return "Palun sisesta parool.";

  // --- formaadid / validaatorid ---
  if (m.includes("invalid email")) return "Vigane e-maili formaat.";
  if (m.includes("email address is invalid")) return "Vigane e-maili formaat.";

  // --- login ---
  if (m.includes("invalid login credentials"))
    return "Vale e-mail või parool.";

  // --- register ---
  if (m.includes("user already registered"))
    return "See e-mail on juba kasutusel.";

  // tihti kui email on olemas aga confirmimata
  if (m.includes("email not confirmed"))
    return "E-mail on kinnitamata. Kontrolli oma inboxi ja kinnita konto.";

  // rate limit / liiga palju katseid
  if (m.includes("rate limit") || m.includes("too many requests"))
    return "Liiga palju katseid. Proovi veidi hiljem uuesti.";

  // fallback
  return message && message.length > 0 ? message : "Midagi läks valesti.";
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  // client-side check (et ei läheks üldse Supabase'i “missing email or phone” peale)
  const cleanEmail = email.trim();

  if (!cleanEmail) return { ok: false, error: "Palun sisesta e-mail." };
  if (!password) return { ok: false, error: "Palun sisesta parool." };

  // väga lihtne e-maili kontroll (mitte “liiga range”, aga aitab)
  const emailOk = /^\S+@\S+\.\S+$/.test(cleanEmail);
  if (!emailOk) return { ok: false, error: "Vigane e-maili formaat." };

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) return { ok: false, error: normalizeSupabaseAuthError(error.message) };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: normalizeSupabaseAuthError(e?.message) };
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResult> {
  const cleanEmail = email.trim();

  if (!cleanEmail) return { ok: false, error: "Palun sisesta e-mail." };
  if (!password) return { ok: false, error: "Palun sisesta parool." };

  const emailOk = /^\S+@\S+\.\S+$/.test(cleanEmail);
  if (!emailOk) return { ok: false, error: "Vigane e-maili formaat." };

  // soovi korral lisa parooli miinimum (Supabase default on tihti 6+)
  if (password.length < 6)
    return { ok: false, error: "Parool peab olema vähemalt 6 tähemärki." };

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { display_name: displayName || "" } },
    });

    if (error) return { ok: false, error: normalizeSupabaseAuthError(error.message) };
    if (!data.user) return { ok: false, error: "Registreerimine ebaõnnestus." };

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: normalizeSupabaseAuthError(e?.message) };
  }
}
