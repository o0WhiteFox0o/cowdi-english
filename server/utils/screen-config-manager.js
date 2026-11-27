/**
 * Quản lý cấu hình Hệ thống Màn học trên Server (Đợt 2 — GEMINI-SCREEN-SYSTEM-PHASE2).
 * Tương thích MySQL 5.5 / 5.6+ (RK-005): chỉ dùng DATETIME NULL + cập nhật bằng NOW().
 */

export const VALID_STATUSES = ['on', 'test', 'off', 'todo', 'retired'];
export const VALID_GROUPS = ['beginner', 'intermediate', 'exam'];
export const CODE_REGEX = /^[TF]-\d{2}$/;

export const DEFAULT_SEED_SCREENS = [
  ['T-01', 'on',      null],
  ['T-02', 'on',      null],
  ['T-03', 'retired', 'Không chiếm vị trí · dùng làm mẹo pet'],
  ['T-04', 'on',      null],
  ['T-05', 'on',      null],
  ['T-06', 'on',      null],
  ['T-07', 'on',      null],
  ['T-08', 'on',      null],
  ['F-01', 'todo',    null],
  ['F-02', 'todo',    null],
  ['F-03', 'todo',    null],
  ['F-04', 'todo',    null],
  ['F-05', 'todo',    null],
  ['F-06', 'todo',    null],
  ['F-07', 'todo',    null],
  ['F-08', 'todo',    null],
  ['F-09', 'todo',    null],
  ['F-10', 'todo',    null],
  ['F-11', 'todo',    null],
];

export const DEFAULT_SEED_WEIGHTS = [
  ['beginner',     'friendly', 1.000],
  ['beginner',     'focus',    0.000],
  ['intermediate', 'friendly', 0.500],
  ['intermediate', 'focus',    0.500],
  ['exam',         'friendly', 0.250],
  ['exam',         'focus',    0.750],
];

const BUILTIN_SUPPORTED_CODES = ['T-01', 'T-02', 'T-04', 'T-05', 'T-06', 'T-07', 'T-08'];
const SUPPORTED_TTL_MS = 60 * 60 * 1000; // 1 giờ theo PHASE2 §2.2

let supportedCache = {
  codes: [...BUILTIN_SUPPORTED_CODES],
  expiresAt: 0,
};

export function registerSupportedCodes(codes) {
  if (!Array.isArray(codes) || codes.length === 0) return supportedCache.codes;
  const clean = [...new Set(codes.filter((c) => typeof c === 'string' && CODE_REGEX.test(c)))];
  if (clean.length > 0) {
    supportedCache = { codes: clean, expiresAt: Date.now() + SUPPORTED_TTL_MS };
  }
  return supportedCache.codes;
}

export function getSupportedCodes() {
  if (supportedCache.expiresAt > Date.now()) return supportedCache.codes;
  return [...BUILTIN_SUPPORTED_CODES];
}

const ensuredPools = new WeakSet();

export async function ensureScreenSystemTables(pool, { force = false } = {}) {
  if (!force && ensuredPools.has(pool)) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS screen_config (
      code        VARCHAR(8)  PRIMARY KEY,
      status      ENUM('on','test','off','todo','retired') NOT NULL DEFAULT 'off',
      note        VARCHAR(255) DEFAULT NULL,
      updated_by  INT DEFAULT NULL,
      updated_at  DATETIME DEFAULT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS screen_weights (
      group_id    VARCHAR(16) NOT NULL,
      level       ENUM('focus','friendly') NOT NULL,
      weight      DECIMAL(4,3) NOT NULL,
      updated_by  INT DEFAULT NULL,
      updated_at  DATETIME DEFAULT NULL,
      PRIMARY KEY (group_id, level)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS screen_testers (
      user_id     INT PRIMARY KEY,
      note        VARCHAR(255) DEFAULT NULL,
      added_by    INT DEFAULT NULL,
      added_at    DATETIME DEFAULT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS screen_config_log (
      id          BIGINT AUTO_INCREMENT PRIMARY KEY,
      target      VARCHAR(48) NOT NULL,
      old_value   TEXT,
      new_value   TEXT,
      changed_by  INT NOT NULL,
      changed_at  DATETIME DEFAULT NULL,
      KEY idx_scl_changed (changed_at)
    )
  `);

  for (const [code, status, note] of DEFAULT_SEED_SCREENS) {
    await pool.execute(
      'INSERT IGNORE INTO screen_config (code, status, note, updated_at) VALUES (?, ?, ?, NOW())',
      [code, status, note],
    );
  }

  for (const [groupId, level, weight] of DEFAULT_SEED_WEIGHTS) {
    await pool.execute(
      'INSERT IGNORE INTO screen_weights (group_id, level, weight, updated_at) VALUES (?, ?, ?, NOW())',
      [groupId, level, weight],
    );
  }

  ensuredPools.add(pool);
}

function toIsoVersion(val) {
  if (!val) return '1970-01-01T00:00:00.000Z';
  const d = val instanceof Date ? val : new Date(val);
  return Number.isNaN(d.getTime()) ? String(val) : d.toISOString();
}

export async function getClientScreenConfig(pool, userId) {
  await ensureScreenSystemTables(pool);

  const [cfgRows] = await pool.execute('SELECT code, status, updated_at FROM screen_config');
  const [weightRows] = await pool.execute('SELECT group_id, level, weight, updated_at FROM screen_weights');
  const [testerRows] = userId
    ? await pool.execute('SELECT user_id FROM screen_testers WHERE user_id = ?', [userId])
    : [[]];

  const status = {};
  let maxMs = 0;
  for (const r of cfgRows) {
    status[r.code] = r.status;
    const ms = r.updated_at ? new Date(r.updated_at).getTime() : 0;
    if (ms > maxMs) maxMs = ms;
  }

  const weights = {
    beginner:     { friendly: 1, focus: 0 },
    intermediate: { friendly: 0.5, focus: 0.5 },
    exam:         { friendly: 0.25, focus: 0.75 },
  };
  for (const r of weightRows) {
    if (!weights[r.group_id]) weights[r.group_id] = { friendly: 0.5, focus: 0.5 };
    weights[r.group_id][r.level] = Number(r.weight);
    const ms = r.updated_at ? new Date(r.updated_at).getTime() : 0;
    if (ms > maxMs) maxMs = ms;
  }

  const isTester = testerRows.length > 0;
  const version = toIsoVersion(maxMs ? new Date(maxMs) : null);
  return { version, status, weights, isTester };
}

export async function getAdminScreenSnapshot(pool) {
  await ensureScreenSystemTables(pool);

  const [cfgRows] = await pool.execute(`
    SELECT sc.code, sc.status, sc.note, sc.updated_by, sc.updated_at,
           u.name AS updated_by_name, u.email AS updated_by_email
    FROM screen_config sc
    LEFT JOIN users u ON u.id = sc.updated_by
    ORDER BY sc.code ASC
  `);

  const [weightRows] = await pool.execute(`
    SELECT sw.group_id, sw.level, sw.weight, sw.updated_by, sw.updated_at,
           u.name AS updated_by_name
    FROM screen_weights sw
    LEFT JOIN users u ON u.id = sw.updated_by
  `);

  const weights = {
    beginner:     { friendly: 1, focus: 0 },
    intermediate: { friendly: 0.5, focus: 0.5 },
    exam:         { friendly: 0.25, focus: 0.75 },
  };
  for (const r of weightRows) {
    if (!weights[r.group_id]) weights[r.group_id] = { friendly: 0.5, focus: 0.5 };
    weights[r.group_id][r.level] = Number(r.weight);
  }

  const screens = cfgRows.map((r) => ({
    code: r.code,
    status: r.status,
    note: r.note || '',
    updatedBy: r.updated_by || null,
    updatedByName: r.updated_by_name || r.updated_by_email || null,
    updatedAt: r.updated_at ? toIsoVersion(r.updated_at) : null,
  }));

  return { screens, weights, supportedCodes: getSupportedCodes() };
}

export async function updateScreenStatus(pool, { code, status, note, adminUserId, supportedCodes }) {
  await ensureScreenSystemTables(pool);
  if (!CODE_REGEX.test(code || '')) {
    const err = new Error('Mã màn không hợp lệ (phải dạng T-01 hoặc F-03).');
    err.status = 400;
    throw err;
  }
  if (code === 'T-03') {
    const err = new Error('T-03 Ngữ pháp không chiếm vị trí màn (chỉ dùng làm mẹo pet) nên không đổi trạng thái.');
    err.status = 400;
    throw err;
  }
  if (!VALID_STATUSES.includes(status)) {
    const err = new Error(`Trạng thái không hợp lệ: ${status}`);
    err.status = 400;
    throw err;
  }
  if (Array.isArray(supportedCodes) && supportedCodes.length > 0) {
    registerSupportedCodes(supportedCodes);
  }
  const activeSupported = getSupportedCodes();
  if ((status === 'on' || status === 'test') && !activeSupported.includes(code)) {
    const err = new Error(`Màn ${code} chưa có component trong bản client hiện hành, không thể đặt '${status}'.`);
    err.status = 400;
    throw err;
  }

  const cleanNote = note != null ? String(note).slice(0, 255) : undefined;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[prev]] = await conn.execute(
      'SELECT code, status, note FROM screen_config WHERE code = ? FOR UPDATE',
      [code],
    );
    const oldVal = prev ? { status: prev.status, note: prev.note || '' } : null;
    const nextNote = cleanNote !== undefined ? cleanNote : (prev?.note || null);

    await conn.execute(
      `INSERT INTO screen_config (code, status, note, updated_by, updated_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE status = VALUES(status), note = VALUES(note), updated_by = VALUES(updated_by), updated_at = NOW()`,
      [code, status, nextNote, adminUserId],
    );

    await conn.execute(
      `INSERT INTO screen_config_log (target, old_value, new_value, changed_by, changed_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [
        `status:${code}`,
        oldVal ? JSON.stringify(oldVal) : null,
        JSON.stringify({ status, note: nextNote || '' }),
        adminUserId,
      ],
    );
    await conn.commit();
    return { code, status, note: nextNote || '' };
  } catch (err) {
    try { await conn.rollback(); } catch { /* ignore */ }
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateScreenWeights(pool, { groupId, friendly, focus, adminUserId }) {
  await ensureScreenSystemTables(pool);
  if (!VALID_GROUPS.includes(groupId)) {
    const err = new Error(`Nhóm học không hợp lệ: ${groupId}`);
    err.status = 400;
    throw err;
  }
  const f = Number(friendly);
  const c = Number(focus);
  if (!Number.isFinite(f) || !Number.isFinite(c) || f < 0 || f > 1 || c < 0 || c > 1 || f + c <= 0) {
    const err = new Error('Trọng số phải nằm trong khoảng 0..1 và tổng phải > 0.');
    err.status = 400;
    throw err;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [prevRows] = await conn.execute(
      'SELECT level, weight FROM screen_weights WHERE group_id = ? FOR UPDATE',
      [groupId],
    );
    const oldVal = {};
    for (const r of prevRows) oldVal[r.level] = Number(r.weight);

    for (const [lvl, val] of [['friendly', f], ['focus', c]]) {
      await conn.execute(
        `INSERT INTO screen_weights (group_id, level, weight, updated_by, updated_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE weight = VALUES(weight), updated_by = VALUES(updated_by), updated_at = NOW()`,
        [groupId, lvl, val, adminUserId],
      );
    }

    await conn.execute(
      `INSERT INTO screen_config_log (target, old_value, new_value, changed_by, changed_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [
        `weight:${groupId}`,
        JSON.stringify(oldVal),
        JSON.stringify({ friendly: f, focus: c }),
        adminUserId,
      ],
    );
    await conn.commit();
    return { groupId, friendly: f, focus: c };
  } catch (err) {
    try { await conn.rollback(); } catch { /* ignore */ }
    throw err;
  } finally {
    conn.release();
  }
}

export async function listAndSearchTesters(pool, query = '') {
  await ensureScreenSystemTables(pool);

  const [testers] = await pool.execute(`
    SELECT st.user_id, st.note, st.added_by, st.added_at,
           u.name, u.email, a.name AS added_by_name
    FROM screen_testers st
    JOIN users u ON u.id = st.user_id
    LEFT JOIN users a ON a.id = st.added_by
    ORDER BY st.added_at DESC
  `);

  const q = String(query || '').trim();
  let matches = [];
  if (q.length > 0) {
    const like = `%${q}%`;
    const [rows] = await pool.execute(
      `SELECT id, name, email, is_admin
       FROM users
       WHERE email LIKE ? OR name LIKE ?
       ORDER BY id DESC
       LIMIT 20`,
      [like, like],
    );
    matches = rows.map((r) => ({
      userId: r.id,
      name: r.name || '',
      email: r.email || '',
      isAdmin: Boolean(r.is_admin),
    }));
  }

  return {
    testers: testers.map((r) => ({
      userId: r.user_id,
      name: r.name || '',
      email: r.email || '',
      note: r.note || '',
      addedByName: r.added_by_name || null,
      addedAt: r.added_at ? toIsoVersion(r.added_at) : null,
    })),
    matches,
  };
}

export async function addScreenTester(pool, { userId, note, adminUserId }) {
  await ensureScreenSystemTables(pool);
  const uid = Number(userId);
  if (!Number.isInteger(uid) || uid <= 0) {
    const err = new Error('userId không hợp lệ.');
    err.status = 400;
    throw err;
  }
  const cleanNote = note ? String(note).slice(0, 255) : null;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[userRow]] = await conn.execute('SELECT id, name, email FROM users WHERE id = ?', [uid]);
    if (!userRow) {
      const err = new Error('Không tìm thấy tài khoản người dùng.');
      err.status = 404;
      throw err;
    }
    await conn.execute(
      `INSERT INTO screen_testers (user_id, note, added_by, added_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE note = VALUES(note), added_by = VALUES(added_by), added_at = NOW()`,
      [uid, cleanNote, adminUserId],
    );
    await conn.execute(
      `INSERT INTO screen_config_log (target, old_value, new_value, changed_by, changed_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [`tester:${uid}`, null, JSON.stringify({ action: 'add', email: userRow.email, note: cleanNote || '' }), adminUserId],
    );
    await conn.commit();
    return { userId: uid, name: userRow.name || '', email: userRow.email || '', note: cleanNote || '' };
  } catch (err) {
    try { await conn.rollback(); } catch { /* ignore */ }
    throw err;
  } finally {
    conn.release();
  }
}

export async function removeScreenTester(pool, { userId, adminUserId }) {
  await ensureScreenSystemTables(pool);
  const uid = Number(userId);
  if (!Number.isInteger(uid) || uid <= 0) {
    const err = new Error('userId không hợp lệ.');
    err.status = 400;
    throw err;
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[prev]] = await conn.execute('SELECT user_id, note FROM screen_testers WHERE user_id = ?', [uid]);
    await conn.execute('DELETE FROM screen_testers WHERE user_id = ?', [uid]);
    await conn.execute(
      `INSERT INTO screen_config_log (target, old_value, new_value, changed_by, changed_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [`tester:${uid}`, prev ? JSON.stringify({ note: prev.note || '' }) : null, JSON.stringify({ action: 'remove' }), adminUserId],
    );
    await conn.commit();
    return { removed: true, userId: uid };
  } catch (err) {
    try { await conn.rollback(); } catch { /* ignore */ }
    throw err;
  } finally {
    conn.release();
  }
}

export async function listScreenConfigLog(pool, { limit = 50, before = null } = {}) {
  await ensureScreenSystemTables(pool);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
  const beforeId = before ? Number(before) : null;

  const sql = beforeId && Number.isFinite(beforeId)
    ? `SELECT l.id, l.target, l.old_value, l.new_value, l.changed_by, l.changed_at, u.name AS actor_name, u.email AS actor_email
       FROM screen_config_log l
       LEFT JOIN users u ON u.id = l.changed_by
       WHERE l.id < ?
       ORDER BY l.id DESC
       LIMIT ${safeLimit}`
    : `SELECT l.id, l.target, l.old_value, l.new_value, l.changed_by, l.changed_at, u.name AS actor_name, u.email AS actor_email
       FROM screen_config_log l
       LEFT JOIN users u ON u.id = l.changed_by
       ORDER BY l.id DESC
       LIMIT ${safeLimit}`;

  const [rows] = beforeId && Number.isFinite(beforeId)
    ? await pool.execute(sql, [beforeId])
    : await pool.execute(sql);

  const parseSafe = (s) => {
    if (!s) return null;
    try { return JSON.parse(s); } catch { return s; }
  };

  return rows.map((r) => ({
    id: r.id,
    target: r.target,
    oldValue: parseSafe(r.old_value),
    newValue: parseSafe(r.new_value),
    changedBy: r.changed_by,
    actorName: r.actor_name || r.actor_email || `#${r.changed_by}`,
    changedAt: r.changed_at ? toIsoVersion(r.changed_at) : null,
  }));
}
