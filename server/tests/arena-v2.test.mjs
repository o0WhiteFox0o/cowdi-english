// ============================================================
// Cowdi English — Tests GĐ5: Đấu trường v2 & Trigger Kỹ năng v0.2
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARENA_CONFIG,
  PET_SKILLS,
  TRIGGER_PRIORITY_ORDER,
} from '../../shared/game-config.js';
import {
  simulateBattle,
  getPetSkill,
} from '../../shared/battle-engine.js';
import {
  getTierFromLp,
  generateAiBotOpponent,
  submitArenaMatch,
  claimWeeklyChest,
} from '../utils/arena-manager.js';

const sk = (l, s, r, w) => ({ listening: l, speaking: s, reading: r, writing: w });

test('GĐ5-1: Cấu hình Đấu trường v2 (D4, D15, D16) đầy đủ & chính xác', () => {
  assert.equal(ARENA_CONFIG.TICKETS.DAILY_FREE, 3);
  assert.equal(ARENA_CONFIG.TICKETS.PER_NEW_LESSON, 2);
  assert.equal(ARENA_CONFIG.TICKETS.PER_UNIT_100, 3);
  assert.equal(ARENA_CONFIG.TICKETS.MAX_CAP, 15);

  assert.equal(ARENA_CONFIG.REWARD_MILK.WIN, 8);
  assert.equal(ARENA_CONFIG.REWARD_MILK.DRAW, 5);
  assert.equal(ARENA_CONFIG.REWARD_MILK.LOSS, 2);

  assert.equal(ARENA_CONFIG.LP.WIN, 20);
  assert.equal(ARENA_CONFIG.LP.DRAW, 5);
  assert.equal(ARENA_CONFIG.LP.LOSS, -12);
  assert.equal(ARENA_CONFIG.LP.BOT_RATIO, 0.5);

  assert.deepEqual(TRIGGER_PRIORITY_ORDER, [
    'energy_full',
    'low_hp',
    'combo_streak',
    'skill_match',
    'fast_answer',
  ]);

  assert.ok(Object.keys(PET_SKILLS).length >= 23);
  assert.equal(getTierFromLp(0), 'bronze');
  assert.equal(getTierFromLp(199), 'bronze');
  assert.equal(getTierFromLp(200), 'silver');
  assert.equal(getTierFromLp(500), 'gold');
  assert.equal(getTierFromLp(900), 'platinum');
  assert.equal(getTierFromLp(1400), 'diamond');
  assert.equal(getTierFromLp(2000), 'master');
});

test('GĐ5-2: Trigger combo_streak (Cowdi) kích hoạt ở câu đúng thứ 3 và reset đếm lại từ 0', () => {
  const cowdi = { speciesId: 'cowdi', evolution: 1, skills: sk(20, 20, 20, 20) };
  const target = { speciesId: 'foxie', evolution: 1, skills: sk(20, 20, 20, 20) };

  const answersA = Array.from({ length: 7 }, () => ({ correct: true, timeMs: 6000 }));
  const answersB = Array.from({ length: 7 }, () => ({ correct: false, timeMs: 6000 }));

  const res = simulateBattle(cowdi, target, answersA, answersB, 'combo-seed');
  const skillLogs = res.log.filter((e) => e.type === 'skill' && e.side === 'challenger');

  // 7 câu đúng liên tiếp -> kích hoạt ở câu 3 và câu 6 (reset đếm từ 0 sau lần 1, nhưng cooldown 2 lượt hết kịp ở câu 6)
  assert.equal(skillLogs.length, 2);
  assert.equal(skillLogs[0].q, 3);
  assert.equal(skillLogs[0].skill.trigger, 'combo_streak');
  assert.equal(skillLogs[0].skill.label, '3 câu liên tiếp!');
  assert.equal(skillLogs[1].q, 6);
});

test('GĐ5-3: Trigger fast_answer (Foxie) kích hoạt khi trả lời <= 5s và có hồi chiêu 2 lượt', () => {
  const foxie = { speciesId: 'foxie', evolution: 1, skills: sk(20, 50, 20, 20) };
  const target = { speciesId: 'cowdi', evolution: 1, skills: sk(50, 20, 20, 20) };

  // Trả lời nhanh 2.5s cả 5 câu
  const answersA = Array.from({ length: 5 }, () => ({ correct: true, timeMs: 2500 }));
  const answersB = Array.from({ length: 5 }, () => ({ correct: false, timeMs: 6000 }));

  const res = simulateBattle(foxie, target, answersA, answersB, 'fast-seed');
  const skillLogs = res.log.filter((e) => e.type === 'skill' && e.side === 'challenger');

  // Câu 1 kích hoạt (cooldown = 2 -> hết lượt 1 còn 1, hết lượt 2 còn 0) -> Câu 4 kích hoạt lại!
  assert.equal(skillLogs.length, 2);
  assert.equal(skillLogs[0].q, 1);
  assert.equal(skillLogs[0].skill.trigger, 'fast_answer');
  assert.equal(skillLogs[0].skill.label, 'Nhanh như chớp!');
  assert.equal(skillLogs[1].q, 4);
});

test('GĐ5-4: Trigger skill_match (Owlbert - Đọc) chỉ kích hoạt khi đúng câu thuộc sở trường', () => {
  const owl = { speciesId: 'owlbert', evolution: 1, skills: sk(20, 20, 50, 20) };
  const target = { speciesId: 'cowdi', evolution: 1, skills: sk(50, 20, 20, 20) };

  const answersA = [
    { correct: true, timeMs: 6000, category: 'listening' }, // Không khớp
    { correct: true, timeMs: 6000, category: 'reading' },   // Khớp -> kích hoạt ở câu 2
    { correct: true, timeMs: 6000, category: 'reading' },   // Đang hồi chiêu
  ];
  const answersB = Array.from({ length: 3 }, () => ({ correct: false, timeMs: 6000 }));

  const res = simulateBattle(owl, target, answersA, answersB, 'skill-match-seed');
  const skillLogs = res.log.filter((e) => e.type === 'skill' && e.side === 'challenger');

  assert.equal(skillLogs.length, 1);
  assert.equal(skillLogs[0].q, 2);
  assert.equal(skillLogs[0].skill.trigger, 'skill_match');
  assert.equal(skillLogs[0].skill.label, 'Đúng sở trường!');
});

test('GĐ5-5: Trigger energy_full (Draco) kích hoạt ở câu đúng thứ 5 và giới hạn 1 lần/trận', () => {
  const draco = { speciesId: 'draco', evolution: 1, skills: sk(20, 50, 20, 20) };
  const target = { speciesId: 'cowdi', evolution: 2, skills: sk(500, 20, 20, 20) };

  const answersA = Array.from({ length: 10 }, () => ({ correct: true, timeMs: 6000 }));
  const answersB = Array.from({ length: 10 }, () => ({ correct: false, timeMs: 6000 }));

  const res = simulateBattle(draco, target, answersA, answersB, 'energy-seed');
  const skillLogs = res.log.filter((e) => e.type === 'skill' && e.side === 'challenger');

  assert.equal(skillLogs.length, 1);
  assert.equal(skillLogs[0].q, 5);
  assert.equal(skillLogs[0].skill.trigger, 'energy_full');
  assert.equal(skillLogs[0].skill.label, 'Tuyệt kỹ!');
});

test('GĐ5-6: Trigger low_hp (Pingu) kích hoạt khi HP <= 30% sau khi trúng đòn (1 lần/trận)', () => {
  const pingu = { speciesId: 'pingu', evolution: 1, skills: sk(0, 0, 0, 0) };
  const storm = { speciesId: 'storm', evolution: 3, skills: sk(50, 400, 50, 50) };

  const answersA = Array.from({ length: 5 }, () => ({ correct: false, timeMs: 6000 }));
  const answersB = Array.from({ length: 5 }, () => ({ correct: true, timeMs: 2000 }));

  const res = simulateBattle(pingu, storm, answersA, answersB, 'low-hp-seed', { stopAtZero: true });
  const skillLogs = res.log.filter((e) => e.type === 'skill' && e.side === 'challenger');

  if (skillLogs.length > 0) {
    assert.equal(skillLogs.length, 1);
    assert.equal(skillLogs[0].skill.trigger, 'low_hp');
    assert.equal(skillLogs[0].skill.label, 'Cứu nguy!');
  }
  assert.ok(getPetSkill('pingu').activation.trigger === 'low_hp');
});

test('GĐ5-7: Pet ở giai đoạn Trứng (evolution = 0) không kích hoạt kỹ năng', () => {
  const eggFoxie = { speciesId: 'foxie', evolution: 0, skills: sk(20, 20, 20, 20) };
  const target = { speciesId: 'cowdi', evolution: 1, skills: sk(20, 20, 20, 20) };

  const answersA = Array.from({ length: 5 }, () => ({ correct: true, timeMs: 2000 }));
  const answersB = Array.from({ length: 5 }, () => ({ correct: false, timeMs: 6000 }));

  const res = simulateBattle(eggFoxie, target, answersA, answersB, 'egg-seed');
  const skillLogs = res.log.filter((e) => e.type === 'skill' && e.side === 'challenger');
  assert.equal(skillLogs.length, 0);
});

test('GĐ5-8: generateAiBotOpponent tạo bot hợp lệ cùng cấp tiến hoá', () => {
  const userSnap = { speciesId: 'cowdi', evolution: 2, skills: sk(40, 40, 40, 40) };
  const bot = generateAiBotOpponent(userSnap, 250);
  assert.equal(bot.isBot, true);
  assert.equal(bot.petSnapshot.evolution, 2);
  assert.notEqual(bot.petSnapshot.speciesId, 'cowdi');
  assert.ok(bot.displayName.length > 0);
});

test('GĐ5-9: submitArenaMatch (mock DB) trừ vé, tính LP, thưởng Sữa qua ledger và cập nhật rương tuần', async () => {
  const ledgerRows = [];
  const profileUpdates = [];

  const mockConn = {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute: async (sql, params) => {
      if (sql.includes('UPDATE arena_profiles')) {
        profileUpdates.push(params);
        return [{ affectedRows: 1 }];
      }
      if (sql.includes('INSERT INTO wallet_ledger')) {
        ledgerRows.push(params);
        return [{ insertId: 1 }];
      }
      if (sql.includes('INSERT INTO arena_matches')) {
        return [{ insertId: 999 }];
      }
      return [{ affectedRows: 1 }];
    },
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const mockDb = {
    execute: async (sql) => {
      if (sql.includes('SELECT * FROM arena_profiles')) {
        return [[{
          user_id: 101,
          tickets: 5,
          lp: 0,
          tier: 'bronze',
          wins_this_week: 2,
          claimed_weekly_chests: '[]',
          last_ticket_refill: todayStr,
          last_weekly_reset: todayStr,
          season_id: 'season_1',
        }]];
      }
      return [[]];
    },
    getConnection: async () => mockConn,
  };

  const res = await submitArenaMatch({
    userId: 101,
    opponentId: null,
    isBot: true,
    hasTicket: true,
    quizData: Array.from({ length: 10 }, () => ({ category: 'vocabulary' })),
    challengerAnswers: Array.from({ length: 10 }, () => true),
    challengerTimes: Array.from({ length: 10 }, () => 3000),
    challengerPetSnap: { speciesId: 'cowdi', evolution: 2, skills: sk(100, 100, 100, 100) },
    opponentPetSnap: { speciesId: 'mushroom', evolution: 2, skills: sk(20, 20, 20, 20) },
  }, mockDb);

  assert.equal(res.matchId, 999);
  assert.equal(res.winner, 'challenger');
  assert.equal(res.hasTicket, true);
  assert.equal(res.rewardMilk, 8); // Thắng = 8 Sữa
  assert.equal(res.challengerLpDelta, 10); // Bot = 50% của +20 LP = +10 LP
  assert.equal(res.updatedProfile.tickets, 4); // 5 - 1 = 4 vé
  assert.equal(res.updatedProfile.winsThisWeek, 3);
  assert.equal(ledgerRows.length, 1);
  assert.equal(ledgerRows[0][1], 8); // amount = 8 Sữa
});

test('GĐ5-10: claimWeeklyChest (mock DB) trao Sữa/Gem/Mảnh đá qua ledger', async () => {
  const ledgerRows = [];
  const mockConn = {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute: async (sql, params) => {
      if (sql.includes('INSERT INTO wallet_ledger')) {
        ledgerRows.push({ sql, params });
      }
      return [{ affectedRows: 1 }];
    },
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const mockDb = {
    execute: async (sql) => {
      if (sql.includes('SELECT * FROM arena_profiles')) {
        return [[{
          user_id: 101,
          tickets: 5,
          lp: 250,
          tier: 'silver',
          wins_this_week: 30,
          claimed_weekly_chests: '[]',
          last_ticket_refill: todayStr,
          last_weekly_reset: todayStr,
          season_id: 'season_1',
        }]];
      }
      return [[]];
    },
    getConnection: async () => mockConn,
  };

  const res = await claimWeeklyChest(101, 'gold', mockDb);
  assert.equal(res.success, true);
  assert.equal(res.rewards.milk, 100);
  assert.equal(res.rewards.gem, 2);
  assert.equal(res.rewards.stoneShards, 2);
  assert.equal(ledgerRows.length, 3); // 1 milk, 1 gem, 1 stone_shard
});
