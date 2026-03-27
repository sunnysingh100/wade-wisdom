import { test } from 'node:test';
import assert from 'node:assert';
import { isRelevantContent } from './discover.ts';

test('isRelevantContent', async (t) => {
  await t.test('should return true for full name matches (>= 1 needed for 3 pts)', () => {
    assert.strictEqual(isRelevantContent('Wade Foster is the CEO.', 'News'), true);
  });

  await t.test('should return true for multiple Zapier mentions (>= 3 needed for 3 pts)', () => {
    assert.strictEqual(isRelevantContent('Zapier is great. Zapier connects apps. We love Zapier.', 'News'), true);
  });

  await t.test('should return false for too few Zapier mentions (< 3 pts)', () => {
    assert.strictEqual(isRelevantContent('Zapier connects apps.', 'News'), false);
  });

  await t.test('should return true for combination of matches (e.g. 1 Zapier + bare Wades with relevant title)', () => {
    // 1 zapier = 1 pt. Title has 'foster', so bare 'wade' counts for 0.5 each. Need 4 bare wades for 2 pts.
    assert.strictEqual(
      isRelevantContent('Zapier is great. Wade thinks so. Wade agrees. Wade said yes. Wade left.', 'Foster updates'),
      true
    );
  });

  await t.test('should return false for bare Wade mentions if title is not relevant', () => {
    assert.strictEqual(
      isRelevantContent('Wade went to the store. Wade bought milk. Wade came back. Wade slept. Wade woke up. Wade.', 'Random News'),
      false
    );
  });

  await t.test('should handle case insensitivity correctly', () => {
    assert.strictEqual(isRelevantContent('WaDe fOsTeR', 'News'), true);
    assert.strictEqual(isRelevantContent('ZAPIER ZAPIER ZAPIER', 'News'), true);
    assert.strictEqual(isRelevantContent('WADE WADE WADE WADE WADE WADE', 'zApIeR updates'), true);
  });

  await t.test('should handle newlines and extra spaces between Wade and Foster', () => {
    assert.strictEqual(isRelevantContent('Wade \n Foster is here', 'News'), true);
    assert.strictEqual(isRelevantContent('Wade    Foster is here', 'News'), true);
  });

  await t.test('should not count full name match as a bare Wade match', () => {
    // 1 full name = 3 pts.
    // Title is relevant, but the only "wade" is part of "wade foster".
    // Score should be 3, returning true.
    assert.strictEqual(isRelevantContent('Wade Foster', 'Foster'), true);
  });

  await t.test('should correctly count bare Wade when there is also a full name match', () => {
    // Title has zapier. Full name count = 1 (3 pts). Bare Wade count = 1 (0.5 pts). Total 3.5 pts.
    assert.strictEqual(isRelevantContent('Wade Foster is here. Wade agrees.', 'Zapier'), true);
  });

  await t.test('should return false for empty string', () => {
    assert.strictEqual(isRelevantContent(''), false);
  });
});
