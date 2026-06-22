-- ============================================================
-- MIGRATION: Fix all Supabase security & performance warnings
-- ============================================================

-- ── 1. Fix function search_path (function_search_path_mutable) ──

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger functions cannot be called via RPC anyway, revoke to silence warning
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
    AND role = 'admin'
  );
$$;

-- get_dashboard_stats: add admin check inside + revoke from anon
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  RETURN json_build_object(
    'orders_today',       (SELECT COUNT(*) FROM public.orders WHERE created_at >= CURRENT_DATE),
    'orders_pending',     (SELECT COUNT(*) FROM public.orders WHERE status = 'pending'),
    'orders_total',       (SELECT COUNT(*) FROM public.orders),
    'revenue_today',      (SELECT COALESCE(SUM(total_amount),0) FROM public.orders WHERE created_at >= CURRENT_DATE AND payment_status = 'paid'),
    'revenue_total',      (SELECT COALESCE(SUM(total_amount),0) FROM public.orders WHERE payment_status = 'paid'),
    'inquiries_new',      (SELECT COUNT(*) FROM public.inquiries WHERE status = 'new'),
    'inquiries_total',    (SELECT COUNT(*) FROM public.inquiries),
    'gallery_photos',     (SELECT COUNT(*) FROM public.gallery_photos),
    'active_flash_deals', (SELECT COUNT(*) FROM public.flash_deals WHERE is_active = TRUE AND ends_at > NOW()),
    'published_news',     (SELECT COUNT(*) FROM public.news WHERE is_published = TRUE)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_dashboard_stats() FROM anon;

CREATE OR REPLACE FUNCTION public.claim_flash_deal(deal_id UUID, qty INTEGER DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  updated_id UUID;
BEGIN
  UPDATE public.flash_deals
  SET quantity_sold = quantity_sold + qty
  WHERE id = deal_id
    AND is_active = TRUE
    AND ends_at > NOW()
    AND (total_quantity IS NULL OR quantity_sold + qty <= total_quantity)
  RETURNING id INTO updated_id;
  RETURN updated_id IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.extract_youtube_id(url TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN CASE
    WHEN url ~ 'youtu\.be/([a-zA-Z0-9_-]{11})' THEN
      SUBSTRING(url FROM 'youtu\.be/([a-zA-Z0-9_-]{11})')
    WHEN url ~ '[?&]v=([a-zA-Z0-9_-]{11})' THEN
      SUBSTRING(url FROM '[?&]v=([a-zA-Z0-9_-]{11})')
    WHEN url ~ '/embed/([a-zA-Z0-9_-]{11})' THEN
      SUBSTRING(url FROM '/embed/([a-zA-Z0-9_-]{11})')
    ELSE NULL
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.extract_tiktok_id(url TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN CASE
    WHEN url ~ '/video/([0-9]+)' THEN
      SUBSTRING(url FROM '/video/([0-9]+)')
    ELSE NULL
  END;
END;
$$;

-- ── 2. Drop all existing RLS policies and recreate optimally ──
-- Fixes: auth_rls_initplan, multiple_permissive_policies

DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- PROFILES
-- (SELECT auth.uid()) evaluated once per query, not per row
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING ((SELECT auth.uid()) = id OR (SELECT public.is_admin()));
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT auth.uid()) = id OR (SELECT public.is_admin()));
CREATE POLICY "profiles_admin_delete" ON public.profiles FOR DELETE
  USING ((SELECT public.is_admin()));

-- PRODUCTS: one SELECT policy (no overlap with admin write policies)
CREATE POLICY "products_select"       ON public.products FOR SELECT  USING (true);
CREATE POLICY "products_admin_insert" ON public.products FOR INSERT  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "products_admin_update" ON public.products FOR UPDATE  USING ((SELECT public.is_admin()));
CREATE POLICY "products_admin_delete" ON public.products FOR DELETE  USING ((SELECT public.is_admin()));

-- ORDERS
CREATE POLICY "orders_insert"         ON public.orders FOR INSERT    WITH CHECK (true);
CREATE POLICY "orders_select"         ON public.orders FOR SELECT    USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));
CREATE POLICY "orders_admin_update"   ON public.orders FOR UPDATE    USING ((SELECT public.is_admin()));
CREATE POLICY "orders_admin_delete"   ON public.orders FOR DELETE    USING ((SELECT public.is_admin()));

-- ORDER ITEMS
CREATE POLICY "order_items_insert"        ON public.order_items FOR INSERT  WITH CHECK (true);
CREATE POLICY "order_items_select"        ON public.order_items FOR SELECT  USING (
  (SELECT public.is_admin()) OR
  order_id IN (SELECT id FROM public.orders WHERE user_id = (SELECT auth.uid()))
);
CREATE POLICY "order_items_admin_update"  ON public.order_items FOR UPDATE  USING ((SELECT public.is_admin()));
CREATE POLICY "order_items_admin_delete"  ON public.order_items FOR DELETE  USING ((SELECT public.is_admin()));

-- INQUIRIES
CREATE POLICY "inquiries_insert"       ON public.inquiries FOR INSERT  WITH CHECK (true);
CREATE POLICY "inquiries_admin_select" ON public.inquiries FOR SELECT  USING ((SELECT public.is_admin()));
CREATE POLICY "inquiries_admin_update" ON public.inquiries FOR UPDATE  USING ((SELECT public.is_admin()));
CREATE POLICY "inquiries_admin_delete" ON public.inquiries FOR DELETE  USING ((SELECT public.is_admin()));

-- GALLERY PHOTOS
CREATE POLICY "gallery_select"         ON public.gallery_photos FOR SELECT  USING (true);
CREATE POLICY "gallery_admin_insert"   ON public.gallery_photos FOR INSERT  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "gallery_admin_update"   ON public.gallery_photos FOR UPDATE  USING ((SELECT public.is_admin()));
CREATE POLICY "gallery_admin_delete"   ON public.gallery_photos FOR DELETE  USING ((SELECT public.is_admin()));

-- MEDIA EMBEDS
CREATE POLICY "media_select"           ON public.media_embeds FOR SELECT  USING (true);
CREATE POLICY "media_admin_insert"     ON public.media_embeds FOR INSERT  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "media_admin_update"     ON public.media_embeds FOR UPDATE  USING ((SELECT public.is_admin()));
CREATE POLICY "media_admin_delete"     ON public.media_embeds FOR DELETE  USING ((SELECT public.is_admin()));

-- NEWS
CREATE POLICY "news_select"            ON public.news FOR SELECT  USING (is_published = true OR (SELECT public.is_admin()));
CREATE POLICY "news_admin_insert"      ON public.news FOR INSERT  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "news_admin_update"      ON public.news FOR UPDATE  USING ((SELECT public.is_admin()));
CREATE POLICY "news_admin_delete"      ON public.news FOR DELETE  USING ((SELECT public.is_admin()));

-- OFFERS
CREATE POLICY "offers_select"          ON public.offers FOR SELECT  USING (is_active = true OR (SELECT public.is_admin()));
CREATE POLICY "offers_admin_insert"    ON public.offers FOR INSERT  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "offers_admin_update"    ON public.offers FOR UPDATE  USING ((SELECT public.is_admin()));
CREATE POLICY "offers_admin_delete"    ON public.offers FOR DELETE  USING ((SELECT public.is_admin()));

-- FLASH DEALS
CREATE POLICY "flash_deals_select"        ON public.flash_deals FOR SELECT  USING (
  (is_active = true AND ends_at > NOW()) OR (SELECT public.is_admin())
);
CREATE POLICY "flash_deals_admin_insert"  ON public.flash_deals FOR INSERT  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "flash_deals_admin_update"  ON public.flash_deals FOR UPDATE  USING ((SELECT public.is_admin()));
CREATE POLICY "flash_deals_admin_delete"  ON public.flash_deals FOR DELETE  USING ((SELECT public.is_admin()));

-- SITE SETTINGS
CREATE POLICY "settings_select"        ON public.site_settings FOR SELECT  USING (true);
CREATE POLICY "settings_admin_insert"  ON public.site_settings FOR INSERT  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "settings_admin_update"  ON public.site_settings FOR UPDATE  USING ((SELECT public.is_admin()));
CREATE POLICY "settings_admin_delete"  ON public.site_settings FOR DELETE  USING ((SELECT public.is_admin()));
