-- ============================================================
-- RLS: قراءة عامة فقط — خدمات + مخزون
-- يسمح للجميع SELECT ويمنع INSERT/UPDATE/DELETE
-- ============================================================

-- ============================================================
-- 1. services — قراءة عامة فقط
-- ============================================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all select" ON services;
DROP POLICY IF EXISTS "Allow all insert" ON services;
DROP POLICY IF EXISTS "Allow all update" ON services;
DROP POLICY IF EXISTS "Allow all delete" ON services;
DROP POLICY IF EXISTS "Public can read services" ON services;

CREATE POLICY "Public can read services"
  ON services
  FOR SELECT
  USING (true);

-- ============================================================
-- 2. inventory_items — إزالة الصلاحيات القديمة، ثم قراءة فقط
-- ============================================================
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all select" ON inventory_items;
DROP POLICY IF EXISTS "Allow all insert" ON inventory_items;
DROP POLICY IF EXISTS "Allow all update" ON inventory_items;
DROP POLICY IF EXISTS "Allow all delete" ON inventory_items;
DROP POLICY IF EXISTS "Public can read inventory" ON inventory_items;

CREATE POLICY "Public can read inventory"
  ON inventory_items
  FOR SELECT
  USING (true);
