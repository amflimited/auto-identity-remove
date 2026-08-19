/**
 * test/twocaptcha-provider.test.js
 *
 * Fork-specific: this build routes captcha solving through 2Captcha instead of
 * CapSolver. These tests lock in the three things that swap touched:
 *   1. createTask posts to the 2Captcha base and remaps CapSolver task-type names.
 *   2. pollCapSolver treats a non-zero errorId (2Captcha's failure shape) as failure.
 *   3. config.applyEnvOverrides injects TWOCAPTCHA_API_KEY over the file value.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const captcha = require('../lib/captcha');
const config = require('../lib/config');

test('SOLVER_BASE defaults to 2Captcha', () => {
  assert.equal(captcha.SOLVER_BASE, 'https://api.2captcha.com');
});

test('createTask remaps CapSolver type names to 2Captcha and hits /createTask', async () => {
  const calls = [];
  const fakeAxios = { post: async (url, body) => { calls.push({ url, body }); return { data: { errorId: 0, taskId: 42 } }; } };

  await captcha.createTask(fakeAxios, 'KEY', { type: 'AntiTurnstileTaskProxyLess', websiteURL: 'u', websiteKey: 'k' });
  await captcha.createTask(fakeAxios, 'KEY', { type: 'ReCaptchaV2TaskProxyless', websiteURL: 'u', websiteKey: 'k' });
  await captcha.createTask(fakeAxios, 'KEY', { type: 'HCaptchaTaskProxyless', websiteURL: 'u', websiteKey: 'k' });

  assert.ok(calls[0].url.endsWith('/createTask'));
  assert.ok(calls[0].url.startsWith('https://api.2captcha.com'));
  assert.equal(calls[0].body.clientKey, 'KEY');
  assert.equal(calls[0].body.task.type, 'TurnstileTaskProxyless');   // remapped
  assert.equal(calls[1].body.task.type, 'RecaptchaV2TaskProxyless'); // remapped (lower-c)
  assert.equal(calls[2].body.task.type, 'HCaptchaTaskProxyless');    // unchanged
  // original params preserved
  assert.equal(calls[0].body.task.websiteKey, 'k');
});

test('createTask passes unknown types through unchanged', async () => {
  let seen = null;
  const fakeAxios = { post: async (_u, body) => { seen = body; return { data: { taskId: 1 } }; } };
  await captcha.createTask(fakeAxios, 'K', { type: 'SomeFutureTask', foo: 1 });
  assert.equal(seen.task.type, 'SomeFutureTask');
});

test('pollCapSolver treats non-zero errorId as failure (2Captcha shape)', async () => {
  const fakeAxios = { post: async () => ({ data: { errorId: 12, errorCode: 'ERROR_CAPTCHA_UNSOLVABLE' } }) };
  const r = await captcha.pollCapSolver('t', { clientKey: 'K', axios: fakeAxios, intervalMs: 0, maxTries: 3 });
  assert.equal(r, null);
});

test('pollCapSolver returns solution on ready with errorId 0', async () => {
  const fakeAxios = { post: async () => ({ data: { errorId: 0, status: 'ready', solution: { token: 'abc' } } }) };
  const r = await captcha.pollCapSolver('t', { clientKey: 'K', axios: fakeAxios, intervalMs: 0, maxTries: 3 });
  assert.deepEqual(r, { token: 'abc' });
});

test('applyEnvOverrides injects TWOCAPTCHA_API_KEY over the file value', () => {
  const prev = process.env.TWOCAPTCHA_API_KEY;
  process.env.TWOCAPTCHA_API_KEY = 'ENV_KEY_123';
  try {
    const cfg = config.applyEnvOverrides({ capsolver: { apiKey: 'from-file' }, person: {} });
    assert.equal(cfg.capsolver.apiKey, 'ENV_KEY_123');
  } finally {
    if (prev === undefined) delete process.env.TWOCAPTCHA_API_KEY; else process.env.TWOCAPTCHA_API_KEY = prev;
  }
});

test('applyEnvOverrides leaves config untouched when no env key is set', () => {
  const prev = process.env.TWOCAPTCHA_API_KEY;
  const prevCap = process.env.CAPSOLVER_API_KEY;
  delete process.env.TWOCAPTCHA_API_KEY;
  delete process.env.CAPSOLVER_API_KEY;
  try {
    const cfg = config.applyEnvOverrides({ capsolver: { apiKey: 'from-file' } });
    assert.equal(cfg.capsolver.apiKey, 'from-file');
  } finally {
    if (prev !== undefined) process.env.TWOCAPTCHA_API_KEY = prev;
    if (prevCap !== undefined) process.env.CAPSOLVER_API_KEY = prevCap;
  }
});
