import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

const variantStyles = {
  default: 'border-border',
  danger: 'border-destructive/30',
  warning: 'border-warning/30',
  success: 'border-success/30',
};

const iconStyles = {
  default: 'text-primary bg-primary/10',
  danger: 'text-destructive bg-destructive/10',
  warning: 'text-warning bg-warning/10',
  success: 'text-success bg-success/10',
};

const StatCard = ({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-card rounded-xl border ${variantStyles[variant]} p-5 hover:border-primary/30 transition-colors duration-300`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-mono font-semibold ${trend.positive ? 'text-success' : 'text-destructive'}`}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>}
    </motion.div>
  );
};

export default StatCard;
