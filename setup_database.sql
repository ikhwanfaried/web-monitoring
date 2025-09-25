-- Script untuk setup database web_mon
-- Jalankan di MySQL untuk setup database

-- Menggunakan database web_mon (database utama)
USE web_mon;

-- Copy semua tabel dari database asli (web_mon) ke database clone
-- Uncomment dan jalankan perintah berikut jika ingin mengcopy dari database asli:

-- CREATE TABLE items LIKE web_mon.items;
-- INSERT items SELECT * FROM web_mon.items;

-- CREATE TABLE dataset2 LIKE web_mon.dataset2;
-- INSERT dataset2 SELECT * FROM web_mon.dataset2;

-- CREATE TABLE gudang LIKE web_mon.gudang;
-- INSERT gudang SELECT * FROM web_mon.gudang;

-- CREATE TABLE site LIKE web_mon.site;
-- INSERT site SELECT * FROM web_mon.site;

-- CREATE TABLE transaksi1 LIKE web_mon.transaksi1;
-- INSERT transaksi1 SELECT * FROM web_mon.transaksi1;

-- CREATE TABLE transaksi2 LIKE web_mon.transaksi2;
-- INSERT transaksi2 SELECT * FROM web_mon.transaksi2;

-- CREATE TABLE users LIKE web_mon.users;
-- INSERT users SELECT * FROM web_mon.users;

-- CREATE TABLE login_logs LIKE web_mon.login_logs;
-- INSERT login_logs SELECT * FROM web_mon.login_logs;

-- CREATE TABLE dataset40200 LIKE web_mon.dataset40200;
-- INSERT dataset40200 SELECT * FROM web_mon.dataset40200;

-- Jika ingin membuat login_logs table baru:
CREATE TABLE IF NOT EXISTS login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status ENUM('success', 'failed') NOT NULL DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Memberikan privileges jika diperlukan
-- GRANT ALL PRIVILEGES ON web_monitoring_clone.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;

SELECT 'Database web_monitoring_clone telah dibuat!' as status;