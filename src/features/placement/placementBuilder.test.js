import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPlacementTierQuestions,
  evaluatePlacementAnswer,
  getQuestionAudio,
} from './placementBuilder.js';

test('PlacementBuilder: mỗi tầng A, B, C sinh đủ 6 câu và có từ 3 dạng bài khác nhau trở lên', () => {
  for (const tier of ['A', 'B', 'C']) {
    const qs = buildPlacementTierQuestions(tier, { ttsAvailable: true });
    assert.equal(qs.length, 6, `Tier ${tier} must have 6 questions`);
    const formats = new Set(qs.map((q) => q.format));
    assert.ok(formats.size >= 3, `Tier ${tier} expected >=3 distinct formats, got ${[...formats].join(', ')}`);

    for (const q of qs) {
      assert.ok(q.question, `Missing question text in tier ${tier}`);
      if (q.format === 'spell-tiles') {
        assert.ok(q.targetWord && Array.isArray(q.tiles) && q.tiles.length === q.targetWord.length);
        assert.equal(evaluatePlacementAnswer(q, q.targetWord), true);
        assert.equal(evaluatePlacementAnswer(q, 'ZZZZZZ'), false);
      } else if (q.format === 'sentence-order') {
        assert.ok(q.targetSentence && Array.isArray(q.tiles) && q.tiles.length >= 3);
        assert.equal(evaluatePlacementAnswer(q, q.targetSentence), true);
        assert.equal(evaluatePlacementAnswer(q, 'wrong order'), false);
      } else {
        assert.ok(Array.isArray(q.options) && q.options.length >= 2);
        assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length);
        assert.equal(evaluatePlacementAnswer(q, q.correct), true);
        if (q.format === 'listen-pick') {
          assert.ok(getQuestionAudio(q), `Listening question missing audio in tier ${tier}`);
        }
      }
    }
  }
});
