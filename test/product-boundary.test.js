'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadRemovalBoundary, applyRemovalBoundary } = require('../lib/product-boundary');

function withBoundary(document, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-boundary-'));
  const file = path.join(dir, 'boundary.json');
  fs.writeFileSync(file, JSON.stringify(document));
  try { return fn(file); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

test('pending owner approval fails closed', () => {
  withBoundary({ schemaVersion: 1, approvalStatus: 'pending_owner_approval', approvedRemovalBrokers: ['A'] }, file => {
    assert.throws(() => loadRemovalBoundary(file), /pending owner approval/);
  });
});

test('approved empty boundary fails closed', () => {
  withBoundary({ schemaVersion: 1, approvalStatus: 'approved', approvedRemovalBrokers: [] }, file => {
    assert.throws(() => loadRemovalBoundary(file), /empty/);
  });
});

test('approved boundary selects exact names and rejects catalog drift', () => {
  withBoundary({ schemaVersion: 1, approvalStatus: 'approved', approvedRemovalBrokers: ['A'] }, file => {
    const boundary = loadRemovalBoundary(file);
    assert.deepEqual(applyRemovalBoundary([{ name: 'A' }, { name: 'B' }], boundary).map(x => x.name), ['A']);
    assert.throws(() => applyRemovalBoundary([{ name: 'B' }], boundary), /missing broker/);
  });
});
