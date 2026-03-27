import { test } from 'node:test';
import assert from 'node:assert';
import { stripHtml } from './string';

test('stripHtml', async (t) => {
  await t.test('Base Cases', async (st) => {
    await st.test('should handle empty strings', () => {
      assert.strictEqual(stripHtml(''), '');
    });

    await st.test('should handle plain text without any HTML or entities', () => {
      assert.strictEqual(stripHtml('Just plain text'), 'Just plain text');
    });
  });

  await t.test('Tags Handling', async (st) => {
    await st.test('should remove basic HTML tags', () => {
      assert.strictEqual(stripHtml('<p>Hello <b>World</b></p>'), 'Hello World');
    });

    await st.test('should remove tags with attributes', () => {
      assert.strictEqual(
        stripHtml('<a href="https://example.com" class="link">Click here</a>'),
        'Click here'
      );
      assert.strictEqual(
        stripHtml('<img src="image.png" alt="An image" />'),
        ''
      );
    });

    await st.test('should handle nested and consecutive tags', () => {
      assert.strictEqual(
        stripHtml('<div><span><p>Deeply nested</p></span></div>'),
        'Deeply nested'
      );
      assert.strictEqual(
        stripHtml('<h1>Title</h1><p>Paragraph</p>'),
        'TitleParagraph'
      );
    });

    await st.test('should handle malformed or unclosed tags gracefully', () => {
      // Current regex /<[^>]*>/g behavior:
      assert.strictEqual(stripHtml('<p>test<'), 'test<');
      assert.strictEqual(stripHtml('<ptest'), '<ptest');
    });

    await st.test('should remove tags spanning multiple lines', () => {
      assert.strictEqual(
        stripHtml('<div\nclass="test"\nid="main"\n>\nContent\n</div>'),
        'Content'
      );
    });
  });

  await t.test('Entities Handling', async (st) => {
    await st.test('should decode common HTML entities correctly', () => {
      assert.strictEqual(stripHtml('Wade &amp; Zapier &quot;CEO&quot;'), 'Wade & Zapier "CEO"');
      assert.strictEqual(stripHtml('It&#x27;s &lt;great&gt;'), "It's <great>");
    });

    await st.test('should decode non-breaking spaces as regular spaces', () => {
      assert.strictEqual(stripHtml('Hello&nbsp;World'), 'Hello World');
      assert.strictEqual(stripHtml('Hello&nbsp;&nbsp;World'), 'Hello World');
    });

    await st.test('should leave & character alone if not part of decoded entity', () => {
      assert.strictEqual(stripHtml('Me & you'), 'Me & you');
      assert.strictEqual(stripHtml('Me &amp you'), 'Me &amp you'); // Malformed entity, but &amp is handled globally so maybe just missing ; in real HTML, but our regex is exact. Let's see. wait, our code does `replace(/&amp;/g, "&")`, so it doesn't match `&amp `
    });
  });

  await t.test('Whitespace Handling', async (st) => {
    await st.test('should collapse multiple spaces into a single space', () => {
      assert.strictEqual(stripHtml('Hello   World'), 'Hello World');
      assert.strictEqual(stripHtml('Hello \t World'), 'Hello World');
    });

    await st.test('should handle newlines', () => {
      assert.strictEqual(stripHtml('Hello\nWorld'), 'Hello World');
      assert.strictEqual(stripHtml('Hello\r\nWorld'), 'Hello World');
      assert.strictEqual(stripHtml('Hello   \n  World'), 'Hello World');
    });

    await st.test('should trim the result', () => {
      assert.strictEqual(stripHtml('   Hello   '), 'Hello');
      assert.strictEqual(stripHtml('\n\tHello\n\t'), 'Hello');
    });
  });

  await t.test('Edge Cases / Potential Issues', async (st) => {
    await st.test('should incorrectly strip math expressions with < and > if they look like tags', () => {
      // "1 < 2 and 3 > 1"
      // the regex /<[^>]*>/g matches "< 2 and 3 >"
      assert.strictEqual(stripHtml('1 < 2 and 3 > 1'), '1 1');
    });

    await st.test('should handle strings that only consist of tags and entities', () => {
      assert.strictEqual(stripHtml('<p>&nbsp;</p>'), '');
      assert.strictEqual(stripHtml('<div>&amp;</div>'), '&');
    });
  });
});
