-- Seed script to insert Salon Services, Products, and Fees into the Product table

-- Clear existing data if necessary (optional, commented out for safety)
-- DELETE FROM "public"."Product";

INSERT INTO "public"."Product" ("name", "price", "description", "category", "isAvailable") VALUES

-- =====================================
-- CATEGORY: Haircuts (قص الشعر)
-- =====================================
('قص كامل (full)', 5, 'آخر موعد 5:45 م', 'Haircuts', TRUE),
('قص أطراف (trim)', 3, 'آخر موعد 5:45 م. ⛔ لا يتم تقديم خدمة القص كخدمة منزلية مستقلة، بل كإضافة للبروتين فقط.', 'Haircuts', TRUE),
('قص غرة (bangs)', 1, 'آخر موعد 5:45 م', 'Haircuts', TRUE),

-- =====================================
-- CATEGORY: Hair Dye (الصبغات)
-- =====================================
('صبغة جذور (root dye)', 10, 'جميع الصبغات إيطالية، خالية من الأمونيا، وآمنة للاستخدام فوراً بعد البروتين.', 'Hair Dye', TRUE),
('صبغة كاملة (full dye)', 15, 'السعر يتراوح بين 15–25 دينار (حسب الطول والكثافة). آخر موعد 4:30 م. ⛔ لا يتم تقديم خدمة الصبغة كخدمة منزلية مستقلة، بل كإضافة للبروتين فقط.', 'Hair Dye', TRUE),
('صبغة هايلايت / خصل (highlights)', 0, 'السعر يعتمد على الطول والكثافة. آخر موعد 3:30 أو 4:00 م.', 'Hair Dye', TRUE),

-- =====================================
-- CATEGORY: Protein (البروتين)
-- =====================================
('بروتين (protein)', 0, 'آخر موعد 4:00 م', 'Protein Treatments', TRUE),

-- =====================================
-- CATEGORY: Nails (الأظافر)
-- =====================================
('جل يدين أو رجلين (gel hands or feet)', 0, 'آخر موعد 5:15 م', 'Nails', TRUE),
('جل يدين + رجلين (gel hands + feet)', 0, 'آخر موعد 5:15 م', 'Nails', TRUE),
('سوفت جل (soft gel)', 0, 'آخر موعد 4:00 م', 'Nails', TRUE),
('جل اكستنشن (gel extension)', 0, 'آخر موعد 4:00 م', 'Nails', TRUE),
('بدكير وتنظيف يد + رجل (pedicure)', 0, 'آخر موعد 5:30 م', 'Nails', TRUE),
('تركيب اظافر (nail installation)', 0, 'آخر موعد 5:15 م', 'Nails', TRUE),

-- =====================================
-- CATEGORY: Retail Products (منتجات للبيع)
-- =====================================
('منتجات عناية بالشعر (hair care products)', 0, '', 'Retail Products', TRUE),
('شامبو (shampoo)', 0, '', 'Retail Products', TRUE),
('بلسم (conditioner)', 0, '', 'Retail Products', TRUE),
('سيروم (serum)', 0, '', 'Retail Products', TRUE),
('حمام زيت (oil bath)', 0, '', 'Retail Products', TRUE),
('بروتين 100مل (protein 100ml)', 0, '', 'Retail Products', TRUE),

-- =====================================
-- CATEGORY: Home Service Transportation (رسوم التوصيل المنزلي)
-- =====================================
('توصيل منزلي: جبل الحسين، الجاردنز، جبل القصور', 5, 'ضمن عمان', 'Transportation Fees', TRUE),
('توصيل منزلي: طبربور، عبدون، المدينة الرياضية', 6, 'ضمن عمان', 'Transportation Fees', TRUE),
('توصيل منزلي: الجبيهة، أبو علندا، مرج الحمام', 7, 'ضمن عمان', 'Transportation Fees', TRUE),
('توصيل منزلي: الرصيفة، البيادر، الفحيص', 8, 'ضمن عمان', 'Transportation Fees', TRUE),
('توصيل منزلي: السلط، الزرقاء', 10, 'خارج عمان', 'Transportation Fees', TRUE),
('توصيل منزلي: إربد، الرمثا، المفرق', 15, 'خارج عمان. يتطلب متابعة بشرية.', 'Transportation Fees', TRUE),

-- =====================================
-- CATEGORY: Product Delivery Fees (رسوم توصيل المنتجات)
-- =====================================
('توصيل منتجات: داخل عمان', 3, '', 'Delivery Fees', TRUE),
('توصيل منتجات: المحافظات', 5, '', 'Delivery Fees', TRUE);
