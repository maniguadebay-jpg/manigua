import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function createSupabaseUser(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
): Promise<{ id: string } | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: metadata ?? {},
      email_confirm: true,
    });
    if (error || !data?.user) return null;
    return { id: data.user.id };
  } catch {
    return null;
  }
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<{ id: string } | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.user) return null;
    return { id: data.user.id };
  } catch {
    return null;
  }
}