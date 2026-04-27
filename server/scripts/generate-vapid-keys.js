/**
 * server/scripts/generate-vapid-keys.js
 * Sinh cặp khóa VAPID cho Web Push.
 * Chạy MỘT LẦN, copy output vào server/.env:
 *   VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 *
 * Usage: cd server && node scripts/generate-vapid-keys.js
 */
import webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  VAPID KEYS — Copy 3 dòng sau vào server/.env');
console.log('═══════════════════════════════════════════════════════════\n');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@cowdi.net`);
console.log('\n═══════════════════════════════════════════════════════════');
console.log('  ⚠️  KHÔNG commit private key vào git!');
console.log('═══════════════════════════════════════════════════════════\n');
