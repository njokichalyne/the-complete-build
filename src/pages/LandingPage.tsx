import { motion } from 'framer-motion';
import { Shield, Brain, Zap, Eye, BarChart3, Lock, ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-shield.png';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Detection',
    description: 'Machine learning models analyze thousands of data points per transaction in real-time to identify fraud patterns.',
  },
  {
    icon: Zap,
    title: 'Real-Time Monitoring',
    description: 'Transactions are scored and assessed in under 50ms, ensuring seamless banking while maintaining security.',
  },
  {
    icon: Eye,
    title: 'Behavioral Biometrics',
    description: 'Unique user interaction patterns like typing rhythm and navigation behavior create a digital fingerprint.',
  },
  {
    icon: Lock,
    title: 'Adaptive Authentication',
    description: 'Only high-risk transactions trigger additional verification, reducing friction for legitimate users.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboards provide real-time insights into fraud trends and system performance.',
  },
  {
    icon: Shield,
    title: 'Zero-Day Protection',
    description: 'Isolation Forest algorithms detect novel attack vectors that have never been seen before.',
  },
];

const stats = [
  { value: '98.7%', label: 'Detection Accuracy' },
  { value: '<50ms', label: 'Response Time' },
  { value: '71%', label: 'Fraud Reduction' },
  { value: '2.3%', label: 'False Positive Rate' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">FraudGuard</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Performance</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/portal" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Client Portal
            </Link>
            <Link
              to="/portal"
              className="text-sm font-medium gradient-primary text-primary-foreground px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Protected
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-xs font-semibold text-primary">AI-Powered Security Active</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Protect Your
                <span className="text-gradient"> Mobile Banking</span>
                {' '}With AI
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                FraudGuard uses advanced machine learning to detect and prevent fraud in real-time, 
                keeping your mobile banking transactions secure without slowing you down.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  to="/portal"
                  className="inline-flex items-center gap-2 gradient-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                  Access Portal <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/portal/chatbot"
                  className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-secondary/80 transition-colors text-sm"
                >
                  Talk to AI Assistant
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 gradient-primary opacity-20 rounded-3xl blur-3xl" />
                <img
                  src={heroImage}
                  alt="AI Fraud Detection Shield"
                  className="relative rounded-3xl border border-border/50 w-full"
                />
              </div>
            </motion.div>
          </div>

          <a href="#stats" className="flex justify-center mt-16">
            <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce" />
          </a>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-bold text-gradient font-mono">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Multi-Layered AI Protection</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our system combines supervised and unsupervised machine learning to detect both known fraud patterns and novel zero-day threats.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">How FraudGuard Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every transaction passes through our multi-layered AI pipeline in milliseconds.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Data Capture', desc: 'Transaction details, device fingerprint, and behavioral data are collected.' },
              { step: '02', title: 'Feature Extraction', desc: '142+ features including geospatial velocity, typing patterns, and session behavior.' },
              { step: '03', title: 'AI Scoring', desc: 'XGBoost and Isolation Forest models generate a real-time risk score.' },
              { step: '04', title: 'Decision', desc: 'Adaptive authentication triggers only when risk exceeds dynamic thresholds.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <span className="text-6xl font-bold text-primary/10 font-mono">{item.step}</span>
                <h3 className="text-lg font-semibold text-foreground mt-2 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Stay Protected Today</h2>
            <p className="text-muted-foreground mb-8">
              Report suspicious activity, track your transactions, or chat with our AI assistant for fraud prevention guidance.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/portal/report"
                className="inline-flex items-center gap-2 gradient-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                Report Fraud
              </Link>
              <Link
                to="/portal/chatbot"
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-secondary/80 transition-colors text-sm"
              >
                AI Assistant
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">FraudGuard</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 FraudGuard AI. Research Project by Njoki Chalyne Wawira.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
