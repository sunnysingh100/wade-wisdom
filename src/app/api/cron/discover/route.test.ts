import { test } from 'node:test';
import assert from 'node:assert';
import { GET } from './route';

test('Cron discover API secret validation', async (t) => {
  const originalCronSecret = process.env.CRON_SECRET;

  t.afterEach(() => {
    if (originalCronSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalCronSecret;
    }
  });

  await t.test('should return 500 when CRON_SECRET is not set', async () => {
    delete process.env.CRON_SECRET;
    const req = new Request('http://localhost/api/cron/discover?secret=test');
    const res = await GET(req);
    assert.strictEqual(res.status, 500);
    const data = await res.json();
    assert.strictEqual(data.error, 'CRON_SECRET not configured on the server.');
  });

  await t.test('should return 401 when secret query parameter is missing', async () => {
    process.env.CRON_SECRET = 'my-secret';
    const req = new Request('http://localhost/api/cron/discover');
    const res = await GET(req);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.error, 'Unauthorized. Invalid or missing secret.');
  });

  await t.test('should return 401 when secret query parameter is incorrect', async () => {
    process.env.CRON_SECRET = 'my-secret';
    const req = new Request('http://localhost/api/cron/discover?secret=wrong-secret');
    const res = await GET(req);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.error, 'Unauthorized. Invalid or missing secret.');
  });
});
