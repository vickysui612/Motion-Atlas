import { roadster, mechanismCatalog, parseRoute, routeForNode, findNode } from './data.js';
import { createViewerState, selectNode, setMode } from './viewer-state.js';
import { createRackPinionView } from './rack-view.js';
import { RoadsterScene } from './roadster-3d.js';

const pages = {
  home: document.querySelector('#page-home'), atlas: document.querySelector('#page-atlas'),
  mechanism: document.querySelector('#page-mechanism'), product: document.querySelector('#page-product')
};
let roadsterScene = null;
let rackView = null;
let viewerState = createViewerState();
let expandedSystem = null;
let expandedMechanism = null;

function iconFor(id) {
  const base = `<svg viewBox="0 0 220 130" aria-hidden="true"><path d="M25 105H195" stroke="#4d5955" stroke-width="3"/>`;
  if (id === 'rack-pinion') return `${base}<g transform="translate(72 56)"><circle r="31" fill="none" stroke="#ffb65c" stroke-width="8"/><circle r="8" fill="#ffb65c"/><path d="M0-42V-30M0 30V42M-42 0H-30M30 0H42M-30-30l9 9M21 21l9 9M30-30l-9 9M-21 21l-9 9" stroke="#ffb65c" stroke-width="7"/></g><path d="M95 78h97v22H95z" fill="#a98df544" stroke="#a98df5" stroke-width="4"/><path d="M100 78l7-12 8 12 8-12 8 12 8-12 8 12 8-12 8 12 8-12 8 12 8-12 8 12" fill="none" stroke="#a98df5" stroke-width="4"/></svg>`;
  if (id === 'slider-crank') return `${base}<circle cx="62" cy="63" r="34" fill="none" stroke="#78e6d1" stroke-width="7"/><path d="M62 63l33 18 54 0" stroke="#ffb65c" stroke-width="9"/><rect x="145" y="61" width="42" height="39" fill="#a98df544" stroke="#a98df5" stroke-width="5"/></svg>`;
  if (id === 'four-bar') return `${base}<path d="M45 92l28-55 66 14 36 41" fill="none" stroke="#78e6d1" stroke-width="8"/><circle cx="45" cy="92" r="7" fill="#ffb65c"/><circle cx="73" cy="37" r="7" fill="#ffb65c"/><circle cx="139" cy="51" r="7" fill="#a98df5"/><circle cx="175" cy="92" r="7" fill="#a98df5"/></svg>`;
  if (id === 'belt') return `${base}<circle cx="66" cy="66" r="31" fill="none" stroke="#78e6d1" stroke-width="7"/><circle cx="161" cy="66" r="23" fill="none" stroke="#ffb65c" stroke-width="7"/><path d="M67 35h94M67 97h94" stroke="#c8f75f" stroke-width="5"/></svg>`;
  return `${base}<circle cx="72" cy="65" r="31" fill="none" stroke="#78e6d1" stroke-width="7"/><circle cx="144" cy="65" r="24" fill="none" stroke="#a98df5" stroke-width="7"/><path d="M102 65h18" stroke="#c8f75f" stroke-width="7"/></svg>`;
}

function renderAtlas() {
  const grid = document.querySelector('#mechanism-grid');
  grid.innerHTML = mechanismCatalog.map(item => `<a class="mechanism-card ${item.id === 'rack-pinion' ? 'featured' : ''}" href="${item.id === 'rack-pinion' ? '#mechanism/rack-pinion' : '#atlas'}" data-mechanism-card="${item.id}"><div class="mini-diagram">${iconFor(item.id)}</div><h3>${item.name}</h3><p>${item.motion}</p><footer><span>${item.use}</span><b>${item.id === 'rack-pinion' ? '可交互 →' : '预览'}</b></footer></a>`).join('');
  grid.addEventListener('click', event => {
    const card = event.target.closest('[data-mechanism-card]');
    if (card && card.dataset.mechanismCard !== 'rack-pinion') { event.preventDefault(); toast('本轮先验证齿轮齿条完整链路，其他机构保留为二维预览。'); }
  });
}

function mountRackView() {
  if (rackView) return;
  rackView = createRackPinionView(document.querySelector('#rack-pinion-stage'), {
    play: document.querySelector('#motion-play'), progress: document.querySelector('#motion-progress'),
    reset: document.querySelector('#motion-reset'), speedButtons: [...document.querySelectorAll('[data-speed]')]
  });
}

function findMechanismForPart(system, partId) { return system?.mechanisms.find(item => item.parts.some(part => part.id === partId)); }

function currentNode(selection = viewerState.selection) {
  if (!selection.systemId) return { system: null, mechanism: null, part: null };
  const system = roadster.systems.find(item => item.id === selection.systemId);
  const mechanism = selection.mechanismId ? system?.mechanisms.find(item => item.id === selection.mechanismId) : findMechanismForPart(system, selection.partId);
  const part = selection.partId ? mechanism?.parts.find(item => item.id === selection.partId) : null;
  return { system, mechanism, part };
}

function renderTree(query = '') {
  const term = query.trim().toLowerCase();
  const tree = document.querySelector('#component-tree');
  tree.innerHTML = roadster.systems.map(system => {
    const matches = !term || [system.name, system.purpose, ...system.mechanisms.flatMap(m => [m.name, ...m.parts.map(p => p.name)])].join(' ').toLowerCase().includes(term);
    if (!matches) return '';
    const open = expandedSystem === system.id || Boolean(term);
    const selected = viewerState.selection.systemId === system.id;
    return `<div class="tree-group"><button class="tree-row tree-system ${selected && !viewerState.selection.mechanismId && !viewerState.selection.partId ? 'selected' : ''}" data-system-id="${system.id}" style="--system-color:${system.color}"><span class="dot"></span><b>${system.name}</b><small>${open ? '⌄' : '›'}</small></button>${open ? `<div class="tree-children">${system.mechanisms.map(mechanism => { const mechOpen = expandedMechanism === mechanism.id || Boolean(term) || viewerState.selection.mechanismId === mechanism.id; return `<button class="tree-row mechanism ${viewerState.selection.mechanismId === mechanism.id && !viewerState.selection.partId ? 'selected' : ''}" data-mechanism-id="${mechanism.id}" data-system-id="${system.id}"><span class="dot"></span><b>${mechanism.name}</b><small>${mechOpen ? '⌄' : '›'}</small></button>${mechOpen ? `<div class="tree-children">${mechanism.parts.map(part => `<button class="tree-row part ${viewerState.selection.partId === part.id ? 'selected' : ''}" data-part-id="${part.id}" data-mechanism-id="${mechanism.id}" data-system-id="${system.id}"><span class="dot"></span><b>${part.name}</b><small></small></button>`).join('')}</div>` : ''}`; }).join('')}</div>` : ''}</div>`;
  }).join('');
  if (!tree.innerHTML.trim()) tree.innerHTML = '<div class="tree-tip">没有找到匹配结构</div>';
}

function updateInsight() {
  const { system, mechanism, part } = currentNode();
  const name = part?.name || mechanism?.name || system?.name || roadster.name;
  const purpose = part?.purpose || mechanism?.purpose || system?.purpose || '选择左侧层级或点击3D零件，了解它在整车中的位置与作用。';
  const level = part ? '零件层' : mechanism ? '机构层' : system ? '系统层' : '产品层';
  document.querySelector('#insight-level').textContent = level;
  document.querySelector('#insight-name').textContent = name;
  document.querySelector('#insight-purpose').textContent = purpose;
  document.querySelector('#prop-location').textContent = [system?.name, mechanism?.name].filter(Boolean).join(' / ') || '完整车辆';
  document.querySelector('#prop-material').textContent = part?.material || (system ? '多种工程材料' : '多种教学材质');
  document.querySelector('#prop-movement').textContent = part?.movement || (mechanism ? '机构协同运动' : system ? '系统级运动' : '多个系统协同');
  document.querySelector('#part-preview small').textContent = `${level.replace('层', '').toUpperCase()} / ${part ? '04' : mechanism ? '03' : system ? '02' : '01'}`;
  document.querySelector('#part-preview b').textContent = name;
  const path = ['产品', 'Roadster', system?.name, mechanism?.name, part?.name].filter(Boolean);
  document.querySelector('#level-path').innerHTML = path.map((item, index) => `${index ? '<i>›</i>' : ''}<${index === path.length - 1 ? 'b' : 'span'}>${item}</${index === path.length - 1 ? 'b' : 'span'}>`).join('');
  document.querySelector('#viewer-status').textContent = part ? `已聚焦零件 · ${part.name}` : system ? `当前系统 · ${system.name}` : '完整车辆 · 拖动旋转 · 滚轮缩放';
  document.querySelector('#open-2d').classList.toggle('hidden', mechanism?.id !== 'rack-pinion');
  document.querySelector('[data-select-product]').classList.toggle('selected', !system);
  renderTree(document.querySelector('#component-search').value);
}

function ensureScene() {
  if (roadsterScene) return;
  roadsterScene = new RoadsterScene(document.querySelector('#three-stage'), document.querySelector('#three-labels'), selection => {
    const system = roadster.systems.find(item => item.id === selection.systemId);
    const mechanism = findMechanismForPart(system, selection.partId);
    applySelection({ systemId: system.id, mechanismId: mechanism?.id, partId: selection.partId }, true);
  });
}

function applySelection(selection, updateHash = false, focus = false) {
  viewerState = selectNode(viewerState, selection);
  expandedSystem = selection.systemId || null;
  expandedMechanism = selection.mechanismId || currentNode(viewerState.selection).mechanism?.id || null;
  roadsterScene?.select(viewerState.selection);
  updateInsight();
  if (focus) roadsterScene?.focus(selection.partId, selection.systemId);
  if (updateHash && selection.systemId) history.replaceState(null, '', routeForNode(selection.systemId, expandedMechanism, selection.partId));
}

function showPage(page) {
  Object.entries(pages).forEach(([id, element]) => element.classList.toggle('active', id === page));
  document.querySelectorAll('[data-nav]').forEach(item => item.classList.toggle('active', item.dataset.nav === (page === 'mechanism' ? 'atlas' : page)));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function handleRoute() {
  const route = parseRoute(location.hash);
  showPage(route.page);
  if (route.page === 'atlas' && location.hash.startsWith('#mechanism/') && !route.valid) toast('该机构目前提供二维预览，完整交互将在后续版本加入。');
  if (route.page === 'mechanism') mountRackView();
  if (route.page === 'product') {
    ensureScene();
    if (!route.valid) warn('没有找到该结构，已返回完整 Roadster。');
    applySelection({ systemId: route.systemId, mechanismId: route.mechanismId, partId: route.partId }, false, Boolean(route.partId));
  }
}

function bindUI() {
  document.querySelector('#open-2d').addEventListener('click', event => {
    if(parent!==window){event.preventDefault();parent.postMessage({type:'MOTION_MECHANISM',id:'rack'},location.origin);}
  });
  document.querySelector('#component-tree').addEventListener('click', event => {
    const row = event.target.closest('[data-system-id]'); if (!row) return;
    const selection = { systemId: row.dataset.systemId, mechanismId: row.dataset.mechanismId || null, partId: row.dataset.partId || null };
    if (!row.dataset.mechanismId && !row.dataset.partId) expandedSystem = expandedSystem === selection.systemId ? null : selection.systemId;
    if (row.dataset.mechanismId && !row.dataset.partId) expandedMechanism = expandedMechanism === selection.mechanismId ? null : selection.mechanismId;
    applySelection(selection, true, Boolean(selection.partId));
  });
  document.querySelector('[data-select-product]').addEventListener('click', () => { history.replaceState(null, '', '#product/roadster'); applySelection({}, false); roadsterScene.resetCamera(); });
  document.querySelector('#component-search').addEventListener('input', event => renderTree(event.target.value));
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    viewerState = setMode(viewerState, button.dataset.mode); roadsterScene.setMode(viewerState.mode);
    document.querySelectorAll('[data-mode]').forEach(item => item.classList.toggle('active', item === button));
    document.querySelector('#explode-control').style.visibility = viewerState.mode === 'explode' ? 'visible' : 'hidden';
  }));
  document.querySelector('#explode-range').addEventListener('input', event => roadsterScene.setExplode(+event.target.value / 100));
  document.querySelector('#toggle-labels').addEventListener('click', event => { viewerState.labels = !viewerState.labels; event.currentTarget.classList.toggle('active', viewerState.labels); roadsterScene.toggleLabels(viewerState.labels); });
  document.querySelector('#reset-camera').addEventListener('click', () => roadsterScene.resetCamera());
  document.querySelector('#focus-selection').addEventListener('click', () => roadsterScene.focus(viewerState.selection.partId, viewerState.selection.systemId));
  document.querySelector('#clear-selection').addEventListener('click', () => { location.hash = '#product/roadster'; });
  document.querySelectorAll('.info-tabs button').forEach((button, index) => button.addEventListener('click', () => {
    document.querySelectorAll('.info-tabs button').forEach(item => item.classList.toggle('active', item === button));
    const { system, mechanism, part } = currentNode();
    const text = index === 2 ? `主要材料：${part?.material || '该层级包含多种工程材料。'}` : index === 1 ? (part?.purpose || mechanism?.purpose || system?.purpose || roadster.note) : (part?.purpose || mechanism?.purpose || system?.purpose || '选择结构后查看它在产品中的位置、功能与材料。');
    document.querySelector('#insight-purpose').textContent = text;
  }));
  window.addEventListener('hashchange', handleRoute);
}

function toast(message) { const element = document.querySelector('#toast'); element.textContent = message; element.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => element.classList.remove('show'), 2400); }
function warn(message) { const element = document.querySelector('#route-warning'); element.textContent = message; element.classList.add('show'); setTimeout(() => element.classList.remove('show'), 3200); }

renderAtlas(); renderTree(); bindUI(); handleRoute();

window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#mechanism/rack-pinion'))parent.postMessage({type:'MOTION_MECHANISM',id:'rack'},location.origin)});

if(parent!==window){
 document.body.classList.add('embedded');
 document.querySelector('#open-2d').addEventListener('click',e=>{e.preventDefault();parent.postMessage({type:'MOTION_MECHANISM',id:'rack'},location.origin)});
}
