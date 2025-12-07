-- Allow authenticated users to update community needs they've matched
CREATE POLICY "Authenticated users can update matched needs"
ON public.community_needs
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create a table to track fulfillment records
CREATE TABLE public.match_fulfillments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_need_id UUID NOT NULL REFERENCES public.community_needs(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  producer_id UUID NOT NULL REFERENCES public.profiles(id),
  quantity_fulfilled NUMERIC NOT NULL,
  fulfilled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on fulfillments
ALTER TABLE public.match_fulfillments ENABLE ROW LEVEL SECURITY;

-- Producers can view their own fulfillments
CREATE POLICY "Producers can view their fulfillments"
ON public.match_fulfillments
FOR SELECT
USING (auth.uid() = producer_id);

-- Producers can insert their own fulfillments
CREATE POLICY "Producers can create fulfillments"
ON public.match_fulfillments
FOR INSERT
WITH CHECK (auth.uid() = producer_id);

-- Partners can view all fulfillments for reporting
CREATE POLICY "Partners can view all fulfillments"
ON public.match_fulfillments
FOR SELECT
USING (auth.uid() IS NOT NULL);