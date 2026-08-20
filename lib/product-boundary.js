/**
 * Protect Indiana's customer product uses a deliberately smaller set than the
 * upstream engine catalog. The versioned file must be personally approved by
 * the owner before a customer run can submit anything. Fail closed on a
 * missing, malformed, pending, empty, or drifted boundary.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_BOUNDARY_PATH = path.join(__dirname, '..', 'data', 'protectindiana-boundaries.json');

function loadRemovalBoundary(filePath = DEFAULT_BOUNDARY_PATH) {
  let document;
  try {
    document = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(`Protect Indiana removal boundary could not be loaded: ${err.message}`);
  }
  if (document.schemaVersion !== 1) {
    throw new Error(`Protect Indiana removal boundary has unsupported schemaVersion ${document.schemaVersion}`);
  }
  if (document.approvalStatus !== 'approved') {
    throw new Error('Protect Indiana removal boundary is pending owner approval; refusing customer submissions');
  }
  const names = document.approvedRemovalBrokers;
  if (!Array.isArray(names) || names.length === 0) {
    throw new Error('Protect Indiana approved removal boundary is empty; refusing customer submissions');
  }
  const normalized = names.map(name => String(name || '').trim()).filter(Boolean);
  if (normalized.length !== names.length || new Set(normalized).size !== normalized.length) {
    throw new Error('Protect Indiana approved removal boundary contains blank or duplicate broker names');
  }
  return { document, names: new Set(normalized) };
}

function applyRemovalBoundary(catalog, boundary) {
  if (!Array.isArray(catalog)) throw new Error('broker catalog must be an array');
  const names = boundary && boundary.names;
  if (!(names instanceof Set)) throw new Error('approved removal broker names are missing');

  const available = new Set(catalog.map(broker => broker.name));
  const missing = [...names].filter(name => !available.has(name));
  if (missing.length > 0) {
    throw new Error(`Protect Indiana removal boundary references missing broker(s): ${missing.join(', ')}`);
  }

  const selected = catalog.filter(broker => names.has(broker.name));
  if (selected.length === 0) {
    throw new Error('Protect Indiana removal boundary selected no brokers; refusing customer submissions');
  }
  return selected;
}

module.exports = { DEFAULT_BOUNDARY_PATH, loadRemovalBoundary, applyRemovalBoundary };
