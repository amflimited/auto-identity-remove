#!/usr/bin/env node
/* Engine health check — network-free. Catches the failure modes that would make a paid
   removal run silently do nothing: the broker registry not loading, its count collapsing
   (a bad deploy or truncated data file), or the explicit-broker module failing to require.
   Exits non-zero and prints the reasons if anything is red; the shell wrapper emails the
   owner on non-zero. Deliberately does NOT hit broker sites — that is noisy from a
   datacenter IP and is the per-customer --verify job's concern, not a health signal. */
'use strict';
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const MIN_PERMISSIVE = 1000;   // merged registry is 1,173; alert well below that
const MIN_NAVIGABLE  = 750;    // rows with an http opt-out URL the generic runner can use
const MIN_EXPLICIT   = 30;     // brokers.js hand-mapped set (~42)

const problems = [];
const stats = {};

// 1) permissive registry loads with a sane count
try {
  const reg = JSON.parse(fs.readFileSync(path.join(dir, 'data', 'permissive-brokers.json'), 'utf8'));
  const rows = reg.brokers || [];
  stats.permissive_total = rows.length;
  stats.permissive_navigable = rows.filter(r => (r.optOutUrl || '').startsWith('http')).length;
  stats.permissive_with_email = rows.filter(r => r.optOutEmail).length;
  if (rows.length < MIN_PERMISSIVE) problems.push(`permissive registry only ${rows.length} rows (< ${MIN_PERMISSIVE})`);
  if (stats.permissive_navigable < MIN_NAVIGABLE) problems.push(`only ${stats.permissive_navigable} navigable opt-out URLs (< ${MIN_NAVIGABLE})`);
} catch (e) {
  problems.push('permissive-brokers.json failed to load: ' + e.message);
}

// 2) the generic runner actually loads brokers (exercises the real load path)
try {
  const m = require(path.join(dir, 'generic-runner.js'));
  const fn = m.loadGenericBrokers || (m.__test && m.__test.loadGenericBrokers);
  if (typeof fn === 'function') {
    const loaded = fn(new Set());
    stats.generic_loaded = loaded.length;
    if (loaded.length < MIN_NAVIGABLE) problems.push(`generic runner loaded only ${loaded.length} brokers`);
  } else {
    stats.generic_loaded = 'loadGenericBrokers not exported (non-fatal)';
  }
} catch (e) {
  problems.push('generic-runner.js failed to load: ' + e.message);
}

// 3) explicit hand-mapped brokers module requires cleanly
try {
  const explicit = require(path.join(dir, 'brokers.js'));
  stats.explicit = Array.isArray(explicit) ? explicit.length : Object.keys(explicit).length;
  if (stats.explicit < MIN_EXPLICIT) problems.push(`brokers.js only ${stats.explicit} entries (< ${MIN_EXPLICIT})`);
} catch (e) {
  problems.push('brokers.js failed to require: ' + e.message);
}

const healthy = problems.length === 0;
console.log(JSON.stringify({ healthy, at: new Date().toISOString(), stats, problems }, null, 1));
process.exit(healthy ? 0 : 1);
