export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'transfer' | 'withdrawal' | 'deposit' | 'payment';
  amount: number;
  currency: string;
  timestamp: string;
  status: 'approved' | 'flagged' | 'blocked';
  riskScore: number;
  location: string;
  device: string;
  description: string;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface DashboardStats {
  totalTransactions: number;
  flaggedTransactions: number;
  blockedTransactions: number;
  totalVolume: number;
  fraudRate: number;
  falsePositiveRate: number;
  avgRiskScore: number;
  activeAlerts: number;
}

export const dashboardStats: DashboardStats = {
  totalTransactions: 48293,
  flaggedTransactions: 342,
  blockedTransactions: 87,
  totalVolume: 12450000,
  fraudRate: 0.71,
  falsePositiveRate: 2.3,
  avgRiskScore: 12.4,
  activeAlerts: 23,
};

export const transactions: Transaction[] = [
  { id: 'TXN-001', userId: 'USR-4821', userName: 'James Mwangi', type: 'transfer', amount: 250000, currency: 'KES', timestamp: '2026-03-09T14:23:00Z', status: 'flagged', riskScore: 78, location: 'Nairobi, KE', device: 'iPhone 15 Pro', description: 'Transfer to unknown account' },
  { id: 'TXN-002', userId: 'USR-1293', userName: 'Grace Wanjiku', type: 'withdrawal', amount: 50000, currency: 'KES', timestamp: '2026-03-09T14:18:00Z', status: 'approved', riskScore: 12, location: 'Mombasa, KE', device: 'Samsung Galaxy S24', description: 'ATM withdrawal' },
  { id: 'TXN-003', userId: 'USR-8734', userName: 'Peter Odhiambo', type: 'payment', amount: 15000, currency: 'KES', timestamp: '2026-03-09T14:15:00Z', status: 'approved', riskScore: 8, location: 'Kisumu, KE', device: 'Pixel 8', description: 'Utility bill payment' },
  { id: 'TXN-004', userId: 'USR-5621', userName: 'Amina Hassan', type: 'transfer', amount: 890000, currency: 'KES', timestamp: '2026-03-09T14:10:00Z', status: 'blocked', riskScore: 95, location: 'Lagos, NG', device: 'Unknown Device', description: 'Large transfer to foreign account' },
  { id: 'TXN-005', userId: 'USR-3342', userName: 'David Kimani', type: 'deposit', amount: 75000, currency: 'KES', timestamp: '2026-03-09T14:05:00Z', status: 'approved', riskScore: 5, location: 'Nakuru, KE', device: 'iPhone 14', description: 'M-PESA deposit' },
  { id: 'TXN-006', userId: 'USR-9981', userName: 'Faith Njeri', type: 'transfer', amount: 320000, currency: 'KES', timestamp: '2026-03-09T13:55:00Z', status: 'flagged', riskScore: 67, location: 'Nairobi, KE', device: 'Huawei P60', description: 'Multiple rapid transfers' },
  { id: 'TXN-007', userId: 'USR-2210', userName: 'John Otieno', type: 'payment', amount: 8500, currency: 'KES', timestamp: '2026-03-09T13:50:00Z', status: 'approved', riskScore: 3, location: 'Eldoret, KE', device: 'Samsung Galaxy A54', description: 'Online purchase' },
  { id: 'TXN-008', userId: 'USR-7745', userName: 'Lucy Akinyi', type: 'withdrawal', amount: 500000, currency: 'KES', timestamp: '2026-03-09T13:42:00Z', status: 'blocked', riskScore: 92, location: 'Dar es Salaam, TZ', device: 'Unknown Device', description: 'Unusual withdrawal location' },
  { id: 'TXN-009', userId: 'USR-1156', userName: 'Samuel Karanja', type: 'transfer', amount: 22000, currency: 'KES', timestamp: '2026-03-09T13:38:00Z', status: 'approved', riskScore: 15, location: 'Thika, KE', device: 'iPhone 13', description: 'Regular transfer' },
  { id: 'TXN-010', userId: 'USR-6623', userName: 'Mercy Chebet', type: 'payment', amount: 45000, currency: 'KES', timestamp: '2026-03-09T13:30:00Z', status: 'approved', riskScore: 18, location: 'Nairobi, KE', device: 'Oppo Reno 10', description: 'School fees payment' },
];

export const fraudAlerts: FraudAlert[] = [
  { id: 'ALT-001', transactionId: 'TXN-004', severity: 'critical', type: 'Geospatial Anomaly', message: 'Transaction originated from Lagos while user\'s last activity was in Nairobi 2 hours ago. Impossible travel detected.', timestamp: '2026-03-09T14:10:00Z', resolved: false },
  { id: 'ALT-002', transactionId: 'TXN-001', severity: 'high', type: 'Behavioral Anomaly', message: 'Transfer amount exceeds user\'s historical maximum by 400%. New recipient account flagged in fraud database.', timestamp: '2026-03-09T14:23:00Z', resolved: false },
  { id: 'ALT-003', transactionId: 'TXN-008', severity: 'critical', type: 'Device Fingerprint Mismatch', message: 'Unknown device attempting high-value withdrawal. Device fingerprint does not match any registered devices for this user.', timestamp: '2026-03-09T13:42:00Z', resolved: false },
  { id: 'ALT-004', transactionId: 'TXN-006', severity: 'medium', type: 'Velocity Check', message: 'User initiated 5 transfers within 10 minutes, exceeding the normal transaction velocity by 300%.', timestamp: '2026-03-09T13:55:00Z', resolved: false },
  { id: 'ALT-005', transactionId: 'TXN-012', severity: 'low', type: 'SIM Change Detected', message: 'SIM card change detected for user account. Monitoring subsequent transactions for 24 hours.', timestamp: '2026-03-09T12:30:00Z', resolved: true },
  { id: 'ALT-006', transactionId: 'TXN-015', severity: 'high', type: 'Synthetic Identity', message: 'Account exhibits characteristics of synthetic identity fraud. Multiple data points inconsistent.', timestamp: '2026-03-09T11:15:00Z', resolved: false },
];

export const chartData = {
  transactionVolume: [
    { hour: '00:00', legitimate: 1200, flagged: 12, blocked: 3 },
    { hour: '02:00', legitimate: 450, flagged: 8, blocked: 2 },
    { hour: '04:00', legitimate: 280, flagged: 5, blocked: 1 },
    { hour: '06:00', legitimate: 890, flagged: 15, blocked: 4 },
    { hour: '08:00', legitimate: 2400, flagged: 28, blocked: 7 },
    { hour: '10:00', legitimate: 3200, flagged: 35, blocked: 9 },
    { hour: '12:00', legitimate: 3800, flagged: 42, blocked: 11 },
    { hour: '14:00', legitimate: 3500, flagged: 38, blocked: 8 },
    { hour: '16:00', legitimate: 2900, flagged: 30, blocked: 6 },
    { hour: '18:00', legitimate: 2100, flagged: 22, blocked: 5 },
    { hour: '20:00', legitimate: 1800, flagged: 18, blocked: 4 },
    { hour: '22:00', legitimate: 1400, flagged: 14, blocked: 3 },
  ],
  fraudByType: [
    { type: 'Identity Theft', count: 34, percentage: 28 },
    { type: 'SIM Swap', count: 22, percentage: 18 },
    { type: 'Phishing', count: 19, percentage: 16 },
    { type: 'Account Takeover', count: 17, percentage: 14 },
    { type: 'Synthetic ID', count: 15, percentage: 12 },
    { type: 'Other', count: 14, percentage: 12 },
  ],
  riskDistribution: [
    { range: '0-20', count: 38400 },
    { range: '21-40', count: 6200 },
    { range: '41-60', count: 2100 },
    { range: '61-80', count: 890 },
    { range: '81-100', count: 340 },
  ],
  weeklyTrend: [
    { day: 'Mon', transactions: 6800, fraudAttempts: 48 },
    { day: 'Tue', transactions: 7200, fraudAttempts: 52 },
    { day: 'Wed', transactions: 6500, fraudAttempts: 44 },
    { day: 'Thu', transactions: 7100, fraudAttempts: 55 },
    { day: 'Fri', transactions: 7800, fraudAttempts: 61 },
    { day: 'Sat', transactions: 5900, fraudAttempts: 42 },
    { day: 'Sun', transactions: 4100, fraudAttempts: 30 },
  ],
};
