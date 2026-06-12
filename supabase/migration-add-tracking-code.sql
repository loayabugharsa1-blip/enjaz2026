-- إضافة عمود tracking_code لجدول الطلبات
-- الرمز مشتق من UUID لكن وجوده في قاعدة البيانات يسهل البحث والفهرسة

alter table if exists orders add column if not exists tracking_code text;

-- تعبئة القيم للأوامر الموجودة
update orders set tracking_code = 'ENJ-' || (
  (('x' || substr(replace(id::text, '-', ''), 1, 8))::bit(32)::int % 90000 + 10000)::text
) where tracking_code is null;

create index if not exists idx_orders_tracking_code on orders (tracking_code);
