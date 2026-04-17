-- =============================================
-- FIX: Infinite recursion in profiles RLS
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================

-- 1. Create security definer function (bypasses RLS, no recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Fix profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.is_admin());

-- 3. Fix all other admin policies to use the function too
DROP POLICY IF EXISTS "Admins can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can delete jobs" ON public.jobs;
CREATE POLICY "Admins can insert jobs" ON public.jobs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update jobs" ON public.jobs FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete jobs" ON public.jobs FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
CREATE POLICY "Admins can view all applications" ON public.applications FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all resumes" ON public.resumes;
CREATE POLICY "Admins can view all resumes" ON public.resumes FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all conversations" ON public.chat_conversations;
CREATE POLICY "Admins can view all conversations" ON public.chat_conversations FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all messages" ON public.chat_messages;
CREATE POLICY "Admins can view all messages" ON public.chat_messages FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can send messages" ON public.chat_messages;
CREATE POLICY "Admins can send messages" ON public.chat_messages FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage config" ON public.site_config;
CREATE POLICY "Admins can manage config" ON public.site_config FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage plans" ON public.send_plans;
CREATE POLICY "Admins can manage plans" ON public.send_plans FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage dispatch config" ON public.dispatch_config;
CREATE POLICY "Admins can manage dispatch config" ON public.dispatch_config FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage upsell texts" ON public.upsell_texts;
CREATE POLICY "Admins can manage upsell texts" ON public.upsell_texts FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos;
CREATE POLICY "Admins can manage videos" ON public.videos FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage social proof" ON public.social_proof_config;
CREATE POLICY "Admins can manage social proof" ON public.social_proof_config FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage rotation" ON public.rotation_config;
CREATE POLICY "Admins can manage rotation" ON public.rotation_config FOR ALL USING (public.is_admin());
