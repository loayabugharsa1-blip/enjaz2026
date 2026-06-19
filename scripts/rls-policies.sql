-- تشغيل هذا الأمر في Supabase SQL Editor
-- يضيف RLS policies للمستخدم العام (anon key)
-- حتى لو تجاوز أحد الـ Proxy، يبقى محمياً

-- 1. تفعيل RLS على كل الجداول
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

-- 2. مسح السياسات القديمة (إن وجدت)
DROP POLICY IF EXISTS "anon_read_services" ON services;
DROP POLICY IF EXISTS "anon_read_inventory" ON inventory_items;
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "anon_read_orders" ON orders;
DROP POLICY IF EXISTS "anon_read_portfolio" ON portfolio;

-- 3. الخدمات: للقراءة فقط (العامة)
CREATE POLICY "anon_read_services"
  ON services FOR SELECT
  TO anon
  USING (true);

-- 4. المخزون: لا يمكن للعامة القراءة أو الكتابة
-- (يتم التحكم به عبر الـ Proxy فقط)
CREATE POLICY "anon_no_access_inventory"
  ON inventory_items FOR ALL
  TO anon
  USING (false);

-- 5. الطلبات: يمكن للعامة الإدراج فقط (تقديم طلب جديد)
-- الـ middleware يمنع الطلبات غير الموثقة أصلاً
-- الـ WITH CHECK يضمن صحة البيانات كطبقة دفاع ثانية
CREATE POLICY "anon_insert_orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (
    total > 0
    AND customer_name IS NOT NULL AND customer_name <> ''
    AND customer_phone IS NOT NULL AND customer_phone <> ''
  );

-- 6. الطلبات: لا يمكن للعامة القراءة
-- (يتم التحكم به عبر الـ Proxy فقط)
CREATE POLICY "anon_no_read_orders"
  ON orders FOR SELECT
  TO anon
  USING (false);

-- 7. بورتفوليو: للقراءة فقط
CREATE POLICY "anon_read_portfolio"
  ON portfolio FOR SELECT
  TO anon
  USING (true);

-- 8. المستخدمين: منع الوصول تماماً
CREATE POLICY "anon_no_access_users"
  ON users FOR ALL
  TO anon
  USING (false);

-- 9. الفواتير: منع الوصول
CREATE POLICY "anon_no_access_invoices"
  ON invoices FOR ALL
  TO anon
  USING (false);
CREATE POLICY "anon_no_access_invoice_items"
  ON invoice_items FOR ALL
  TO anon
  USING (false);

-- 10. تتبع الطلبات: منع الوصول
CREATE POLICY "anon_no_access_tracking"
  ON order_tracking FOR ALL
  TO anon
  USING (false);
