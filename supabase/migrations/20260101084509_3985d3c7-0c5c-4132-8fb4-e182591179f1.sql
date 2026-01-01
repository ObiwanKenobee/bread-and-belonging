-- Task 1: Fix inventory RLS policy to require authentication
DROP POLICY IF EXISTS "Anyone can view inventory" ON public.inventory;
CREATE POLICY "Authenticated users can view inventory" 
ON public.inventory 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Task 5: Create user_roles table with proper security
CREATE TYPE public.app_role AS ENUM ('admin', 'producer', 'beneficiary', 'partner');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-assign default role on signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_type_value text;
  role_to_assign app_role;
BEGIN
  -- Get user_type from the profile
  user_type_value := NEW.user_type;
  
  -- Map user_type to role
  CASE user_type_value
    WHEN 'producer' THEN role_to_assign := 'producer';
    WHEN 'partner' THEN role_to_assign := 'partner';
    ELSE role_to_assign := 'beneficiary';
  END CASE;
  
  -- Insert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, role_to_assign)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to assign role when profile is created
CREATE TRIGGER on_profile_created_assign_role
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();