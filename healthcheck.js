#!/usr/bin/env node
/* Engine health check - network-free. Catches the failure modes that would make a paid
   removal run silently do nothing: the broker registry not loading, its count collapsing
   (a bad deploy or truncated data file), or the explicit-broker module failing to require.
   Exits non-zero and prints the reasons if anything is red; the shell wrapper emails the
   owner on non-zero. Deliberately does NOT hit broker sites - that is noisy from a
   datacenter IP and is the per-customer --verify job's concern, not a health signal. */
'use strict';
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const MIN_PERMISSIVE = 450;    // PersProtect publishes 499 CC BY 4.0 rows; alert on collapse
const MIN_NAVIGABLE  = 400;    // 452 rows currently have an http opt-out URL
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

// 2) the development-only generic runner actually loads (exercises its real
// load path). Its deduplicated count is informational: Protect Indiana's
// customer product never uses the generic submission lane.
try {
  const m = require(path.join(dir, 'generic-runner.js'));
  const fn = m.loadGenericBrokers || (m.__test && m.__test.loadGenericBrokers);
  if (typeof fn === 'function') {
    const loaded = fn(new Set());
    stats.generic_loaded = loaded.length;
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

// 4) the versioned Protect Indiana product boundary parses. Pending approval is
// a valid pre-launch state, so health reports it without treating it as a
// customer-submission authorization.
try {
  const boundary = JSON.parse(fs.readFileSync(path.join(dir, 'data', 'protectindiana-boundaries.json'), 'utf8'));
  stats.protectindiana_boundary_status = boundary.approvalStatus;
  stats.protectindiana_approved_removal = (boundary.approvedRemovalBrokers || []).length;
  stats.protectindiana_candidate_removal = (boundary.candidateRemovalBrokers || []).length;
  if (boundary.schemaVersion !== 1) problems.push('protectindiana-boundaries.json has an unsupported schemaVersion');
} catch (e) {
  problems.push('protectindiana-boundaries.json failed to load: ' + e.message);
}

const healthy = problems.length === 0;
console.log(JSON.stringify({ healthy, at: new Date().toISOString(), stats, problems }, null, 1));
process.exit(healthy ? 0 : 1);
