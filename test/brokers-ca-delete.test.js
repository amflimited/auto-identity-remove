/**
 * test/brokers-ca-delete.test.js
 *
 * Verifies the California DELETE Portal broker entry exists in brokers.js.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');

// brokers.js reads config.json at load time; use the config.example.json values
// by monkeypatching require before importing.
const Module = require('module');
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === './config.json' || request === '../config.json') {
    return require('../config.example.json');
  }
  return origLoad.apply(this, arguments);
};

const brokers = require('../brokers');

Module._load = origLoad;

test('brokers.js exports a California DELETE Portal entry', () => {
  const entry = brokers.find(b => b.name === 'California DELETE Portal');
  assert.ok(entry, 'California DELETE Portal entry must exist in brokers.js');
});

test('California DELETE Portal has priority 1', () => {
  const entry = brokers.find(b => b.name === 'California DELETE Portal');
  assert.equal(entry.priority, 1);
});

test('California DELETE Portal has method manual', () => {
  const entry = brokers.find(b => b.name === 'California DELETE Portal');
  assert.equal(entry.method, 'manual', 'California DROP must remain a manual external resource');
});

test('California DELETE Portal optOutUrl points to the official privacy.ca.gov service', () => {
  const entry = brokers.find(b => b.name === 'California DELETE Portal');
  assert.ok(
    entry.optOutUrl && entry.optOutUrl.includes('privacy.ca.gov'),
    `optOutUrl must reference privacy.ca.gov, got: ${entry.optOutUrl}`
  );
});

test('California DELETE Portal has current official confidence', () => {
  const entry = brokers.find(b => b.name === 'California DELETE Portal');
  assert.equal(entry.confidence, 'official_current');
});

test('California DELETE Portal note limits eligibility to California residents', () => {
  const entry = brokers.find(b => b.name === 'California DELETE Portal');
  const noteText = (entry.note || entry.notes || '').toLowerCase();
  assert.ok(
    noteText.includes('california residents'),
    'note must describe California-resident eligibility'
  );
});
