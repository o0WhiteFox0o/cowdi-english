import './env.js';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'cowdi_english',
  waitForConnections: true,
  connectionLimit:    10,
  charset:            'UTF8MB4_UNICODE_CI',
  timezone:           '+00:00',
});

// Đảm bảo mỗi connection dùng utf8mb4 (quan trọng cho tiếng Việt)
pool.on('connection', (conn) => {
  conn.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
});

export default pool;
