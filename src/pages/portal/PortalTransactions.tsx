import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Brain, Loader2, SendHorizontal, ChevronDown, ChevronUp, UserSearch } from 'lucide-react';
import PortalLayout from '@/components/PortalLayout';
import { fetchTransactions, analyzeTransaction, createTransaction, DbTransaction } from '@/lib/api';
import { lookupByAccountNumber } from '@/lib/credentials';
import ReactMarkdown from 'react-markdown';
import BiometricModal from '@/components/BiometricModal';
import { useBiometricGate } from '@/hooks/useBiometricGate';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const RiskBar = ({ score }: { score: number }) => {
  const color = score > 70 ? 'bg-destructive' : score > 40 ? 'bg-warning' : 'bg-success';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono text-muted-foreground">{score}</span>
    </div>
  );
};

const statusStyles: Record<string, string> = {
  approved: 'bg-success/10 text-success',
  flagged: 'bg-warning/10 text-warning',
  blocked: 'bg-destructive/10 text-destructive',
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'NGN', 'ZAR', 'GHS'];
const TX_TYPES = ['transfer', 'payment', 'withdrawal', 'deposit'];

interface SendForm {
  accountNumber: string;
  amount: string;
  currency: string;
  type: string;
  description: string;
}

const defaultForm: SendForm = {
  accountNumber: '',
  amount: '',
  currency: 'USD',
  type: 'transfer',
  description: '',
};

const PortalTransactions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: transactions, isLoading } = useQuery({ queryKey: ['transactions'], queryFn: fetchTransactions });
  const [search, setSearch] = useState('');
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Record<string, string>>({});
  const { showGate, requireVerification, onVerified, onCancel } = useBiometricGate();

  // Send transaction state
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendForm, setSendForm] = useState<SendForm>(defaultForm);
  const [sending, setSending] = useState(false);
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const filtered = transactions?.filter(t =>
    t.user_name.toLowerCase().includes(search.toLowerCase()) ||
    t.transaction_ref.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const doAnalyze = async (tx: DbTransaction) => {
    setAnalyzing(tx.id);
    try {
      const result = await analyzeTransaction(tx);
      setAnalysis(prev => ({ ...prev, [tx.id]: result }));
    } catch (err: unknown) {
      setAnalysis(prev => ({ ...prev, [tx.id]: `Error: ${(err as Error).message}` }));
    } finally {
      setAnalyzing(null);
    }
  };

  const handleAnalyze = (tx: DbTransaction) => {
    requireVerification(() => doAnalyze(tx));
  };

  const handleAccountLookup = async () => {
    if (!sendForm.accountNumber.trim()) return;
    setLookingUp(true);
    setRecipientName(null);
    try {
      const profile = await lookupByAccountNumber(sendForm.accountNumber);
      if (profile) {
        setRecipientName(profile.full_name || 'Unknown User');
        toast.success(`Recipient found: ${profile.full_name || 'User'}`);
      } else {
        toast.error('No account found with that number');
      }
    } catch {
      toast.error('Failed to look up account');
    } finally {
      setLookingUp(false);
    }
  };

  const doSendTransaction = async () => {
    if (!sendForm.accountNumber || !sendForm.amount || Number(sendForm.amount) <= 0) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!recipientName) {
      toast.error('Please verify the account number first.');
      return;
    }
    setSending(true);
    try {
      const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
      await createTransaction({
        user_name: displayName,
        user_phone: user?.phone ?? undefined,
        type: sendForm.type,
        amount: Number(sendForm.amount),
        currency: sendForm.currency,
        description: sendForm.description || `${sendForm.type} to ${recipientName} (${sendForm.accountNumber})`,
        location: 'Web Portal',
        device: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
      });
      toast.success(`Transaction to ${recipientName} sent successfully!`);
      setSendForm(defaultForm);
      setRecipientName(null);
      setShowSendForm(false);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to send transaction');
    } finally {
      setSending(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    requireVerification(doSendTransaction);
  };

  return (
    <PortalLayout>
      <BiometricModal open={showGate} onVerified={onVerified} onCancel={onCancel} />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Transaction Monitor</h1>
        <p className="text-sm text-muted-foreground">View recent transactions and get AI-powered risk analysis.</p>
      </motion.div>

      {/* Send Transaction Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 bg-card border border-border rounded-xl overflow-hidden"
      >
        <button
          onClick={() => setShowSendForm(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <SendHorizontal className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Send Transaction</p>
              <p className="text-xs text-muted-foreground">Initiate a new transfer or payment</p>
            </div>
          </div>
          {showSendForm ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        <AnimatePresence>
          {showSendForm && (
            <motion.div
              key="send-form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSend} className="px-5 pb-5 pt-1 border-t border-border space-y-4">
                <p className="text-xs text-muted-foreground pt-2">
                  Biometric or PIN verification is required before sending.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground block mb-1.5">Recipient Account Number *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={sendForm.accountNumber}
                        onChange={e => {
                          setSendForm(f => ({ ...f, accountNumber: e.target.value.toUpperCase() }));
                          setRecipientName(null);
                        }}
                        placeholder="ACC-XXXXXXXX"
                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleAccountLookup}
                        disabled={lookingUp || !sendForm.accountNumber.trim()}
                        className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {lookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserSearch className="w-4 h-4" />}
                        Verify
                      </button>
                    </div>
                    {recipientName && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-success mt-1.5 flex items-center gap-1"
                      >
                        ✓ Recipient: <span className="font-semibold">{recipientName}</span>
                      </motion.p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">Transaction Type</label>
                    <select
                      value={sendForm.type}
                      onChange={e => setSendForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
                    >
                      {TX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">Amount *</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={sendForm.amount}
                      onChange={e => setSendForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1.5">Currency</label>
                    <select
                      value={sendForm.currency}
                      onChange={e => setSendForm(f => ({ ...f, currency: e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
                    >
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground block mb-1.5">Description (optional)</label>
                    <input
                      type="text"
                      value={sendForm.description}
                      onChange={e => setSendForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Purpose of transaction"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={sending || !recipientName}
                    className="gradient-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {sending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    ) : (
                      <><SendHorizontal className="w-4 h-4" /> Send</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSendForm(defaultForm); setRecipientName(null); setShowSendForm(false); }}
                    className="px-6 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 mt-6 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, ID, or description..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          {filtered.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono font-semibold text-foreground">{tx.transaction_ref}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusStyles[tx.status]}`}>
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{tx.user_name}</p>
                  <p className="text-xs text-muted-foreground">{tx.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground">{tx.location}</span>
                    <span className="text-xs text-muted-foreground">{tx.device}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-foreground">{tx.currency} {Number(tx.amount).toLocaleString()}</p>
                  <div className="mt-1"><RiskBar score={tx.risk_score} /></div>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(tx.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="mt-3 pt-3 border-t border-border/50">
                {analysis[tx.id] ? (
                  <div className="prose prose-sm prose-invert max-w-none text-xs">
                    <ReactMarkdown>{analysis[tx.id]}</ReactMarkdown>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAnalyze(tx)}
                    disabled={analyzing === tx.id}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                  >
                    {analyzing === tx.id ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Brain className="w-3.5 h-3.5" /> AI Risk Analysis</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
};

export default PortalTransactions;
