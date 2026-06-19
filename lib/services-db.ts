import type { Service } from "@/types/common";
import { supabase } from "@/lib/supabase";
import { fetchWithCSRF } from "@/lib/csrf";

const STORAGE_KEY = "injaz_services";
const SEED_VERSION_KEY = "injaz_services_seed_version";
const SEED_VERSION = "2.5.0";

export const DEFAULT_SERVICES: Service[] = [
  // ========================
  // 1. الحلول البرمجية والرقمية
  // ========================
  { id: "cat-software", titleAr: "الحلول البرمجية والرقمية", titleEn: "Software & Digital Solutions", descriptionAr: "برمجة وتطوير مواقع الويب وأنظمة المبيعات، وتطبيقات الهواتف الذكية - حلول رقمية متكاملة للشركات والمؤسسات", descriptionEn: "Web development & sales systems, mobile app development - complete digital solutions for businesses", icon: "💻", basePrice: 2000, parentId: null },
  { id: "software-web", titleAr: "برمجة وتطوير مواقع الويب وأنظمة المبيعات", titleEn: "Web Development & Sales Systems", descriptionAr: "تصميم وبرمجة مواقع ويب احترافية وأنظمة مبيعات متكاملة مع لوحات تحكم إلكترونية وحلول تجارة إلكترونية مخصصة", descriptionEn: "Professional web design and development, integrated sales systems with dashboards and custom e-commerce solutions", icon: "🌐", basePrice: 2000, parentId: "cat-software" },
  { id: "software-mobile", titleAr: "برمجة وتطوير تطبيقات الهواتف الذكية", titleEn: "Mobile App Development", descriptionAr: "تصميم وبرمجة تطبيقات موبايل (iOS/Android) احترافية مع واجهات مستخدم مبتكرة وحلول متكاملة حسب الطلب", descriptionEn: "Professional mobile app development (iOS/Android) with innovative UIs and custom integrated solutions", icon: "📱", basePrice: 1500, parentId: "cat-software" },

  // ========================
  // 2. الأعلام والستاندات واللوحات الإعلانية
  // ========================
  { id: "cat-media", titleAr: "الأعلام والستاندات واللوحات الإعلانية", titleEn: "Flags, Stands & Advertising Boards", descriptionAr: "أعلام مكاتب وصالات فردي ومزدوج وكبير، أشرعة خارجية، لافتات ثابتة وضوئية LED وألواح PVC، وستاندات عرض A3 متنوعة وإكس ستاند ورول اب", descriptionEn: "Single/double/large desk flags, outdoor sails, fixed & LED signs, PVC boards, A3 display stands, X-stands and roll-up stands", icon: "🚩", basePrice: 250, parentId: null },
  { id: "media-flag-single", titleAr: "علم مكتبة وصالات فردي صغير", titleEn: "Small Single Desk & Hall Flag", descriptionAr: "علم مكتبي وصالات فردي صغير بخامات عالية الجودة مع قاعدة متينة وطباعة شعار المؤسسة أو الدولة", descriptionEn: "Small single desk and hall flag with high-quality materials, sturdy base and logo printing", icon: "🚩", basePrice: 35, parentId: "cat-media" },
  { id: "media-flag-double", titleAr: "علم مكتبة وصالات مزدوج (علمين بقاعدة واحدة)", titleEn: "Double Desk & Hall Flag (Two Flags One Base)", descriptionAr: "علم مكتبي مزدوج علمين على قاعدة واحدة لعرض علم الدولة وعلم المؤسسة جنباً إلى جنب", descriptionEn: "Double desk flag with two flags on one base for national and corporate flags", icon: "🎌", basePrice: 55, parentId: "cat-media" },
  { id: "media-flag-large", titleAr: "علم مكتبة وصالات كبير بحامل فاخر", titleEn: "Large Desk & Hall Flag with Premium Stand", descriptionAr: "علم مكتبي كبير 90×150 سم مع حامل أرضي فاخر وقاعدة ثقيلة للصالات والفعاليات", descriptionEn: "Large desk flag 90×150cm with premium floor stand and heavy base for halls and events", icon: "🇪🇭", basePrice: 180, parentId: "cat-media" },
  { id: "media-outdoor-sail", titleAr: "شراع خارجي للواجهات ولافتات ثابتة وضوئية LED وألواح PVC", titleEn: "Outdoor Sail, Fixed & LED Signs, PVC Boards", descriptionAr: "شراع إعلاني خارجي، لافتات ثابتة للمحلات، لافتات ضوئية LED، ألواح PVC للطباعة الرقمية", descriptionEn: "Outdoor advertising sail, fixed shop signs, LED signs, PVC boards for digital printing", icon: "🪧", basePrice: 350, parentId: "cat-media" },
  { id: "media-sign-fixed", titleAr: "لافتات ثابتة للواجهات والمحلات", titleEn: "Fixed Signs for Shop Fronts & Offices", descriptionAr: "لافتات ثابتة للواجهات والمحلات من الأكريليك والمعدن وPVC بطباعة UV احترافية", descriptionEn: "Fixed facade and shop signs in acrylic, metal and PVC with professional UV printing", icon: "🪧", basePrice: 180, parentId: "cat-media" },
  { id: "media-sign-light", titleAr: "لافتات ضوئية متحركة وحروف بارزة LED", titleEn: "Lighted Signs & LED Raised Letters", descriptionAr: "لافتات ضوئية LED داخلية وخارجية مع حروف بارزة وإضاءة متحركة للمحلات والعلامات التجارية", descriptionEn: "Internal/external LED signs with raised illuminated letters for shops and brands", icon: "💡", basePrice: 350, parentId: "cat-media" },
  { id: "media-pvc-board", titleAr: "طباعة ألواح PVC للإعلانات", titleEn: "PVC Board Advertising Printing", descriptionAr: "طباعة رقمية مباشرة على ألواح PVC بسماكات مختلفة للوحات الداخلية والخارجية", descriptionEn: "Direct digital printing on PVC boards in various thicknesses for indoor/outdoor displays", icon: "🧱", basePrice: 100, parentId: "cat-media" },
  { id: "stand-x-mini-a3", titleAr: "إكس ستاند مكتبي مصغر A3 (طباعة + هيكل)", titleEn: "Mini Desk X-Stand A3 (Print + Frame)", descriptionAr: "إكس ستاند مكتبي مصغر A3 للمكاتب والاستقبال - طباعة ملونة مع هيكل بلاستيكي متين", descriptionEn: "Mini desk X-stand A3 for offices and reception - color print with durable plastic frame", icon: "🖼️", basePrice: 80, parentId: "cat-media" },
  { id: "stand-a3-acrylic", titleAr: "حامل مكاتب A3 أكريليك شفاف مائل فاخر", titleEn: "Premium Slanted Acrylic A3 Desk Holder", descriptionAr: "حامل عرض A3 أكريليك شفاف مائل فاخر يعرض البوسترات والصور بشكل أنيق", descriptionEn: "Slanted clear acrylic A3 desk holder elegantly displays posters and photos", icon: "🪟", basePrice: 90, parentId: "cat-media" },
  { id: "stand-a3-mesh", titleAr: "ستاند A3 شبكي معدني متعدد الأرفف للمطويات", titleEn: "Multi-Shelf Metal Mesh A3 Stand", descriptionAr: "ستاند A3 شبكي معدني متعدد الأرفف والجيوب لعرض المطويات والكتيبات بشكل منظم", descriptionEn: "Multi-shelf metal mesh A3 stand with pockets for organized brochure display", icon: "🏗️", basePrice: 150, parentId: "cat-media" },
  { id: "stand-x-large", titleAr: "إكس ستاند كبير للصالات والمعارض (طباعة + هيكل)", titleEn: "Large X-Stand for Halls (Print + Frame)", descriptionAr: "إكس ستاند كبير مع طباعة رقمية عالية الجودة وهيكل ألمنيوم متين قابل للطي", descriptionEn: "Large X-stand with high-quality digital print and durable foldable aluminum frame", icon: "🖼️", basePrice: 250, parentId: "cat-media" },
  { id: "stand-roll-up", titleAr: "رول اب ستاند فاخر مع ماكينة ألومنيوم (طباعة + ماكينة)", titleEn: "Premium Roll-up Stand with Aluminum Machine", descriptionAr: "رول اب ستاند فاخر مع ماكينة ألومنيوم داخلية وطباعة على قماش البنر المطاطي", descriptionEn: "Premium roll-up stand with internal aluminum machine and stretch banner fabric print", icon: "📜", basePrice: 450, parentId: "cat-media" },

  // ========================
  // 3. الدروع التكريمية والمسميات الفاخرة
  // ========================
  { id: "cat-awards", titleAr: "الدروع التكريمية والمسميات الفاخرة", titleEn: "Awards & Premium Nameplates", descriptionAr: "دروع تكريم فاخرة من الجلد والكريستال والخشب، مسميات مكاتب وعناوين فاخرة، مسميات أبواب وحوائط، ودروع الرتب العسكرية", descriptionEn: "Premium leather, crystal & wood honor shields, luxury desk nameplates, door signs and military rank shields", icon: "🏆", basePrice: 200, parentId: null },
  { id: "award-shield", titleAr: "دروع تكريم فاخرة (جلد / كريستال / خشب)", titleEn: "Premium Honor Shields (Leather/Crystal/Wood)", descriptionAr: "دروع تكريم فاخرة من الجلد الفاخر والكريستال الشفاف والخشب الطبيعي مع نقش ليزر دقيق", descriptionEn: "Premium honor shields in fine leather, clear crystal and natural wood with precision laser engraving", icon: "🪵", basePrice: 200, parentId: "cat-awards" },
  { id: "award-nameplate-desk", titleAr: "مسميات مكاتب وعناوين فاخرة (خشب وكريستال)", titleEn: "Premium Desk Nameplates (Wood & Crystal)", descriptionAr: "مسميات مكاتب فاخرة من الخشب والكريستال مع نقش ليزر دقيق للأسماء والمسميات الوظيفية", descriptionEn: "Premium desk nameplates in wood and crystal with precision laser engraving for names and titles", icon: "💎", basePrice: 120, parentId: "cat-awards" },
  { id: "award-nameplate-door", titleAr: "مسميات أبواب وحوائط (وجه واحد / وجهين)", titleEn: "Door & Wall Nameplates (Single/Double)", descriptionAr: "مسميات أبواب وحوائط وجه واحد أو وجهين بخامات الأكريليك والمعدن للمكاتب والقاعات", descriptionEn: "Door and wall nameplates single/double side in acrylic and metal for offices and halls", icon: "🚪", basePrice: 80, parentId: "cat-awards" },
  { id: "award-military-rank", titleAr: "دروع الرتب العسكرية والمناسبات الرسمية", titleEn: "Military Rank & Ceremony Shields", descriptionAr: "دروع الرتب العسكرية والمناسبات الرسمية بتصميم خاص ونقش ليزر دقيق", descriptionEn: "Military rank and official ceremony shields with custom design and precise engraving", icon: "🎖️", basePrice: 350, parentId: "cat-awards" },

  // ========================
  // 4. الهدايا التذكارية والطباعة التخصصية والغذائية
  // ========================
  { id: "cat-gifts", titleAr: "الهدايا التذكارية والطباعة التخصصية والغذائية", titleEn: "Gifts, Specialized & Food Printing", descriptionAr: "شموع مناسبات، طباعة حرارية على الميداليات والأكواب، براويز صور، قص فينيل، وطباعة غذائية على ورق السكر والترانسفير والويفر", descriptionEn: "Event candles, heat printing on medals/cups, photo frames, vinyl cutting, edible printing on sugar sheets, choco transfer & wafer paper", icon: "🎁", basePrice: 150, parentId: null },
  { id: "gift-candle-set", titleAr: "طقم شموع مناسبات ثلاثي (3 قطع مع طباعة)", titleEn: "Triple Event Candle Set (3 Pcs with Print)", descriptionAr: "طقم شموع مناسبات 3 قطع مع طباعة حرارية للصور والشعارات وتزيين فني", descriptionEn: "3-piece event candle set with heat printing for photos/logos and artistic decoration", icon: "🕯️", basePrice: 150, parentId: "cat-gifts" },
  { id: "gift-medal-print", titleAr: "طباعة حرارية على الميداليات التذكارية", titleEn: "Heat Printing on Souvenir Medals", descriptionAr: "طباعة حرارية على الميداليات المعدنية والبلاستيكية للصور والشعارات", descriptionEn: "Heat printing on metal and plastic medals for photos and logos", icon: "🏅", basePrice: 80, parentId: "cat-gifts" },
  { id: "gift-photo-frame", titleAr: "إطارات وبراويز صور (معدن وزجاج)", titleEn: "Metal & Glass Photo Frames", descriptionAr: "إطارات وبراويز صور فاخرة من المعدن والزجاج بمقاسات مختلفة مع طباعة وحفر ليزر", descriptionEn: "Luxury metal and glass photo frames in all sizes with printing and laser engraving", icon: "🖼️", basePrice: 100, parentId: "cat-gifts" },
  { id: "gift-vinyl-cutting", titleAr: "قص فينيل لاصق وحراري (للواجهات والملابس)", titleEn: "Adhesive & Heat Vinyl Cutting", descriptionAr: "قص فينيل لاصق للواجهات والزجاج وفينيل حراري للملابس والتيشيرتات", descriptionEn: "Adhesive vinyl cutting for facades and glass, heat vinyl for apparel and t-shirts", icon: "✂️", basePrice: 120, parentId: "cat-gifts" },
  { id: "gift-heat-print-general", titleAr: "مطبوعات حرارية عامة (أكواب / تيشيرتات / سيراميك)", titleEn: "General Heat Printing (Cups/T-shirts/Ceramics)", descriptionAr: "طباعة حرارية على الأكواب والتيشيرتات والسيراميك + طباعة غذائية على ورق السكر والترانسفير والويفر", descriptionEn: "Heat printing on cups, t-shirts and ceramics + edible printing on sugar/choco/wafer paper", icon: "🧁", basePrice: 60, parentId: "cat-gifts" },
  { id: "gift-sugar-sheet", titleAr: "طباعة ورق سكر (Sugar Sheet) صالح للأكل", titleEn: "Edible Sugar Sheet Printing", descriptionAr: "طباعة صالحة للأكل على ورق السكر لتزيين الكيك والكب كيك والمناسبات", descriptionEn: "Edible printing on sugar sheets for cake decoration, cupcakes and events", icon: "🍰", basePrice: 50, parentId: "cat-gifts" },
  { id: "gift-choco-transfer", titleAr: "طباعة ورق ترانسفير شوكولاتة (Choco Transfer)", titleEn: "Choco Transfer Paper Printing", descriptionAr: "ورق ترانسفير شوكولاتة لنقل الصور والتصاميم على الشوكولاتة المخصصة", descriptionEn: "Chocolate transfer paper for printing images onto custom chocolates", icon: "🍫", basePrice: 60, parentId: "cat-gifts" },
  { id: "gift-wafer-paper", titleAr: "طباعة ورق ويفر/أرز (Wafer Paper) صالح للأكل", titleEn: "Edible Wafer / Rice Paper Printing", descriptionAr: "ورق ويفر وأرز صالح للأكل لصنع المجسمات السكرية وتزيين الكوكيز والكيك", descriptionEn: "Edible wafer and rice paper for sugar sculptures, cookies and cake decorating", icon: "🍪", basePrice: 70, parentId: "cat-gifts" },

  // ========================
  // 5. التعبئة والتغليف والورقيات المتقدمة
  // ========================
  { id: "cat-papers", titleAr: "التعبئة والتغليف والورقيات المتقدمة", titleEn: "Packaging & Advanced Paper Products", descriptionAr: "أكياس ورقية هدايا فاخرة، كروت تعريف 300 جرام وجه ووجهين، مطويات وكتيبات، شهادات قماشية، طباعة كانفاس، ومخططات كوبيست", descriptionEn: "Luxury paper gift bags, 300g ID cards single/double, brochures, fabric certificates, canvas printing & copiest plans", icon: "📄", basePrice: 80, parentId: null },
  { id: "paper-gift-bag", titleAr: "طباعة أكياس ورقية فاخرة للهدايا", titleEn: "Luxury Paper Gift Bags Printing", descriptionAr: "أكياس ورقية فاخرة للهدايا بطباعة مخصصة للشعارات والتصاميم بمقاسات متعددة", descriptionEn: "Luxury paper gift bags with custom logo printing in multiple sizes", icon: "🛍️", basePrice: 50, parentId: "cat-papers" },
  { id: "paper-id-single", titleAr: "كروت تعريف شخصية 300 جرام (طباعة وجه واحد)", titleEn: "300g ID Cards (Single-Side Print)", descriptionAr: "كروت تعريف من ورق 300 جرام مع طباعة وجه واحد عالية الجودة", descriptionEn: "300g card paper ID cards with single-side high-quality printing", icon: "🪪", basePrice: 25, parentId: "cat-papers" },
  { id: "paper-id-double", titleAr: "كروت تعريف شخصية 300 جرام (طباعة وجهين)", titleEn: "300g ID Cards (Double-Side Print)", descriptionAr: "كروت تعريف من ورق 300 جرام مع طباعة وجهين كاملتين بالملون", descriptionEn: "300g card paper ID cards with full double-sided color printing", icon: "🆔", basePrice: 35, parentId: "cat-papers" },
  { id: "paper-stickers-more", titleAr: "مطويات وكتيبات وملصقات مقواة ومخططات كوبيست", titleEn: "Brochures, Booklets, Stickers & Copiest Plans", descriptionAr: "مطويات وبروشورات، كتيبات، ملصقات مقواة، ومخططات كوبيست هندسية ملونة وأسود", descriptionEn: "Brochures and flyers, booklets, reinforced stickers, and engineering copiest plans", icon: "📑", basePrice: 30, parentId: "cat-papers" },
  { id: "paper-certificate-fabric", titleAr: "شهادات شكر وتقدير بغلاف قماشي فخم", titleEn: "Premium Fabric Certificate in Luxury Cover", descriptionAr: "شهادات شكر فاخرة مطبوعة على ورق فاخر بغلاف قماشي فخم مع شريط", descriptionEn: "Premium appreciation certificates on fine paper in fabric cover with ribbon", icon: "📜", basePrice: 100, parentId: "cat-papers" },
  { id: "paper-canvas-print", titleAr: "طباعة على ورق قطني كانفاس للوحات الفنية", titleEn: "Art Canvas Printing on Cotton Paper", descriptionAr: "طباعة رقمية على ورق كانفاس قطني للوحات الفنية والصور والديكور المكتبي", descriptionEn: "Digital printing on cotton canvas paper for art pieces, photos and office decor", icon: "🎨", basePrice: 200, parentId: "cat-papers" },
  { id: "papers-copiest", titleAr: "مخططات كوبيست هندسية (ملونة وأسود)", titleEn: "Engineering Copiest Plans (Color & B&W)", descriptionAr: "طباعة كوبيست ملونة وأسود للمخططات الهندسية والمطبوعات المكتبية", descriptionEn: "Color and B&W copiest printing for engineering plans and office prints", icon: "📝", basePrice: 15, parentId: "cat-papers" },

  // ===== الأقسام القديمة (احتفاظ للتوافق مع الطلبات السابقة) =====
  { id: "shields-gifts", titleAr: "قسم الدروع والهدايا التذكارية", titleEn: "Shields & Souvenirs", descriptionAr: "دروع خشب وكريستال وجلد فاخرة، هدايا تذكارية وميداليات معدنية، وستاندات زجاجية وأكريليك A4 للمكاتب والمناسبات", descriptionEn: "Premium wood, crystal & leather shields, souvenir medals, glass & acrylic A4 stands for offices and events", icon: "🏆", basePrice: 200, parentId: null },
  { id: "nameplates", titleAr: "قسم المسميات واللوحات المكتبية", titleEn: "Nameplates & Desk Signs", descriptionAr: "مسميات مكتبية فاخرة كريستال وخشب، مسميات مكاتب وجه واحد وجانبية وجهين بجودة عالية", descriptionEn: "Premium crystal & wood nameplates, single-face and double-side desk name signs", icon: "🪪", basePrice: 80, parentId: null },
  { id: "certificates", titleAr: "شهادات الشكر والتقدير", titleEn: "Certificates of Appreciation", descriptionAr: "شهادات شكر وتقدير فاخرة قماشية بطبعة عالية الجودة، مثالية للتكريم في المؤسسات والشركات", descriptionEn: "Premium fabric appreciation certificates with high-quality printing, perfect for corporate recognition", icon: "📜", basePrice: 60, parentId: null },
  { id: "paper-prints", titleAr: "المطبوعات الورقية", titleEn: "Paper Prints", descriptionAr: "كروت شخصية وكروت متابعة، بروشورات ومطويات دعائية بتصميم احترافي وأعلى جودة طباعة", descriptionEn: "Business cards, follow-up cards, brochures and flyers with professional design and high-quality print", icon: "📄", basePrice: 50, parentId: null },
  { id: "vinyl-printing", titleAr: "قسم قص الفينيل والطباعة الرقمية", titleEn: "Vinyl Cutting & Digital Printing", descriptionAr: "قص فينيل احترافي، طباعة بنر وفينيل شفاف ومعتم، طباعة قماش، وفينيل مرمل للزجاج", descriptionEn: "Professional vinyl cutting, banner printing, transparent & opaque vinyl, fabric printing, and sandblasted vinyl for glass", icon: "🖨️", basePrice: 150, parentId: null },
  { id: "stickers", titleAr: "قسم الملصقات والاستيكرات", titleEn: "Stickers & Labels", descriptionAr: "ملصقات منتجات دائرية ومربعة، استيكرات مقاومة للماء وقص مخصص بجودة طباعة عالية", descriptionEn: "Round and square product labels, waterproof stickers and custom cut stickers with high-quality print", icon: "🏷️", basePrice: 30, parentId: null },
  { id: "social-media-design", titleAr: "تصميم السوشيال ميديا", titleEn: "Social Media Design", descriptionAr: "تصميم بوستات فيسبوك وإنستغرام احترافية، تصميم شعارات وهويات بصرية كاملة للعلامات التجارية", descriptionEn: "Professional Facebook & Instagram post designs, logo design and complete visual branding", icon: "📱", basePrice: 200, parentId: null },
  { id: "food-printing", titleAr: "قسم الطباعة الغذائية", titleEn: "Food Printing", descriptionAr: "طباعة صالحة للأكل على الكيك والشوكولاتة والكوكيز بأعلى جودة وألوان زاهية طبيعية", descriptionEn: "Edible printing on cakes, chocolates, and cookies with highest quality and vibrant natural colors", icon: "🧁", basePrice: 50, parentId: null },
  { id: "shields-wood-crystal-leather", titleAr: "دروع خشب وكريستال وجلد", titleEn: "Wood, Crystal & Leather Shields", descriptionAr: "دروع فاخرة من الخشب الطبيعي والكريستال الشفاف والجلد الفاخر مع نقش ليزر دقيق", descriptionEn: "Premium shields in natural wood, clear crystal and fine leather with precision laser engraving", icon: "🪵", basePrice: 200, parentId: "shields-gifts" },
  { id: "souvenirs-medals", titleAr: "هدايا تذكارية وميداليات معدنية", titleEn: "Souvenirs & Metal Medals", descriptionAr: "هدايا تذكارية متنوعة وميداليات معدنية مخصصة بتصاميم فريدة للمناسبات والمؤتمرات والتكريم", descriptionEn: "Various souvenirs and custom metal medals with unique designs for events, conferences and recognition", icon: "🎖️", basePrice: 100, parentId: "shields-gifts" },
  { id: "glass-acrylic-stand-a4", titleAr: "ستاند زجاجي وأكريليك A4", titleEn: "Glass & Acrylic A4 Stand", descriptionAr: "ستاندات عرض زجاجية وأكريليك بمقاس A4 مع حفر ليزر احترافي", descriptionEn: "Glass and acrylic A4 display stands with professional laser engraving", icon: "🖼️", basePrice: 150, parentId: "shields-gifts" },
  { id: "nameplates-crystal-wood", titleAr: "مسميات مكتبية فاخرة كريستال وخشب", titleEn: "Premium Crystal & Wood Nameplates", descriptionAr: "مسميات مكاتب فاخرة من الكريستال والخشب مع نقش ليزر دقيق للمديرين والموظفين", descriptionEn: "Premium desk nameplates in crystal and wood with precise laser engraving for managers and staff", icon: "💎", basePrice: 120, parentId: "nameplates" },
  { id: "nameplates-single-double", titleAr: "مسميات مكاتب وجه واحد وجانبية وجهين", titleEn: "Single & Double-Side Desk Nameplates", descriptionAr: "مسميات مكاتب وجه واحد للمكاتب الأمامية وجانبية وجهين للاجتماعات والغرف الزجاجية", descriptionEn: "Single-face desk nameplates for front desks and double-side nameplates for meetings and glass rooms", icon: "🪟", basePrice: 80, parentId: "nameplates" },
  { id: "certificates-fabric", titleAr: "شهادات شكر وتقدير فاخرة قماشية", titleEn: "Premium Fabric Certificates", descriptionAr: "شهادات شكر وتقدير على قماش فاخر بطبعة عالية الجودة مع إطار اختياري", descriptionEn: "Appreciation certificates on premium fabric with high-quality print and optional frame", icon: "🧧", basePrice: 60, parentId: "certificates" },
  { id: "business-cards", titleAr: "كروت شخصية وكروت متابعة", titleEn: "Business & Follow-up Cards", descriptionAr: "كروت شخصية فاخرة بمقاسات وخامات متعددة مع تشطيب احترافي", descriptionEn: "Premium business cards in multiple sizes and finishes with professional touch", icon: "🆔", basePrice: 50, parentId: "paper-prints" },
  { id: "brochures-flyers", titleAr: "بروشورات ومطويات", titleEn: "Brochures & Flyers", descriptionAr: "بروشورات ومطويات دعائية مطوية بتصميم جذاب وطباعة عالية الجودة للإعلان عن منتجاتك وخدماتك", descriptionEn: "Folded promotional brochures and flyers with attractive design and high-quality print", icon: "📑", basePrice: 100, parentId: "paper-prints" },
  { id: "vinyl-cutting", titleAr: "قص فينيل", titleEn: "Vinyl Cutting", descriptionAr: "قص فينيل احترافي للأحرف والتصاميم والكتابات بدقة عالية على أروع الألوان والمقاسات", descriptionEn: "Professional vinyl cutting for letters, designs and writings with high precision", icon: "✂️", basePrice: 80, parentId: "vinyl-printing" },
  { id: "banner-vinyl-printing", titleAr: "طباعة بنر وفينيل شفاف ومعتم", titleEn: "Banner & Vinyl Printing", descriptionAr: "طباعة راية (بنر) خارجية عالية الجودة، فينيل شفاف للزجاج والمعتم للجدران بمقاسات مختلفة", descriptionEn: "High-quality outdoor banner printing, transparent vinyl for glass and opaque vinyl for walls", icon: "🪧", basePrice: 150, parentId: "vinyl-printing" },
  { id: "fabric-printing", titleAr: "طباعة قماش", titleEn: "Fabric Printing", descriptionAr: "طباعة رقمية على القماش بجودة عالية للافتات والبراويز والتصاميم الدعائية", descriptionEn: "Digital fabric printing with high quality for banners, frames and promotional designs", icon: "🧵", basePrice: 120, parentId: "vinyl-printing" },
  { id: "sandblasted-vinyl", titleAr: "فينيل مرمل للزجاج", titleEn: "Sandblasted Glass Vinyl", descriptionAr: "فينيل مرمل للزجاج لمظهر زجاج مصنفر فاخر للخصوصية والديكور", descriptionEn: "Sandblasted vinyl for glass for a premium frosted glass look for privacy and decor", icon: "🪟", basePrice: 200, parentId: "vinyl-printing" },
  { id: "product-stickers", titleAr: "ملصقات منتجات دائرية ومربعة", titleEn: "Round & Square Product Labels", descriptionAr: "ملصقات منتجات دائرية ومربعة بجودة طباعة عالية للمنتجات الغذائية والتجارية", descriptionEn: "Round and square product labels with high-quality print for food and commercial products", icon: "🔵", basePrice: 30, parentId: "stickers" },
  { id: "waterproof-stickers", titleAr: "استيكرات مقاومة للماء وقص مخصص", titleEn: "Waterproof & Custom Cut Stickers", descriptionAr: "استيكرات مقاومة للماء والظروف الجوية للسيارات والواجهات وقص مخصص لأي شكل", descriptionEn: "Waterproof stickers resistant to weather conditions for cars and facades, custom cut to any shape", icon: "💧", basePrice: 50, parentId: "stickers" },
  { id: "social-posts", titleAr: "تصميم بوستات فيسبوك وإنستغرام", titleEn: "Facebook & Instagram Posts Design", descriptionAr: "تصميم بوستات احترافية لوسائل التواصل الاجتماعي بحسب هوية علامتك التجارية", descriptionEn: "Professional social media post designs aligned with your brand identity", icon: "📱", basePrice: 200, parentId: "social-media-design" },
  { id: "logo-branding", titleAr: "تصميم شعارات وهويات بصرية كاملة", titleEn: "Logo & Complete Visual Identity", descriptionAr: "تصميم شعار احترافي وهوية بصرية متكاملة تشمل الألوان والخطوط والأدلة الإرشادية", descriptionEn: "Professional logo design and complete visual identity including colors, fonts and brand guidelines", icon: "🎨", basePrice: 800, parentId: "social-media-design" },
  { id: "food-sugar-sheet", titleAr: "طباعة ورق سكر (Sugar Sheet)", titleEn: "Sugar Sheet Printing", descriptionAr: "طباعة صالحة للأكل على ورق السكر لتزيين الكيك والكب كيك والمناسبات", descriptionEn: "Edible printing on sugar sheets for cake decoration, cupcakes and events", icon: "🍰", basePrice: 50, parentId: "food-printing" },
  { id: "food-choco-transfer", titleAr: "طباعة ورق ترانسفير (Choco Transfer)", titleEn: "Choco Transfer Printing", descriptionAr: "ورق ترانسفير شوكولاتة لنقل الصور والتصاميم على الشوكولاتة المخصصة", descriptionEn: "Chocolate transfer paper for transferring images onto custom chocolates", icon: "🍫", basePrice: 60, parentId: "food-printing" },
  { id: "food-wafer-paper", titleAr: "طباعة ورق ويفر/أرز (Wafer Paper)", titleEn: "Wafer / Rice Paper Printing", descriptionAr: "ورق ويفر وأرز صالح للأكل لصنع المجسمات السكرية وتزيين الكوكيز والكيك", descriptionEn: "Edible wafer and rice paper for sugar sculptures, cookie decorating and cakes", icon: "🍪", basePrice: 70, parentId: "food-printing" },
  { id: "flags-section", titleAr: "قسم الأعلام", titleEn: "Flags Section", descriptionAr: "أعلام مكتبية فردية ومزدوجة صغيرة وكبيرة، أشرعة خارجية للفعاليات والمؤسسات والمناسبات بأعلى جودة", descriptionEn: "Single and double small and large desk flags, outdoor sails for events and institutions", icon: "🚩", basePrice: 35, parentId: null },
  { id: "prints-boards", titleAr: "قسم المطبوعات واللوحات", titleEn: "Prints & Boards", descriptionAr: "ستيكرات مقوى، كروت تعريف شخصية، لافتات ثابتة وضوئية، طباعة ألواح PVC، مطبوعات كوبيست", descriptionEn: "Reinforced stickers, ID cards, fixed and light signs, PVC board printing, copiest prints", icon: "🪧", basePrice: 25, parentId: null },
  { id: "flag-desk-single", titleAr: "علم مكتبة صغير فردي", titleEn: "Small Single Desk Flag", descriptionAr: "علم مكتبي صغير فردي بخامات عالية الجودة مع قاعدة وطباعة راقية لشعار المؤسسة", descriptionEn: "Small single desk flag with high-quality materials, base and elegant logo printing", icon: "🚩", basePrice: 35, parentId: "flags-section" },
  { id: "flag-desk-double", titleAr: "علم مكتبة صغير مزدوج", titleEn: "Small Double Desk Flag", descriptionAr: "علم مكتبي صغير مزدوج (علمين على قاعدة واحدة) للشركات لعرض علم الدولة وعلم المؤسسة", descriptionEn: "Small double desk flag (two flags on one base) for company flag and national flag", icon: "🎌", basePrice: 55, parentId: "flags-section" },
  { id: "flag-desk-large", titleAr: "علم مكتبة كبير", titleEn: "Large Desk Flag", descriptionAr: "علم مكتبي كبير الحجم بطول 90×150 سم مع قاعدة ثقيلة للاستخدام اليومي في المكاتب", descriptionEn: "Large desk flag 90×150cm with heavy base for daily use in executive offices", icon: "🇪🇭", basePrice: 120, parentId: "flags-section" },
  { id: "flag-outdoor-sail", titleAr: "شراع خارجي", titleEn: "Outdoor Sail", descriptionAr: "شراع إعلاني خارجي كبير بخامة متينة مقاومة للعوامل الجوية والرياح للفعاليات والواجهات", descriptionEn: "Large outdoor advertising sail in durable weather-resistant material for events", icon: "🏴", basePrice: 250, parentId: "flags-section" },
  { id: "print-sticker-reinforced", titleAr: "ستيكرات مقوى", titleEn: "Reinforced Stickers", descriptionAr: "ستيكرات مقوى بسماكة عالية وخامة متينة للاستخدام الطويل على الأسطح - للواجهات والسيارات", descriptionEn: "Reinforced thick high-durability stickers for long-term use on surfaces and cars", icon: "🔲", basePrice: 40, parentId: "prints-boards" },
  { id: "print-id-cards", titleAr: "كروت تعريف شخصية", titleEn: "Personal ID Cards", descriptionAr: "كروت تعريف شخصية بلاستيكية عالية الجودة مع طباعة ملونة ووجهين مع إضافة باركود وصورة", descriptionEn: "High-quality plastic ID cards with full-color double-sided printing, barcode and photo", icon: "🪪", basePrice: 25, parentId: "prints-boards" },
  { id: "print-sign-fixed", titleAr: "لافتات ثابتة", titleEn: "Fixed Signs", descriptionAr: "لافتات ثابتة للمحلات والمكاتب من خامات متعددة (أكريليك، PVC، معدن) بطباعة UV", descriptionEn: "Fixed signs for shops and offices in acrylic, PVC, metal with professional UV printing", icon: "🪧", basePrice: 180, parentId: "prints-boards" },
  { id: "print-sign-light", titleAr: "لافتات ضوئية", titleEn: "Lighted Signs", descriptionAr: "لافتات ضوئية بإضاءة LED داخلية أو خارجية للمحلات والعلامات التجارية مع لوحة أكريليك مضيئة", descriptionEn: "Lighted signs with internal or external LED for shops with illuminated acrylic panel", icon: "💡", basePrice: 350, parentId: "prints-boards" },
  { id: "print-pvc-board", titleAr: "طباعة ألواح PVC", titleEn: "PVC Board Printing", descriptionAr: "طباعة رقمية مباشرة على ألواح PVC بسماكات مختلفة للوحات العرض الداخلية والخارجية", descriptionEn: "Direct digital printing on PVC boards in various thicknesses for indoor/outdoor displays", icon: "🧱", basePrice: 100, parentId: "prints-boards" },
  { id: "print-copiest", titleAr: "مطبوعات كوبيست", titleEn: "Copiest Prints", descriptionAr: "طباعة كوبيست ملونة وأسود لجميع المطبوعات المكتبية والإدارية بأسعار تنافسية", descriptionEn: "Color and B/W copiest printing for all office and admin prints at competitive prices", icon: "📝", basePrice: 15, parentId: "prints-boards" },


];

function getLocal(): Service[] {
  if (typeof window === "undefined") return DEFAULT_SERVICES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }
    return JSON.parse(raw) || DEFAULT_SERVICES;
  } catch {
    return DEFAULT_SERVICES;
  }
}

function saveLocal(services: Service[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch (err) {
    console.warn("[saveLocal] Failed to save services:", err);
  }
}

async function syncToCloud(services: Service[]): Promise<void> {
  try {
    for (const s of services) {
      await fetchWithCSRF("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: s.id,
          title_ar: s.titleAr,
          title_en: s.titleEn,
          description_ar: s.descriptionAr,
          description_en: s.descriptionEn,
          icon: s.icon,
          image_url: s.imageUrl || null,
          base_price: s.basePrice,
          parent_id: s.parentId,
          attributes: s.attributes || [],
        }),
      });
    }
  } catch (err) {
    console.warn("[syncToCloud] Failed to sync services:", err);
  }
}

export async function fetchCloudServices(): Promise<Service[] | null> {
  // 1. try API route (works on website/deployed, not in static export/Tauri)
  try {
    const resp = await fetch("/api/services");
    if (resp.ok) {
      const json = await resp.json();
      if (json?.data && Array.isArray(json.data)) {
        return json.data.map(mapCloudRow);
      }
    }
  } catch (err) {
    console.warn("[fetchCloudServices] API route unavailable:", err);
  }

  // 2. fallback: direct Supabase query with anon key (SELECT allowed by RLS)
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return null;
    if (!data || !Array.isArray(data)) return null;
    return data.map(mapCloudRow);
  } catch (err) {
    console.warn("[fetchCloudServices] Supabase query failed:", err);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- cloud data from Supabase RPC
function mapCloudRow(r: any): Service {
  const attrs = Array.isArray(r.attributes) ? r.attributes : [];
  return {
    id: r.id,
    titleAr: r.title_ar || "",
    titleEn: r.title_en || "",
    descriptionAr: r.description_ar || "",
    descriptionEn: r.description_en || "",
    icon: r.icon || "📦",
    imageUrl: r.image_url || undefined,
    basePrice: Number(r.base_price) || 0,
    parentId: r.parent_id == null || r.parent_id === "" ? null : r.parent_id,
    attributes: attrs,
  } as Service;
}

export async function getAllServices(): Promise<Service[]> {
  const cloud = await fetchCloudServices();
  if (cloud && cloud.length > 0) {
    saveLocal(cloud);
    return cloud;
  }
  return getLocal();
}

export function getParentServices(): Service[] {
  return getLocal().filter((s) => s.parentId === null);
}

export function getChildServices(parentId: string): Service[] {
  return getLocal().filter((s) => s.parentId === parentId);
}

export function getServiceById(id: string): Service | undefined {
  return getLocal().find((s) => s.id === id);
}

export async function addService(service: Service): Promise<void> {
  const all = getLocal();
  all.push(service);
  saveLocal(all);
  await syncToCloud(all);
}

export async function updateService(id: string, updates: Partial<Service>): Promise<boolean> {
  const all = getLocal();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  all[idx] = { ...all[idx], ...updates };
  saveLocal(all);
  try {
    await fetchWithCSRF("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: all[idx].id,
        title_ar: all[idx].titleAr,
        title_en: all[idx].titleEn,
        description_ar: all[idx].descriptionAr,
        description_en: all[idx].descriptionEn,
        icon: all[idx].icon,
        image_url: all[idx].imageUrl || null,
        base_price: all[idx].basePrice,
        parent_id: all[idx].parentId,
        attributes: all[idx].attributes || [],
      }),
    });
  } catch (err) {
    console.warn("[updateService] Cloud sync failed:", err);
  }
  return true;
}

export async function deleteService(id: string): Promise<boolean> {
  const all = getLocal();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  saveLocal(all);
  try {
    await fetchWithCSRF("/api/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  } catch (err) {
    console.warn("[deleteService] Cloud sync failed:", err);
  }
  return true;
}

export async function seedDefaultServices(): Promise<void> {
  if (typeof window !== "undefined") {
    const version = localStorage.getItem(SEED_VERSION_KEY);
    if (version === SEED_VERSION) return;
  }
  saveLocal(DEFAULT_SERVICES);
  if (typeof window !== "undefined") {
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
  }
  await syncToCloud(DEFAULT_SERVICES);
}
