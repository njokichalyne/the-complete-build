import { supabase } from '@/integrations/supabase/client';

export interface DbTransaction {
  id: string;
  transaction_ref: string;
  user_name: string;
  user_phone: string | null;
  type: string;
  amount: number;
  currency: string;
  status: string;
  risk_score: number;
  location: string | null;
  device: string | null;
  description: string | null;
  created_at: string;
}

export interface DbFraudAlert {
  id: string;
  transaction_id: string | null;
  severity: string;
  alert_type: string;
  message: string;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface DbFraudReport {
  id: string;
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string | null;
  report_type: string;
  description: string;
  status: string;
  reference_number: string;
  created_at: string;
  updated_at: string;
}

export async function fetchTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as DbTransaction[];
}

export async function fetchFraudAlerts() {
  const { data, error } = await supabase
    .from('fraud_alerts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as DbFraudAlert[];
}

export async function fetchFraudReports() {
  const { data, error } = await supabase
    .from('fraud_reports')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as DbFraudReport[];
}

export async function createFraudReport(report: {
  reporter_name: string;
  reporter_email: string;
  reporter_phone?: string;
  report_type: string;
  description: string;
}) {
  const reference_number = `FR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const { data, error } = await supabase
    .from('fraud_reports')
    .insert({ ...report, reference_number })
    .select()
    .single();
  if (error) throw error;
  return data as DbFraudReport;
}

export async function updateAlertStatus(alertId: string, resolved: boolean) {
  const { error } = await supabase
    .from('fraud_alerts')
    .update({ resolved, resolved_at: resolved ? new Date().toISOString() : null })
    .eq('id', alertId);
  if (error) throw error;
}

export async function createTransaction(tx: {
  user_name: string;
  user_phone?: string;
  type: string;
  amount: number;
  currency: string;
  description?: string;
  location?: string;
  device?: string;
}) {
  const transaction_ref = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const risk_score = Math.floor(Math.random() * 30); // Low risk for user-initiated transactions
  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...tx, transaction_ref, status: 'approved', risk_score })
    .select()
    .single();
  if (error) throw error;
  return data as DbTransaction;
}

export async function analyzeTransaction(transaction: DbTransaction) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-transaction`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ transaction }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Analysis failed');
  }

  const data = await response.json();
  return data.analysis as string;
}

type Msg = { role: 'user' | 'assistant'; content: string };

export async function streamChat({
  messages,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    }
  );

  if (!resp.ok || !resp.body) {
    const err = await resp.json().catch(() => ({ error: 'Stream failed' }));
    throw new Error(err.error || 'Failed to start stream');
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = '';
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') { streamDone = true; break; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + '\n' + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split('\n')) {
      if (!raw) continue;
      if (raw.endsWith('\r')) raw = raw.slice(0, -1);
      if (raw.startsWith(':') || raw.trim() === '') continue;
      if (!raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}
