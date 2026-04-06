import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import AlertCard from '@/components/AlertCard';
import { fetchFraudAlerts, updateAlertStatus } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';

const AdminAlerts = () => {
  const queryClient = useQueryClient();
  const { data: alerts } = useQuery({ queryKey: ['alerts'], queryFn: fetchFraudAlerts });
  const [showResolved, setShowResolved] = useState(false);

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolved }: { id: string; resolved: boolean }) => updateAlertStatus(id, resolved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert updated');
    },
  });

  const filtered = showResolved ? alerts : alerts?.filter(a => !a.resolved);
  const criticalCount = alerts?.filter(a => a.severity === 'critical' && !a.resolved).length ?? 0;
  const highCount = alerts?.filter(a => a.severity === 'high' && !a.resolved).length ?? 0;

  const alertCards = (filtered ?? []).map(a => ({
    id: a.id,
    transactionId: a.transaction_id || '',
    severity: a.severity as 'low' | 'medium' | 'high' | 'critical',
    type: a.alert_type,
    message: a.message,
    timestamp: a.created_at,
    resolved: a.resolved,
  }));

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Fraud Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-generated alerts from the database</p>
      </motion.div>

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
          <button onClick={() => setShowResolved(!showResolved)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${showResolved ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {showResolved ? 'Showing All' : 'Show Resolved'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {alertCards.map((alert, i) => (
          <div key={alert.id}>
            <AlertCard alert={alert} index={i} />
            {!alert.resolved && (
              <button
                onClick={() => resolveMutation.mutate({ id: alert.id, resolved: true })}
                className="mt-2 ml-12 text-xs text-success hover:underline"
              >
                Mark as resolved
              </button>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminAlerts;
