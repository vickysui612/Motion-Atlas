import test from 'node:test';
import assert from 'node:assert/strict';
import { roadster, parseRoute, routeForNode } from '../src/data.js';

test('Roadster content graph exposes seven complete systems', () => {
  assert.equal(roadster.systems.length, 7);
  for (const system of roadster.systems) {
    assert.ok(system.id);
    assert.ok(system.mechanisms.length >= 1);
    assert.ok(system.mechanisms[0].parts.length >= 3);
  }
});

test('deep link resolves exact product system mechanism and part', () => {
  const route = parseRoute('#product/roadster/steering-system/rack-pinion/steering-rack');
  assert.deepEqual(route, {
    page: 'product', productId: 'roadster', systemId: 'steering-system',
    mechanismId: 'rack-pinion', partId: 'steering-rack', valid: true
  });
});

test('invalid product deep link safely falls back to whole Roadster', () => {
  assert.deepEqual(parseRoute('#product/no-car/no-system/no-mechanism/no-part'), {
    page: 'product', productId: 'roadster', systemId: null,
    mechanismId: null, partId: null, valid: false
  });
});

test('node routes remain stable and human-readable', () => {
  assert.equal(
    routeForNode('steering-system', 'rack-pinion', 'steering-pinion'),
    '#product/roadster/steering-system/rack-pinion/steering-pinion'
  );
});

test('unimplemented mechanism detail routes return to atlas instead of showing wrong diagram', () => {
  assert.deepEqual(parseRoute('#mechanism/worm'), { page: 'atlas', mechanismId: 'worm', valid: false });
});
