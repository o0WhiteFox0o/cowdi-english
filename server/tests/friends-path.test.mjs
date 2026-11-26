// ============================================================
// Cowdi English — Tests Bước 6: Bạn bè trên bản đồ lộ trình
// Bao phủ FR-MAP-01..08, NFR-01 (2 truy vấn, không N+1), AT-08, AT-09.
// ============================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getFriendsPathProgress } from '../utils/friends-manager.js';
import { getPathById, buildPathNodes } from '../../src/data/path.js';
import {
  computeFriendPathLayout,
  findNearestFriendAhead,
  detectPassedFriends,
} from '../../src/features/friends/friendPathLogic.js';

describe('Bước 6 — Bạn bè trên bản đồ lộ trình (FR-MAP, AT-08, AT-09)', () => {
  it('FR-MAP-01 & NFR-01: GET /api/friends/path-progress chạy đúng 2 truy vấn SQL (không N+1), bỏ bạn bị chặn, không rò điểm số', async () => {
    const executedSql = [];
    const fakeDb = {
      async execute(sql, params) {
        const q = sql.replace(/\s+/g, ' ').trim();
        executedSql.push(q);
        if (/FROM friendships/i.test(q)) {
          // Chỉ trả bạn accepted (không trả user 99 bị blocked)
          return [[{ friend_id: 2 }, { friend_id: 3 }]];
        }
        if (/FROM users u LEFT JOIN user_progress/i.test(q)) {
          assert.deepEqual(params, [2, 3]);
          return [[
            {
              id: 2,
              nickname: 'Mai',
              pet_data: JSON.stringify({ activePetId: 'cowdi_1', collection: { cowdi_1: { speciesId: 'cowdi', evolution: 1 } } }),
              learner_group: 'exam',
              active_path: 'ielts',
              completed_lessons: JSON.stringify(['pronunciation-ipa', 'ielts-read-rooftop-farms']),
              checkpoint_scores: JSON.stringify({
                'exam-intro': { passed: true, score: 15, total: 15 },
                'exam-pron': { passed: false, score: 5, total: 15 },
              }),
            },
            {
              id: 3,
              nickname: 'Nam',
              pet_data: null,
              learner_group: 'beginner',
              active_path: 'beginner',
              completed_lessons: JSON.stringify([]),
              checkpoint_scores: null,
            },
          ]];
        }
        throw new Error(`Unexpected SQL: ${sql}`);
      },
    };

    const friends = await getFriendsPathProgress(1, fakeDb);
    assert.equal(executedSql.length, 2, 'Phải chạy đúng 2 truy vấn SQL, không N+1');
    assert.equal(friends.length, 2);
    assert.deepEqual(friends[0].passedUnits, ['exam-intro'], 'Chỉ trả unitId đã passed, không trả điểm');
    assert.equal(JSON.stringify(friends).includes('score'), false, 'Không rò điểm số bài học');
    assert.equal(friends.some((f) => f.userId === 99), false, 'Bạn bị chặn không hiện');
  });

  it('AT-08: Bạn ở lộ trình Luyện thi (IELTS) có đúng 1 vị trí; bạn xong toàn bộ lộ trình có vương miện (finished=true)', () => {
    const ieltsPath = getPathById('ielts');
    const beginnerPath = getPathById('beginner');

    // Lấy toàn bộ lesson + unit của lộ trình beginner để tạo bạn đã hoàn thành 100%
    const beginnerNodes = buildPathNodes(beginnerPath, { completedLessons: [], checkpointScores: {} });
    const allBeginnerLessons = beginnerNodes.filter((n) => n.type === 'lesson').map((n) => n.lessonId);
    const allBeginnerUnits = [...new Set(beginnerNodes.filter((n) => n.type === 'checkpoint').map((n) => n.unit.id))];

    const friends = [
      {
        userId: 2,
        nickname: 'Mai',
        petId: 'foxie',
        petEvolution: 2,
        learnerGroup: 'exam',
        activePath: 'ielts',
        completedLessons: [],
        passedUnits: [],
      },
      {
        userId: 3,
        nickname: 'An',
        petId: 'cowdi',
        petEvolution: 3,
        learnerGroup: 'beginner',
        activePath: 'beginner',
        completedLessons: allBeginnerLessons,
        passedUnits: allBeginnerUnits,
      },
    ];

    // Trên lộ trình IELTS: Mai có đúng 1 nodeKey, An nằm ở otherPathFriends
    const ieltsLayout = computeFriendPathLayout(friends, ieltsPath);
    assert.equal(ieltsLayout.onPathFriends.length, 1);
    assert.equal(ieltsLayout.onPathFriends[0].nickname, 'Mai');
    assert.ok(ieltsLayout.onPathFriends[0].nodeKey, 'Mai có đúng 1 vị trí trên IELTS');
    assert.equal(ieltsLayout.onPathFriends[0].finished, false);
    assert.equal(ieltsLayout.otherPathFriends.length, 1);
    assert.equal(ieltsLayout.otherPathFriends[0].nickname, 'An');

    // Trên lộ trình Beginner: An hoàn thành 100% -> finished = true (👑) ở node cuối
    const begLayout = computeFriendPathLayout(friends, beginnerPath);
    const an = begLayout.onPathFriends.find((f) => f.userId === 3);
    assert.ok(an);
    assert.equal(an.finished, true, 'Hoàn thành lộ trình -> hiện vương miện 👑');
    assert.equal(an.nodeKey, beginnerNodes[beginnerNodes.length - 1].key);
  });

  it('AT-09: Học lại bài cũ (vị trí không đổi) không báo vượt qua; học bài mới vượt bạn thì phát hiện đúng', () => {
    const onPathFriends = [
      { userId: 2, nickname: 'Mai', nodeIndex: 3 },
      { userId: 3, nickname: 'Nam', nodeIndex: 5 },
    ];

    // FR-MAP-06: Người dùng đang ở node 1 -> Mai đi trước 2 bài (gần nhất)
    const ahead = findNearestFriendAhead(onPathFriends, 1);
    assert.equal(ahead.friend.nickname, 'Mai');
    assert.equal(ahead.stepsAhead, 2);

    // Học lại bài cũ: vị trí giữ nguyên 1 -> 1 => KHÔNG hiện toast vượt qua
    assert.deepEqual(detectPassedFriends(1, 1, onPathFriends), []);

    // Học xong bài mới: vị trí nhảy từ 3 -> 4 => vừa vượt qua Mai (node 3), chưa vượt Nam (node 5)
    const passed = detectPassedFriends(3, 4, onPathFriends);
    assert.deepEqual(passed.map((f) => f.nickname), ['Mai']);
  });
});
