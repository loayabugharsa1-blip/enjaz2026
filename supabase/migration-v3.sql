-- ============================================================
-- Migration v3 — شجرة الخدمات v2.5.0 (5 أقسام مستقلة كاملة)
-- Injaz Advertising — يونيو 2026
-- آمن للتشغيل المتكرر (IF NOT EXISTS / ON CONFLICT DO NOTHING)
-- ============================================================

-- ============================================================
-- 1. جدول الخدمات الأساسي
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id            text primary key,
  title_ar      text not null,
  title_en      text not null,
  description_ar text not null default '',
  description_en text not null default '',
  icon          text not null default '📦',
  base_price    numeric(10,2) not null default 0,
  parent_id     text references services(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS idx_services_parent ON services(parent_id);

-- ============================================================
-- 2. الأقسام الرئيسية الخمسة
-- ============================================================

-- 2.1 الحلول البرمجية والرقمية
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('cat-software', 'الحلول البرمجية والرقمية', 'Software & Digital Solutions',
 'برمجة وتطوير مواقع الويب وأنظمة المبيعات، وتطبيقات الهواتف الذكية - حلول رقمية متكاملة للشركات والمؤسسات',
 'Web development & sales systems, mobile app development - complete digital solutions for businesses',
 '💻', 2000, NULL)
ON CONFLICT (id) DO NOTHING;

-- 2.2 الأعلام والستاندات واللوحات الإعلانية
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('cat-media', 'الأعلام والستاندات واللوحات الإعلانية', 'Flags, Stands & Advertising Boards',
 'أعلام مكاتب وصالات فردي ومزدوج وكبير، أشرعة خارجية، لافتات ثابتة وضوئية LED وألواح PVC، وستاندات عرض A3 متنوعة وإكس ستاند ورول اب',
 'Single/double/large desk flags, outdoor sails, fixed & LED signs, PVC boards, A3 display stands, X-stands and roll-up stands',
 '🚩', 250, NULL)
ON CONFLICT (id) DO NOTHING;

-- 2.3 الدروع التكريمية والمسميات الفاخرة
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('cat-awards', 'الدروع التكريمية والمسميات الفاخرة', 'Awards & Premium Nameplates',
 'دروع تكريم فاخرة من الجلد والكريستال والخشب، مسميات مكاتب وعناوين فاخرة، مسميات أبواب وحوائط، ودروع الرتب العسكرية',
 'Premium leather, crystal & wood honor shields, luxury desk nameplates, door signs and military rank shields',
 '🏆', 200, NULL)
ON CONFLICT (id) DO NOTHING;

-- 2.4 الهدايا التذكارية والطباعة التخصصية والغذائية
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('cat-gifts', 'الهدايا التذكارية والطباعة التخصصية والغذائية', 'Gifts, Specialized & Food Printing',
 'شموع مناسبات، طباعة حرارية على الميداليات والأكواب، براويز صور، قص فينيل، وطباعة غذائية على ورق السكر والترانسفير والويفر',
 'Event candles, heat printing on medals/cups, photo frames, vinyl cutting, edible printing on sugar sheets, choco transfer & wafer paper',
 '🎁', 150, NULL)
ON CONFLICT (id) DO NOTHING;

-- 2.5 التعبئة والتغليف والورقيات المتقدمة
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('cat-papers', 'التعبئة والتغليف والورقيات المتقدمة', 'Packaging & Advanced Paper Products',
 'أكياس ورقية هدايا فاخرة، كروت تعريف 300 جرام وجه ووجهين، مطويات وكتيبات، شهادات قماشية، طباعة كانفاس، ومخططات كوبيست',
 'Luxury paper gift bags, 300g ID cards single/double, brochures, fabric certificates, canvas printing & copiest plans',
 '📄', 80, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. الخدمات الفرعية (Children)
-- ============================================================

-- 3.1 تحت الحلول البرمجية والرقمية
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('software-web', 'برمجة وتطوير مواقع الويب وأنظمة المبيعات', 'Web Development & Sales Systems',
 'تصميم وبرمجة مواقع ويب احترافية وأنظمة مبيعات متكاملة مع لوحات تحكم إلكترونية وحلول تجارة إلكترونية مخصصة',
 'Professional web design and development, integrated sales systems with dashboards and custom e-commerce solutions',
 '🌐', 2000, 'cat-software')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('software-mobile', 'برمجة وتطوير تطبيقات الهواتف الذكية', 'Mobile App Development',
 'تصميم وبرمجة تطبيقات موبايل (iOS/Android) احترافية مع واجهات مستخدم مبتكرة وحلول متكاملة حسب الطلب',
 'Professional mobile app development (iOS/Android) with innovative UIs and custom integrated solutions',
 '📱', 1500, 'cat-software')
ON CONFLICT (id) DO NOTHING;

-- 3.2 تحت الأعلام والستاندات واللوحات الإعلانية
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('media-flag-single', 'علم مكتبة وصالات فردي صغير', 'Small Single Desk & Hall Flag',
 'علم مكتبي وصالات فردي صغير بخامات عالية الجودة مع قاعدة متينة وطباعة شعار المؤسسة أو الدولة',
 'Small single desk and hall flag with high-quality materials, sturdy base and logo printing',
 '🚩', 35, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('media-flag-double', 'علم مكتبة وصالات مزدوج (علمين بقاعدة واحدة)', 'Double Desk & Hall Flag (Two Flags One Base)',
 'علم مكتبي مزدوج علمين على قاعدة واحدة لعرض علم الدولة وعلم المؤسسة جنباً إلى جنب',
 'Double desk flag with two flags on one base for national and corporate flags',
 '🎌', 55, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('media-flag-large', 'علم مكتبة وصالات كبير بحامل فاخر', 'Large Desk & Hall Flag with Premium Stand',
 'علم مكتبي كبير 90×150 سم مع حامل أرضي فاخر وقاعدة ثقيلة للصالات والفعاليات',
 'Large desk flag 90×150cm with premium floor stand and heavy base for halls and events',
 '🇪🇭', 180, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('media-outdoor-sail', 'شراع خارجي للواجهات ولافتات ثابتة وضوئية LED وألواح PVC', 'Outdoor Sail, Fixed & LED Signs, PVC Boards',
 'شراع إعلاني خارجي، لافتات ثابتة للمحلات، لافتات ضوئية LED، ألواح PVC للطباعة الرقمية',
 'Outdoor advertising sail, fixed shop signs, LED signs, PVC boards for digital printing',
 '🪧', 350, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('media-sign-fixed', 'لافتات ثابتة للواجهات والمحلات', 'Fixed Signs for Shop Fronts & Offices',
 'لافتات ثابتة للواجهات والمحلات من الأكريليك والمعدن وPVC بطباعة UV احترافية',
 'Fixed facade and shop signs in acrylic, metal and PVC with professional UV printing',
 '🪧', 180, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('media-sign-light', 'لافتات ضوئية متحركة وحروف بارزة LED', 'Lighted Signs & LED Raised Letters',
 'لافتات ضوئية LED داخلية وخارجية مع حروف بارزة وإضاءة متحركة للمحلات والعلامات التجارية',
 'Internal/external LED signs with raised illuminated letters for shops and brands',
 '💡', 350, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('media-pvc-board', 'طباعة ألواح PVC للإعلانات', 'PVC Board Advertising Printing',
 'طباعة رقمية مباشرة على ألواح PVC بسماكات مختلفة للوحات الداخلية والخارجية',
 'Direct digital printing on PVC boards in various thicknesses for indoor/outdoor displays',
 '🧱', 100, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('stand-x-mini-a3', 'إكس ستاند مكتبي مصغر A3 (طباعة + هيكل)', 'Mini Desk X-Stand A3 (Print + Frame)',
 'إكس ستاند مكتبي مصغر A3 للمكاتب والاستقبال - طباعة ملونة مع هيكل بلاستيكي متين',
 'Mini desk X-stand A3 for offices and reception - color print with durable plastic frame',
 '🖼️', 80, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('stand-a3-acrylic', 'حامل مكاتب A3 أكريليك شفاف مائل فاخر', 'Premium Slanted Acrylic A3 Desk Holder',
 'حامل عرض A3 أكريليك شفاف مائل فاخر يعرض البوسترات والصور بشكل أنيق',
 'Slanted clear acrylic A3 desk holder elegantly displays posters and photos',
 '🪟', 90, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('stand-a3-mesh', 'ستاند A3 شبكي معدني متعدد الأرفف للمطويات', 'Multi-Shelf Metal Mesh A3 Stand',
 'ستاند A3 شبكي معدني متعدد الأرفف والجيوب لعرض المطويات والكتيبات بشكل منظم',
 'Multi-shelf metal mesh A3 stand with pockets for organized brochure display',
 '🏗️', 150, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('stand-x-large', 'إكس ستاند كبير للصالات والمعارض (طباعة + هيكل)', 'Large X-Stand for Halls (Print + Frame)',
 'إكس ستاند كبير مع طباعة رقمية عالية الجودة وهيكل ألمنيوم متين قابل للطي',
 'Large X-stand with high-quality digital print and durable foldable aluminum frame',
 '🖼️', 250, 'cat-media')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('stand-roll-up', 'رول اب ستاند فاخر مع ماكينة ألومنيوم (طباعة + ماكينة)', 'Premium Roll-up Stand with Aluminum Machine',
 'رول اب ستاند فاخر مع ماكينة ألومنيوم داخلية وطباعة على قماش البنر المطاطي',
 'Premium roll-up stand with internal aluminum machine and stretch banner fabric print',
 '📜', 450, 'cat-media')
ON CONFLICT (id) DO NOTHING;

-- 3.3 تحت الدروع التكريمية والمسميات الفاخرة
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('award-shield', 'دروع تكريم فاخرة (جلد / كريستال / خشب)', 'Premium Honor Shields (Leather/Crystal/Wood)',
 'دروع تكريم فاخرة من الجلد الفاخر والكريستال الشفاف والخشب الطبيعي مع نقش ليزر دقيق',
 'Premium honor shields in fine leather, clear crystal and natural wood with precision laser engraving',
 '🪵', 200, 'cat-awards')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('award-nameplate-desk', 'مسميات مكاتب وعناوين فاخرة (خشب وكريستال)', 'Premium Desk Nameplates (Wood & Crystal)',
 'مسميات مكاتب فاخرة من الخشب والكريستال مع نقش ليزر دقيق للأسماء والمسميات الوظيفية',
 'Premium desk nameplates in wood and crystal with precision laser engraving for names and titles',
 '💎', 120, 'cat-awards')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('award-nameplate-door', 'مسميات أبواب وحوائط (وجه واحد / وجهين)', 'Door & Wall Nameplates (Single/Double)',
 'مسميات أبواب وحوائط وجه واحد أو وجهين بخامات الأكريليك والمعدن للمكاتب والقاعات',
 'Door and wall nameplates single/double side in acrylic and metal for offices and halls',
 '🚪', 80, 'cat-awards')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('award-military-rank', 'دروع الرتب العسكرية والمناسبات الرسمية', 'Military Rank & Ceremony Shields',
 'دروع الرتب العسكرية والمناسبات الرسمية بتصميم خاص ونقش ليزر دقيق',
 'Military rank and official ceremony shields with custom design and precise engraving',
 '🎖️', 350, 'cat-awards')
ON CONFLICT (id) DO NOTHING;

-- 3.4 تحت الهدايا التذكارية والطباعة التخصصية والغذائية
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('gift-candle-set', 'طقم شموع مناسبات ثلاثي (3 قطع مع طباعة)', 'Triple Event Candle Set (3 Pcs with Print)',
 'طقم شموع مناسبات 3 قطع مع طباعة حرارية للصور والشعارات وتزيين فني',
 '3-piece event candle set with heat printing for photos/logos and artistic decoration',
 '🕯️', 150, 'cat-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('gift-medal-print', 'طباعة حرارية على الميداليات التذكارية', 'Heat Printing on Souvenir Medals',
 'طباعة حرارية على الميداليات المعدنية والبلاستيكية للصور والشعارات',
 'Heat printing on metal and plastic medals for photos and logos',
 '🏅', 80, 'cat-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('gift-photo-frame', 'إطارات وبراويز صور (معدن وزجاج)', 'Metal & Glass Photo Frames',
 'إطارات وبراويز صور فاخرة من المعدن والزجاج بمقاسات مختلفة مع طباعة وحفر ليزر',
 'Luxury metal and glass photo frames in all sizes with printing and laser engraving',
 '🖼️', 100, 'cat-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('gift-vinyl-cutting', 'قص فينيل لاصق وحراري (للواجهات والملابس)', 'Adhesive & Heat Vinyl Cutting',
 'قص فينيل لاصق للواجهات والزجاج وفينيل حراري للملابس والتيشيرتات',
 'Adhesive vinyl cutting for facades and glass, heat vinyl for apparel and t-shirts',
 '✂️', 120, 'cat-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('gift-heat-print-general', 'مطبوعات حرارية عامة (أكواب / تيشيرتات / سيراميك)', 'General Heat Printing (Cups/T-shirts/Ceramics)',
 'طباعة حرارية على الأكواب والتيشيرتات والسيراميك + طباعة غذائية على ورق السكر والترانسفير والويفر',
 'Heat printing on cups, t-shirts and ceramics + edible printing on sugar/choco/wafer paper',
 '🧁', 60, 'cat-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('gift-sugar-sheet', 'طباعة ورق سكر (Sugar Sheet) صالح للأكل', 'Edible Sugar Sheet Printing',
 'طباعة صالحة للأكل على ورق السكر لتزيين الكيك والكب كيك والمناسبات',
 'Edible printing on sugar sheets for cake decoration, cupcakes and events',
 '🍰', 50, 'cat-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('gift-choco-transfer', 'طباعة ورق ترانسفير شوكولاتة (Choco Transfer)', 'Choco Transfer Paper Printing',
 'ورق ترانسفير شوكولاتة لنقل الصور والتصاميم على الشوكولاتة المخصصة',
 'Chocolate transfer paper for printing images onto custom chocolates',
 '🍫', 60, 'cat-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('gift-wafer-paper', 'طباعة ورق ويفر/أرز (Wafer Paper) صالح للأكل', 'Edible Wafer / Rice Paper Printing',
 'ورق ويفر وأرز صالح للأكل لصنع المجسمات السكرية وتزيين الكوكيز والكيك',
 'Edible wafer and rice paper for sugar sculptures, cookies and cake decorating',
 '🍪', 70, 'cat-gifts')
ON CONFLICT (id) DO NOTHING;

-- 3.5 تحت التعبئة والتغليف والورقيات المتقدمة
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('paper-gift-bag', 'طباعة أكياس ورقية فاخرة للهدايا', 'Luxury Paper Gift Bags Printing',
 'أكياس ورقية فاخرة للهدايا بطباعة مخصصة للشعارات والتصاميم بمقاسات متعددة',
 'Luxury paper gift bags with custom logo printing in multiple sizes',
 '🛍️', 50, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('paper-id-single', 'كروت تعريف شخصية 300 جرام (طباعة وجه واحد)', '300g ID Cards (Single-Side Print)',
 'كروت تعريف من ورق 300 جرام مع طباعة وجه واحد عالية الجودة',
 '300g card paper ID cards with single-side high-quality printing',
 '🪪', 25, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('paper-id-double', 'كروت تعريف شخصية 300 جرام (طباعة وجهين)', '300g ID Cards (Double-Side Print)',
 'كروت تعريف من ورق 300 جرام مع طباعة وجهين كاملتين بالملون',
 '300g card paper ID cards with full double-sided color printing',
 '🆔', 35, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('paper-stickers-more', 'مطويات وكتيبات وملصقات مقواة ومخططات كوبيست', 'Brochures, Booklets, Stickers & Copiest Plans',
 'مطويات وبروشورات، كتيبات، ملصقات مقواة، ومخططات كوبيست هندسية ملونة وأسود',
 'Brochures and flyers, booklets, reinforced stickers, and engineering copiest plans',
 '📑', 30, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('paper-certificate-fabric', 'شهادات شكر وتقدير بغلاف قماشي فخم', 'Premium Fabric Certificate in Luxury Cover',
 'شهادات شكر فاخرة مطبوعة على ورق فاخر بغلاف قماشي فخم مع شريط',
 'Premium appreciation certificates on fine paper in fabric cover with ribbon',
 '📜', 100, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('paper-canvas-print', 'طباعة على ورق قطني كانفاس للوحات الفنية', 'Art Canvas Printing on Cotton Paper',
 'طباعة رقمية على ورق كانفاس قطني للوحات الفنية والصور والديكور المكتبي',
 'Digital printing on cotton canvas paper for art pieces, photos and office decor',
 '🎨', 200, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('papers-copiest', 'مخططات كوبيست هندسية (ملونة وأسود)', 'Engineering Copiest Plans (Color & B&W)',
 'طباعة كوبيست ملونة وأسود للمخططات الهندسية والمطبوعات المكتبية',
 'Color and B&W copiest printing for engineering plans and office prints',
 '📝', 15, 'cat-papers')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. الأقسام القديمة (للتوافق مع الطلبات السابقة)
-- ============================================================
INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('shields-gifts', 'قسم الدروع والهدايا التذكارية', 'Shields & Souvenirs',
 'دروع خشب وكريستال وجلد فاخرة، هدايا تذكارية وميداليات معدنية، وستاندات زجاجية وأكريليك A4 للمكاتب والمناسبات',
 'Premium wood, crystal & leather shields, souvenir medals, glass & acrylic A4 stands for offices and events',
 '🏆', 200, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('nameplates', 'قسم المسميات واللوحات المكتبية', 'Nameplates & Desk Signs',
 'مسميات مكتبية فاخرة كريستال وخشب، مسميات مكاتب وجه واحد وجانبية وجهين بجودة عالية',
 'Premium crystal & wood nameplates, single-face and double-side desk name signs',
 '🪪', 80, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('certificates', 'شهادات الشكر والتقدير', 'Certificates of Appreciation',
 'شهادات شكر وتقدير فاخرة قماشية بطبعة عالية الجودة، مثالية للتكريم في المؤسسات والشركات',
 'Premium fabric appreciation certificates with high-quality printing, perfect for corporate recognition',
 '📜', 60, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('paper-prints', 'المطبوعات الورقية', 'Paper Prints',
 'كروت شخصية وكروت متابعة، بروشورات ومطويات دعائية بتصميم احترافي وأعلى جودة طباعة',
 'Business cards, follow-up cards, brochures and flyers with professional design and high-quality print',
 '📄', 50, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('vinyl-printing', 'قسم قص الفينيل والطباعة الرقمية', 'Vinyl Cutting & Digital Printing',
 'قص فينيل احترافي، طباعة بنر وفينيل شفاف ومعتم، طباعة قماش، وفينيل مرمل للزجاج',
 'Professional vinyl cutting, banner printing, transparent & opaque vinyl, fabric printing, and sandblasted vinyl for glass',
 '🖨️', 150, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('stickers', 'قسم الملصقات والاستيكرات', 'Stickers & Labels',
 'ملصقات منتجات دائرية ومربعة، استيكرات مقاومة للماء وقص مخصص بجودة طباعة عالية',
 'Round and square product labels, waterproof stickers and custom cut stickers with high-quality print',
 '🏷️', 30, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('social-media-design', 'تصميم السوشيال ميديا', 'Social Media Design',
 'تصميم بوستات فيسبوك وإنستغرام احترافية، تصميم شعارات وهويات بصرية كاملة للعلامات التجارية',
 'Professional Facebook & Instagram post designs, logo design and complete visual branding',
 '📱', 200, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('food-printing', 'قسم الطباعة الغذائية', 'Food Printing',
 'طباعة صالحة للأكل على الكيك والشوكولاتة والكوكيز بأعلى جودة وألوان زاهية طبيعية',
 'Edible printing on cakes, chocolates, and cookies with highest quality and vibrant natural colors',
 '🧁', 50, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('shields-wood-crystal-leather', 'دروع خشب وكريستال وجلد', 'Wood, Crystal & Leather Shields',
 'دروع فاخرة من الخشب الطبيعي والكريستال الشفاف والجلد الفاخر مع نقش ليزر دقيق',
 'Premium shields in natural wood, clear crystal and fine leather with precision laser engraving',
 '🪵', 200, 'shields-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('souvenirs-medals', 'هدايا تذكارية وميداليات معدنية', 'Souvenirs & Metal Medals',
 'هدايا تذكارية متنوعة وميداليات معدنية مخصصة بتصاميم فريدة للمناسبات والمؤتمرات والتكريم',
 'Various souvenirs and custom metal medals with unique designs for events, conferences and recognition',
 '🎖️', 100, 'shields-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('glass-acrylic-stand-a4', 'ستاند زجاجي وأكريليك A4', 'Glass & Acrylic A4 Stand',
 'ستاندات عرض زجاجية وأكريليك بمقاس A4 مع حفر ليزر احترافي',
 'Glass and acrylic A4 display stands with professional laser engraving',
 '🖼️', 150, 'shields-gifts')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('nameplates-crystal-wood', 'مسميات مكتبية فاخرة كريستال وخشب', 'Premium Crystal & Wood Nameplates',
 'مسميات مكاتب فاخرة من الكريستال والخشب مع نقش ليزر دقيق للمديرين والموظفين',
 'Premium desk nameplates in crystal and wood with precise laser engraving for managers and staff',
 '💎', 120, 'nameplates')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('nameplates-single-double', 'مسميات مكاتب وجه واحد وجانبية وجهين', 'Single & Double-Side Desk Nameplates',
 'مسميات مكاتب وجه واحد للمكاتب الأمامية وجانبية وجهين للاجتماعات والغرف الزجاجية',
 'Single-face desk nameplates for front desks and double-side nameplates for meetings and glass rooms',
 '🪟', 80, 'nameplates')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('certificates-fabric', 'شهادات شكر وتقدير فاخرة قماشية', 'Premium Fabric Certificates',
 'شهادات شكر وتقدير على قماش فاخر بطبعة عالية الجودة مع إطار اختياري',
 'Appreciation certificates on premium fabric with high-quality print and optional frame',
 '🧧', 60, 'certificates')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('business-cards', 'كروت شخصية وكروت متابعة', 'Business & Follow-up Cards',
 'كروت شخصية فاخرة بمقاسات وخامات متعددة مع تشطيب احترافي',
 'Premium business cards in multiple sizes and finishes with professional touch',
 '🆔', 50, 'paper-prints')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('brochures-flyers', 'بروشورات ومطويات', 'Brochures & Flyers',
 'بروشورات ومطويات دعائية مطوية بتصميم جذاب وطباعة عالية الجودة للإعلان عن منتجاتك وخدماتك',
 'Folded promotional brochures and flyers with attractive design and high-quality print',
 '📑', 100, 'paper-prints')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('vinyl-cutting', 'قص فينيل', 'Vinyl Cutting',
 'قص فينيل احترافي للأحرف والتصاميم والكتابات بدقة عالية على أروع الألوان والمقاسات',
 'Professional vinyl cutting for letters, designs and writings with high precision',
 '✂️', 80, 'vinyl-printing')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('banner-vinyl-printing', 'طباعة بنر وفينيل شفاف ومعتم', 'Banner & Vinyl Printing',
 'طباعة راية (بنر) خارجية عالية الجودة، فينيل شفاف للزجاج والمعتم للجدران بمقاسات مختلفة',
 'High-quality outdoor banner printing, transparent vinyl for glass and opaque vinyl for walls',
 '🪧', 150, 'vinyl-printing')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('fabric-printing', 'طباعة قماش', 'Fabric Printing',
 'طباعة رقمية على القماش بجودة عالية للافتات والبراويز والتصاميم الدعائية',
 'Digital fabric printing with high quality for banners, frames and promotional designs',
 '🧵', 120, 'vinyl-printing')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('sandblasted-vinyl', 'فينيل مرمل للزجاج', 'Sandblasted Glass Vinyl',
 'فينيل مرمل للزجاج لمظهر زجاج مصنفر فاخر للخصوصية والديكور',
 'Sandblasted vinyl for glass for a premium frosted glass look for privacy and decor',
 '🪟', 200, 'vinyl-printing')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('product-stickers', 'ملصقات منتجات دائرية ومربعة', 'Round & Square Product Labels',
 'ملصقات منتجات دائرية ومربعة بجودة طباعة عالية للمنتجات الغذائية والتجارية',
 'Round and square product labels with high-quality print for food and commercial products',
 '🔵', 30, 'stickers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('waterproof-stickers', 'استيكرات مقاومة للماء وقص مخصص', 'Waterproof & Custom Cut Stickers',
 'استيكرات مقاومة للماء والظروف الجوية للسيارات والواجهات وقص مخصص لأي شكل',
 'Waterproof stickers resistant to weather conditions for cars and facades, custom cut to any shape',
 '💧', 50, 'stickers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('social-posts', 'تصميم بوستات فيسبوك وإنستغرام', 'Facebook & Instagram Posts Design',
 'تصميم بوستات احترافية لوسائل التواصل الاجتماعي بحسب هوية علامتك التجارية',
 'Professional social media post designs aligned with your brand identity',
 '📱', 200, 'social-media-design')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('logo-branding', 'تصميم شعارات وهويات بصرية كاملة', 'Logo & Complete Visual Identity',
 'تصميم شعار احترافي وهوية بصرية متكاملة تشمل الألوان والخطوط والأدلة الإرشادية',
 'Professional logo design and complete visual identity including colors, fonts and brand guidelines',
 '🎨', 800, 'social-media-design')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('flags-section', 'قسم الأعلام', 'Flags Section',
 'أعلام مكتبية فردية ومزدوجة صغيرة وكبيرة، أشرعة خارجية للفعاليات والمؤسسات والمناسبات بأعلى جودة',
 'Single and double small and large desk flags, outdoor sails for events and institutions',
 '🚩', 35, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('prints-boards', 'قسم المطبوعات واللوحات', 'Prints & Boards',
 'ستيكرات مقوى، كروت تعريف شخصية، لافتات ثابتة وضوئية، طباعة ألواح PVC، مطبوعات كوبيست',
 'Reinforced stickers, ID cards, fixed and light signs, PVC board printing, copiest prints',
 '🪧', 25, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('flag-desk-single', 'علم مكتبة صغير فردي', 'Small Single Desk Flag',
 'علم مكتبي صغير فردي بخامات عالية الجودة مع قاعدة وطباعة راقية لشعار المؤسسة',
 'Small single desk flag with high-quality materials, base and elegant logo printing',
 '🚩', 35, 'flags-section')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('flag-desk-double', 'علم مكتبة صغير مزدوج', 'Small Double Desk Flag',
 'علم مكتبي صغير مزدوج (علمين على قاعدة واحدة) للشركات لعرض علم الدولة وعلم المؤسسة',
 'Small double desk flag (two flags on one base) for company flag and national flag',
 '🎌', 55, 'flags-section')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('flag-desk-large', 'علم مكتبة كبير', 'Large Desk Flag',
 'علم مكتبي كبير الحجم بطول 90×150 سم مع قاعدة ثقيلة للاستخدام اليومي في المكاتب',
 'Large desk flag 90×150cm with heavy base for daily use in executive offices',
 '🇪🇭', 120, 'flags-section')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('flag-outdoor-sail', 'شراع خارجي', 'Outdoor Sail',
 'شراع إعلاني خارجي كبير بخامة متينة مقاومة للعوامل الجوية والرياح للفعاليات والواجهات',
 'Large outdoor advertising sail in durable weather-resistant material for events',
 '🏴', 250, 'flags-section')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('print-sticker-reinforced', 'ستيكرات مقوى', 'Reinforced Stickers',
 'ستيكرات مقوى بسماكة عالية وخامة متينة للاستخدام الطويل على الأسطح - للواجهات والسيارات',
 'Reinforced thick high-durability stickers for long-term use on surfaces and cars',
 '🔲', 40, 'prints-boards')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('print-id-cards', 'كروت تعريف شخصية', 'Personal ID Cards',
 'كروت تعريف شخصية بلاستيكية عالية الجودة مع طباعة ملونة ووجهين مع إضافة باركود وصورة',
 'High-quality plastic ID cards with full-color double-sided printing, barcode and photo',
 '🪪', 25, 'prints-boards')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('print-sign-fixed', 'لافتات ثابتة', 'Fixed Signs',
 'لافتات ثابتة للمحلات والمكاتب من خامات متعددة (أكريليك، PVC، معدن) بطباعة UV',
 'Fixed signs for shops and offices in acrylic, PVC, metal with professional UV printing',
 '🪧', 180, 'prints-boards')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('print-sign-light', 'لافتات ضوئية', 'Lighted Signs',
 'لافتات ضوئية بإضاءة LED داخلية أو خارجية للمحلات والعلامات التجارية مع لوحة أكريليك مضيئة',
 'Lighted signs with internal or external LED for shops with illuminated acrylic panel',
 '💡', 350, 'prints-boards')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('print-pvc-board', 'طباعة ألواح PVC', 'PVC Board Printing',
 'طباعة رقمية مباشرة على ألواح PVC بسماكات مختلفة للوحات العرض الداخلية والخارجية',
 'Direct digital printing on PVC boards in various thicknesses for indoor/outdoor displays',
 '🧱', 100, 'prints-boards')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title_ar, title_en, description_ar, description_en, icon, base_price, parent_id) VALUES
('print-copiest', 'مطبوعات كوبيست', 'Copiest Prints',
 'طباعة كوبيست ملونة وأسود لجميع المطبوعات المكتبية والإدارية بأسعار تنافسية',
 'Color and B/W copiest printing for all office and admin prints at competitive prices',
 '📝', 15, 'prints-boards')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. تحديث pricing_rules (أسعار الحاسبة الذكية)
-- ============================================================
CREATE TABLE IF NOT EXISTS pricing_rules (
  id            text primary key,
  service_id    text not null,
  name_ar       text not null,
  name_en       text not null,
  price_per_unit numeric(10,2) not null check (price_per_unit >= 0),
  unit_type     text not null,
  updated_at    timestamptz not null default now()
);

INSERT INTO pricing_rules (id, service_id, name_ar, name_en, price_per_unit, unit_type) VALUES
  ('shld-wd-pc', 'shields-wood-crystal-leather', 'سعر القطعة - دروع', 'Per piece - Shields', 200, 'piece'),
  ('shld-sv-pc', 'souvenirs-medals', 'سعر القطعة - هدايا', 'Per piece - Souvenirs', 100, 'piece'),
  ('shld-gl-pc', 'glass-acrylic-stand-a4', 'سعر القطعة - ستاند', 'Per piece - Stand', 150, 'piece'),
  ('nam-cr-pc', 'nameplates-crystal-wood', 'سعر القطعة - مسميات كريستال', 'Per piece - Crystal nameplate', 120, 'piece'),
  ('nam-sg-pc', 'nameplates-single-double', 'سعر القطعة - مسميات مكتب', 'Per piece - Desk nameplate', 80, 'piece'),
  ('cert-fb-pc', 'certificates-fabric', 'سعر القطعة - شهادات', 'Per piece - Certificate', 60, 'piece'),
  ('ppr-crd-pc', 'business-cards', 'سعر الكرت - 100 بطاقة', 'Per pack - 100 cards', 50, 'piece'),
  ('ppr-bro-pc', 'brochures-flyers', 'سعر القطعة - بروشور', 'Per piece - Brochure', 5, 'piece'),
  ('vin-cut-cm2', 'vinyl-cutting', 'سعر السم المربع - قص فينيل', 'Per cm² - Vinyl cutting', 0.02, 'cm2'),
  ('vin-bnr-cm2', 'banner-vinyl-printing', 'سعر السم المربع - بنر', 'Per cm² - Banner printing', 0.01, 'cm2'),
  ('vin-fab-cm2', 'fabric-printing', 'سعر السم المربع - طباعة قماش', 'Per cm² - Fabric printing', 0.015, 'cm2'),
  ('vin-snd-cm2', 'sandblasted-vinyl', 'سعر السم المربع - فينيل مرمل', 'Per cm² - Sandblasted vinyl', 0.03, 'cm2'),
  ('stk-prd-cm2', 'product-stickers', 'سعر السم المربع - ملصقات', 'Per cm² - Product labels', 0.015, 'cm2'),
  ('stk-wtr-cm2', 'waterproof-stickers', 'سعر السم المربع - استيكرات مقاومة', 'Per cm² - Waterproof stickers', 0.025, 'cm2'),
  ('soc-pst-pc', 'social-posts', 'سعر البوست الواحد', 'Per post design', 200, 'piece'),
  ('soc-lgo-pc', 'logo-branding', 'سعر الهوية البصرية المتكاملة', 'Complete branding package', 800, 'piece'),
  ('food-sgr-pc', 'food-sugar-sheet', 'سعر الورقة - ورق سكر A4', 'Per sheet - Sugar sheet A4', 50, 'piece'),
  ('food-cho-pc', 'food-choco-transfer', 'سعر الورقة - ورق ترانسفير A4', 'Per sheet - Choco transfer A4', 60, 'piece'),
  ('food-waf-pc', 'food-wafer-paper', 'سعر الورقة - ورق ويفر A4', 'Per sheet - Wafer paper A4', 70, 'piece')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. إضافة أصناف المخزن الجديدة (إن لم تكن موجودة)
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
  ('هيكل إكس ستاند كبير', 'Large X-Stand Frame', 'خامات ستاندات', 100, 100, 40),
  ('هيكل إكس ستاند مكتبي مصغر A3', 'Mini Desk X-Stand A3 Frame', 'خامات ستاندات', 100, 35, 12),
  ('ماكينة رول أب ألومنيوم', 'Aluminum Roll-up Machine', 'خامات ستاندات', 100, 200, 90),
  ('قاعدة ستاند A3 تلسكوبية معدنية', 'A3 Telescopic Metal Stand Base', 'خامات ستاندات', 100, 60, 25),
  ('قالب أكريليك A3 مائل', 'Slanted Acrylic A3 Mold', 'خامات ستاندات', 100, 40, 15),
  ('هيكل ستاند شبكي A3', 'A3 Mesh Stand Frame', 'خامات ستاندات', 100, 55, 22)
) AS t(name_ar, name_en, category, quantity, unit_price, cost_price)
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_items WHERE name_ar = t.name_ar
);

-- ============================================================
-- تم بحمد الله اكتمال حقن شجرة الخدمات v2.5.0
-- ============================================================
