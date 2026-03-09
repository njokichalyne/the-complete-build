import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import PortalLayout from '@/components/PortalLayout';
import { createFraudReport } from '@/lib/api';
import { toast } from 'sonner';

const reportTypes = [
  { value: 'suspicious_transaction', label: 'Suspicious Transaction' },
  { value: 'phishing', label: 'Phishing Attempt' },
  { value: 'identity_theft', label: 'Identity Theft' },
  { value: 'unauthorized_access', label: 'Unauthorized Access' },
  { value: 'other', label: 'Other' },
];

const ReportFraud = () => {
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    report_type: 'suspicious_transaction',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reporter_name || !form.reporter_email || !form.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const report = await createFraudReport(form);
      setRefNumber(report.reference_number);
      setSubmitted(true);
      toast.success('Fraud report submitted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PortalLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center py-16"
        >
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Report Submitted</h2>
          <p className="text-sm text-muted-foreground mb-6">Your fraud report has been received and is being reviewed by our security team.</p>
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <p className="text-xs text-muted-foreground mb-1">Your Reference Number</p>
            <p className="text-2xl font-bold font-mono text-primary">{refNumber}</p>
            <p className="text-xs text-muted-foreground mt-2">Save this number to track your report status.</p>
          </div>
          <button
            onClick={() => { setSubmitted(false); setForm({ reporter_name: '', reporter_email: '', reporter_phone: '', report_type: 'suspicious_transaction', description: '' }); }}
            className="text-sm text-primary hover:underline"
          >
            Submit another report
          </button>
        </motion.div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Report Suspicious Activity</h1>
        <p className="text-sm text-muted-foreground">File a fraud report. You'll receive a reference number to track your case.</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="max-w-2xl mt-8 space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Full Name *</label>
              <input
                type="text"
                value={form.reporter_name}
                onChange={e => setForm(f => ({ ...f, reporter_name: e.target.value }))}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Email *</label>
              <input
                type="email"
                value={form.reporter_email}
                onChange={e => setForm(f => ({ ...f, reporter_email: e.target.value }))}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                value={form.reporter_phone}
                onChange={e => setForm(f => ({ ...f, reporter_phone: e.target.value }))}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                placeholder="+254..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Report Type *</label>
              <select
                value={form.report_type}
                onChange={e => setForm(f => ({ ...f, report_type: e.target.value }))}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
              >
                {reportTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Description *</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={5}
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
              placeholder="Describe the suspicious activity in detail. Include dates, amounts, and any other relevant information."
            />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-warning/5 border border-warning/20 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            If you suspect your account has been compromised, contact your bank immediately at their emergency line before filing this report.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="gradient-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Report'}
        </button>
      </form>
    </PortalLayout>
  );
};

export default ReportFraud;
