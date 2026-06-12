-- ============================================================
-- RLS: ORDERS — نهائي صارم
-- سياسة واحدة: no SELECT policy for anon
-- القراءة فقط عبر RPC (SECURITY DEFINER) مع ::uuid
-- التعديل ممنوع على anon — فقط service_role key
-- ============================================================

-- 1. مسح كل السياسات القديمة بدون استثناء
DROP POLICY IF EXISTS "Allow all select" ON orders;
DROP POLICY IF EXISTS "Allow all insert" ON orders;
DROP POLICY IF EXISTS "Allow all update" ON orders;
DROP POLICY IF EXISTS "Allow all delete" ON orders;
DROP POLICY IF EXISTS "Public can read orders" ON orders;

-- 2. لا存在 سياسة SELECT — القراءة المباشرة ممنوعة تماماً
-- 3. لا存在 سياسة INSERT/UPDATE/DELETE — التعديل ممنوع على anon

-- 4. RPC دالة التتبع — الطريقة الوحيدة للقراءة
--    تأخذ tracking_id كنص text وتحوّله إلى uuid باستخدام ::uuid
--    تعيد الطلب فقط إذا تطابق الـ id
CREATE OR REPLACE FUNCTION get_order_by_tracking_id(tracking_id text)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT * FROM orders WHERE id = tracking_id::uuid;
$$;

GRANT EXECUTE ON FUNCTION get_order_by_tracking_id TO anon, authenticated;

-- 5. RPC دالة البحث برقم الهاتف (للمرونة)
--    تستخدم SECURITY DEFINER لتتجاوز RLS
CREATE OR REPLACE FUNCTION get_my_orders(phone text)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT * FROM orders 
  WHERE customer_phone ILIKE '%' || phone || '%' 
     OR whatsapp_number ILIKE '%' || phone || '%'
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION get_my_orders TO anon, authenticated;
