import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, Brain, Loader2 } from 'lucide-react';
import PortalLayout from '@/components/PortalLayout';
import { fetchTransactions, analyzeTransaction, DbTransaction } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import BiometricModal from '@/components/BiometricModal';
import { useBiometricGate } from '@/hooks/useBiometricGate';

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

const PortalTransactions = () => {
  const { data: transactions, isLoading } = useQuery({ queryKey: ['transactions'], queryFn: fetchTransactions });
  const [search, setSearch] = useState('');
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Record<string, string>>({});

  const filtered = transactions?.filter(t =>
    t.user_name.toLowerCase().includes(search.toLowerCase()) ||
    t.transaction_ref.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleAnalyze = async (tx: DbTransaction) => {
    setAnalyzing(tx.id);
    try {
      const result = await analyzeTransaction(tx);
      setAnalysis(prev => ({ ...prev, [tx.id]: result }));
    } catch (err: any) {
      setAnalysis(prev => ({ ...prev, [tx.id]: `Error: ${err.message}` }));
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Transaction Monitor</h1>
        <p className="text-sm text-muted-foreground">View recent transactions and get AI-powered risk analysis.</p>
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
