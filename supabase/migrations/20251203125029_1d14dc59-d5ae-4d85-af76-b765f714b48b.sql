-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  user_type text CHECK (user_type IN ('producer', 'beneficiary', 'partner')),
  phone text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  unit text NOT NULL,
  price_per_unit decimal(10,2),
  sustainability_score integer CHECK (sustainability_score >= 0 AND sustainability_score <= 100),
  nutritional_info jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can manage their own products"
  ON public.products FOR ALL
  USING (auth.uid() = producer_id);

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Create inventory table
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity decimal(10,2) NOT NULL DEFAULT 0,
  available_quantity decimal(10,2) NOT NULL DEFAULT 0,
  reserved_quantity decimal(10,2) NOT NULL DEFAULT 0,
  expiry_date date,
  location text,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can manage inventory for their products"
  ON public.inventory FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = inventory.product_id
      AND products.producer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view inventory"
  ON public.inventory FOR SELECT
  USING (true);

-- Create dignity credits table
CREATE TABLE public.dignity_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  transaction_type text CHECK (transaction_type IN ('earned', 'spent', 'transferred')) NOT NULL,
  source text,
  description text,
  related_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.dignity_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits"
  ON public.dignity_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert credits"
  ON public.dignity_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create community needs table
CREATE TABLE public.community_needs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  quantity_needed decimal(10,2),
  unit text,
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  location text,
  status text CHECK (status IN ('open', 'matched', 'fulfilled')) DEFAULT 'open',
  matched_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_needs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open needs"
  ON public.community_needs FOR SELECT
  USING (status = 'open' OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create needs"
  ON public.community_needs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_needs_updated_at
  BEFORE UPDATE ON public.community_needs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'user_type'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();