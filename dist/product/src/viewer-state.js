const MODES = new Set(['normal', 'xray', 'isolate', 'explode']);

export function createViewerState() {
  return {
    mode: 'normal',
    labels: true,
    explodeAmount: 0,
    selection: { systemId: null, mechanismId: null, partId: null }
  };
}

export function selectNode(state, selection) {
  return {
    ...state,
    selection: {
      systemId: selection.systemId || null,
      mechanismId: selection.mechanismId || null,
      partId: selection.partId || null
    }
  };
}

export function setMode(state, mode) {
  const safeMode = MODES.has(mode) ? mode : 'normal';
  return { ...state, mode: safeMode, explodeAmount: safeMode === 'explode' ? Math.max(state.explodeAmount, 0.45) : 0 };
}

export function isVisibleInHierarchy(object) {
  let current = object;
  while (current) {
    if (current.visible === false) return false;
    current = current.parent;
  }
  return true;
}
