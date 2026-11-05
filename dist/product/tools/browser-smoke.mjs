const pages = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const target = pages.find(page => page.url.startsWith('http://127.0.0.1:4173/roadster.html'));
if (!target) throw new Error('Roadster target not found');
const socket = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
socket.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  if (data.id && pending.has(data.id)) { pending.get(data.id)(data); pending.delete(data.id); }
});
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
function send(method, params = {}) { const id = nextId++; socket.send(JSON.stringify({ id, method, params })); return new Promise(resolve => pending.set(id, resolve)); }
await send('Runtime.enable');
const expression = `(async()=>{
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  location.hash='#product/roadster/steering-system/rack-pinion/steering-rack'; await wait(500);
  const deepLink={active:document.querySelector('#page-product').classList.contains('active'),name:document.querySelector('#insight-name').textContent,tree:document.querySelector('.tree-row.part.selected')?.textContent.trim(),canvas:document.querySelectorAll('#three-stage canvas').length};
  document.querySelector('[data-mode="explode"]').click(); await wait(120);
  const explode={active:document.querySelector('[data-mode="explode"]').classList.contains('active'),slider:document.querySelector('#explode-control').style.visibility};
  location.hash='#mechanism/rack-pinion'; await wait(400);
  const rack=document.querySelector('#rack-group'); const progress=document.querySelector('#motion-progress');
  progress.value='20'; progress.dispatchEvent(new Event('input',{bubbles:true})); const before=rack.getAttribute('transform');
  progress.value='75'; progress.dispatchEvent(new Event('input',{bubbles:true}));
  const mechanism={active:document.querySelector('#page-mechanism').classList.contains('active'),svg:document.querySelectorAll('#rack-pinion-stage svg').length,before,after:rack.getAttribute('transform')};
  return {deepLink,explode,mechanism};
})()`;
const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
console.log(JSON.stringify(response.result?.result?.value, null, 2));
socket.close();
