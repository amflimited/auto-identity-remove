'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const brokers = require('../brokers');

test('unverified Protect Indiana candidate workflows stay manual', () => {
  for (const name of ['FastPeopleSearch', 'CheckPeople']) {
    const broker = brokers.find(entry => entry.name === name);
    assert.ok(broker, `${name} definition must exist`);
    assert.equal(broker.method, 'manual', `${name} must not submit through the stale generic definition`);
    assert.match(broker.notes || '', /disabled/i);
  }
});
