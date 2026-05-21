-- Script Seeder Category untuk Supabase (PostgreSQL)
-- Ganti angka "1" di bawah ini dengan user_id yang sesuai dengan akun Anda.

INSERT INTO categories (user_id, name, type, color, icon, created_at, updated_at) VALUES 
(1, 'Gaji', 'income', '#10b981', '💰', NOW(), NOW()),
(1, 'Makanan', 'expense', '#f43f5e', '🍔', NOW(), NOW()),
(1, 'Transportasi', 'expense', '#3b82f6', '🚗', NOW(), NOW()),
(1, 'Belanja', 'expense', '#a855f7', '🛒', NOW(), NOW()),
(1, 'Tagihan', 'expense', '#f59e0b', '📄', NOW(), NOW()),
(1, 'Hiburan', 'expense', '#ec4899', '🎬', NOW(), NOW());

-- ----------------------------------------------------------------------
-- BONUS: Jika Anda ingin otomatis menambahkan kategori ke SEMUA user 
-- yang ada di database saat ini, Anda bisa menggunakan query di bawah ini:
-- (Hapus tanda komentar '--' untuk menjalankannya)
-- ----------------------------------------------------------------------

-- INSERT INTO categories (user_id, name, type, color, icon, created_at, updated_at)
-- SELECT id, 'Gaji', 'income', '#10b981', '💰', NOW(), NOW() FROM users;

-- INSERT INTO categories (user_id, name, type, color, icon, created_at, updated_at)
-- SELECT id, 'Makanan', 'expense', '#f43f5e', '🍔', NOW(), NOW() FROM users;

-- INSERT INTO categories (user_id, name, type, color, icon, created_at, updated_at)
-- SELECT id, 'Transportasi', 'expense', '#3b82f6', '🚗', NOW(), NOW() FROM users;

-- INSERT INTO categories (user_id, name, type, color, icon, created_at, updated_at)
-- SELECT id, 'Belanja', 'expense', '#a855f7', '🛒', NOW(), NOW() FROM users;

-- INSERT INTO categories (user_id, name, type, color, icon, created_at, updated_at)
-- SELECT id, 'Tagihan', 'expense', '#f59e0b', '📄', NOW(), NOW() FROM users;

-- INSERT INTO categories (user_id, name, type, color, icon, created_at, updated_at)
-- SELECT id, 'Hiburan', 'expense', '#ec4899', '🎬', NOW(), NOW() FROM users;
