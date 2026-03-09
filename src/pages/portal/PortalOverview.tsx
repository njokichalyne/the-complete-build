import { motion } from 'framer-motion';
import { Shield, Activity, AlertTriangle, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchTransactions, fetchFraudAlerts } from '@/lib/api';
import PortalLayout from '@/components/PortalLayout';

const PortalOverview = () => {
  const { data: transactions } = useQuery({ queryKey: ['transactions'], queryFn: fetchTransactions });
  const { data: alerts } = useQuery({ queryKey: ['alerts'], queryFn: fetchFraudAlerts });

  const totalTx = transactions?.length ?? 0;
  const flaggedTx = transactions?.filter(t => t.status === 'flagged').length ?? 0;
  const blockedTx = transactions?.filter(t => t.status === 'blocked').length ?? 0;
  const activeAlerts = alerts?.filter(a => !a.resolved).length ?? 0;

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Welcome to FraudGuard</h1>
        <p className="text-sm text-muted-foreground">Monitor your banking security and report suspicious activity.</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Total Transactions', value: totalTx, icon: Activity, color: 'text-primary' },
          { label: 'Flagged', value: flaggedTx, icon: AlertTriangle, color: 'text-warning' },
          { label: 'Blocked', value: blockedTx, icon: Shield, color: 'text-destructive' },
          { label: 'Active Alerts', value: activeAlerts, icon: AlertTriangle, color: 'text-destructive' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-foreground font-mono">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {[
          { to: '/portal/report', title: 'Report Suspicious Activity', desc: 'File a fraud report and get a tracking reference number.', icon: AlertTriangle, color: 'bg-destructive/10 text-destructive' },
          { to: '/portal/chatbot', title: 'AI Security Assistant', desc: 'Chat with our AI for fraud prevention advice and guidance.', icon: MessageSquare, color: 'bg-primary/10 text-primary' },
          { to: '/portal/transactions', title: 'View Transactions', desc: 'Browse recent transactions and check risk scores.', icon: Activity, color: 'bg-success/10 text-success' },
        ].map((action, i) => (
          <motion.div
            key={action.to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Link
              to={action.to}
              className="block bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{action.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{action.desc}</p>
              <span className="text-xs text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Go <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Alerts */}
      {alerts && alerts.filter(a => !a.resolved).length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Security Alerts</h2>
          <div className="space-y-3">
            {alerts.filter(a => !a.resolved).slice(0, 3).map((alert) => {
              const severityColors: Record<string, string> = {
                critical: 'border-destructive/30 bg-destructive/5',
                high: 'border-warning/30 bg-warning/5',
                medium: 'border-primary/30 bg-primary/5',
                low: 'border-success/30 bg-success/5',
              };
              return (
                <div key={alert.id} className={`border rounded-xl p-4 ${severityColors[alert.severity] || ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold font-mono uppercase text-foreground bg-secondary px-2 py-0.5 rounded">
                      {alert.severity}
                    </span>
                    <span className="text-xs font-semibold text-foreground">{alert.alert_type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PortalLayout>
  );
};

export default PortalOverview;
