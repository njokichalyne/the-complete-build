import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { chartData, dashboardStats } from '@/lib/mockData';
import { Zap, Eye, TrendingUp, Target } from 'lucide-react';

const tooltipStyle = {
  background: 'hsl(220, 18%, 12%)',
  border: '1px solid hsl(220, 14%, 18%)',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'hsl(200, 20%, 92%)',
};

const Analytics = () => {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">AI model performance and fraud pattern analysis</p>
      </motion.div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-8">
        <StatCard title="Model Accuracy" value="98.7%" icon={Target} variant="success" trend={{ value: 0.3, positive: true }} />
        <StatCard title="F1 Score" value="0.964" icon={Zap} trend={{ value: 1.2, positive: true }} />
        <StatCard title="False Positive Rate" value={`${dashboardStats.falsePositiveRate}%`} icon={Eye} variant="warning" trend={{ value: 5, positive: true }} />
        <StatCard title="Avg Detection Time" value="47ms" subtitle="Real-time scoring" icon={TrendingUp} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Weekly Fraud Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Transactions vs fraud attempts</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(215, 12%, 52%)' }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 52%)' }} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="transactions" fill="hsl(174, 72%, 46%)" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="fraudAttempts" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Risk Score Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Transaction risk profile</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData.riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'hsl(215, 12%, 52%)' }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 52%)' }} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.riskDistribution.map((entry, index) => (
                  <motion.rect
                    key={`bar-${index}`}
                    fill={
                      index <= 1 ? 'hsl(142, 71%, 45%)' :
                      index === 2 ? 'hsl(38, 92%, 50%)' :
                      'hsl(0, 72%, 51%)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Model Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">AI Model Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-foreground">XGBoost Classifier</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Supervised learning model for known fraud pattern recognition. Trained on 2M+ historical transactions.</p>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-muted-foreground">Precision: <span className="text-success">97.2%</span></span>
              <span className="text-[10px] font-mono text-muted-foreground">Recall: <span className="text-success">95.8%</span></span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-xs font-semibold text-foreground">Isolation Forest</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Unsupervised anomaly detection for zero-day threat identification. Detects novel attack vectors.</p>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-muted-foreground">AUC-ROC: <span className="text-success">0.982</span></span>
              <span className="text-[10px] font-mono text-muted-foreground">Latency: <span className="text-primary">23ms</span></span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-xs font-semibold text-foreground">Behavioral Biometrics</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Device fingerprinting and user behavior analysis. Keystroke dynamics and navigation patterns.</p>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-muted-foreground">Features: <span className="text-primary">142</span></span>
              <span className="text-[10px] font-mono text-muted-foreground">Updates: <span className="text-primary">Real-time</span></span>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Analytics;
