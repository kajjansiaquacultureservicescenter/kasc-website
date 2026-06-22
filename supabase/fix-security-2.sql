-- ============================================================
-- MIGRATION 2: Clear all remaining security warnings
-- ============================================================

-- ── 1. Create private schema (not exposed via REST API) ──────
-- Functions here are invisible to /rest/v1/rpc/ — silences the
-- "Public Can Execute SECURITY DEFINER Function" warning for is_admin

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_admin()
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

-- ── 2. Update get_dashboard_stats to use private.is_admin() ──

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT private.is_admin() THEN
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

-- ── 3. Lock down trigger-only functions ──────────────────────
-- Triggers don't need the calling user to have EXECUTE — safe to revoke

REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- get_dashboard_stats: revoke from PUBLIC, grant back to authenticated only
-- (admins are authenticated; the function checks is_admin internally)
REVOKE EXECUTE ON FUNCTION public.get_dashboard_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;

-- ── 4. Drop ALL existing policies first (removes public.is_admin() deps) ──

DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Now safe to drop public.is_admin() — no policies depend on it
DROP FUNCTION IF EXISTS public.is_admin();

-- ── 5. Recreate ALL RLS policies using private.is_admin() ────

-- PROFILES
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING ((SELECT auth.uid()) = id OR (SELECT private.is_admin()));
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id OR (SELECT private.is_admin()))
  WITH CHECK ((SELECT auth.uid()) = id OR (SELECT private.is_admin()));
CREATE POLICY "profiles_admin_delete" ON public.profiles FOR DELETE
  USING ((SELECT private.is_admin()));

-- PRODUCTS
CREATE POLICY "products_select"       ON public.products FOR SELECT  USING (true);
CREATE POLICY "products_admin_insert" ON public.products FOR INSERT  WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "products_admin_update" ON public.products FOR UPDATE  USING ((SELECT private.is_admin()));
CREATE POLICY "products_admin_delete" ON public.products FOR DELETE  USING ((SELECT private.is_admin()));

-- ORDERS: no public INSERT policy — API route uses service role
CREATE POLICY "orders_select"         ON public.orders FOR SELECT    USING ((SELECT auth.uid()) = user_id OR (SELECT private.is_admin()));
CREATE POLICY "orders_admin_insert"   ON public.orders FOR INSERT    WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "orders_admin_update"   ON public.orders FOR UPDATE    USING ((SELECT private.is_admin()));
CREATE POLICY "orders_admin_delete"   ON public.orders FOR DELETE    USING ((SELECT private.is_admin()));

-- ORDER ITEMS: no public INSERT policy — API route uses service role
CREATE POLICY "order_items_select"        ON public.order_items FOR SELECT  USING (
  (SELECT private.is_admin()) OR
  order_id IN (SELECT id FROM public.orders WHERE user_id = (SELECT auth.uid()))
);
CREATE POLICY "order_items_admin_insert"  ON public.order_items FOR INSERT  WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "order_items_admin_update"  ON public.order_items FOR UPDATE  USING ((SELECT private.is_admin()));
CREATE POLICY "order_items_admin_delete"  ON public.order_items FOR DELETE  USING ((SELECT private.is_admin()));

-- INQUIRIES: no public INSERT policy — API route uses service role
CREATE POLICY "inquiries_admin_select" ON public.inquiries FOR SELECT  USING ((SELECT private.is_admin()));
CREATE POLICY "inquiries_admin_insert" ON public.inquiries FOR INSERT  WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "inquiries_admin_update" ON public.inquiries FOR UPDATE  USING ((SELECT private.is_admin()));
CREATE POLICY "inquiries_admin_delete" ON public.inquiries FOR DELETE  USING ((SELECT private.is_admin()));

-- GALLERY PHOTOS
CREATE POLICY "gallery_select"         ON public.gallery_photos FOR SELECT  USING (true);
CREATE POLICY "gallery_admin_insert"   ON public.gallery_photos FOR INSERT  WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "gallery_admin_update"   ON public.gallery_photos FOR UPDATE  USING ((SELECT private.is_admin()));
CREATE POLICY "gallery_admin_delete"   ON public.gallery_photos FOR DELETE  USING ((SELECT private.is_admin()));

-- MEDIA EMBEDS
CREATE POLICY "media_select"           ON public.media_embeds FOR SELECT  USING (true);
CREATE POLICY "media_admin_insert"     ON public.media_embeds FOR INSERT  WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "media_admin_update"     ON public.media_embeds FOR UPDATE  USING ((SELECT private.is_admin()));
CREATE POLICY "media_admin_delete"     ON public.media_embeds FOR DELETE  USING ((SELECT private.is_admin()));

-- NEWS
CREATE POLICY "news_select"            ON public.news FOR SELECT  USING (is_published = true OR (SELECT private.is_admin()));
CREATE POLICY "news_admin_insert"      ON public.news FOR INSERT  WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "news_admin_update"      ON public.news FOR UPDATE  USING ((SELECT private.is_admin()));
CREATE POLICY "news_admin_delete"      ON public.news FOR DELETE  USING ((SELECT private.is_admin()));

-- OFFERS
CREATE POLICY "offers_select"          ON public.offers FOR SELECT  USING (is_active = true OR (SELECT private.is_admin()));
CREATE POLICY "offers_admin_insert"    ON public.offers FOR INSERT  WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "offers_admin_update"    ON public.offers FOR UPDATE  USING ((SELECT private.is_admin()));
CREATE POLICY "offers_admin_delete"    ON public.offers FOR DELETE  USING ((SELECT private.is_admin()));

-- FLASH DEALS
CREATE POLICY "flash_deals_select"        ON public.flash_deals FOR SELECT  USING (
  (is_active = true AND ends_at > NOW()) OR (SELECT private.is_admin())
);
CREATE POLICY "flash_deals_admin_insert"  ON public.flash_deals FOR INSERT  WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "flash_deals_admin_update"  ON public.flash_deals FOR UPDATE  USING ((SELECT private.is_admin()));
CREATE POLICY "flash_deals_admin_delete"  ON public.flash_deals FOR DELETE  USING ((SELECT private.is_admin()));

-- SITE SETTINGS
CREATE POLICY "settings_select"        ON public.site_settings FOR SELECT  USING (true);
CREATE POLICY "settings_admin_insert"  ON public.site_settings FOR INSERT  WITH CHECK ((SELECT private.is_admin()));
CREATE POLICY "settings_admin_update"  ON public.site_settings FOR UPDATE  USING ((SELECT private.is_admin()));
CREATE POLICY "settings_admin_delete"  ON public.site_settings FOR DELETE  USING ((SELECT private.is_admin()));
