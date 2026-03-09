import { Transaction } from '@/lib/mockData';
import { ArrowUpRight, ArrowDownLeft, CreditCard, Send } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  limit?: number;
}

const typeIcons = {
  transfer: Send,
  withdrawal: ArrowUpRight,
  deposit: ArrowDownLeft,
  payment: CreditCard,
};

const statusStyles = {
  approved: 'bg-success/10 text-success',
  flagged: 'bg-warning/10 text-warning',
  blocked: 'bg-destructive/10 text-destructive',
};

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

const TransactionTable = ({ transactions, limit }: TransactionTableProps) => {
  const data = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Transaction</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">User</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Amount</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Risk</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Location</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((tx) => {
            const TypeIcon = typeIcons[tx.type];
            return (
              <tr key={tx.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <TypeIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-mono font-medium text-foreground">{tx.id}</p>
                      <p className="text-xs text-muted-foreground">{tx.description}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm text-foreground">{tx.userName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{tx.userId}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm font-mono font-semibold text-foreground">
                    {tx.currency} {tx.amount.toLocaleString()}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <RiskBar score={tx.riskScore} />
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm text-muted-foreground">{tx.location}</p>
                  <p className="text-xs text-muted-foreground/70">{tx.device}</p>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[tx.status]}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
