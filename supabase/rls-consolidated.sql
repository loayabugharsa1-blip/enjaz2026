-- ============================================================
-- RLS Consolidated — نهائي صارم
-- Injaz Advertising — يونيو 2026 v2.7.0
-- Public tables: READ-ONLY for anon
-- Admin tables: NO anon access (service_role only)
-- SECURITY DEFINER RPCs for limited public data access
-- ============================================================
-- كيفية التطبيق: Supabase Dashboard > SQL Editor > لصق + تشغيل
-- ============================================================

-- Grant necessary permissions on public schema first
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT CREATE ON SCHEMA public TO PUBLIC;

-- Safe helper: applies RLS operations only if the table exists
DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services') THEN
    ALTER TABLE services ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all select" ON services;
    DROP POLICY IF EXISTS "Allow all insert" ON services;
    DROP POLICY IF EXISTS "Allow all update" ON services;
    DROP POLICY IF EXISTS "Allow all delete" ON services;
    DROP POLICY IF EXISTS "Public can read services" ON services;
    CREATE POLICY "Public can read services" ON services FOR SELECT USING (true);
  END IF;
END $do$;

DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventory_items') THEN
    ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all select" ON inventory_items;
    DROP POLICY IF EXISTS "Allow all insert" ON inventory_items;
    DROP POLICY IF EXISTS "Allow all update" ON inventory_items;
    DROP POLICY IF EXISTS "Allow all delete" ON inventory_items;
    DROP POLICY IF EXISTS "Public can read inventory" ON inventory_items;
    CREATE POLICY "Public can read inventory" ON inventory_items FOR SELECT USING (true);
  END IF;
END $do$;

DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'portfolio') THEN
    ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all select" ON portfolio;
    DROP POLICY IF EXISTS "Allow all insert" ON portfolio;
    DROP POLICY IF EXISTS "Allow all update" ON portfolio;
    DROP POLICY IF EXISTS "Allow all delete" ON portfolio;
    CREATE POLICY "Public can read portfolio" ON portfolio FOR SELECT USING (true);
  END IF;
END $do$;

DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
    ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all select" ON reviews;
    DROP POLICY IF EXISTS "Allow all insert" ON reviews;
    DROP POLICY IF EXISTS "Allow all update" ON reviews;
    DROP POLICY IF EXISTS "Allow all delete" ON reviews;
    CREATE POLICY "Public can read reviews" ON reviews FOR SELECT USING (true);
  END IF;
END $do$;

DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all select" ON orders;
    DROP POLICY IF EXISTS "Allow all insert" ON orders;
    DROP POLICY IF EXISTS "Allow all update" ON orders;
    DROP POLICY IF EXISTS "Allow all delete" ON orders;
  END IF;
END $do$;

DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all select" ON order_items;
    DROP POLICY IF EXISTS "Allow all insert" ON order_items;
    DROP POLICY IF EXISTS "Allow all update" ON order_items;
    DROP POLICY IF EXISTS "Allow all delete" ON order_items;
  END IF;
END $do$;

DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_tracking') THEN
    ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all select" ON order_tracking;
    DROP POLICY IF EXISTS "Allow all insert" ON order_tracking;
    DROP POLICY IF EXISTS "Allow all update" ON order_tracking;
    DROP POLICY IF EXISTS "Allow all delete" ON order_tracking;
  END IF;
END $do$;

DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all select" ON invoices;
    DROP POLICY IF EXISTS "Allow all insert" ON invoices;
    DROP POLICY IF EXISTS "Allow all update" ON invoices;
    DROP POLICY IF EXISTS "Allow all delete" ON invoices;
  END IF;
END $do$;

DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoice_items') THEN
    ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all select" ON invoice_items;
    DROP POLICY IF EXISTS "Allow all insert" ON invoice_items;
    DROP POLICY IF EXISTS "Allow all update" ON invoice_items;
    DROP POLICY IF EXISTS "Allow all delete" ON invoice_items;
  END IF;
END $do$;

DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_log') THEN
    ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all select" ON activity_log;
    DROP POLICY IF EXISTS "Allow all insert" ON activity_log;
    DROP POLICY IF EXISTS "Allow all update" ON activity_log;
    DROP POLICY IF EXISTS "Allow all delete" ON activity_log;
  END IF;
END $do$;

DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all select" ON clients;
    DROP POLICY IF EXISTS "Allow all insert" ON clients;
    DROP POLICY IF EXISTS "Allow all update" ON clients;
    DROP POLICY IF EXISTS "Allow all delete" ON clients;
  END IF;
END $do$;

DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all select" ON users;
    DROP POLICY IF EXISTS "Allow all insert" ON users;
    DROP POLICY IF EXISTS "Allow all update" ON users;
    DROP POLICY IF EXISTS "Allow all delete" ON users;
  END IF;
END $do$;

DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pricing_rules') THEN
    ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
  END IF;
END $do$;

DO $do$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sync_log') THEN
    ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;
  END IF;
END $do$;

-- ============================================================
-- SECURITY DEFINER RPCs for public tracking access
-- (uses $func$ to avoid confusion with $do$ above)
-- ============================================================
DROP FUNCTION IF EXISTS get_order_by_tracking_id(text);

CREATE OR REPLACE FUNCTION get_order_by_tracking_id(tracking_id text)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $func$
  SELECT * FROM orders WHERE id = tracking_id::uuid;
$func$;

ALTER FUNCTION get_order_by_tracking_id OWNER TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_by_tracking_id TO anon, authenticated;

DROP FUNCTION IF EXISTS get_my_orders(text);

CREATE OR REPLACE FUNCTION get_my_orders(phone text)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $func$
  SELECT * FROM orders
  WHERE customer_phone ILIKE '%' || phone || '%'
     OR whatsapp_number ILIKE '%' || phone || '%'
  ORDER BY created_at DESC;
$func$;

ALTER FUNCTION get_my_orders OWNER TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_orders TO anon, authenticated;

-- ============================================================
-- تم بحمد الله — RLS Consolidated v2.7.0
-- ============================================================
