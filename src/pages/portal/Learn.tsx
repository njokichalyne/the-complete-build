import { motion } from 'framer-motion';
import { Shield, Smartphone, Mail, Key, AlertTriangle, Eye } from 'lucide-react';
import PortalLayout from '@/components/PortalLayout';

const tips = [
  {
    icon: Smartphone,
    title: 'Secure Your Device',
    items: [
      'Use biometric authentication (fingerprint/face) for your banking app',
      'Keep your operating system and apps updated',
      'Avoid using public Wi-Fi for banking transactions',
      'Enable device encryption and screen lock',
    ],
  },
  {
    icon: Key,
    title: 'Password & PIN Security',
    items: [
      'Use unique, strong passwords for each account',
      'Never share your PIN, OTP, or passwords with anyone',
      'Change your banking passwords every 90 days',
      'Use a password manager to generate and store passwords',
    ],
  },
  {
    icon: Mail,
    title: 'Recognize Phishing',
    items: [
      'Banks will never ask for your full PIN or password via SMS/email',
      'Check sender email addresses carefully for misspellings',
      'Don\'t click links in unexpected messages about your account',
      'When in doubt, call your bank directly using the number on your card',
    ],
  },
  {
    icon: Shield,
    title: 'SIM Swap Prevention',
    items: [
      'Register for SIM swap notifications with your mobile carrier',
      'Use app-based 2FA instead of SMS-based verification',
      'Set a PIN on your SIM card through your carrier',
      'Be wary of unexpected network disconnections',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'What To Do If Compromised',
    items: [
      'Contact your bank immediately to freeze your account',
      'Change all passwords from a secure device',
      'File a report through our portal',
      'Report to the police and relevant authorities',
      'Monitor your account statements for unauthorized transactions',
    ],
  },
  {
    icon: Eye,
    title: 'How FraudGuard Protects You',
    items: [
      'Every transaction is scored by AI in under 50 milliseconds',
      'Behavioral biometrics create a unique digital fingerprint',
      'Impossible travel detection flags geospatially anomalous activity',
      'Machine learning models continuously improve with new data',
    ],
  },
];

const Learn = () => {
  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Security Education</h1>
        <p className="text-sm text-muted-foreground">Learn how to protect yourself from mobile banking fraud.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {tips.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <section.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{section.title}</h3>
            <ul className="space-y-2">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                  <span className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </PortalLayout>
  );
};

export default Learn;
