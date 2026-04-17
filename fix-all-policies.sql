-- =============================================
-- FIX ALL RLS POLICIES - NUCLEAR RESET
-- Execute no SQL Editor do Supabase Dashboard
-- This drops ALL existing policies and recreates from scratch
-- =============================================

-- 1. Drop ALL policies from ALL tables automatically
DO $$
DECLARE
  _tbl text;
  _pol text;
BEGIN
  FOR _tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    AND tablename IN (
      'profiles','jobs','applications','resumes',
      'chat_conversations','chat_messages',
      'site_config','send_plans','dispatch_config','upsell_texts',
      'companies','testimonials','videos',
      'social_proof_config','rotation_config'
    )
  LOOP
    FOR _pol IN
      SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = _tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', _pol, _tbl);
    END LOOP;
  END LOOP;
END
$$;

-- 2. Ensure is_admin() function exists (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- 3. PROFILES
-- =============================================
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.is_admin());

-- =============================================
-- 4. JOBS (anyone can read, admins manage)
-- =============================================
CREATE POLICY "Anyone can view jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Admins can manage jobs" ON public.jobs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 5. APPLICATIONS
-- =============================================
CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage applications" ON public.applications FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 6. RESUMES
-- =============================================
CREATE POLICY "Users can view own resumes" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON public.resumes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all resumes" ON public.resumes FOR SELECT USING (public.is_admin());

-- =============================================
-- 7. CHAT
-- =============================================
CREATE POLICY "Users can view own conversations" ON public.chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.chat_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage conversations" ON public.chat_conversations FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_conversations WHERE id = chat_messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.chat_conversations WHERE id = chat_messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage messages" ON public.chat_messages FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- 8. PUBLIC CONFIG TABLES (anyone reads, admins manage)
-- =============================================
-- Site Config
CREATE POLICY "Anyone can read site_config" ON public.site_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage site_config" ON public.site_config FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Send Plans
CREATE POLICY "Anyone can read send_plans" ON public.send_plans FOR SELECT USING (true);
CREATE POLICY "Admins can manage send_plans" ON public.send_plans FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Dispatch Config
CREATE POLICY "Anyone can read dispatch_config" ON public.dispatch_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage dispatch_config" ON public.dispatch_config FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Upsell Texts
CREATE POLICY "Anyone can read upsell_texts" ON public.upsell_texts FOR SELECT USING (true);
CREATE POLICY "Admins can manage upsell_texts" ON public.upsell_texts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Companies
CREATE POLICY "Anyone can read companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Testimonials
CREATE POLICY "Anyone can read testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Videos
CREATE POLICY "Anyone can read videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Admins can manage videos" ON public.videos FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Social Proof Config
CREATE POLICY "Anyone can read social_proof_config" ON public.social_proof_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage social_proof_config" ON public.social_proof_config FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Rotation Config
CREATE POLICY "Anyone can read rotation_config" ON public.rotation_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage rotation_config" ON public.rotation_config FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
