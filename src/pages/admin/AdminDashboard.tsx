import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Ban, ShieldAlert, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import TransactionTable from '@/components/TransactionTable';
import AlertCard from '@/components/AlertCard';
import { fetchTransactions, fetchFraudAlerts, DbTransaction, DbFraudAlert } from '@/lib/api';
import { chartData } from '@/lib/mockData';

const COLORS = ['hsl(0, 72%, 51%)', 'hsl(38, 92%, 50%)', 'hsl(174, 72%, 46%)', 'hsl(215, 70%, 50%)', 'hsl(270, 60%, 50%)', 'hsl(142, 71%, 45%)'];

const AdminDashboard = () => {
  const { data: transactions } = useQuery({ queryKey: ['transactions'], queryFn: fetchTransactions });
  const { data: alerts } = useQuery({ queryKey: ['alerts'], queryFn: fetchFraudAlerts });

  const totalTx = transactions?.length ?? 0;
  const flaggedTx = transactions?.filter(t => t.status === 'flagged').length ?? 0;
  const blockedTx = transactions?.filter(t => t.status === 'blocked').length ?? 0;
  const activeAlerts = alerts?.filter(a => !a.resolved).length ?? 0;
  const fraudRate = totalTx > 0 ? (((flaggedTx + blockedTx) / totalTx) * 100).toFixed(1) : '0';

  // Map DB transactions to table format
  const tableTransactions = (transactions ?? []).map(t => ({
    id: t.transaction_ref,
    userId: t.user_phone || 'N/A',
    userName: t.user_name,
    type: t.type as any,
    amount: Number(t.amount),
    currency: t.currency,
    timestamp: t.created_at,
    status: t.status as any,
    riskScore: t.risk_score,
    location: t.location || 'Unknown',
    device: t.device || 'Unknown',
    description: t.description || '',
  }));

  // Map DB alerts to component format
  const alertCards = (alerts ?? []).filter(a => !a.resolved).map(a => ({
    id: a.id,
    transactionId: a.transaction_id || '',
    severity: a.severity as any,
    type: a.alert_type,
    message: a.message,
    timestamp: a.created_at,
    resolved: a.resolved,
  }));

  return (
    <DashboardLayout>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered real-time monitoring for mobile banking security</p>
        </motion.div>
        <div className="flex items-center gap-2 mt-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
          </span>
          <span className="text-xs font-mono text-success">SYSTEM ACTIVE — MONITORING {totalTx} TRANSACTIONS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Transactions" value={totalTx} subtitle="In database" icon={Activity} trend={{ value: 12.5, positive: true }} />
        <StatCard title="Flagged Transactions" value={flaggedTx} subtitle="Pending review" icon={AlertTriangle} variant="warning" />
        <StatCard title="Blocked Transactions" value={blockedTx} subtitle="Auto-blocked by AI" icon={Ban} variant="danger" />
        <StatCard title="Fraud Rate" value={`${fraudRate}%`} subtitle="Flagged + blocked" icon={ShieldAlert} variant={Number(fraudRate) < 1 ? 'success' : 'warning'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Transaction Volume</h3>
          <p className="text-xs text-muted-foreground mb-4">24-hour activity overview</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData.transactionVolume}>
              <defs>
                <linearGradient id="colorLegit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(215, 12%, 52%)' }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 52%)' }} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 14%, 18%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(200, 20%, 92%)' }} />
              <Area type="monotone" dataKey="legitimate" stroke="hsl(174, 72%, 46%)" fill="url(#colorLegit)" strokeWidth={2} />
              <Area type="monotone" dataKey="flagged" stroke="hsl(38, 92%, 50%)" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Fraud by Type</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution analysis</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={chartData.fraudByType} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="count">
                {chartData.fraudByType.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 14%, 18%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(200, 20%, 92%)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {chartData.fraudByType.slice(0, 4).map((item, i) => (
              <div key={item.type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground">{item.type}</span>
                </div>
                <span className="font-mono text-foreground">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
              <p className="text-xs text-muted-foreground">Live from database</p>
            </div>
            <Link to="/admin/transactions" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <TransactionTable transactions={tableTransactions} limit={5} />
        </div>

        <div className="bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Active Alerts</h3>
              <p className="text-xs text-muted-foreground">{activeAlerts} unresolved</p>
            </div>
            <Link to="/admin/alerts" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {alertCards.slice(0, 4).map((alert, i) => (
              <AlertCard key={alert.id} alert={alert} index={i} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
