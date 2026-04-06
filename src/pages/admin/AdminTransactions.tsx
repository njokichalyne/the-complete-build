import { motion } from 'framer-motion';
import { Search, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import TransactionTable from '@/components/TransactionTable';
import { fetchTransactions } from '@/lib/api';
import { useState } from 'react';

const AdminTransactions = () => {
  const { data: transactions } = useQuery({ queryKey: ['transactions'], queryFn: fetchTransactions });
  const [filter, setFilter] = useState<'all' | 'approved' | 'flagged' | 'blocked'>('all');

  const mapped = (transactions ?? []).map(t => ({
    id: t.transaction_ref,
    userId: t.user_phone || 'N/A',
    userName: t.user_name,
    type: t.type as 'transfer' | 'withdrawal' | 'deposit' | 'payment',
    amount: Number(t.amount),
    currency: t.currency,
    timestamp: t.created_at,
    status: t.status as 'approved' | 'flagged' | 'blocked',
    riskScore: t.risk_score,
    location: t.location || 'Unknown',
    device: t.device || 'Unknown',
    description: t.description || '',
  }));

  const filtered = filter === 'all' ? mapped : mapped.filter(t => t.status === filter);
  const filters = [
    { key: 'all' as const, label: 'All', count: mapped.length },
    { key: 'approved' as const, label: 'Approved', count: mapped.filter(t => t.status === 'approved').length },
    { key: 'flagged' as const, label: 'Flagged', count: mapped.filter(t => t.status === 'flagged').length },
    { key: 'blocked' as const, label: 'Blocked', count: mapped.filter(t => t.status === 'blocked').length },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">All transactions from the database</p>
      </motion.div>

      <div className="flex items-center justify-between mt-6 mb-4">
        <div className="flex items-center gap-2">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${filter === f.key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}>
              {f.label} <span className="font-mono ml-1">({f.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <TransactionTable transactions={filtered} />
      </div>
    </DashboardLayout>
  );
};

export default AdminTransactions;
