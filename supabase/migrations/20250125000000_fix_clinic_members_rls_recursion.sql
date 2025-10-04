-- Fix infinite recursion in clinic_members RLS policies
-- The issue is that the policy references the same table it's protecting, causing circular dependency

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view members of their clinics" ON public.clinic_members;
DROP POLICY IF EXISTS "Owners and managers can invite members" ON public.clinic_members;
DROP POLICY IF EXISTS "Owners and managers can update member roles and permissions" ON public.clinic_members;
DROP POLICY IF EXISTS "Owners can remove members" ON public.clinic_members;

-- Create new policies that avoid recursion by using doctor_profiles as the source of truth
CREATE POLICY "Users can view members of their clinics" 
  ON public.clinic_members 
  FOR SELECT 
  USING (
    clinic_id IN (
      SELECT dp.clinic_id FROM public.doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Owners and managers can invite members" 
  ON public.clinic_members 
  FOR INSERT 
  WITH CHECK (
    clinic_id IN (
      SELECT dp.clinic_id FROM public.doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and managers can update member roles and permissions" 
  ON public.clinic_members 
  FOR UPDATE 
  USING (
    clinic_id IN (
      SELECT dp.clinic_id FROM public.doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can remove members" 
  ON public.clinic_members 
  FOR DELETE 
  USING (
    clinic_id IN (
      SELECT dp.clinic_id FROM public.doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    )
  );

-- Also fix the clinic_profiles policies that have the same issue
DROP POLICY IF EXISTS "Users can view clinics they are members of" ON public.clinic_profiles;
DROP POLICY IF EXISTS "Users can update clinics they own or manage" ON public.clinic_profiles;

CREATE POLICY "Users can view clinics they are members of" 
  ON public.clinic_profiles 
  FOR SELECT 
  USING (
    id IN (
      SELECT dp.clinic_id FROM public.doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update clinics they own or manage" 
  ON public.clinic_profiles 
  FOR UPDATE 
  USING (
    id IN (
      SELECT dp.clinic_id FROM public.doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    )
  );

-- Fix clinic_locations policies as well
DROP POLICY IF EXISTS "Users can view locations of their clinics" ON public.clinic_locations;
DROP POLICY IF EXISTS "Users can manage locations of clinics they own or manage" ON public.clinic_locations;

CREATE POLICY "Users can view locations of their clinics" 
  ON public.clinic_locations 
  FOR SELECT 
  USING (
    clinic_id IN (
      SELECT dp.clinic_id FROM public.doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage locations of clinics they own or manage" 
  ON public.clinic_locations 
  FOR ALL 
  USING (
    clinic_id IN (
      SELECT dp.clinic_id FROM public.doctor_profiles dp 
      WHERE dp.user_id = auth.uid()
    )
  );
