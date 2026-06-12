-- ============================================================
-- Seed Full — Data + Schema migration for Injaz v2.5.0
-- Run ONCE in Supabase Dashboard SQL Editor.
-- Safe for repeated execution (uses IF NOT EXISTS / DO $$).
-- ============================================================

-- ============================================================
-- 1. MIGRATION: Add category_id to inventory_items
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'category_id'
  ) THEN
    EXECUTE 'ALTER TABLE inventory_items ADD COLUMN category_id text REFERENCES services(id) ON DELETE SET NULL';
    RAISE NOTICE 'Added category_id column to inventory_items';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category_id);

-- ============================================================
-- 2. SEED: Services (5 categories + children + backward compat)
--    Uses ON CONFLICT DO NOTHING — safe to re-run
-- ============================================================
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
-- 2.1 Software & Digital Solutions
('cat-software', 'الحلول البرمجية والرقمية', 'Software & Digital Solutions', 'برمجة وتطوير مواقع الويب وأنظمة المبيعات، وتطبيقات الهواتف الذكية - حلول رقمية متكاملة للشركات والمؤسسات', 'Web development & sales systems, mobile app development - complete digital solutions for businesses', '💻', 2000, NULL),
('software-web', 'برمجة وتطوير مواقع الويب وأنظمة المبيعات', 'Web Development & Sales Systems', 'تصميم وبرمجة مواقع ويب احترافية وأنظمة مبيعات متكاملة مع لوحات تحكم إلكترونية وحلول تجارة إلكترونية مخصصة', 'Professional web design and development, integrated sales systems with dashboards and custom e-commerce solutions', '🌐', 2000, 'cat-software'),
('software-mobile', 'برمجة وتطوير تطبيقات الهواتف الذكية', 'Mobile App Development', 'تصميم وبرمجة تطبيقات موبايل (iOS/Android) احترافية مع واجهات مستخدم مبتكرة وحلول متكاملة حسب الطلب', 'Professional mobile app development (iOS/Android) with innovative UIs and custom integrated solutions', '📱', 1500, 'cat-software'),

-- 2.2 Flags, Stands & Advertising Boards
('cat-media', 'الأعلام والستاندات واللوحات الإعلانية', 'Flags, Stands & Advertising Boards', 'أعلام مكاتب وصالات فردي ومزدوج وكبير، أشرعة خارجية، لافتات ثابتة وضوئية LED وألواح PVC، وستاندات عرض A3 متنوعة وإكس ستاند ورول اب', 'Single/double/large desk flags, outdoor sails, fixed & LED signs, PVC boards, A3 display stands, X-stands and roll-up stands', '🚩', 250, NULL),
('media-flag-single', 'علم مكتبة وصالات فردي صغير', 'Small Single Desk & Hall Flag', 'علم مكتبي وصالات فردي صغير بخامات عالية الجودة مع قاعدة متينة وطباعة شعار المؤسسة أو الدولة', 'Small single desk and hall flag with high-quality materials, sturdy base and logo printing', '🚩', 35, 'cat-media'),
('media-flag-double', 'علم مكتبة وصالات مزدوج (علمين بقاعدة واحدة)', 'Double Desk & Hall Flag (Two Flags One Base)', 'علم مكتبي مزدوج علمين على قاعدة واحدة لعرض علم الدولة وعلم المؤسسة جنباً إلى جنب', 'Double desk flag with two flags on one base for national and corporate flags', '🎌', 55, 'cat-media'),
('media-flag-large', 'علم مكتبة وصالات كبير بحامل فاخر', 'Large Desk & Hall Flag with Premium Stand', 'علم مكتبي كبير 90×150 سم مع حامل أرضي فاخر وقاعدة ثقيلة للصالات والفعاليات', 'Large desk flag 90×150cm with premium floor stand and heavy base for halls and events', '🇪🇭', 180, 'cat-media'),
('media-outdoor-sail', 'شراع خارجي للواجهات ولافتات ثابتة وضوئية LED وألواح PVC', 'Outdoor Sail, Fixed & LED Signs, PVC Boards', 'شراع إعلاني خارجي، لافتات ثابتة للمحلات، لافتات ضوئية LED، ألواح PVC للطباعة الرقمية', 'Outdoor advertising sail, fixed shop signs, LED signs, PVC boards for digital printing', '🪧', 350, 'cat-media'),
('media-sign-fixed', 'لافتات ثابتة للواجهات والمحلات', 'Fixed Signs for Shop Fronts & Offices', 'لافتات ثابتة للواجهات والمحلات من الأكريليك والمعدن وPVC بطباعة UV احترافية', 'Fixed facade and shop signs in acrylic, metal and PVC with professional UV printing', '🪧', 180, 'cat-media'),
('media-sign-light', 'لافتات ضوئية متحركة وحروف بارزة LED', 'Lighted Signs & LED Raised Letters', 'لافتات ضوئية LED داخلية وخارجية مع حروف بارزة وإضاءة متحركة للمحلات والعلامات التجارية', 'Internal/external LED signs with raised illuminated letters for shops and brands', '💡', 350, 'cat-media'),
('media-pvc-board', 'طباعة ألواح PVC للإعلانات', 'PVC Board Advertising Printing', 'طباعة رقمية مباشرة على ألواح PVC بسماكات مختلفة للوحات الداخلية والخارجية', 'Direct digital printing on PVC boards in various thicknesses for indoor/outdoor displays', '🧱', 100, 'cat-media'),
('stand-x-mini-a3', 'إكس ستاند مكتبي مصغر A3 (طباعة + هيكل)', 'Mini Desk X-Stand A3 (Print + Frame)', 'إكس ستاند مكتبي مصغر A3 للمكاتب والاستقبال - طباعة ملونة مع هيكل بلاستيكي متين', 'Mini desk X-stand A3 for offices and reception - color print with durable plastic frame', '🖼️', 80, 'cat-media'),
('stand-a3-acrylic', 'حامل مكاتب A3 أكريليك شفاف مائل فاخر', 'Premium Slanted Acrylic A3 Desk Holder', 'حامل عرض A3 أكريليك شفاف مائل فاخر يعرض البوسترات والصور بشكل أنيق', 'Slanted clear acrylic A3 desk holder elegantly displays posters and photos', '🪟', 90, 'cat-media'),
('stand-a3-mesh', 'ستاند A3 شبكي معدني متعدد الأرفف للمطويات', 'Multi-Shelf Metal Mesh A3 Stand', 'ستاند A3 شبكي معدني متعدد الأرفف والجيوب لعرض المطويات والكتيبات بشكل منظم', 'Multi-shelf metal mesh A3 stand with pockets for organized brochure display', '🏗️', 150, 'cat-media'),
('stand-x-large', 'إكس ستاند كبير للصالات والمعارض (طباعة + هيكل)', 'Large X-Stand for Halls (Print + Frame)', 'إكس ستاند كبير مع طباعة رقمية عالية الجودة وهيكل ألمنيوم متين قابل للطي', 'Large X-stand with high-quality digital print and durable foldable aluminum frame', '🖼️', 250, 'cat-media'),
('stand-roll-up', 'رول اب ستاند فاخر مع ماكينة ألومنيوم (طباعة + ماكينة)', 'Premium Roll-up Stand with Aluminum Machine', 'رول اب ستاند فاخر مع ماكينة ألومنيوم داخلية وطباعة على قماش البنر المطاطي', 'Premium roll-up stand with internal aluminum machine and stretch banner fabric print', '📜', 450, 'cat-media'),

-- 2.3 Awards & Premium Nameplates
('cat-awards', 'الأوسمة والدروع ولوحات الأسماء الفاخرة', 'Awards & Premium Nameplates', 'دروع أكريليك، خشب وجلد، ميداليات تذكارية، أوسمة، مسميات مكاتب كريستال وخشب، براويز وشهادات فاخرة', 'Acrylic, wood and leather shields, commemorative medals, pins, crystal and wood desk nameplates, frames and premium certificates', '🏆', 100, NULL),
('shields-wood-crystal-leather', 'دروع (أكريليك، خشب، جلد) مع قاعدة', 'Shields (Acrylic, Wood, Leather) with Base', 'دروع أكريليك وخشب وجلد فاخرة بقاعدة خشبية أو كريستال شفافة مع إمكانية حفر الليزر أو طباعة UV', 'Premium acrylic, wood and leather shields with wooden or crystal clear base, laser engraving or UV printing available', '🛡️', 150, 'cat-awards'),
('souvenirs-medals', 'ميداليات تذكارية وأوسمة', 'Commemorative Medals & Pins', 'ميداليات تذكارية معدنية أو بلاستيكية مع شريط تعليق، وأوسمة بروش مع صندوق عرض فاخر', 'Metal or plastic commemorative medals with hanging ribbon, and brooch pins with premium display box', '🎖️', 30, 'cat-awards'),

-- 2.4 Gifts, Specialized & Food Printing
('cat-gifts', 'الهدايا والتخصصي وطباعة الطعام', 'Gifts, Specialized & Food Printing', 'هدايا دعائية واكسسوارات شخصية، ساعات، أكواب، مطبوعات غذائية صالحة للأكل', 'Promotional gifts, personal accessories, watches, cups, edible food prints', '🎁', 50, NULL),

-- 2.5 Packaging & Paper Products
('cat-papers', 'التغليف والمنتجات الورقية المتقدمة', 'Packaging & Advanced Paper Products', 'صناديق تغليف هدايا ومواد غذائية، أكياس ورقية وبلاستيكية، مطبوعات تجارية وكرتون مموج', 'Gift and food packaging boxes, paper and plastic bags, commercial prints and corrugated cardboard', '📦', 100, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. SEED: Inventory items (25+ items) with category_id
-- ============================================================
INSERT INTO inventory_items (id, name_ar, name_en, category, category_id, quantity, unit_price, cost_price)
SELECT gen_random_uuid(), name_ar, name_en, category, category_id, quantity, unit_price, cost_price
FROM (VALUES
  ('قالب درع كريستال شفاف', 'Clear Crystal Shield Mold', 'خامات دروع', 'cat-awards', 100, 200, 90),
  ('قالب درع خشب طبيعي', 'Natural Wood Shield Mold', 'خامات دروع', 'cat-awards', 100, 180, 80),
  ('قالب درع جلد فاخر', 'Premium Leather Shield Mold', 'خامات دروع', 'cat-awards', 100, 250, 120),
  ('طقم شموع خام 3 قطع', 'Raw Candle Set 3 Pcs', 'خامات هدايا', 'cat-gifts', 100, 150, 60),
  ('ميدالية معدنية فارغة', 'Blank Metal Medal', 'خامات ميداليات', 'cat-awards', 100, 25, 10),
  ('ميدالية بلاستيكية فارغة', 'Blank Plastic Medal', 'خامات ميداليات', 'cat-awards', 100, 15, 5),
  ('إطار صورة معدني مقاس A4', 'Metal Photo Frame A4', 'براويز', 'cat-awards', 100, 50, 20),
  ('إطار صورة زجاجي مقاس A4', 'Glass Photo Frame A4', 'براويز', 'cat-awards', 100, 35, 12),
  ('فينيل لاصق واجهات رول', 'Adhesive Vinyl Facade Roll', 'خامات فينيل', 'cat-media', 100, 250, 100),
  ('فينيل حراري للملابس رول', 'Heat Transfer Vinyl Roll', 'خامات فينيل', 'cat-media', 100, 300, 130),
  ('غلاف شهادات قماشي فخم', 'Premium Fabric Certificate Cover', 'خامات شهادات', 'cat-awards', 100, 40, 15),
  ('ورق قطني قماشي للطباعة رول', 'Cotton Canvas Printing Roll', 'خامات طباعة', 'cat-media', 100, 150, 65),
  ('ورق كروت 300 جرام', '300g Card Paper', 'خامات ورقية', 'cat-papers', 100, 35, 12),
  ('كيس ورقي هدايا فاخر', 'Luxury Paper Gift Bag', 'خامات تعبئة', 'cat-papers', 100, 15, 5),
  ('ورق ستيكر مقوى لاصق', 'Reinforced Adhesive Sticker Paper', 'خامات ملصقات', 'cat-media', 100, 45, 18),
  ('قاعدة علم مكتبية بلاستيك', 'Plastic Desk Flag Base', 'خامات أعلام', 'cat-media', 100, 12, 4),
  ('قاعدة علم مكتبية معدنية', 'Metal Desk Flag Base', 'خامات أعلام', 'cat-media', 100, 25, 10),
  ('حامل أعلام أرضي فاخر', 'Premium Floor Flag Stand', 'خامات أعلام', 'cat-media', 100, 80, 35),
  ('ورق ترانسفير شوكولاتة A4', 'Choco Transfer Paper A4', 'خامات طباعة غذائية', 'cat-gifts', 100, 15, 5),
  ('هيكل إكس ستاند كبير', 'Large X-Stand Frame', 'خامات ستاندات', 'cat-media', 100, 100, 40),
  ('هيكل إكس ستاند مكتبي مصغر A3', 'Mini Desk X-Stand A3 Frame', 'خامات ستاندات', 'cat-media', 100, 35, 12),
  ('ماكينة رول أب ألومنيوم', 'Aluminum Roll-up Machine', 'خامات ستاندات', 'cat-media', 100, 200, 90),
  ('قاعدة ستاند A3 تلسكوبية معدنية', 'A3 Telescopic Metal Stand Base', 'خامات ستاندات', 'cat-media', 100, 60, 25),
  ('قالب أكريليك A3 مائل', 'Slanted Acrylic A3 Mold', 'خامات ستاندات', 'cat-media', 100, 40, 15),
  ('هيكل ستاند شبكي A3', 'A3 Mesh Stand Frame', 'خامات ستاندات', 'cat-media', 100, 55, 22)
) AS t(name_ar, name_en, category, category_id, quantity, unit_price, cost_price)
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_items WHERE name_ar = t.name_ar
);

-- ============================================================
-- 4. Backward-compat entries (old IDs still referenced by pricing)
-- ============================================================
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('shields-gifts', 'أوسمة، دروع، هدايا، ميداليات، مسميات', 'Shields, Gifts, Medals, Nameplates', 'القسم القديم — للتوافق مع الإصدارات السابقة', 'Legacy section — backward compatibility', '🏆', 100, 'cat-awards'),
('nameplates', 'لوحات الأسماء (كريستال، خشب، برواز)', 'Nameplates (Crystal, Wood, Frame)', 'القسم القديم — للتوافق', 'Legacy section — compatibility', '📛', 80, 'cat-awards'),
('signs-boards', 'اللوحات الإعلانية والهندسة', 'Signs & Billboard Engineering', 'القسم القديم — للتوافق', 'Legacy section — compatibility', '🪧', 350, 'cat-media'),
('prints-boards', 'المطبوعات واللوحات الورقية', 'Prints & Paper Boards', 'القسم القديم — للتوافق', 'Legacy section — compatibility', '📝', 50, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- تم بحمد الله
-- ============================================================
