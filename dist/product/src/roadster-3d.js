import * as THREE from '../vendor/three.module.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { roadster } from './data.js';
import { isVisibleInHierarchy } from './viewer-state.js';

const SYSTEM_OFFSETS = {
  'body-system': new THREE.Vector3(0, 2.2, 0),
  'battery-system': new THREE.Vector3(0, -1.5, 0),
  'drive-system': new THREE.Vector3(-3.2, .4, 0),
  'steering-system': new THREE.Vector3(3.2, .8, 0),
  'suspension-system': new THREE.Vector3(0, .3, 2.6),
  'brake-system': new THREE.Vector3(0, .2, -3),
  'thermal-system': new THREE.Vector3(3.4, 1.7, 0)
};

export class RoadsterScene {
  constructor(container, labelLayer, onSelect) {
    this.container = container;
    this.labelLayer = labelLayer;
    this.onSelect = onSelect;
    this.systemGroups = new Map();
    this.partGroups = new Map();
    this.labels = new Map();
    this.selection = {};
    this.mode = 'normal';
    this.explode = .45;
    this.labelsVisible = true;
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x080d0f, .035);
    this.camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
    this.camera.position.set(12, 8, 15);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.prepend(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = .07;
    this.controls.target.set(0, .2, 0);
    this.controls.minDistance = 7;
    this.controls.maxDistance = 32;
    this.controls.maxPolarAngle = Math.PI * .83;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.buildLights();
    this.buildGround();
    this.buildRoadster();
    this.createLabels();
    this.renderer.domElement.addEventListener('pointerup', event => this.pick(event));
    this.renderer.domElement.addEventListener('pointerdown', event => { this.pointerDown = { x: event.clientX, y: event.clientY }; });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
    this.animate();
  }

  buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xd9fff2, 0x16201e, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 4); key.position.set(7, 12, 9); key.castShadow = true; this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x78e6d1, 2.5); rim.position.set(-8, 5, -7); this.scene.add(rim);
    const warm = new THREE.PointLight(0xffb65c, 15, 25); warm.position.set(-5, 3, 4); this.scene.add(warm);
  }

  buildGround() {
    const grid = new THREE.GridHelper(34, 34, 0x34443e, 0x17201d); grid.position.y = -2.15; this.scene.add(grid);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(16, 64), new THREE.MeshStandardMaterial({ color: 0x0a0f10, roughness: .94, transparent: true, opacity: .88 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.18; floor.receiveShadow = true; this.scene.add(floor);
  }

  material(color, options = {}) {
    return new THREE.MeshStandardMaterial({ color, metalness: options.metalness ?? .5, roughness: options.roughness ?? .42, transparent: true, opacity: options.opacity ?? 1, side: THREE.DoubleSide });
  }

  mesh(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
    const result = new THREE.Mesh(geometry, material); result.position.set(...position); result.rotation.set(...rotation); result.castShadow = true; result.receiveShadow = true; return result;
  }

  box(size, color, position, rotation, options) { return this.mesh(new THREE.BoxGeometry(...size), this.material(color, options), position, rotation); }
  cylinder(radius, length, color, position, rotation = [0, 0, Math.PI / 2], options) { return this.mesh(new THREE.CylinderGeometry(radius, radius, length, 18), this.material(color, options), position, rotation); }

  addSystem(id) {
    const group = new THREE.Group(); group.userData = { systemId: id, basePosition: new THREE.Vector3() }; this.scene.add(group); this.systemGroups.set(id, group); return group;
  }

  addPart(systemGroup, id, objects) {
    const group = new THREE.Group(); group.name = id; group.userData = { systemId: systemGroup.userData.systemId, partId: id, basePosition: new THREE.Vector3() };
    for (const object of Array.isArray(objects) ? objects : [objects]) { object.userData.partId = id; object.userData.systemId = systemGroup.userData.systemId; group.add(object); }
    systemGroup.add(group); this.partGroups.set(id, group); return group;
  }

  buildRoadster() {
    this.buildBody(); this.buildBattery(); this.buildDrive(); this.buildSteering(); this.buildSuspension(); this.buildBrakes(); this.buildThermal();
  }

  buildBody() {
    const sys = this.addSystem('body-system');
    const shellMat = this.material(0x89958f, { metalness: .72, roughness: .27, opacity: .52 });
    shellMat.depthWrite = false;
    const lower = this.mesh(new THREE.CapsuleGeometry(2.25, 6.8, 5, 14), shellMat, [0, -.25, 0], [0, 0, Math.PI / 2]); lower.scale.set(.34, .72, .75);
    const nose = this.mesh(new THREE.CapsuleGeometry(1.55, 2.4, 4, 12), shellMat, [3.55, -.08, 0], [0, 0, Math.PI / 2]); nose.scale.set(.32, .58, .92);
    const canopy = this.mesh(new THREE.SphereGeometry(2.45, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), this.material(0x78e6d1, { metalness: .25, roughness: .18, opacity: .25 }), [.15, 1.15, 0]); canopy.scale.set(1.25, .68, .8);
    const cabinBar = this.box([3.7, .13, 3.15], 0x6c7873, [.1, .9, 0], [0, 0, 0], { opacity: .42 });
    this.addPart(sys, 'body-shell', [lower, nose, canopy, cabinBar]);
    this.addPart(sys, 'front-subframe', [this.box([2.5, .22, 3.2], 0x69736f, [3.25, -1.12, 0]), this.box([.22, .5, 3.35], 0x69736f, [2.35, -.95, 0])]);
    this.addPart(sys, 'rear-subframe', [this.box([2.8, .24, 3.3], 0x69736f, [-3.05, -1.1, 0]), this.box([.22, .55, 3.4], 0x69736f, [-2.15, -.9, 0])]);
    const wheelMat = this.material(0x151a1b, { metalness: .1, roughness: .75 });
    for (const x of [-3.05, 3.05]) for (const z of [-1.78, 1.78]) {
      const tire = this.mesh(new THREE.TorusGeometry(.72, .22, 12, 28), wheelMat, [x, -1.15, z]);
      const rim = this.cylinder(.46, .16, 0xaab4b0, [x, -1.15, z], [Math.PI / 2, 0, 0], { metalness: .82 }); sys.add(tire, rim);
    }
  }

  buildBattery() {
    const sys = this.addSystem('battery-system');
    this.addPart(sys, 'battery-case', this.box([5.5, .42, 2.65], 0xc8f75f, [-.15, -1.38, 0], [0, 0, 0], { opacity: .42 }));
    const modules = []; for (let x = -2.15; x <= 2.15; x += .72) for (const z of [-.82, 0, .82]) modules.push(this.box([.56, .3, .58], 0xa9d84f, [x, -1.37, z], [0, 0, 0], { roughness: .6 }));
    this.addPart(sys, 'battery-modules', modules);
    this.addPart(sys, 'hv-bus', [this.box([4.7, .08, .12], 0xffb65c, [-.05, -1.12, -.62]), this.box([4.7, .08, .12], 0xffb65c, [-.05, -1.12, .62])]);
  }

  buildDrive() {
    const sys = this.addSystem('drive-system');
    this.addPart(sys, 'motor-rotor', [this.cylinder(.58, 1.8, 0xffb65c, [-2.45, -.55, 0], [Math.PI / 2, 0, 0]), this.cylinder(.22, 2.4, 0xffd497, [-2.45, -.55, 0], [Math.PI / 2, 0, 0])]);
    const gear1 = this.cylinder(.56, .22, 0xf7c56d, [-1.55, -.55, 0], [Math.PI / 2, 0, 0]);
    const gear2 = this.cylinder(.88, .26, 0xf7c56d, [-.78, -.55, 0], [Math.PI / 2, 0, 0]); this.addPart(sys, 'reduction-gear', [gear1, gear2]);
    this.addPart(sys, 'differential', [this.mesh(new THREE.SphereGeometry(.62, 16, 10), this.material(0xe79b3f), [-.05, -.55, 0]), this.cylinder(.15, 1.7, 0xd9a65e, [-.05, -.55, 0], [Math.PI / 2, 0, 0])]);
    this.addPart(sys, 'drive-shafts', [this.cylinder(.1, 2.75, 0xd4ac76, [-.05, -.55, -1.36], [Math.PI / 2, 0, 0]), this.cylinder(.1, 2.75, 0xd4ac76, [-.05, -.55, 1.36], [Math.PI / 2, 0, 0])]);
  }

  buildSteering() {
    const sys = this.addSystem('steering-system');
    this.addPart(sys, 'steering-column', [this.rodBetween(new THREE.Vector3(1.2, 1.1, 0), new THREE.Vector3(2.72, -.55, 0), .11, 0x78e6d1), this.mesh(new THREE.TorusGeometry(.46, .08, 10, 24), this.material(0x78e6d1), [1.05, 1.12, 0], [0, Math.PI / 2, 0])]);
    this.addPart(sys, 'steering-pinion', this.cylinder(.35, .34, 0xffb65c, [2.75, -.68, 0], [0, 0, 0]));
    const teeth = []; for (let z = -1.22; z <= 1.22; z += .18) teeth.push(this.box([.34, .16, .1], 0x78e6d1, [3.05, -.66, z]));
    this.addPart(sys, 'steering-rack', [this.box([.25, .17, 2.85], 0x78e6d1, [3.05, -.82, 0]), ...teeth]);
    this.addPart(sys, 'tie-rods', [this.rodBetween(new THREE.Vector3(3.05, -.82, -1.4), new THREE.Vector3(3.05, -1.08, -1.7), .07, 0x78e6d1), this.rodBetween(new THREE.Vector3(3.05, -.82, 1.4), new THREE.Vector3(3.05, -1.08, 1.7), .07, 0x78e6d1)]);
  }

  rodBetween(start, end, radius, color) {
    const midpoint = start.clone().add(end).multiplyScalar(.5); const direction = end.clone().sub(start); const mesh = this.cylinder(radius, direction.length(), color, [midpoint.x, midpoint.y, midpoint.z], [0, 0, 0]);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()); return mesh;
  }

  buildSuspension() {
    const sys = this.addSystem('suspension-system');
    const upper = [], lower = [], dampers = [], uprights = [];
    for (const x of [-3.05, 3.05]) for (const z of [-1.55, 1.55]) {
      upper.push(this.box([1.15, .09, .12], 0xa98df5, [x, -.72, z], [0, z > 0 ? .42 : -.42, 0]));
      lower.push(this.box([1.28, .12, .14], 0x9274df, [x, -1.45, z], [0, z > 0 ? -.35 : .35, 0]));
      dampers.push(this.cylinder(.1, 1.1, 0xc8f75f, [x, -.82, z], [0, 0, .18]));
      uprights.push(this.box([.18, 1.1, .22], 0xb9a9ed, [x, -1.08, z]));
    }
    this.addPart(sys, 'upper-arm', upper); this.addPart(sys, 'lower-arm', lower); this.addPart(sys, 'damper-spring', dampers); this.addPart(sys, 'upright', uprights);
  }

  buildBrakes() {
    const sys = this.addSystem('brake-system'); const discs = [], calipers = [], pads = [];
    for (const x of [-3.05, 3.05]) for (const z of [-1.67, 1.67]) {
      discs.push(this.cylinder(.5, .08, 0xff6f69, [x, -1.15, z], [Math.PI / 2, 0, 0], { metalness: .8 }));
      calipers.push(this.box([.24, .48, .18], 0xe44f50, [x + .35, -1.15, z]));
      pads.push(this.box([.14, .31, .08], 0x6e3031, [x + .25, -1.15, z + (z > 0 ? -.08 : .08)]));
    }
    this.addPart(sys, 'brake-disc', discs); this.addPart(sys, 'brake-caliper', calipers); this.addPart(sys, 'brake-pads', pads);
  }

  buildThermal() {
    const sys = this.addSystem('thermal-system');
    this.addPart(sys, 'coolant-pump', [this.cylinder(.42, .45, 0x58b7ff, [2.85, -.2, -.82], [Math.PI / 2, 0, 0]), this.cylinder(.15, .65, 0xa8d9ff, [2.85, -.2, -.82], [Math.PI / 2, 0, 0])]);
    this.addPart(sys, 'front-radiator', this.box([.28, 1.35, 2.4], 0x58b7ff, [4.25, -.35, 0], [0, 0, -.1], { opacity: .65 }));
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(3.8,-.2,-.8),new THREE.Vector3(1.4,-1.05,-1.1),new THREE.Vector3(-1.7,-1.0,-1.1),new THREE.Vector3(-2.5,-.5,-.4)]);
    const curve2 = new THREE.CatmullRomCurve3([new THREE.Vector3(3.8,-.05,.8),new THREE.Vector3(1.2,-.9,1.1),new THREE.Vector3(-1.8,-.9,1.1),new THREE.Vector3(-2.5,-.4,.4)]);
    this.addPart(sys, 'coolant-lines', [this.mesh(new THREE.TubeGeometry(curve, 34, .055, 8), this.material(0x58b7ff)), this.mesh(new THREE.TubeGeometry(curve2, 34, .055, 8), this.material(0x58b7ff))]);
  }

  createLabels() {
    for (const system of roadster.systems) {
      const label = document.createElement('div'); label.className = 'three-label'; label.textContent = system.name; this.labelLayer.append(label); this.labels.set(system.id, label);
    }
  }

  pick(event) {
    const dragDistance = this.pointerDown ? Math.hypot(event.clientX - this.pointerDown.x, event.clientY - this.pointerDown.y) : 0;
    this.pointerDown = null;
    if (event.button !== 0 || dragDistance > 5) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects([...this.partGroups.values()], true).filter(hit => isVisibleInHierarchy(hit.object) && !(this.mode === 'xray' && hit.object.userData.systemId === 'body-system'));
    if (!hits.length) return;
    let object = hits[0].object; while (object && !object.userData.partId) object = object.parent;
    if (object?.userData.partId) this.onSelect({ systemId: object.userData.systemId, partId: object.userData.partId });
  }

  select(selection = {}) {
    this.selection = selection;
    const selectedIds = this.selectedPartIds();
    for (const [partId, group] of this.partGroups) group.traverse(object => { if (!object.material) return; object.material.emissive?.set(selectedIds.has(partId) ? 0x314517 : 0x000000); object.material.emissiveIntensity = selectedIds.has(partId) ? .65 : 0; });
    this.applyMode();
  }

  selectedPartIds() {
    if (this.selection.partId) return new Set([this.selection.partId]);
    const system = roadster.systems.find(item => item.id === this.selection.systemId);
    if (!system) return new Set();
    const mechanisms = this.selection.mechanismId ? system.mechanisms.filter(item => item.id === this.selection.mechanismId) : system.mechanisms;
    return new Set(mechanisms.flatMap(item => item.parts.map(part => part.id)));
  }

  setMode(mode) { this.mode = mode; this.applyMode(); }
  setExplode(value) { this.explode = value; if (this.mode === 'explode') this.applyMode(); }
  toggleLabels(visible) { this.labelsVisible = visible; this.labelLayer.style.display = visible ? '' : 'none'; }

  applyMode() {
    const selectedIds = this.selectedPartIds();
    for (const [systemId, group] of this.systemGroups) {
      const selectedSystem = this.selection.systemId;
      const isolate = this.mode === 'isolate' && Boolean(selectedSystem);
      group.visible = !isolate || systemId === selectedSystem;
      for (const partGroup of group.children.filter(child => child.userData.partId)) partGroup.visible = !isolate || (!this.selection.partId && !this.selection.mechanismId) || selectedIds.has(partGroup.userData.partId);
      const offset = this.mode === 'explode' ? SYSTEM_OFFSETS[systemId].clone().multiplyScalar(this.explode) : new THREE.Vector3(); group.position.copy(offset);
      group.traverse(object => {
        if (!object.material) return;
        const isBody = systemId === 'body-system';
        const isSelected = object.userData.partId === this.selection.partId;
        object.material.opacity = this.mode === 'xray' ? (isBody ? .1 : isSelected ? 1 : .48) : (isBody ? .5 : 1);
        object.material.transparent = object.material.opacity < 1;
        object.material.depthWrite = object.material.opacity > .3;
      });
    }
  }

  focus(partId, systemId) {
    const targetObject = partId ? this.partGroups.get(partId) : this.systemGroups.get(systemId);
    if (!targetObject) { this.resetCamera(); return; }
    const box = new THREE.Box3().setFromObject(targetObject); const center = box.getCenter(new THREE.Vector3()); const size = Math.max(box.getSize(new THREE.Vector3()).length(), 1.4);
    this.controls.target.copy(center); const direction = new THREE.Vector3(1, .65, 1).normalize(); this.camera.position.copy(center).add(direction.multiplyScalar(Math.min(13, size * 2.4 + 3))); this.controls.update();
  }

  resetCamera() { this.camera.position.set(12, 8, 15); this.controls.target.set(0, .2, 0); this.controls.update(); }
  resize() { const width = this.container.clientWidth, height = this.container.clientHeight; if (!width || !height) return; this.camera.aspect = width / height; this.camera.updateProjectionMatrix(); this.renderer.setSize(width, height, false); }

  updateLabels() {
    for (const [systemId, label] of this.labels) {
      const group = this.systemGroups.get(systemId); if (!group.visible) { label.style.display = 'none'; continue; }
      label.style.display = '';
      const box = new THREE.Box3().setFromObject(group); const position = box.getCenter(new THREE.Vector3()); position.y = box.max.y + .25; position.project(this.camera);
      label.style.left = `${(position.x * .5 + .5) * this.container.clientWidth}px`; label.style.top = `${(-position.y * .5 + .5) * this.container.clientHeight}px`;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.clock.getElapsedTime();
    this.controls.update(); this.updateLabels(); this.renderer.render(this.scene, this.camera);
  }
}
