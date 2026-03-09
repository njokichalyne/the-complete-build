import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import AlertCard from '@/components/AlertCard';
import { fraudAlerts } from '@/lib/mockData';
import { useState } from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

const Alerts = () => {
  const [showResolved, setShowResolved] = useState(false);
  const filtered = showResolved ? fraudAlerts : fraudAlerts.filter(a => !a.resolved);

  const criticalCount = fraudAlerts.filter(a => a.severity === 'critical' && !a.resolved).length;
  const highCount = fraudAlerts.filter(a => a.severity === 'high' && !a.resolved).length;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Fraud Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-generated security alerts requiring review</p>
      </motion.div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 mt-6 mb-6">
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2">
          <ShieldAlert className="w-4 h-4 text-destructive" />
          <span className="text-xs font-semibold text-destructive">{criticalCount} Critical</span>
        </div>
        <div className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-lg px-4 py-2">
          <ShieldAlert className="w-4 h-4 text-warning" />
          <span className="text-xs font-semibold text-warning">{highCount} High</span>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setShowResolved(!showResolved)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              showResolved ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {showResolved ? 'Showing All' : 'Show Resolved'}
          </button>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((alert, i) => (
          <AlertCard key={alert.id} alert={alert} index={i} />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
