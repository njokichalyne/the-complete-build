-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_ref TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  user_phone TEXT,
  type TEXT NOT NULL CHECK (type IN ('transfer', 'withdrawal', 'deposit', 'payment')),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'flagged', 'blocked')),
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  location TEXT,
  device TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fraud_alerts table
CREATE TABLE public.fraud_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fraud_reports table (client-submitted reports)
CREATE TABLE public.fraud_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_name TEXT NOT NULL,
  reporter_email TEXT NOT NULL,
  reporter_phone TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('suspicious_transaction', 'phishing', 'identity_theft', 'unauthorized_access', 'other')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  reference_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;

-- Public read for transactions
CREATE POLICY "Anyone can view transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update transactions" ON public.transactions FOR UPDATE USING (true);

-- Public read for fraud alerts
CREATE POLICY "Anyone can view fraud alerts" ON public.fraud_alerts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert fraud alerts" ON public.fraud_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update fraud alerts" ON public.fraud_alerts FOR UPDATE USING (true);

-- Fraud reports policies
CREATE POLICY "Anyone can create fraud reports" ON public.fraud_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view fraud reports" ON public.fraud_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can update fraud reports" ON public.fraud_reports FOR UPDATE USING (true);

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for fraud_reports
CREATE TRIGGER update_fraud_reports_updated_at
  BEFORE UPDATE ON public.fraud_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();