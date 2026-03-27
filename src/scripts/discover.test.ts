import { test } from 'node:test';
import assert from 'node:assert';
import { hashContent } from './discover.ts';

test('hashContent', async (t) => {
  await t.test('should return the same hash for identical text', () => {
    const text = 'Wade Foster is the CEO of Zapier.';
    assert.strictEqual(hashContent(text), hashContent(text));
  });

  await t.test('should return the same hash regardless of casing', () => {
    const lower = 'wade foster is the ceo of zapier.';
    const upper = 'WADE FOSTER IS THE CEO OF ZAPIER.';
    const mixed = 'WaDe FoStEr is the CeO oF zApIeR.';

    assert.strictEqual(hashContent(lower), hashContent(upper));
    assert.strictEqual(hashContent(lower), hashContent(mixed));
  });

  await t.test('should normalize varying whitespace correctly', () => {
    const singleSpaces = 'Wade Foster is the CEO of Zapier.';
    const multipleSpaces = 'Wade    Foster   is    the     CEO  of   Zapier.';
    const newlines = 'Wade\nFoster\nis\nthe\nCEO\nof\nZapier.';
    const tabs = 'Wade\tFoster\tis\tthe\tCEO\tof\tZapier.';
    const mixedWhitespace = 'Wade \n Foster \t is \r\n the CEO \nof \tZapier.';

    assert.strictEqual(hashContent(singleSpaces), hashContent(multipleSpaces));
    assert.strictEqual(hashContent(singleSpaces), hashContent(newlines));
    assert.strictEqual(hashContent(singleSpaces), hashContent(tabs));
    assert.strictEqual(hashContent(singleSpaces), hashContent(mixedWhitespace));
  });

  await t.test('should ignore leading and trailing whitespace', () => {
    const clean = 'Wade Foster is the CEO of Zapier.';
    const leading = '   \n  \t Wade Foster is the CEO of Zapier.';
    const trailing = 'Wade Foster is the CEO of Zapier.  \n \t  ';
    const both = '   Wade Foster is the CEO of Zapier.   ';

    assert.strictEqual(hashContent(clean), hashContent(leading));
    assert.strictEqual(hashContent(clean), hashContent(trailing));
    assert.strictEqual(hashContent(clean), hashContent(both));
  });

  await t.test('should return different hashes for genuinely different text', () => {
    const text1 = 'Wade Foster is the CEO of Zapier.';
    const text2 = 'Wade Foster founded Zapier in 2011.';

    assert.notStrictEqual(hashContent(text1), hashContent(text2));
  });

  await t.test('should handle empty strings and whitespace-only strings consistently', () => {
    const empty = '';
    const spaces = '   ';
    const newlines = '\n\n\n';

    assert.strictEqual(hashContent(empty), hashContent(spaces));
    assert.strictEqual(hashContent(empty), hashContent(newlines));
  });
});
