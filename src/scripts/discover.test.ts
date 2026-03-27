import { test } from 'node:test';
import assert from 'node:assert';
import { extractWithRegex } from './discover.ts';

test('extractWithRegex', async (t) => {
  const padTo200 = (str: string) => {
    return str + 'A'.repeat(200);
  };

  await t.test('should remove script tags and their content', () => {
    const html = '<script>const a = 1;</script>Hello<script type="text/javascript">console.log("world");</script>World';
    const result = extractWithRegex(padTo200(html));
    assert.strictEqual(result, 'HelloWorld' + 'A'.repeat(200));
  });

  await t.test('should remove style tags and their content', () => {
    const html = '<style>body { color: red; }</style>Hello<style type="text/css">p { margin: 0; }</style>World';
    const result = extractWithRegex(padTo200(html));
    assert.strictEqual(result, 'HelloWorld' + 'A'.repeat(200));
  });

  await t.test('should remove nav tags and their content', () => {
    const html = '<nav><ul><li>Home</li></ul></nav>Hello<nav class="main">Links</nav>World';
    const result = extractWithRegex(padTo200(html));
    assert.strictEqual(result, 'HelloWorld' + 'A'.repeat(200));
  });

  await t.test('should remove footer tags and their content', () => {
    const html = '<footer>Copyright 2025</footer>Hello<footer id="colophon">Links</footer>World';
    const result = extractWithRegex(padTo200(html));
    assert.strictEqual(result, 'HelloWorld' + 'A'.repeat(200));
  });

  await t.test('should remove header tags and their content', () => {
    const html = '<header><h1>Site Title</h1></header>Hello<header class="banner">Logo</header>World';
    const result = extractWithRegex(padTo200(html));
    assert.strictEqual(result, 'HelloWorld' + 'A'.repeat(200));
  });

  await t.test('should remove general HTML tags but keep their content', () => {
    // We expect the tags to be gone and spaces correctly handled
    assert.strictEqual(extractWithRegex(padTo200('<div>Hello <b>World</b></div>')), 'Hello World ' + 'A'.repeat(200));
  });

  await t.test('should decode common HTML entities', () => {
    const text = 'Wade &amp; Zapier &quot;CEO&quot; It&#x27;s &lt;great&gt; and&nbsp;cool';
    const html = padTo200(text);
    const expectedText = 'Wade & Zapier "CEO" It\'s <great> and cool';

    // In our implementation, &nbsp; becomes a space
    assert.strictEqual(extractWithRegex(html), expectedText + 'A'.repeat(200));
  });

  await t.test('should collapse multiple spaces and trim', () => {
    const text = '   Hello    \n\n\t  World  ';
    const html = text.padEnd(200, ' '); // length 200 before trim
    // after trim it's only 11 chars
    assert.strictEqual(extractWithRegex(html), null);

    const longText = '   Hello    \n\n\t  World  ' + 'A'.repeat(200);
    const result = extractWithRegex(longText);
    assert.strictEqual(result, 'Hello World ' + 'A'.repeat(200));
  });

  await t.test('should return null if resulting length is less than 200', () => {
    const html = '<div>Short text</div>';
    assert.strictEqual(extractWithRegex(html), null);
  });

  await t.test('should return the text if resulting length is exactly 200', () => {
    const html = 'A'.repeat(200);
    assert.strictEqual(extractWithRegex(html), html);
  });

  await t.test('should handle a full realistic HTML document', () => {
    const html = `
      <html>
        <head>
          <title>Test Page</title>
          <style>body { font-size: 16px; }</style>
          <script>window.analytics = true;</script>
        </head>
        <body>
          <header>
            <h1>Site Header</h1>
          </header>
          <nav>
            <a href="/">Home</a>
          </nav>
          <main>
            <article>
              <h1>Article Title</h1>
              <p>This is a paragraph with <b>bold</b> text and a <a href="link">link</a>.</p>
              <p>Special characters: &amp; &lt; &gt; &quot; &#x27; &nbsp;</p>
              ${'More text '.repeat(30)}
            </article>
          </main>
          <footer>
            <p>&copy; 2025</p>
          </footer>
          <script src="app.js"></script>
        </body>
      </html>
    `;
    const result = extractWithRegex(html);
    assert.notStrictEqual(result, null);

    // Verify things that shouldn't be there
    assert.ok(!result!.includes('body { font-size: 16px; }'), 'Should not contain CSS');
    assert.ok(!result!.includes('window.analytics = true;'), 'Should not contain JS');
    assert.ok(!result!.includes('Site Header'), 'Should not contain Header');
    assert.ok(!result!.includes('Home'), 'Should not contain Nav');
    assert.ok(!result!.includes('2025'), 'Should not contain Footer');

    // Verify things that should be there
    assert.ok(result!.includes('Test Page'), 'Should contain title');
    assert.ok(result!.includes('Article Title'), 'Should contain content heading');
    assert.ok(result!.includes('This is a paragraph with bold text and a link .'), 'Should contain content body');
    assert.ok(result!.includes('Special characters: & < > " \' '), 'Should handle entities properly');
  });
});
