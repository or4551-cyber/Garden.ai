-- Seed data for testing

-- Insert sample projects
INSERT INTO projects (id, name, location, dimensions, notes, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'גינת האחורית - משפחת כהן', 
 '{"address": "רמת גן", "climateZone": "ים תיכוני"}'::jsonb,
 '{"width": 8, "length": 12, "unit": "m"}'::jsonb,
 'רוצים בריכה קטנה, דק עץ, וצמחייה טרופית',
 'ready');

INSERT INTO projects (id, name, location, dimensions, notes, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'חצר בית הספר',
 '{"address": "תל אביב", "climateZone": "ים תיכוני"}'::jsonb,
 '{"width": 20, "length": 30, "unit": "m"}'::jsonb,
 'גינה ציבורית, צריכה להיות קלה לתחזוקה, עם מקומות ישיבה',
 'draft');

-- Insert sample style references
INSERT INTO style_references (image_url, description, tags) VALUES
('https://example.com/style1.jpg', 'גינת בריכה בסגנון ים תיכוני עם דק עץ', 
 ARRAY['בריכה', 'דק', 'ים תיכוני', 'טרופי']);

INSERT INTO style_references (image_url, description, tags) VALUES
('https://example.com/style2.jpg', 'גינה ציבורית עם דשא ומקומות ישיבה',
 ARRAY['דשא', 'ישיבה', 'ציבורי', 'מינימליסטי']);
