-- =============================================
-- FIX ALL RLS POLICIES - Drop old recursive ones
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================

-- 1. Ensure is_admin() function exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- 2. PROFILES - fix admin policies
-- =============================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.is_admin());

-- =============================================
-- 3. JOBS - fix admin policies
-- =============================================
DROP POLICY IF EXISTS "Admins can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can delete jobs" ON public.jobs;
CREATE POLICY "Admins can insert jobs" ON public.jobs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update jobs" ON public.jobs FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete jobs" ON public.jobs FOR DELETE USING (public.is_admin());

-- =============================================
-- 4. APPLICATIONS
-- =============================================
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can update all applications" ON public.applications;
CREATE POLICY "Admins can view all applications" ON public.applications FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all applications" ON public.applications FOR UPDATE USING (public.is_admin());

-- =============================================
-- 5. RESUMES
-- =============================================
DROP POLICY IF EXISTS "Admins can view all resumes" ON public.resumes;
CREATE POLICY "Admins can view all resumes" ON public.resumes FOR SELECT USING (public.is_admin());

-- =============================================
-- 6. CHAT
-- =============================================
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Admins can update all conversations" ON public.chat_conversations;
CREATE POLICY "Admins can view all conversations" ON public.chat_conversations FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all conversations" ON public.chat_conversations FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can send messages" ON public.chat_messages;
CREATE POLICY "Admins can insert messages" ON public.chat_messages FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can send messages" ON public.chat_messages FOR INSERT WITH CHECK (public.is_admin());

-- =============================================
-- 7. SITE CONFIG - drop ALL old policies, recreate with is_admin()
-- =============================================
DROP POLICY IF EXISTS "Admins can update site_config" ON public.site_config;
DROP POLICY IF EXISTS "Admins can insert site_config" ON public.site_config;
DROP POLICY IF EXISTS "Admins can manage config" ON public.site_config;
CREATE POLICY "Admins can manage site_config" ON public.site_config FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 8. SEND PLANS - drop ALL old policies, recreate
-- =============================================
DROP POLICY IF EXISTS "Admins can manage send_plans" ON public.send_plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON public.send_plans;
CREATE POLICY "Admins can manage send_plans" ON public.send_plans FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 9. DISPATCH CONFIG
-- =============================================
DROP POLICY IF EXISTS "Admins can update dispatch_config" ON public.dispatch_config;
DROP POLICY IF EXISTS "Admins can insert dispatch_config" ON public.dispatch_config;
DROP POLICY IF EXISTS "Admins can manage dispatch config" ON public.dispatch_config;
CREATE POLICY "Admins can manage dispatch_config" ON public.dispatch_config FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 10. UPSELL TEXTS
-- =============================================
DROP POLICY IF EXISTS "Admins can update upsell_texts" ON public.upsell_texts;
DROP POLICY IF EXISTS "Admins can insert upsell_texts" ON public.upsell_texts;
DROP POLICY IF EXISTS "Admins can manage upsell texts" ON public.upsell_texts;
CREATE POLICY "Admins can manage upsell_texts" ON public.upsell_texts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 11. COMPANIES
-- =============================================
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 12. TESTIMONIALS
-- =============================================
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 13. VIDEOS
-- =============================================
DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos;
CREATE POLICY "Admins can manage videos" ON public.videos FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 14. SOCIAL PROOF CONFIG
-- =============================================
DROP POLICY IF EXISTS "Admins can update social_proof_config" ON public.social_proof_config;
DROP POLICY IF EXISTS "Admins can insert social_proof_config" ON public.social_proof_config;
DROP POLICY IF EXISTS "Admins can manage social proof" ON public.social_proof_config;
CREATE POLICY "Admins can manage social_proof_config" ON public.social_proof_config FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 15. ROTATION CONFIG
-- =============================================
DROP POLICY IF EXISTS "Admins can update rotation_config" ON public.rotation_config;
DROP POLICY IF EXISTS "Admins can insert rotation_config" ON public.rotation_config;
DROP POLICY IF EXISTS "Admins can manage rotation" ON public.rotation_config;
CREATE POLICY "Admins can manage rotation_config" ON public.rotation_config FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
