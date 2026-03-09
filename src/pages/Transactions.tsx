import { motion } from 'framer-motion';
import { Search, Filter, Download } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import TransactionTable from '@/components/TransactionTable';
import { transactions } from '@/lib/mockData';
import { useState } from 'react';

const Transactions = () => {
  const [filter, setFilter] = useState<'all' | 'approved' | 'flagged' | 'blocked'>('all');
  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.status === filter);

  const filters = [
    { key: 'all' as const, label: 'All', count: transactions.length },
    { key: 'approved' as const, label: 'Approved', count: transactions.filter(t => t.status === 'approved').length },
    { key: 'flagged' as const, label: 'Flagged', count: transactions.filter(t => t.status === 'flagged').length },
    { key: 'blocked' as const, label: 'Blocked', count: transactions.filter(t => t.status === 'blocked').length },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor and analyze all mobile banking transactions</p>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6 mb-4">
        <div className="flex items-center gap-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                filter === f.key
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              {f.label} <span className="font-mono ml-1">({f.count})</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-48"
            />
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-card border border-border rounded-lg px-3 py-2 hover:text-foreground transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl">
        <TransactionTable transactions={filtered} />
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
