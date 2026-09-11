/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: ReturnType<typeof createClient> | null = null;

function supabaseClient(): ReturnType<typeof createClient> | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

export interface AuthResult {
  ok: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

export async function getUserFromRequest(authorization: string | string[] | undefined): Promise<AuthResult> {
  const value = Array.isArray(authorization) ? authorization[0] : authorization;
  if (!value || !value.startsWith('Bearer ')) {
    return { ok: false, error: 'Missing bearer token' };
  }
  const token = value.slice('Bearer '.length).trim();
  if (!token) return { ok: false, error: 'Missing bearer token' };

  const sb = supabaseClient();
  if (!sb) {
    return { ok: false, error: 'Supabase env vars not configured' };
  }

  try {
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user) {
      return { ok: false, error: 'Invalid or expired token' };
    }
    return {
      ok: true,
      userId: data.user.id,
      email: data.user.email ?? undefined,
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Auth check failed' };
  }
}