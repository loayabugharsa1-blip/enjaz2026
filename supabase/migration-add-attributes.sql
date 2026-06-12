-- Add attributes JSONB column to services (product options)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'attributes'
  ) THEN
    EXECUTE 'ALTER TABLE services ADD COLUMN attributes jsonb not null default ''[]''::jsonb';
    RAISE NOTICE 'Added attributes column to services';
  END IF;
END $$;

-- Update shield service with material options
UPDATE services SET attributes = '[
  {"nameAr":"الخامة","nameEn":"Material","type":"select","required":true,"options":[{"labelAr":"خشب","labelEn":"Wood","value":"wood","priceModifier":0},{"labelAr":"كريستال","labelEn":"Crystal","value":"crystal","priceModifier":50},{"labelAr":"جلد","labelEn":"Leather","value":"leather","priceModifier":100}]}
]'::jsonb WHERE id = 'shields-wood-crystal-leather';

-- Update nameplates with material options
UPDATE services SET attributes = '[
  {"nameAr":"الخامة","nameEn":"Material","type":"select","required":true,"options":[{"labelAr":"خشب","labelEn":"Wood","value":"wood","priceModifier":0},{"labelAr":"كريستال","labelEn":"Crystal","value":"crystal","priceModifier":30}]}
]'::jsonb WHERE id = 'nameplates-crystal-wood' OR id = 'nameplates' OR id = 'nameplates-single-double';

-- Update desk nameplates single/double
UPDATE services SET attributes = '[
  {"nameAr":"النوع","nameEn":"Type","type":"select","required":true,"options":[{"labelAr":"وجه واحد","labelEn":"Single Side","value":"single","priceModifier":0},{"labelAr":"وجهين","labelEn":"Double Side","value":"double","priceModifier":25}]}
]'::jsonb WHERE id = 'nameplates-single-double';

-- Update frames
UPDATE services SET attributes = '[
  {"nameAr":"الخامة","nameEn":"Material","type":"select","required":true,"options":[{"labelAr":"زجاج","labelEn":"Glass","value":"glass","priceModifier":0},{"labelAr":"معدن","labelEn":"Metal","value":"metal","priceModifier":30}]}
]'::jsonb WHERE id = 'frames' OR id = 'glass-acrylic-stand-a4';

-- Update certificates
UPDATE services SET attributes = '[
  {"nameAr":"الخامة","nameEn":"Material","type":"select","required":true,"options":[{"labelAr":"ورق سميك","labelEn":"Thick Paper","value":"paper","priceModifier":0},{"labelAr":"قماش قطيفة","labelEn":"Velvet Fabric","value":"velvet","priceModifier":40},{"labelAr":"ساتان","labelEn":"Satin","value":"satin","priceModifier":60}]}
]'::jsonb WHERE id = 'certificates-fabric';

-- Update paper bags
UPDATE services SET attributes = '[
  {"nameAr":"اللون","nameEn":"Color","type":"color","required":true,"options":[{"labelAr":"أسود","labelEn":"Black","value":"black","priceModifier":0},{"labelAr":"أبيض","labelEn":"White","value":"white","priceModifier":0},{"labelAr":"بني كرافت","labelEn":"Kraft Brown","value":"kraft","priceModifier":0}]}
]'::jsonb WHERE id LIKE 'packaging-%' OR id = 'packaging-bags-boxes';

-- Update menus
UPDATE services SET attributes = '[
  {"nameAr":"المقاس","nameEn":"Size","type":"size","required":true,"options":[{"labelAr":"A3","labelEn":"A3","value":"a3","priceModifier":0},{"labelAr":"A4","labelEn":"A4","value":"a4","priceModifier":-10},{"labelAr":"A5","labelEn":"A5","value":"a5","priceModifier":-20}]}
]'::jsonb WHERE id = 'menus' OR id = 'brochures-flyers';

-- Update stands
UPDATE services SET attributes = '[
  {"nameAr":"النوع","nameEn":"Type","type":"select","required":true,"options":[{"labelAr":"إكس ستاند","labelEn":"X-Stand","value":"xstand","priceModifier":0},{"labelAr":"رول أب","labelEn":"Roll-up","value":"rollup","priceModifier":200},{"labelAr":"بوب أب","labelEn":"Pop-up","value":"popup","priceModifier":500}]}
]'::jsonb WHERE id = 'stand-x-large' OR id = 'stand-roll-up';

-- Update cups
UPDATE services SET attributes = '[
  {"nameAr":"النوع","nameEn":"Type","type":"select","required":true,"options":[{"labelAr":"سيراميك","labelEn":"Ceramic","value":"ceramic","priceModifier":0},{"labelAr":"سحري","labelEn":"Magic","value":"magic","priceModifier":15},{"labelAr":"حراري","labelEn":"Thermal","value":"thermal","priceModifier":25}]}
]'::jsonb WHERE id = 'cups-mugs';

-- Update clothing
UPDATE services SET attributes = '[
  {"nameAr":"المقاس","nameEn":"Size","type":"size","required":true,"options":[{"labelAr":"S","labelEn":"S","value":"s","priceModifier":0},{"labelAr":"M","labelEn":"M","value":"m","priceModifier":0},{"labelAr":"L","labelEn":"L","value":"l","priceModifier":0},{"labelAr":"XL","labelEn":"XL","value":"xl","priceModifier":10}]},
  {"nameAr":"اللون","nameEn":"Color","type":"color","required":true,"options":[{"labelAr":"أسود","labelEn":"Black","value":"black","priceModifier":0},{"labelAr":"أبيض","labelEn":"White","value":"white","priceModifier":0},{"labelAr":"أزرق","labelEn":"Blue","value":"blue","priceModifier":0}]}
]'::jsonb WHERE id = 'clothing-uniforms';

-- Set attributes for backward-compat entries (map to parent category defaults)
UPDATE services SET attributes = '[
  {"nameAr":"الخامة","nameEn":"Material","type":"select","required":true,"options":[{"labelAr":"عادي","labelEn":"Standard","value":"standard","priceModifier":0},{"labelAr":"فاخر","labelEn":"Premium","value":"premium","priceModifier":100}]}
]'::jsonb WHERE attributes IS NULL OR attributes = '[]'::jsonb;
