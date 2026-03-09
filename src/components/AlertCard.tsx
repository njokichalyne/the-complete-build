import { motion } from 'framer-motion';
import { FraudAlert } from '@/lib/mockData';
import { AlertTriangle, ShieldAlert, ShieldCheck, Info } from 'lucide-react';

const severityConfig = {
  critical: { icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: 'CRITICAL' },
  high: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', label: 'HIGH' },
  medium: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', label: 'MEDIUM' },
  low: { icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', label: 'LOW' },
};

interface AlertCardProps {
  alert: FraudAlert;
  index?: number;
}

const AlertCard = ({ alert, index = 0 }: AlertCardProps) => {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`bg-card rounded-xl border ${config.border} p-4 hover:border-primary/40 transition-all duration-300`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{alert.transactionId}</span>
            {alert.resolved && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-success/10 text-success ml-auto">RESOLVED</span>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">{alert.type}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
          <p className="text-[10px] text-muted-foreground/60 font-mono mt-2">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertCard;
