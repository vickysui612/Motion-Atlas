import test from 'node:test';
import assert from 'node:assert/strict';
import { createViewerState, selectNode, setMode } from '../src/viewer-state.js';
import { isVisibleInHierarchy } from '../src/viewer-state.js';

test('selecting a part keeps its product hierarchy synchronized', () => {
  const state = selectNode(createViewerState(), {
    systemId: 'steering-system', mechanismId: 'rack-pinion', partId: 'steering-rack'
  });
  assert.deepEqual(state.selection, {
    systemId: 'steering-system', mechanismId: 'rack-pinion', partId: 'steering-rack'
  });
});

test('viewer display modes are mutually exclusive', () => {
  let state = createViewerState();
  state = setMode(state, 'xray');
  state = setMode(state, 'isolate');
  assert.equal(state.mode, 'isolate');
  state = setMode(state, 'explode');
  assert.equal(state.mode, 'explode');
});

test('unknown display mode safely returns to normal', () => {
  const state = setMode(createViewerState(), 'wireframe');
  assert.equal(state.mode, 'normal');
});

test('hidden ancestors make a mesh ineligible for picking', () => {
  const root = { visible: false, parent: null };
  const child = { visible: true, parent: root };
  assert.equal(isVisibleInHierarchy(child), false);
  root.visible = true;
  assert.equal(isVisibleInHierarchy(child), true);
});
