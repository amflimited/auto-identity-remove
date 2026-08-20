'use strict';

/**
 * lib/diff.js
 *
 * Compare current run results against a previous run log without turning an
 * accepted submission into a verified removal or an exposure finding.
 */

const fs   = require('fs');
const path = require('path');

/**
 * Compare previous and current run results.
 *
 * @param {object|null} prev - Previous run results object (or null if no prior log).
 * @param {object} curr - Current run results object.
 * @returns {{ newSubmissions: string[], newNoListingResults: string[], newErrors: string[], summary: string }}
 */
function diffResults(prev, curr) {
  if (prev === null) {
    const allCurrent = [
      ...(curr.succeeded     || []),
      ...(curr.notFound      || []),
      ...(curr.errors        || []),
      ...(curr.captchaFailed || []),
      ...(curr.pendingConfirm|| []),
      ...(curr.manual        || []),
    ].map(r => r.broker);

    return {
      newSubmissions: [],
      newNoListingResults: [],
      newErrors: [],
      summary:      `Since last run: ${allCurrent.length} newly attempted.`,
    };
  }

  const prevSucceeded = new Set((prev.succeeded || []).map(r => r.broker));
  const prevNotFound = new Set((prev.notFound || []).map(r => r.broker));
  const prevErrors = new Set((prev.errors || []).map(r => r.broker));
  const newSubmissions = (curr.succeeded || [])
    .map(r => r.broker)
    .filter(name => !prevSucceeded.has(name));
  const newNoListingResults = (curr.notFound || [])
    .map(r => r.broker)
    .filter(name => !prevNotFound.has(name));
  const newErrors = (curr.errors || [])
    .map(r => r.broker)
    .filter(name => !prevErrors.has(name));

  const summary = `Since last run: +${newSubmissions.length} new submissions, +${newNoListingResults.length} new no-listing results, +${newErrors.length} new errors.`;

  return { newSubmissions, newNoListingResults, newErrors, summary };
}

/**
 * Load the newest run-*.json file in logsDir, excluding currentFile.
 *
 * @param {string} logsDir - Directory containing run-*.json files.
 * @param {string} currentFile - Filename or absolute path of the current log to exclude.
 * @returns {object|null} Parsed JSON of the previous run, or null if none found.
 */
function loadPreviousLog(logsDir, currentFile) {
  const currentBase = path.basename(currentFile);

  let files;
  try {
    files = fs.readdirSync(logsDir);
  } catch (_) {
    return null;
  }

  const candidates = files
    .filter(f => /^run-.+\.json$/.test(f) && f !== currentBase)
    .sort()
    .reverse();

  if (candidates.length === 0) return null;

  try {
    const content = fs.readFileSync(path.join(logsDir, candidates[0]), 'utf8');
    return JSON.parse(content);
  } catch (_) {
    return null;
  }
}

module.exports = { diffResults, loadPreviousLog };
