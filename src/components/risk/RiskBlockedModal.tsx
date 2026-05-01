import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldX, MessageSquareWarning, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  riskEventId: string | null;
  reasonCodes: string[];
  onClose: () => void;
}

const RiskBlockedModal = ({ open, riskEventId, reasonCodes, onClose }: Props) => {
  const { user } = useAuth();
  const [showDispute, setShowDispute] = useState(false);
  const [type, setType] = useState<'false_positive' | 'accessibility_change' | 'device_change' | 'other'>('false_positive');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await supabase.from('risk_disputes').insert({
        user_id: user.id, risk_event_id: riskEventId,
        dispute_type: type, message: message.trim() || null,
      });
      toast.success('Dispute submitted. Our team will review within 24 hours.');
      setShowDispute(false); setMessage(''); onClose();
    } catch {
      toast.error('Failed to submit dispute. Try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl relative">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>

        <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center mb-3">
          <ShieldX className="w-6 h-6 text-destructive" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Transaction paused for safety</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Several signals didn't match your usual pattern. We've held this transaction so we can confirm it really is you.
        </p>

        {!showDispute ? (
          <>
            <div className="bg-secondary/40 border border-border rounded-lg p-3 mt-4 mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">What we noticed</p>
              <ul className="text-xs text-foreground space-y-1">
                {reasonCodes.map(r => <li key={r}>• {r.replace(/_/g, ' ')}</li>)}
              </ul>
            </div>
            <div className="space-y-2">
              <button onClick={() => setShowDispute(true)}
                className="w-full gradient-primary text-primary-foreground font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
                <MessageSquareWarning className="w-4 h-4" /> This was me — dispute the block
              </button>
              <button onClick={onClose}
                className="w-full border border-border text-foreground font-medium py-2.5 rounded-lg text-sm hover:bg-secondary">
                OK, cancel transaction
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">What changed?</label>
              <select value={type} onChange={e => setType(e.target.value as typeof type)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                <option value="false_positive">Nothing — this was me as usual</option>
                <option value="device_change">I'm using a new device</option>
                <option value="accessibility_change">My typing/movement changed (injury, AT, etc.)</option>
                <option value="other">Something else</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Tell us more (optional)</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                placeholder="Anything that'll help us understand..."
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={submit} disabled={submitting}
                className="flex-1 gradient-primary text-primary-foreground font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 mx-auto animate-spin" /> : 'Submit dispute'}
              </button>
              <button onClick={() => setShowDispute(false)}
                className="px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-secondary">Back</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RiskBlockedModal;
