import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Accessibility, Loader2, Eye, MessageSquareWarning, Brain, History } from 'lucide-react';
import PortalLayout from '@/components/PortalLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ensurePrefs, COLD_START_THRESHOLD } from '@/lib/behavioral';
import { toast } from 'sonner';

interface Prefs {
  behavioral_monitoring_enabled: boolean;
  accessibility_mode: boolean;
  preferred_step_up: 'biometric' | 'pin' | 'email_otp';
  share_signals_for_global_model: boolean;
}

const RiskSettings = () => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [baseline, setBaseline] = useState<{ samples_count: number; last_updated: string } | null>(null);
  const [events, setEvents] = useState<Array<{ id: string; risk_score: number; decision: string; reason_codes: string[]; created_at: string }>>([]);
  const [disputes, setDisputes] = useState<Array<{ id: string; status: string; dispute_type: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const p = await ensurePrefs(user.id);
      setPrefs(p as Prefs);
      const { data: b } = await supabase.from('behavioral_baselines').select('samples_count, last_updated').eq('user_id', user.id).maybeSingle();
      setBaseline(b);
      const { data: ev } = await supabase.from('risk_events').select('id, risk_score, decision, reason_codes, created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
      setEvents(ev ?? []);
      const { data: dp } = await supabase.from('risk_disputes').select('id, status, dispute_type, created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
      setDisputes(dp ?? []);
      setLoading(false);
    })();
  }, [user]);

  const update = async (patch: Partial<Prefs>) => {
    if (!user || !prefs) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    const { error } = await supabase.from('user_risk_prefs').update({ ...patch, updated_at: new Date().toISOString() }).eq('user_id', user.id);
    if (error) toast.error('Failed to save'); else toast.success('Saved');
  };

  if (loading || !prefs) {
    return <PortalLayout><div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div></PortalLayout>;
  }

  const samples = baseline?.samples_count ?? 0;
  const coldStart = samples < COLD_START_THRESHOLD;

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Security & Behavior</h1>
        <p className="text-sm text-muted-foreground">Control how we use behavioral signals to keep your account safe.</p>
      </motion.div>

      {/* Baseline status */}
      <div className="mt-6 bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Your behavioral baseline</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          We learn typing rhythm, pointer movement, login times, and devices to spot when something doesn't feel like you.
          {coldStart && ' We're still learning — until then, we won't block any transactions.'}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full gradient-primary" style={{ width: `${Math.min(100, (samples / COLD_START_THRESHOLD) * 100)}%` }} />
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {samples}/{COLD_START_THRESHOLD} samples {coldStart ? '(learning)' : '(active)'}
          </span>
        </div>
      </div>

      {/* Toggles */}
      <div className="mt-4 bg-card border border-border rounded-xl divide-y divide-border">
        <Toggle icon={<Shield className="w-4 h-4 text-primary" />} title="Behavioral monitoring"
          desc="Use typing and pointer patterns to detect unauthorized access."
          checked={prefs.behavioral_monitoring_enabled}
          onChange={v => update({ behavioral_monitoring_enabled: v })} />
        <Toggle icon={<Accessibility className="w-4 h-4 text-primary" />} title="Accessibility mode"
          desc="Reduces sensitivity to typing/movement variance. Recommended if you use assistive tech, have a motor disability, or your patterns naturally vary."
          checked={prefs.accessibility_mode}
          onChange={v => update({ accessibility_mode: v })} />
        <Toggle icon={<Eye className="w-4 h-4 text-primary" />} title="Share anonymous signals"
          desc="Help improve fraud detection across all users. We never share content — only aggregated, anonymized stats."
          checked={prefs.share_signals_for_global_model}
          onChange={v => update({ share_signals_for_global_model: v })} />
        <div className="p-4">
          <p className="text-sm font-semibold text-foreground mb-2">Preferred step-up method</p>
          <div className="flex gap-2">
            {(['biometric', 'pin', 'email_otp'] as const).map(m => (
              <button key={m} onClick={() => update({ preferred_step_up: m })}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  prefs.preferred_step_up === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                }`}>
                {m === 'email_otp' ? 'Email code' : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent risk events */}
      <div className="mt-4 bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <History className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Recent activity</h2>
        </div>
        {events.length === 0 ? (
          <p className="text-xs text-muted-foreground">No risk evaluations yet.</p>
        ) : (
          <ul className="space-y-2">
            {events.map(e => (
              <li key={e.id} className="flex items-center justify-between text-xs border-b border-border/50 pb-2 last:border-0">
                <div>
                  <span className={`font-semibold ${e.decision === 'blocked' ? 'text-destructive' : e.decision === 'step_up' ? 'text-warning' : 'text-success'}`}>
                    {e.decision}
                  </span>
                  <span className="text-muted-foreground ml-2">{e.reason_codes.slice(0, 2).join(', ') || 'normal'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-foreground">{e.risk_score}</span>
                  <span className="text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Disputes */}
      <div className="mt-4 bg-card border border-border rounded-xl p-5 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <MessageSquareWarning className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Your disputes</h2>
        </div>
        {disputes.length === 0 ? (
          <p className="text-xs text-muted-foreground">No disputes filed. If we ever block something that was actually you, you can dispute it.</p>
        ) : (
          <ul className="space-y-2">
            {disputes.map(d => (
              <li key={d.id} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{d.dispute_type.replace(/_/g, ' ')}</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold ${d.status === 'accepted' ? 'bg-success/10 text-success' : d.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                  {d.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PortalLayout>
  );
};

const Toggle = ({ icon, title, desc, checked, onChange }: { icon: React.ReactNode; title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="p-4 flex items-start justify-between gap-4">
    <div className="flex items-start gap-3 flex-1">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
    <button onClick={() => onChange(!checked)} role="switch" aria-checked={checked}
      className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-secondary border border-border'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card border border-border transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
  </div>
);

export default RiskSettings;
