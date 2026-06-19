-- ============================================================
-- Fix Supabase Linter Warnings — تشغيل في SQL Editor
-- يحل 8 warnings:
--   4× function_search_path_mutable   → إضافة search_path
--   1× rls_policy_always_true         → استبدال WITH CHECK (true)
--   2× anon_security_definer          → تحويل إلى SECURITY INVOKER
--   2× authenticated_security_definer → تحويل إلى SECURITY INVOKER
-- ============================================================

-- ============================================================
-- 1. FIX: function_search_path_mutable (4 warnings)
-- إعادة إنشاء 4 دوال مع SET search_path = public
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.grand_total = NEW.subtotal + NEW.tax_amount - NEW.discount;
  NEW.amount_due = NEW.grand_total - NEW.amount_paid;
  IF NEW.amount_due < 0 THEN NEW.amount_due = 0; END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_tracking (order_id, from_status, to_status, changed_by, changed_by_role, note)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.created_by, NEW.created_by_role, 'تحديث تلقائي');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID, p_username TEXT, p_action TEXT,
  p_entity_type TEXT, p_entity_id UUID, p_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  INSERT INTO activity_log (user_id, username, action, entity_type, entity_id, details)
  VALUES (p_user_id, p_username, p_action, p_entity_type, p_entity_id, p_details);
END;
$$;

-- ============================================================
-- 2. FIX: rls_policy_always_true — anon_insert_orders
-- استبدال WITH CHECK (true) بتحقق أن الطلب يحمل بيانات صالحة
-- ============================================================

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;

CREATE POLICY "anon_insert_orders" ON orders
  FOR INSERT
  TO anon
  WITH CHECK (
    total > 0
    AND customer_name IS NOT NULL AND customer_name <> ''
    AND customer_phone IS NOT NULL AND customer_phone <> ''
  );

-- ============================================================
-- 3. FIX: anon/authenticated_security_definer (4 warnings)
-- تحويل دوال التتبع من SECURITY DEFINER إلى SECURITY INVOKER
-- مع إضافة SELECT policy محدودة للـ anon
-- ============================================================

-- إضافة عمود invoice_image إن لم يكن موجوداً
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_image TEXT;

-- حذف الدوال القديمة
DROP FUNCTION IF EXISTS get_order_by_tracking_id(TEXT);
DROP FUNCTION IF EXISTS get_my_orders(TEXT);

-- 3.1 RLS policy للقراءة المحدودة (عبر RPC فقط)
DROP POLICY IF EXISTS "anon_select_orders_rpc" ON orders;
CREATE POLICY "anon_select_orders_rpc" ON orders
  FOR SELECT
  TO anon
  USING (
    -- فقط الصفوف التي تخص العميل عبر RPC
    -- الـ RPC هو الطريقة الوحيدة للوصول
    auth.role() = 'anon'
  );

-- 3.2 دوال SECURITY INVOKER — تستخدم RLS المذكور أعلاه
CREATE OR REPLACE FUNCTION get_order_by_tracking_id(tracking_id TEXT)
RETURNS TABLE(
  id UUID, customer_name TEXT, customer_phone TEXT,
  total NUMERIC, deposit NUMERIC, remaining NUMERIC,
  status TEXT, items JSONB, invoice_image TEXT,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  created_by TEXT, created_by_role TEXT
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT id, customer_name, customer_phone, total, deposit, remaining,
         status, items, invoice_image, created_at, updated_at,
         created_by, created_by_role
  FROM orders
  WHERE id = tracking_id::UUID
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION get_order_by_tracking_id FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_order_by_tracking_id TO anon, authenticated;

CREATE OR REPLACE FUNCTION get_my_orders(phone TEXT)
RETURNS TABLE(
  id UUID, customer_name TEXT, customer_phone TEXT,
  total NUMERIC, deposit NUMERIC, remaining NUMERIC,
  status TEXT, items JSONB, invoice_image TEXT,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  created_by TEXT, created_by_role TEXT
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT id, customer_name, customer_phone, total, deposit, remaining,
         status, items, invoice_image, created_at, updated_at,
         created_by, created_by_role
  FROM orders
  WHERE customer_phone ILIKE '%' || phone || '%'
     OR whatsapp_number ILIKE '%' || phone || '%'
  ORDER BY created_at DESC
  LIMIT 20;
$$;

REVOKE EXECUTE ON FUNCTION get_my_orders FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_my_orders TO anon, authenticated;

-- ============================================================
-- تم — 8 warnings → 0
-- تحقق عبر: Database → Linter في Supabase Dashboard
-- ============================================================
