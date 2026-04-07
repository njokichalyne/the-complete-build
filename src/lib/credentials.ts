import { supabase } from '@/integrations/supabase/client';

export async function getCredentials(userId: string) {
  const { data, error } = await supabase
    .from('user_credentials')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertPin(userId: string, pinHash: string) {
  const existing = await getCredentials(userId);
  if (existing) {
    const { error } = await supabase
      .from('user_credentials')
      .update({ pin_hash: pinHash, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('user_credentials')
      .insert({ user_id: userId, pin_hash: pinHash });
    if (error) throw error;
  }
}

export async function upsertWebauthnId(userId: string, credentialId: string) {
  const existing = await getCredentials(userId);
  if (existing) {
    const { error } = await supabase
      .from('user_credentials')
      .update({ webauthn_credential_id: credentialId, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('user_credentials')
      .insert({ user_id: userId, webauthn_credential_id: credentialId });
    if (error) throw error;
  }
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function lookupByAccountNumber(accountNumber: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, account_number')
    .eq('account_number', accountNumber.toUpperCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Simple hash for PIN (not crypto-grade, but stored server-side behind RLS)
export function hashPin(pin: string): string {
  let hash = 0;
  const str = `fraudguard_salt_${pin}_pepper`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}
