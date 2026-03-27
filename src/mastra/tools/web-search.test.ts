import { test } from 'node:test';
import assert from 'node:assert';
import { stripHtml, cleanUrl, parseDuckDuckGoResults } from './web-search.ts';

test('stripHtml', async (t) => {
  await t.test('should remove HTML tags', () => {
    assert.strictEqual(stripHtml('<p>Hello <b>World</b></p>'), 'Hello World');
  });

  await t.test('should decode common HTML entities', () => {
    assert.strictEqual(stripHtml('Wade &amp; Zapier &quot;CEO&quot;'), 'Wade & Zapier "CEO"');
    assert.strictEqual(stripHtml('It&#x27;s &lt;great&gt;'), "It's <great>");
  });

  await t.test('should collapse multiple spaces', () => {
    assert.strictEqual(stripHtml('Hello   \n  World'), 'Hello World');
  });

  await t.test('should trim the result', () => {
    assert.strictEqual(stripHtml('   Hello   '), 'Hello');
  });
});

test('cleanUrl', async (t) => {
  await t.test('should extract URL from DuckDuckGo redirect', () => {
    const ddgUrl = '/l/?kh=-1&uddg=https%3A%2F%2Fzapier.com%2Fblog%2Fwade-foster-productivity%2F';
    assert.strictEqual(cleanUrl(ddgUrl), 'https://zapier.com/blog/wade-foster-productivity/');
  });

  await t.test('should return the same URL if no redirect parameter', () => {
    const normalUrl = 'https://zapier.com/about/';
    assert.strictEqual(cleanUrl(normalUrl), 'https://zapier.com/about/');
  });
});

test('parseDuckDuckGoResults', async (t) => {
  await t.test('should parse standard result blocks', () => {
    const html = '<div class="links_main links_deep result__body">' +
        '<a class="result__a" href="/l/?uddg=https%3A%2F%2Fexample.com%2F1">Title 1</a>' +
        '<a class="result__snippet" href="#">Snippet 1 content</a>' +
      '</div>' +
      '<div class="links_main links_deep result__body">' +
        '<a class="result__a" href="https://example.com/2">Title 2</a>' +
        '<a class="result__snippet" href="#">Snippet 2 <b>bold</b> content</a>' +
      '</div>';
    const results = parseDuckDuckGoResults(html);
    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].title, 'Title 1');
    assert.strictEqual(results[0].url, 'https://example.com/1');
    assert.strictEqual(results[0].snippet, 'Snippet 1 content');
    assert.strictEqual(results[1].title, 'Title 2');
    assert.strictEqual(results[1].url, 'https://example.com/2');
    assert.strictEqual(results[1].snippet, 'Snippet 2 bold content');
  });

  await t.test('should parse results using fallback pattern', () => {
    const html = '<a class="result__a" href="https://example.com/fallback">Fallback Title</a>' +
      '<a class="result__snippet" href="#">Fallback Snippet</a>';
    const results = parseDuckDuckGoResults(html);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].title, 'Fallback Title');
    assert.strictEqual(results[0].url, 'https://example.com/fallback');
    assert.strictEqual(results[0].snippet, 'Fallback Snippet');
  });

  await t.test('should return empty array for no results', () => {
    const html = '<html><body>No results found</body></html>';
    const results = parseDuckDuckGoResults(html);
    assert.deepStrictEqual(results, []);
  });

  await t.test('should limit results to 5', () => {
    let html = '';
    for (let i = 1; i <= 10; i++) {
      html += '<div class="links_main links_deep result__body">' +
          '<a class="result__a" href="https://example.com/' + i + '">Title ' + i + '</a>' +
          '<a class="result__snippet" href="#">Snippet ' + i + '</a>' +
        '</div>';
    }
    const results = parseDuckDuckGoResults(html);
    assert.strictEqual(results.length, 5);
  });
});
