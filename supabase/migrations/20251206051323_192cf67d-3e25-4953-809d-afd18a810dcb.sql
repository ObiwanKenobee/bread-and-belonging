-- Create table for daily impact metrics
CREATE TABLE public.impact_metrics_daily (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  meals_distributed INTEGER NOT NULL DEFAULT 0,
  people_helped INTEGER NOT NULL DEFAULT 0,
  products_matched INTEGER NOT NULL DEFAULT 0,
  total_quantity_distributed NUMERIC NOT NULL DEFAULT 0,
  avg_sustainability_score NUMERIC,
  successful_matches INTEGER NOT NULL DEFAULT 0,
  total_match_attempts INTEGER NOT NULL DEFAULT 0,
  dignity_credits_issued NUMERIC NOT NULL DEFAULT 0,
  new_community_needs INTEGER NOT NULL DEFAULT 0,
  needs_fulfilled INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for weekly impact metrics
CREATE TABLE public.impact_metrics_weekly (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  week_end DATE NOT NULL,
  meals_distributed INTEGER NOT NULL DEFAULT 0,
  people_helped INTEGER NOT NULL DEFAULT 0,
  products_matched INTEGER NOT NULL DEFAULT 0,
  total_quantity_distributed NUMERIC NOT NULL DEFAULT 0,
  avg_sustainability_score NUMERIC,
  successful_matches INTEGER NOT NULL DEFAULT 0,
  total_match_attempts INTEGER NOT NULL DEFAULT 0,
  dignity_credits_issued NUMERIC NOT NULL DEFAULT 0,
  new_community_needs INTEGER NOT NULL DEFAULT 0,
  needs_fulfilled INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for monthly impact metrics
CREATE TABLE public.impact_metrics_monthly (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month DATE NOT NULL UNIQUE,
  meals_distributed INTEGER NOT NULL DEFAULT 0,
  people_helped INTEGER NOT NULL DEFAULT 0,
  products_matched INTEGER NOT NULL DEFAULT 0,
  total_quantity_distributed NUMERIC NOT NULL DEFAULT 0,
  avg_sustainability_score NUMERIC,
  successful_matches INTEGER NOT NULL DEFAULT 0,
  total_match_attempts INTEGER NOT NULL DEFAULT 0,
  dignity_credits_issued NUMERIC NOT NULL DEFAULT 0,
  new_community_needs INTEGER NOT NULL DEFAULT 0,
  needs_fulfilled INTEGER NOT NULL DEFAULT 0,
  top_categories JSONB,
  top_locations JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.impact_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics_weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics_monthly ENABLE ROW LEVEL SECURITY;

-- Create policies - partners and authenticated users can view metrics
CREATE POLICY "Authenticated users can view daily metrics"
ON public.impact_metrics_daily
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view weekly metrics"
ON public.impact_metrics_weekly
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view monthly metrics"
ON public.impact_metrics_monthly
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create indexes for efficient querying
CREATE INDEX idx_impact_daily_date ON public.impact_metrics_daily(date DESC);
CREATE INDEX idx_impact_weekly_week_start ON public.impact_metrics_weekly(week_start DESC);
CREATE INDEX idx_impact_monthly_month ON public.impact_metrics_monthly(month DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_impact_metrics_daily_updated_at
BEFORE UPDATE ON public.impact_metrics_daily
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_impact_metrics_weekly_updated_at
BEFORE UPDATE ON public.impact_metrics_weekly
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_impact_metrics_monthly_updated_at
BEFORE UPDATE ON public.impact_metrics_monthly
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();