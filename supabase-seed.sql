-- =====================================================
-- SEED COMPLETO PARA CAFÉ CURSOR - SUPABASE
-- =====================================================

-- Limpiar datos existentes (opcional)
DELETE FROM "EligibleUser";
DELETE FROM "Credit";

-- =====================================================
-- INSERTAR CRÉDITOS REALES DE CURSOR
-- =====================================================
INSERT INTO "Credit" ("id", "code", "link", "isUsed", "isTest", "createdAt", "updatedAt") VALUES 
('c1', 'IOCDK5XY8Y6V', 'https://cursor.com/referral?code=IOCDK5XY8Y6V', false, false, NOW(), NOW()),
('c2', 'QI2T7P4J6GHV', 'https://cursor.com/referral?code=QI2T7P4J6GHV', false, false, NOW(), NOW()),
('c3', 'IMCWTDS3ZXK', 'https://cursor.com/referral?code=IMCWTDS3ZXK', false, false, NOW(), NOW()),
('c4', 'ZQAVUFVJD76T', 'https://cursor.com/referral?code=ZQAVUFVJD76T', false, false, NOW(), NOW()),
('c5', '3OL6UOTHP17C', 'https://cursor.com/referral?code=3OL6UOTHP17C', false, false, NOW(), NOW()),
('c6', '4N23KPDMOVU', 'https://cursor.com/referral?code=4N23KPDMOVU', false, false, NOW(), NOW()),
('c7', '1X1I04SD9TH', 'https://cursor.com/referral?code=1X1I04SD9TH', false, false, NOW(), NOW()),
('c8', '6WHG9LUC9FLH', 'https://cursor.com/referral?code=6WHG9LUC9FLH', false, false, NOW(), NOW()),
('c9', 'TKIJESP22Q', 'https://cursor.com/referral?code=TKIJESP22Q', false, false, NOW(), NOW()),
('c10', 'M4472WWC7N4', 'https://cursor.com/referral?code=M4472WWC7N4', false, false, NOW(), NOW()),
('c11', 'X3KAZWGBB6PV', 'https://cursor.com/referral?code=X3KAZWGBB6PV', false, false, NOW(), NOW()),
('c12', 'IKOI7BMDKXRW', 'https://cursor.com/referral?code=IKOI7BMDKXRW', false, false, NOW(), NOW()),
('c13', '8XZOM9ULF8K', 'https://cursor.com/referral?code=8XZOM9ULF8K', false, false, NOW(), NOW()),
('c14', 'Y6JACXL4DJNB', 'https://cursor.com/referral?code=Y6JACXL4DJNB', false, false, NOW(), NOW()),
('c15', 'E4DPYCFIUYMA', 'https://cursor.com/referral?code=E4DPYCFIUYMA', false, false, NOW(), NOW()),
('c16', 'TQODTEQFCAB', 'https://cursor.com/referral?code=TQODTEQFCAB', false, false, NOW(), NOW()),
('c17', 'WJCW66LSRI', 'https://cursor.com/referral?code=WJCW66LSRI', false, false, NOW(), NOW()),
('c18', '5LBTDD8Q2B', 'https://cursor.com/referral?code=5LBTDD8Q2B', false, false, NOW(), NOW()),
('c19', 'YQB8EQS72RRF', 'https://cursor.com/referral?code=YQB8EQS72RRF', false, false, NOW(), NOW()),
('c20', 'QTFC6ZRZVFGG', 'https://cursor.com/referral?code=QTFC6ZRZVFGG', false, false, NOW(), NOW());

-- =====================================================
-- INSERTAR CRÉDITOS DE TEST
-- =====================================================
INSERT INTO "Credit" ("id", "code", "link", "isUsed", "isTest", "createdAt", "updatedAt") VALUES 
('t1', 'TEST-001', 'https://cursor.com/referral?code=TEST-001', false, true, NOW(), NOW()),
('t2', 'TEST-002', 'https://cursor.com/referral?code=TEST-002', false, true, NOW(), NOW()),
('t3', 'TEST-003', 'https://cursor.com/referral?code=TEST-003', false, true, NOW(), NOW()),
('t4', 'TEST-004', 'https://cursor.com/referral?code=TEST-004', false, true, NOW(), NOW()),
('t5', 'TEST-005', 'https://cursor.com/referral?code=TEST-005', false, true, NOW(), NOW());

-- =====================================================
-- INSERTAR USUARIOS ELEGIBLES
-- =====================================================
INSERT INTO "EligibleUser" ("id", "email", "name", "company", "role", "approvalStatus", "hasClaimed", "createdAt") VALUES 
('u1', 'mockraw@gmail.com', 'Christian', NULL, NULL, 'approved', false, NOW()),
('u2', 'test@example.com', 'Test User 1', 'Test Company', 'Tester', 'approved', false, NOW()),
('u3', 'test2@example.com', 'Test User 2', 'Test Company', 'Tester', 'approved', false, NOW()),
('u4', 'andersonbosa0@gmail.com', 'Anderson Bosa', 'Mercado Livre', 'Desenvolvedor Backend', 'approved', false, NOW()),
('u5', 'alex+event@blockful.io', 'Alex Netto', 'blockful', 'founder', 'approved', false, NOW()),
('u6', 'rafael.benito@ifc.edu.br', 'Rafael Carlos Velez Benito', 'Instituto Federal Catarinense', 'Professor', 'approved', false, NOW()),
('u7', 'kevinrvb16@gmail.com', 'Kevin', 'Mercado Livre', 'Software Developer', 'approved', false, NOW()),
('u8', 'jefferson@bleu.studio', 'Jefferson Bastos', 'Bleu', 'Software eng', 'approved', false, NOW()),
('u9', 'bibiana@bleu.studio', 'Bibiana Silva', 'bleu builders', 'product designer', 'approved', false, NOW()),
('u10', 'jose@bleu.studio', 'Jose Ribeiro', 'bleu.builders', 'CEO', 'approved', false, NOW()),
('u11', 'rafaelmotta021@gmail.com', 'Rafael Michels Motta', 'Footprint', 'Head of Engineering', 'approved', false, NOW()),
('u12', 'gzmoreira5@gmail.com', 'Gabriel Zucco Moreira', 'Zero OS', 'Founder', 'approved', false, NOW()),
('u13', 'berohlfs@gmail.com', 'Bernardo Cruz Rohlfs', 'Sierra Studio', 'Software Engineer', 'approved', false, NOW()),
('u14', 'pedro@sierra.studio', 'Pedro Kretzschmar', 'Sierra Studio', 'Head of Engineer', 'approved', false, NOW()),
('u15', 'evandro@superfiliate.com', 'Evandro Sasse', 'Superfiliate', 'CTO', 'approved', false, NOW()),
('u16', 'victor@superfiliate.com', 'Victor Feijo', 'Superfiliate', 'Head of Engineering', 'approved', false, NOW()),
('u17', 'vini@dynamic.xyz', 'Vinicius Macelai', 'Dynamic/Fireblocks', 'Senior Software Engineer', 'approved', false, NOW()),
('u18', 'bruno@shippit.app', 'Bruno Amorim', 'Shippit', 'Software Developer', 'approved', false, NOW()),
('u19', 'rodrigo.branas@gmail.com', 'Rodrigo Branas', 'Compozy', 'CTO', 'approved', false, NOW()),
('u20', 'dadornes@anysphere.co', 'Daniel Adornes', 'Anysphere / Cursor', 'Technical Support Engineer', 'approved', false, NOW());

-- Verificar datos insertados
SELECT 'Credits insertados:' as info, COUNT(*) as total FROM "Credit";
SELECT 'Usuarios insertados:' as info, COUNT(*) as total FROM "EligibleUser";
SELECT 'Creditos disponibles:' as info, COUNT(*) as total FROM "Credit" WHERE "isUsed" = false AND "isTest" = false;
