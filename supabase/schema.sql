-- ============================================================
-- KAJANSI AQUACULTURE SERVICE CENTER
-- Database Schema v2.0
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- UTILITY: updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. PROFILES
-- Extends auth.users with role and contact info
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  category    TEXT NOT NULL,
  price       DECIMAL(12,2) NOT NULL,
  unit        TEXT NOT NULL DEFAULT 'each',
  description TEXT,
  specs       JSONB DEFAULT '[]',
  badge       TEXT,
  in_stock    BOOLEAN DEFAULT TRUE,
  image_url   TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 3. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number        TEXT UNIQUE NOT NULL DEFAULT 'KASC-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Guest fields (used when no account)
  guest_name          TEXT,
  guest_email         TEXT,
  guest_phone         TEXT,
  -- Status
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  -- Financials
  subtotal            DECIMAL(12,2) NOT NULL,
  delivery_fee        DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount        DECIMAL(12,2) NOT NULL,
  -- Payment
  payment_method      TEXT NOT NULL DEFAULT 'cash_on_delivery'
                        CHECK (payment_method IN ('cash_on_delivery','mtn_momo','airtel_money','bank_transfer')),
  payment_status      TEXT NOT NULL DEFAULT 'unpaid'
                        CHECK (payment_status IN ('unpaid','paid','refunded')),
  payment_reference   TEXT,
  -- Delivery
  delivery_address    TEXT,
  delivery_district   TEXT,
  delivery_notes      TEXT,
  -- Internal
  admin_notes         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 4. ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_slug    TEXT,
  product_name    TEXT NOT NULL,
  product_price   DECIMAL(12,2) NOT NULL,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  subtotal        DECIMAL(12,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. INQUIRIES (contact form — was already created, safe to re-declare)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  subject     TEXT,
  service     TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','replied')),
  admin_reply TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER set_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 6. GALLERY PHOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  storage_path    TEXT NOT NULL,
  public_url      TEXT NOT NULL,
  category        TEXT DEFAULT 'general',
  is_featured     BOOLEAN DEFAULT FALSE,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. MEDIA EMBEDS (YouTube + TikTok — replaces old videos table)
-- ============================================================
DROP TABLE IF EXISTS public.videos CASCADE;

CREATE TABLE IF NOT EXISTS public.media_embeds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  platform        TEXT NOT NULL CHECK (platform IN ('youtube','tiktok')),
  original_url    TEXT NOT NULL,
  video_id        TEXT NOT NULL,
  embed_url       TEXT NOT NULL,
  thumbnail_url   TEXT,
  is_featured     BOOLEAN DEFAULT FALSE,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. NEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.news (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL,
  slug                TEXT UNIQUE NOT NULL,
  excerpt             TEXT,
  content             TEXT,
  cover_image_url     TEXT,
  cover_storage_path  TEXT,
  is_published        BOOLEAN DEFAULT FALSE,
  published_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_news_updated_at ON public.news;
CREATE TRIGGER set_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 9. OFFERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.offers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,
  storage_path    TEXT,
  badge_text      TEXT,
  discount_type   TEXT CHECK (discount_type IN ('percentage','fixed','free_delivery','bundle')),
  discount_value  DECIMAL(12,2),
  is_active       BOOLEAN DEFAULT TRUE,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_offers_updated_at ON public.offers;
CREATE TRIGGER set_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 10. FLASH DEALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.flash_deals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name     TEXT NOT NULL,
  product_slug     TEXT,
  original_price   DECIMAL(12,2) NOT NULL,
  deal_price       DECIMAL(12,2) NOT NULL,
  image_url        TEXT,
  storage_path     TEXT,
  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ NOT NULL,
  total_quantity   INTEGER,
  quantity_sold    INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_flash_deals_updated_at ON public.flash_deals;
CREATE TRIGGER set_flash_deals_updated_at
  BEFORE UPDATE ON public.flash_deals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 11. SITE SETTINGS (key-value store)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  label       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (key, label, value, category) VALUES
  ('contact_email',           'Primary Email',              'info@kasc.ug',                         'contact'),
  ('contact_phone_primary',   'Primary Phone',              '+256 700 000000',                      'contact'),
  ('contact_phone_secondary', 'Secondary Phone',            '',                                     'contact'),
  ('contact_whatsapp',        'WhatsApp Number',            '+256 700 000000',                      'contact'),
  ('contact_address',         'Physical Address',           'Kajjansi, Wakiso District, Uganda',     'contact'),
  ('contact_business_hours',  'Business Hours',             'Mon–Fri: 8AM–6PM, Sat: 8AM–4PM',      'contact'),
  ('social_facebook',         'Facebook URL',               '',                                     'social'),
  ('social_instagram',        'Instagram URL',              '',                                     'social'),
  ('social_tiktok',           'TikTok URL',                 '',                                     'social'),
  ('social_youtube',          'YouTube Channel URL',        '',                                     'social'),
  ('social_twitter',          'Twitter / X URL',            '',                                     'social'),
  ('delivery_fee_default',    'Default Delivery Fee (UGX)', '15000',                                'shop'),
  ('delivery_fee_free_above', 'Free Delivery Above (UGX)',  '500000',                               'shop'),
  ('mtn_momo_number',         'MTN MoMo Collection Number', '',                                     'payments'),
  ('airtel_money_number',     'Airtel Money Number',        '',                                     'payments'),
  ('bank_name',               'Bank Name',                  '',                                     'payments'),
  ('bank_account_name',       'Bank Account Name',          '',                                     'payments'),
  ('bank_account_number',     'Bank Account Number',        '',                                     'payments'),
  ('bank_branch',             'Bank Branch',                '',                                     'payments')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id        ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id  ON public.order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_gallery_category      ON public.gallery_photos(category);
CREATE INDEX IF NOT EXISTS idx_gallery_featured      ON public.gallery_photos(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_gallery_sort          ON public.gallery_photos(sort_order);

CREATE INDEX IF NOT EXISTS idx_media_platform        ON public.media_embeds(platform);
CREATE INDEX IF NOT EXISTS idx_media_sort            ON public.media_embeds(sort_order);

CREATE INDEX IF NOT EXISTS idx_news_published        ON public.news(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_slug             ON public.news(slug);

CREATE INDEX IF NOT EXISTS idx_flash_deals_active    ON public.flash_deals(is_active, ends_at);
CREATE INDEX IF NOT EXISTS idx_offers_active         ON public.offers(is_active);

CREATE INDEX IF NOT EXISTS idx_profiles_role         ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_inquiries_status      ON public.inquiries(status, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_embeds  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_deals   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop all old policies before recreating
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- PROFILES
CREATE POLICY "profiles_select_own"       ON public.profiles FOR SELECT  USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_update_own"       ON public.profiles FOR UPDATE  USING (auth.uid() = id OR public.is_admin());

-- PRODUCTS
CREATE POLICY "products_public_read"      ON public.products FOR SELECT  USING (TRUE);
CREATE POLICY "products_admin_all"        ON public.products FOR ALL     USING (public.is_admin());

-- ORDERS
CREATE POLICY "orders_user_select"        ON public.orders FOR SELECT    USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "orders_public_insert"      ON public.orders FOR INSERT    WITH CHECK (TRUE);
CREATE POLICY "orders_admin_update"       ON public.orders FOR UPDATE    USING (public.is_admin());
CREATE POLICY "orders_admin_delete"       ON public.orders FOR DELETE    USING (public.is_admin());

-- ORDER ITEMS
CREATE POLICY "order_items_user_select"   ON public.order_items FOR SELECT USING (
  public.is_admin() OR
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
);
CREATE POLICY "order_items_public_insert" ON public.order_items FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "order_items_admin_all"     ON public.order_items FOR ALL   USING (public.is_admin());

-- INQUIRIES
CREATE POLICY "inquiries_public_insert"   ON public.inquiries FOR INSERT  WITH CHECK (TRUE);
CREATE POLICY "inquiries_admin_all"       ON public.inquiries FOR ALL     USING (public.is_admin());

-- GALLERY
CREATE POLICY "gallery_public_read"       ON public.gallery_photos FOR SELECT USING (TRUE);
CREATE POLICY "gallery_admin_all"         ON public.gallery_photos FOR ALL    USING (public.is_admin());

-- MEDIA EMBEDS
CREATE POLICY "media_public_read"         ON public.media_embeds FOR SELECT USING (TRUE);
CREATE POLICY "media_admin_all"           ON public.media_embeds FOR ALL    USING (public.is_admin());

-- NEWS
CREATE POLICY "news_public_read"          ON public.news FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "news_admin_all"            ON public.news FOR ALL    USING (public.is_admin());

-- OFFERS
CREATE POLICY "offers_public_read"        ON public.offers FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "offers_admin_all"          ON public.offers FOR ALL   USING (public.is_admin());

-- FLASH DEALS
CREATE POLICY "flash_deals_public_read"   ON public.flash_deals FOR SELECT USING (
  (is_active = TRUE AND ends_at > NOW()) OR public.is_admin()
);
CREATE POLICY "flash_deals_admin_all"     ON public.flash_deals FOR ALL   USING (public.is_admin());

-- SITE SETTINGS
CREATE POLICY "settings_public_read"      ON public.site_settings FOR SELECT USING (TRUE);
CREATE POLICY "settings_admin_update"     ON public.site_settings FOR UPDATE USING (public.is_admin());

-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- Admin dashboard stats (single query, zero N+1)
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomically claim flash deal stock (prevents overselling at 50k concurrent users)
CREATE OR REPLACE FUNCTION public.claim_flash_deal(deal_id UUID, qty INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql;

-- Extract YouTube video ID from URL
CREATE OR REPLACE FUNCTION public.extract_youtube_id(url TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Handles: youtu.be/ID, ?v=ID, /embed/ID
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Extract TikTok video ID from URL
CREATE OR REPLACE FUNCTION public.extract_tiktok_id(url TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Handles: tiktok.com/@user/video/ID or vm.tiktok.com/ID
  RETURN CASE
    WHEN url ~ '/video/([0-9]+)' THEN
      SUBSTRING(url FROM '/video/([0-9]+)')
    ELSE NULL
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
