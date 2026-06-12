-- ============================================================
-- Migration v2: شجرة الخدمات المحدثة + مستهلكات المخزن
-- استخدم ON CONFLICT DO NOTHING لضمان عدم التعارض
-- ============================================================

-- 1. إنشاء جدول services إن لم يكن موجوداً
CREATE TABLE IF NOT EXISTS services (
  id text primary key,
  title_ar text not null,
  title_en text not null,
  description_ar text not null default '',
  description_en text not null default '',
  icon text not null default '📦',
  base_price numeric(10,2) not null default 0,
  parent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS idx_services_parent ON services(parent_id);

-- 2. التصنيفات الرئيسية (Parents) 
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('cat-awards', 'دروع التكريم والمسميات الإدارية الفاخرة', 'Awards & Premium Administrative Nameplates', 'دروع تكريم فاخرة وخشب وكريستال وجلد، مسميات مكاتب وأبواب وحوائط فاخرة، ورتب عسكرية للمناسبات الرسمية بتصاميم محترفة ونقش ليزر', 'Premium crystal, wood & leather honor shields, luxury desk/door/wall nameplates, military rank shields for official events with professional laser engraving', '🏆', 200, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('cat-gifts', 'الهدايا التذكارية والطباعة التخصصية', 'Souvenir Gifts & Specialized Printing', 'أطقم شموع مناسبات، طباعة حرارية على الميداليات والأكواب والتيشيرتات، براويز صور، قص فينيل لاصق وحراري، وطباعة غذائية بورق السكر والترانسفير والويفر', 'Event candle sets, heat printing on medals/cups/t-shirts, photo frames, adhesive & heat vinyl cutting, edible printing on sugar sheets, choco transfer & wafer paper', '🎁', 150, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('cat-papers', 'التعبئة والتغليف والمطبوعات الورقية الفاخرة', 'Packaging & Premium Paper Prints', 'شهادات شكر قماشية فاخرة، طباعة على ورق قطني كانفاس، كروت تعريف شخصية 300 جرام وجه ووجهين، أكياس ورقية هدايا، ملصقات مقواة، مطويات، كتيبات، ومخططات كوبيست هندسية', 'Premium fabric certificates, canvas cotton paper printing, 300g ID cards single/double side, luxury paper gift bags, reinforced stickers, brochures, booklets & engineering copiest plans', '📄', 80, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('cat-media', 'الأعلام واللوحات الإعلانية والحلول البرمجية', 'Flags, Advertising Boards & Software Solutions', 'أعلام مكاتب وصالات فردي ومزدوج وكبير، أشرعة خارجية، لافتات ثابتة وضوئية LED، ألواح PVC، وحلول برمجة مواقع الويب وتطبيقات الموبايل', 'Desk and hall flags single/double/large, outdoor sails, fixed & LED light signs, PVC boards, and web/mobile app development solutions', '🚩', 250, NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. الخدمات الفرعية تحت cat-awards
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('award-shield', 'دروع تكريم فاخرة (كريستال / خشب / جلد)', 'Premium Honor Shields (Crystal / Wood / Leather)', 'دروع تكريم فاخرة مصنوعة من الكريستال الشفاف أو الخشب الطبيعي أو الجلد الفاخر مع نقش ليزر دقيق وشعار المؤسسة - مثالية للتكريم والجوائز والمناسبات الرسمية', 'Premium honor shields in clear crystal, natural wood or fine leather with precision laser engraving and company logo - perfect for awards and official events', '🪵', 200, 'cat-awards')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('award-nameplate-desk', 'مسميات مكاتب وعناوين فاخرة (خشب وكريستال)', 'Premium Desk Nameplates (Wood & Crystal)', 'مسميات مكاتب فاخرة من الخشب والكريستال مع نقش ليزر دقيق للأسماء والمسميات الوظيفية - للمديرين والموظفين بمظهر احترافي وأنيق', 'Premium desk nameplates in wood and crystal with precision laser engraving for names and titles - for managers and staff with professional elegant look', '💎', 120, 'cat-awards')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('award-nameplate-door', 'مسميات أبواب وحوائط (وجه واحد أو وجهين جداري)', 'Door & Wall Nameplates (Single/Double Side)', 'مسميات مكاتب وأبواب وحوائط وجه واحد للمكاتب الأمامية أو وجهين جداري للقاعات والممرات - بخامات الأكريليك والمعدن', 'Door and wall nameplates, single-side for front offices or double-side for halls and corridors - in acrylic and metal materials', '🚪', 80, 'cat-awards')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('award-military-rank', 'دروع الرتب العسكرية والمناسبات الرسمية الفاخرة', 'Military Rank Shields & Official Ceremony Shields', 'دروع الرتب العسكرية الميدانية والمناسبات الرسمية بتصميم خاص ونقش ليزر دقيق مع شعار الدولة والمؤسسة - لهيئة التكريم العسكري', 'Military field rank shields and official ceremony shields with custom design and precise engraving with national and institutional logos - for military honor boards', '🎖️', 350, 'cat-awards')
ON CONFLICT (id) DO NOTHING;

-- 4. الخدمات الفرعية تحت cat-gifts
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('gift-candle-set', 'طقم شموع مناسبات ثلاثي (طباعة حرارية وتزيين)', 'Triple Event Candle Set (Heat Print & Decoration)', 'طقم شموع مناسبات فاخر مكون من 3 قطع مع طباعة حرارية مخصصة للصور والشعارات وتزيين فني - هدية مثالية للمناسبات والأفراح والتكريم', 'Luxury 3-piece event candle set with custom heat printing for photos and logos with artistic decoration - perfect gift for events, weddings and honors', '🕯️', 150, 'cat-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('gift-medal-print', 'طباعة حرارية على الميداليات التذكارية (معدن وبلاستيك)', 'Heat Printing on Souvenir Medals (Metal & Plastic)', 'طباعة حرارية احترافية على الميداليات التذكارية المعدنية والبلاستيكية لنقل الصور والشعارات بدقة عالية وثبات لوني ممتاز', 'Professional heat printing on metal and plastic souvenir medals for transferring images and logos with high precision and excellent color fastness', '🏅', 80, 'cat-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('gift-photo-frame', 'إطارات وبراويز صور معدنية وزجاجية بكافة المقاسات', 'Metal & Glass Photo Frames All Sizes', 'إطارات وبراويز صور فاخرة من المعدن والزجاج بجميع المقاسات مع طباعة وحفر ليزر للصور الشخصية والشعارات للمكاتب والمنازل', 'Luxury metal and glass photo frames in all sizes with printing and laser engraving for personal photos and logos for offices and homes', '🖼️', 100, 'cat-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('gift-vinyl-cutting', 'خدمات قص الفينيل اللاصق والحراري (للواجهات والملابس)', 'Adhesive & Heat Vinyl Cutting (Facades & Apparel)', 'قص فينيل لاصق للواجهات والزجاج وفينيل حراري للملابس والتيشيرتات بأحرف وتصاميم مخصصة بجودة احترافية', 'Adhesive vinyl cutting for facades and glass, heat vinyl for apparel and t-shirts with custom letters and designs at professional quality', '✂️', 120, 'cat-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('gift-heat-print-general', 'المطبوعات الحرارية العامة وقسم الطباعة الغذائية', 'General Heat Printing & Food Printing', 'طباعة حرارية على الأكواب والتيشيرتات والسيراميك، طباعة غذائية على ورق السكر وورق ترانسفير الشوكولاتة وورق الويفر لتزيين الكيك والحلويات', 'Heat printing on cups, t-shirts and ceramics; edible printing on sugar sheets, choco transfer paper and wafer paper for cake and dessert decoration', '🧁', 60, 'cat-gifts')
ON CONFLICT (id) DO NOTHING;

-- 5. الخدمات الفرعية تحت cat-papers
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('paper-certificate-fabric', 'شهادات شكر وتقدير فاخرة داخل غلاف قماشي فخم', 'Premium Fabric Certificate in Luxury Fabric Cover', 'شهادات شكر وتقدير فاخرة مطبوعة على ورق فاخر ومقدمة داخل غلاف قماشي فخم مع شريط - مثالية لتكريم الموظفين والشركاء في المؤسسات', 'Premium appreciation certificates printed on fine paper presented in a luxurious fabric cover with ribbon - perfect for employee and partner recognition', '📜', 100, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('paper-canvas-print', 'طباعة على ورق قطني قماشي تخصصي للوحات الفنية (Canvas)', 'Art Canvas Printing on Specialty Cotton Paper', 'طباعة رقمية عالية الجودة على ورق قطني قماشي تخصصي (كانفاس) للوحات الفنية والصور الشخصية والديكور المكتبي بمقاسات مختلفة', 'High-quality digital printing on specialty cotton canvas paper for art pieces, personal photos and office decor in various sizes', '🎨', 200, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('paper-id-single', 'كروت تعريف شخصية وزن 300 جرام (طباعة وجه واحد)', '300g ID Cards (Single-Side Print)', 'كروت تعريف شخصية فاخرة من ورق الكروت 300 جرام مع طباعة وجه واحد عالية الجودة - مناسبة للتعريف الشخصي والبطاقات الوظيفية', 'Premium ID cards made of 300g card paper with single-side high-quality printing - suitable for personal identification and business cards', '🪪', 25, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('paper-id-double', 'كروت تعريف شخصية وزن 300 جرام (طباعة وجهين)', '300g ID Cards (Double-Side Print)', 'كروت تعريف شخصية فاخرة من ورق الكروت 300 جرام مع طباعة وجهين كاملتين بالملون مع إمكانية إضافة شعار وصورة', 'Premium ID cards from 300g card paper with full double-sided color printing with option to add logo and photo', '🆔', 35, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('paper-gift-bag', 'طباعة أكياس ورقية فاخرة للهدايا والمحلات التجارية', 'Luxury Paper Gift Bags Printing', 'أكياس ورقية فاخرة للهدايا والمحلات التجارية والمولات بطباعة مخصصة للشعارات والتصاميم بمقاسات وخامات متعددة', 'Luxury paper gift bags for shops and malls with custom logo and design printing in multiple sizes and materials', '🛍️', 50, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('paper-stickers-more', 'ملصقات وستيكرات مقواة ومطويات وكتيبات ومخططات كوبيست', 'Reinforced Stickers, Brochures, Booklets & Copiest Plans', 'ملصقات وستيكرات مقواة مقاومة للقطع، مطويات وبروشورات دعائية، كتيبات متعددة الصفحات، ومخططات كوبيست هندسية ملونة وأسود', 'Reinforced cut-resistant stickers, promotional brochures and flyers, multi-page booklets, and engineering copiest plans in color and B&W', '📑', 30, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

-- 6. الخدمات الفرعية تحت cat-media
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('media-flag-single', 'علم مكتبة وصالات فردي صغير', 'Small Single Desk & Hall Flag', 'علم مكتبي وصالات فردي صغير بخامات عالية الجودة مع قاعدة متينة وطباعة شعار المؤسسة أو الدولة - للمكاتب التنفيذية والغرف', 'Small single desk and hall flag with high-quality materials, sturdy base and logo/national flag printing for executive offices and rooms', '🚩', 35, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('media-flag-double', 'علم مكتبة وصالات مزدوج (علمين بقاعدة واحدة)', 'Double Desk & Hall Flag (Two Flags One Base)', 'علم مكتبي مزدوج علمين على قاعدة واحدة للمكاتب والصالات لعرض علم الدولة وعلم المؤسسة جنباً إلى جنب بمظهر راق', 'Double desk flag with two flags on one base for offices and halls displaying national and corporate flags side by side in elegant style', '🎌', 55, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('media-flag-large', 'علم مكتبة وصالات كبير بحامل فاخر', 'Large Desk & Hall Flag with Premium Stand', 'علم مكتبي كبير الحجم 90×150 سم مع حامل أرضي فاخر وقاعدة ثقيلة للمكاتب الكبيرة وصالات الاستقبال والفعاليات', 'Large desk flag 90×150cm with premium floor stand and heavy base for large offices, reception halls and events', '🇪🇭', 180, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('media-outdoor-sail', 'شراع خارجي للواجهات ولافتات ثابتة وضوئية LED وألواح PVC', 'Outdoor Sail, Fixed & LED Signs, PVC Boards', 'شراع إعلاني خارجي مقاوم للعوامل الجوية، لافتات ثابتة للمحلات، لافتات ضوئية LED، ألواح PVC للطباعة الرقمية - حل إعلاني متكامل', 'Weather-resistant outdoor advertising sail, fixed shop signs, LED illuminated signs, PVC boards for digital printing - complete advertising solution', '🪧', 350, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('media-software-dev', 'حلول البرمجة الإلكترونية وتصميم المواقع وتطبيقات الموبايل', 'Software Development, Web Design & Mobile Apps', 'تصميم وبرمجة مواقع الويب الاحترافية، تطبيقات الموبايل (iOS/Android)، حلول برمجية مخصصة للشركات، لوحات تحكم إلكترونية، وأنظمة متكاملة حسب الطلب', 'Professional web design and development, mobile apps (iOS/Android), custom software solutions for businesses, electronic dashboards and integrated systems on demand', '💻', 2000, 'cat-media')
ON CONFLICT (id) DO NOTHING;

-- 6b. خدمات الستاندات الجديدة تحت cat-media (v2.4)
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('stand-x-large', 'طباعة وتجهيز إكس ستاند (X-Stand) كبير للصالات والمعارض', 'Large X-Stand Printing for Halls & Exhibitions', 'إكس ستاند كبير الحجم للصالات والمعارض والفعاليات - طباعة رقمية عالية الجودة على قماش البنر مع هيكل ألمنيوم متين قابل للطي وسهل الحمل', 'Large X-stand for halls, exhibitions and events - high-quality digital printing on banner fabric with durable foldable aluminum frame', '🖼️', 250, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('stand-x-mini-a3', 'طباعة وتجهيز إكس ستاند مكتبي مصغر A3', 'Mini Desk X-Stand A3 Printing', 'إكس ستاند مكتبي مصغر بحجم A3 للمكاتب والاستقبال - طباعة رقمية ملونة مع هيكل بلاستيكي متين للحمل والعرض على المكاتب والطاولات', 'Mini desk X-stand A3 size for offices and reception - color digital print with durable plastic frame for desktop display', '🖼️', 80, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('stand-roll-up', 'طباعة وتجهيز رول اب ستاند (Roll-up Stand) فاخر مع ماكينة ألومنيوم', 'Premium Roll-up Stand with Aluminum Machine', 'رول اب ستاند فاخر مع ماكينة ألومنيوم داخلية - طباعة رقمية على قماش البنر المطاطي مع نظام سحب وسحب داخلي للحمل والعرض المتكرر', 'Premium roll-up stand with internal aluminum machine - digital printing on stretch banner fabric with retractable system for repeated use', '📜', 450, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('stand-a3-telescopic', 'ستاند عرض A3 بقاعدة معدنية تلسكوبية قابلة لتعديل الارتفاع', 'A3 Display Stand with Adjustable Telescopic Metal Base', 'ستاند عرض لوحات A3 بقاعدة معدنية تلسكوبية أرضية قابلة لتعديل الارتفاع - مثالي للواجهات والعروض التقديمية والفعاليات', 'A3 display stand with telescopic metal floor base adjustable in height - perfect for shop fronts, presentations and events', '📏', 180, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('stand-a3-acrylic', 'حامل مكاتب A3 أكريليك شفاف مائل فاخر', 'Premium Slanted Clear Acrylic A3 Desk Holder', 'حامل عرض A3 أكريليك شفاف مائل فاخر للمكاتب والاستقبال - يعرض البوسترات والصور والإعلانات بشكل أنيق واحترافي', 'Slanted clear acrylic A3 desk holder for offices and reception - elegantly displays posters, photos and ads', '🪟', 90, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('stand-a3-mesh', 'ستاند A3 شبكي معدني متعدد الأرفف للمطويات والكتيبات', 'Multi-Shelf Metal Mesh A3 Stand for Brochures & Booklets', 'ستاند عرض A3 شبكي معدني متعدد الأرفف والجيوب لعرض المطويات والكتيبات والبروشورات والمنشورات بشكل منظم', 'Multi-shelf metal mesh A3 stand with multiple pockets for organized display of brochures, booklets and flyers', '🏗️', 150, 'cat-media')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. مستهلكات المخزن (Inventory Items) - 25 صنفاً جديداً
-- الكمية الافتراضية: 100 وحدة لكل صنف
-- ============================================================
INSERT INTO inventory_items (id, name_ar, name_en, category, quantity, unit_price, cost_price, created_at, updated_at)
SELECT gen_random_uuid(), name_ar, name_en, category, quantity, unit_price, cost_price, now(), now()
FROM (VALUES
  ('قالب درع كريستال شفاف', 'Clear Crystal Shield Mold', 'خامات دروع', 100, 200, 90),
  ('قالب درع خشب طبيعي', 'Natural Wood Shield Mold', 'خامات دروع', 100, 180, 80),
  ('قالب درع جلد فاخر', 'Premium Leather Shield Mold', 'خامات دروع', 100, 250, 120),
  ('طقم شموع خام 3 قطع', 'Raw Candle Set 3 Pcs', 'خامات هدايا', 100, 150, 60),
  ('ميدالية معدنية فارغة', 'Blank Metal Medal', 'خامات ميداليات', 100, 25, 10),
  ('ميدالية بلاستيكية فارغة', 'Blank Plastic Medal', 'خامات ميداليات', 100, 15, 5),
  ('إطار صورة معدني مقاس A4', 'Metal Photo Frame A4', 'براويز', 100, 50, 20),
  ('إطار صورة زجاجي مقاس A4', 'Glass Photo Frame A4', 'براويز', 100, 35, 12),
  ('فينيل لاصق واجهات رول', 'Adhesive Vinyl Facade Roll', 'خامات فينيل', 100, 250, 100),
  ('فينيل حراري للملابس رول', 'Heat Transfer Vinyl Roll', 'خامات فينيل', 100, 300, 130),
  ('غلاف شهادات قماشي فخم', 'Premium Fabric Certificate Cover', 'خامات شهادات', 100, 40, 15),
  ('ورق قطني قماشي للطباعة رول', 'Cotton Canvas Printing Roll', 'خامات طباعة', 100, 150, 65),
  ('ورق كروت 300 جرام', '300g Card Paper', 'خامات ورقية', 100, 35, 12),
  ('كيس ورقي هدايا فاخر', 'Luxury Paper Gift Bag', 'خامات تعبئة', 100, 15, 5),
  ('ورق ستيكر مقوى لاصق', 'Reinforced Adhesive Sticker Paper', 'خامات ملصقات', 100, 45, 18),
  ('قاعدة علم مكتبية بلاستيك', 'Plastic Desk Flag Base', 'خامات أعلام', 100, 12, 4),
  ('قاعدة علم مكتبية معدنية', 'Metal Desk Flag Base', 'خامات أعلام', 100, 25, 10),
  ('حامل أعلام أرضي فاخر', 'Premium Floor Flag Stand', 'خامات أعلام', 100, 80, 35),
  ('ورق ترانسفير شوكولاتة A4', 'Choco Transfer Paper A4', 'خامات طباعة غذائية', 100, 15, 5),

  -- مستهلكات الستاندات الـ 6 الجديدة (v2.4)
  ('هيكل إكس ستاند كبير', 'Large X-Stand Frame', 'خامات ستاندات', 100, 100, 40),
  ('هيكل إكس ستاند مكتبي مصغر A3', 'Mini Desk X-Stand A3 Frame', 'خامات ستاندات', 100, 35, 12),
  ('ماكينة رول أب ألومنيوم', 'Aluminum Roll-up Machine', 'خامات ستاندات', 100, 200, 90),
  ('قاعدة ستاند A3 تلسكوبية معدنية', 'A3 Telescopic Metal Stand Base', 'خامات ستاندات', 100, 60, 25),
  ('قالب أكريليك A3 مائل', 'Slanted Acrylic A3 Mold', 'خامات ستاندات', 100, 40, 15),
  ('هيكل ستاند شبكي A3', 'A3 Mesh Stand Frame', 'خامات ستاندات', 100, 55, 22)
) AS t(name_ar, name_en, category, quantity, unit_price, cost_price)
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_items WHERE name_ar = t.name_ar
)
ON CONFLICT DO NOTHING;
