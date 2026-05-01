import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const sha256 = async (s: string) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: claims } = await userClient.auth.getClaims(auth.replace('Bearer ', ''));
    if (!claims?.claims?.sub) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const userId = claims.claims.sub as string;
    const userEmail = claims.claims.email as string | undefined;

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { action, code } = await req.json();

    if (action === 'send') {
      // Rate-limit: max 5 OTP sends per hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await admin.from('step_up_otps').select('*', { count: 'exact', head: true })
        .eq('user_id', userId).gte('created_at', oneHourAgo);
      if ((count ?? 0) >= 5) {
        return new Response(JSON.stringify({ error: 'Too many requests. Try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const otpHash = await sha256(otp);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await admin.from('step_up_otps').insert({ user_id: userId, otp_hash: otpHash, expires_at: expiresAt });

      // For demo: log code to function logs since email infra isn\'t wired.
      // In production, route through send-transactional-email or auth email.
      console.log(`[step-up-otp] Code for ${userEmail}: ${otp}`);

      return new Response(JSON.stringify({ ok: true, devCode: otp }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'verify') {
      if (typeof code !== 'string' || code.length !== 6) {
        return new Response(JSON.stringify({ error: 'Invalid code format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const codeHash = await sha256(code);
      const { data: otps } = await admin.from('step_up_otps').select('*')
        .eq('user_id', userId).eq('consumed', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false }).limit(1);
      const latest = otps?.[0];
      if (!latest) return new Response(JSON.stringify({ error: 'No active code. Request a new one.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (latest.attempts >= 5) return new Response(JSON.stringify({ error: 'Too many attempts' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      await admin.from('step_up_otps').update({ attempts: latest.attempts + 1 }).eq('id', latest.id);
      if (latest.otp_hash !== codeHash) {
        return new Response(JSON.stringify({ error: 'Incorrect code' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      await admin.from('step_up_otps').update({ consumed: true }).eq('id', latest.id);
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
