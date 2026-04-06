import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { LucideIcon, Loader2, Eye, Clock, CheckCircle, Search as SearchIcon, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchFraudReports } from '@/lib/api';

const statusConfig: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  investigating: { icon: Eye, color: 'text-primary', bg: 'bg-primary/10' },
  resolved: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  dismissed: { icon: AlertTriangle, color: 'text-muted-foreground', bg: 'bg-muted' },
};

const AdminReports = () => {
  const { data: reports, isLoading } = useQuery({ queryKey: ['reports'], queryFn: fetchFraudReports });

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Fraud Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Client-submitted fraud reports</p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : reports && reports.length > 0 ? (
        <div className="space-y-3 mt-6">
          {reports.map((report) => {
            const config = statusConfig[report.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <div key={report.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono font-semibold text-foreground">{report.reference_number}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${config.bg} ${config.color}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{report.reporter_name} — {report.reporter_email}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{report.report_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{report.description}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/60 font-mono mt-3">
                  Submitted {new Date(report.created_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <SearchIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No fraud reports yet.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminReports;
