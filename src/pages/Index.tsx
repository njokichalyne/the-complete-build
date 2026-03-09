import { motion } from 'framer-motion';
import { Activity, ShieldAlert, Ban, TrendingUp, Zap, Eye, AlertTriangle, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import TransactionTable from '@/components/TransactionTable';
import AlertCard from '@/components/AlertCard';
import { dashboardStats, transactions, fraudAlerts, chartData } from '@/lib/mockData';
import { Link } from 'react-router-dom';

const COLORS = ['hsl(0, 72%, 51%)', 'hsl(38, 92%, 50%)', 'hsl(174, 72%, 46%)', 'hsl(215, 70%, 50%)', 'hsl(270, 60%, 50%)', 'hsl(142, 71%, 45%)'];

const Index = () => {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Fraud Detection Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered real-time monitoring for mobile banking security</p>
        </motion.div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mt-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
          </span>
          <span className="text-xs font-mono text-success">SYSTEM ACTIVE — MONITORING 48,293 TRANSACTIONS</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Transactions"
          value={dashboardStats.totalTransactions.toLocaleString()}
          subtitle="Last 24 hours"
          icon={Activity}
          trend={{ value: 12.5, positive: true }}
        />
        <StatCard
          title="Flagged Transactions"
          value={dashboardStats.flaggedTransactions}
          subtitle="Pending review"
          icon={AlertTriangle}
          variant="warning"
          trend={{ value: 3.2, positive: false }}
        />
        <StatCard
          title="Blocked Transactions"
          value={dashboardStats.blockedTransactions}
          subtitle="Auto-blocked by AI"
          icon={Ban}
          variant="danger"
          trend={{ value: 8.1, positive: false }}
        />
        <StatCard
          title="Fraud Rate"
          value={`${dashboardStats.fraudRate}%`}
          subtitle="Below industry avg (1.2%)"
          icon={ShieldAlert}
          variant="success"
          trend={{ value: 15, positive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Transaction Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card border border-border rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-1">Transaction Volume</h3>
          <p className="text-xs text-muted-foreground mb-4">24-hour activity overview</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData.transactionVolume}>
              <defs>
                <linearGradient id="colorLegit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'hsl(215, 12%, 52%)' }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 52%)' }} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(220, 18%, 12%)',
                  border: '1px solid hsl(220, 14%, 18%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(200, 20%, 92%)',
                }}
              />
              <Area type="monotone" dataKey="legitimate" stroke="hsl(174, 72%, 46%)" fill="url(#colorLegit)" strokeWidth={2} />
              <Area type="monotone" dataKey="flagged" stroke="hsl(38, 92%, 50%)" fill="url(#colorFlagged)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Fraud by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-1">Fraud by Type</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution analysis</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={chartData.fraudByType}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="count"
              >
                {chartData.fraudByType.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(220, 18%, 12%)',
                  border: '1px solid hsl(220, 14%, 18%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(200, 20%, 92%)',
                }}
              />
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

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
              <p className="text-xs text-muted-foreground">Live transaction feed</p>
            </div>
            <Link to="/transactions" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <TransactionTable transactions={transactions} limit={5} />
        </div>

        {/* Active Alerts */}
        <div className="bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Active Alerts</h3>
              <p className="text-xs text-muted-foreground">{fraudAlerts.filter(a => !a.resolved).length} unresolved</p>
            </div>
            <Link to="/alerts" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {fraudAlerts.filter(a => !a.resolved).slice(0, 4).map((alert, i) => (
              <AlertCard key={alert.id} alert={alert} index={i} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
