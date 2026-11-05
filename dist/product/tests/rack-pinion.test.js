import test from 'node:test';
import assert from 'node:assert/strict';
import { RackPinionModel } from '../src/rack-pinion.js';

test('rotating pinion moves rack by pitch radius arc length', () => {
  const model = new RackPinionModel({ pitchRadius: 48, minX: -160, maxX: 160 });
  model.setAngle(Math.PI / 2);
  assert.ok(Math.abs(model.rackX + Math.PI * 24) < 0.001);
});

test('dragging rack back-solves the pinion angle', () => {
  const model = new RackPinionModel({ pitchRadius: 40, minX: -120, maxX: 120 });
  model.setRackX(80);
  assert.equal(model.rackX, 80);
  assert.equal(model.angle, -2);
});

test('rack travel is clamped without breaking engagement', () => {
  const model = new RackPinionModel({ pitchRadius: 40, minX: -100, maxX: 100 });
  model.setRackX(999);
  assert.equal(model.rackX, 100);
  assert.equal(model.angle, -2.5);
});

test('rack dragging preserves the grabbed offset instead of jumping', async () => {
  const { rackDragTarget } = await import('../src/rack-pinion.js');
  assert.equal(rackDragTarget(510, 500, 35), 45);
});

test('pinion dragging unwraps angle across the pi boundary', async () => {
  const { unwrapAngleDelta } = await import('../src/rack-pinion.js');
  const delta = unwrapAngleDelta(-Math.PI + 0.1, Math.PI - 0.1);
  assert.ok(Math.abs(delta - 0.2) < 0.0001);
});
