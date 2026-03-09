import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Shield, Home, Activity, AlertTriangle, MessageSquare, BookOpen, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const navItems = [
  { to: '/portal', icon: Home, label: 'Overview', end: true },
  { to: '/portal/transactions', icon: Activity, label: 'Transactions' },
  { to: '/portal/report', icon: AlertTriangle, label: 'Report Fraud' },
  { to: '/portal/chatbot', icon: MessageSquare, label: 'AI Assistant' },
  { to: '/portal/learn', icon: BookOpen, label: 'Learn' },
];

const PortalLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mr-4">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Back</span>
            </Link>
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm">FraudGuard Portal</span>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default PortalLayout;
