-- Table to track user tour completion status
CREATE TABLE public.user_tour_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  tour_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_tour_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tour status"
ON public.user_tour_status FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tour status"
ON public.user_tour_status FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tour status"
ON public.user_tour_status FOR UPDATE
USING (auth.uid() = user_id);

-- Table for producer ratings from beneficiaries
CREATE TABLE public.producer_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID NOT NULL,
  beneficiary_id UUID NOT NULL,
  fulfillment_id UUID REFERENCES public.match_fulfillments(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  thank_you_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.producer_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
ON public.producer_ratings FOR SELECT
USING (true);

CREATE POLICY "Beneficiaries can create ratings"
ON public.producer_ratings FOR INSERT
WITH CHECK (auth.uid() = beneficiary_id);

-- Table for real-time notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to notify beneficiary when their need is fulfilled
CREATE OR REPLACE FUNCTION public.notify_beneficiary_on_fulfillment()
RETURNS TRIGGER AS $$
DECLARE
  need_record RECORD;
  product_record RECORD;
BEGIN
  -- Get the community need details
  SELECT * INTO need_record FROM public.community_needs WHERE id = NEW.need_id;
  
  -- Get the product details
  SELECT * INTO product_record FROM public.products WHERE id = NEW.product_id;
  
  -- Insert notification for the beneficiary
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (
    need_record.user_id,
    'fulfillment',
    'Your need has been fulfilled!',
    'A producer has fulfilled your request for ' || COALESCE(product_record.name, 'an item') || '.',
    jsonb_build_object(
      'fulfillment_id', NEW.id,
      'product_name', product_record.name,
      'quantity', NEW.quantity_fulfilled,
      'producer_id', NEW.producer_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to send notification on fulfillment
CREATE TRIGGER on_fulfillment_notify_beneficiary
AFTER INSERT ON public.match_fulfillments
FOR EACH ROW
EXECUTE FUNCTION public.notify_beneficiary_on_fulfillment();