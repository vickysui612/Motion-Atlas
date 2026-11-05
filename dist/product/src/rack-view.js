import { RackPinionModel, rackDragTarget, unwrapAngleDelta } from './rack-pinion.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function gearPath(cx, cy, teeth = 18, outer = 72, inner = 61) {
  const points = [];
  for (let i = 0; i < teeth * 4; i += 1) {
    const angle = (i / (teeth * 4)) * Math.PI * 2;
    const radius = i % 4 === 1 || i % 4 === 2 ? outer : inner;
    points.push(`${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`);
  }
  return points.join(' ');
}

export function createRackPinionView(container, controls) {
  const model = new RackPinionModel({ pitchRadius: 62, minX: -120, maxX: 70 });
  container.innerHTML = `<svg viewBox="0 0 760 470" role="img" aria-labelledby="diagram-title">
    <title id="diagram-title">齿轮旋转带动齿条水平移动的二维机构简图</title>
    <defs><pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="#66736f" stroke-width="2"/></pattern></defs>
    <g class="ground"><path d="M95 388H665" stroke="#66736f" stroke-width="4"/><rect x="105" y="389" width="550" height="20" fill="url(#hatch)"/><path d="M140 350V388M620 350V388" stroke="#66736f" stroke-width="7"/></g>
    <g class="guide"><rect x="128" y="261" width="504" height="94" rx="16" fill="none" stroke="#697672" stroke-width="4"/><path d="M145 278H615M145 338H615" stroke="#394441" stroke-width="2" stroke-dasharray="8 9"/></g>
    <g id="rack-group" class="drag-rack" style="cursor:ew-resize"><rect x="205" y="285" width="350" height="48" rx="6" fill="#a98df5" fill-opacity=".22" stroke="#a98df5" stroke-width="6"/><g id="rack-teeth"></g><circle cx="545" cy="309" r="16" fill="#a98df5"/><path d="M545 291v36M527 309h36" stroke="#101619" stroke-width="4"/><text x="372" y="324" text-anchor="middle" fill="#dcd6f9" font-size="15">输出构件 · 拖动齿条</text></g>
    <g id="gear-group" class="drag-gear" style="cursor:grab"><polygon id="gear-shape" points="${gearPath(286, 213)}" fill="#ffb65c" fill-opacity=".24" stroke="#ffb65c" stroke-width="5"/><circle cx="286" cy="213" r="34" fill="#0b1113" stroke="#ffb65c" stroke-width="5"/><path d="M286 179v68M252 213h68" stroke="#ffb65c" stroke-width="5"/><circle cx="286" cy="213" r="11" fill="#ffb65c" stroke="#0b1113" stroke-width="4"/></g>
    <g class="fixed-joint"><path d="M286 224V388" stroke="#66736f" stroke-width="5" stroke-dasharray="9 9"/><path d="M258 388h56l-10-18h-36z" fill="#66736f"/><circle cx="286" cy="213" r="9" fill="#0b1113" stroke="#78e6d1" stroke-width="4"/></g>
    <g class="labels"><path d="M286 118v28" stroke="#ffb65c" stroke-width="2"/><text x="286" y="100" text-anchor="middle" fill="#ffcf8b" font-size="16">输入：拖动小齿轮旋转</text><path d="M595 238v25" stroke="#a98df5" stroke-width="2"/><text x="595" y="220" text-anchor="middle" fill="#d6c8ff" font-size="16">输出：左右直线移动</text><text x="91" y="438" fill="#82908b" font-size="13">固定机架</text><text x="600" y="438" fill="#82908b" font-size="13">固定机架</text></g>
    <path id="rotation-arrow" d="M235 180a65 65 0 0 1 99 8" fill="none" stroke="#c8f75f" stroke-width="4" stroke-linecap="round"/><path d="M333 174l5 18-18-3" fill="none" stroke="#c8f75f" stroke-width="4"/>
  </svg>`;
  const svg = container.querySelector('svg');
  const gear = svg.querySelector('#gear-group');
  const rack = svg.querySelector('#rack-group');
  const teeth = svg.querySelector('#rack-teeth');
  teeth.innerHTML = Array.from({ length: 25 }, (_, i) => `<path d="M${215 + i * 13} 285l6-14h8l6 14" fill="none" stroke="#a98df5" stroke-width="4"/>`).join('');
  let dragging = null;
  let dragStart = null;
  let playing = false;
  let speed = 1;
  let direction = 1;
  let lastTime = performance.now();

  function svgPoint(event) {
    const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }
  function draw() {
    const degrees = model.angle * 180 / Math.PI;
    gear.setAttribute('transform', `rotate(${degrees} 286 213)`);
    rack.setAttribute('transform', `translate(${model.rackX} 0)`);
    controls.progress.value = String(((model.rackX - model.minX) / (model.maxX - model.minX)) * 100);
  }
  function begin(kind, event) {
    const point = svgPoint(event); dragging = kind; playing = false; controls.play.textContent = '▶';
    dragStart = kind === 'rack' ? { pointerX: point.x, rackX: model.rackX } : { pointerAngle: Math.atan2(point.y - 213, point.x - 286), modelAngle: model.angle };
    event.currentTarget.setPointerCapture?.(event.pointerId); event.preventDefault();
  }
  gear.addEventListener('pointerdown', event => begin('gear', event));
  rack.addEventListener('pointerdown', event => begin('rack', event));
  svg.addEventListener('pointermove', event => {
    if (!dragging) return;
    const point = svgPoint(event);
    if (dragging === 'gear') {
      const pointerAngle = Math.atan2(point.y - 213, point.x - 286);
      model.setAngle(dragStart.modelAngle + unwrapAngleDelta(pointerAngle, dragStart.pointerAngle));
    } else model.setRackX(rackDragTarget(point.x, dragStart.pointerX, dragStart.rackX));
    draw();
  });
  const stopDrag = () => { dragging = null; dragStart = null; };
  svg.addEventListener('pointerup', stopDrag); svg.addEventListener('pointercancel', stopDrag);
  controls.play.addEventListener('click', () => { playing = !playing; controls.play.textContent = playing ? 'Ⅱ' : '▶'; });
  controls.progress.addEventListener('input', event => { playing = false; controls.play.textContent = '▶'; model.setRackX(model.minX + (+event.target.value / 100) * (model.maxX - model.minX)); draw(); });
  controls.reset.addEventListener('click', () => { playing = false; controls.play.textContent = '▶'; model.setRackX(0); draw(); });
  controls.speedButtons.forEach(button => button.addEventListener('click', () => { speed = +button.dataset.speed; controls.speedButtons.forEach(item => item.classList.toggle('active', item === button)); }));
  function animate(now) {
    const delta = Math.min(40, now - lastTime); lastTime = now;
    if (playing) {
      const next = model.rackX + direction * delta * 0.09 * speed;
      if (next >= model.maxX || next <= model.minX) direction *= -1;
      model.setRackX(next); draw();
    }
    requestAnimationFrame(animate);
  }
  draw(); requestAnimationFrame(animate);
  return { model, draw };
}
