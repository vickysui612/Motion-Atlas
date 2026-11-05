const pages = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const target = pages.find(page => page.url.startsWith('http://127.0.0.1:4173/roadster.html'));
if (!target) throw new Error('Roadster target not found');
const socket = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
const events = [];
socket.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  if (data.id && pending.has(data.id)) { pending.get(data.id)(data); pending.delete(data.id); }
  if (data.method === 'Runtime.exceptionThrown' || data.method === 'Log.entryAdded') events.push(data.params);
});
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
function send(method, params = {}) { const id = nextId++; socket.send(JSON.stringify({ id, method, params })); return new Promise(resolve => pending.set(id, resolve)); }
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Page.reload', { ignoreCache: true });
await new Promise(resolve => setTimeout(resolve, 2500));
const result = await send('Runtime.evaluate', { expression: `({active:document.querySelectorAll('.page.active').length,body:document.body.innerText.slice(0,400),scripts:[...document.scripts].map(s=>s.src),ready:document.readyState})`, returnByValue: true });
console.log(JSON.stringify({ result: result.result?.result?.value, events }, null, 2));
socket.close();
