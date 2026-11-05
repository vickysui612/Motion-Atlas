(() => {
  const app = document.querySelector('.pump-app');
  if (!app) return;
  app.classList.add('resizable');
  for (const [side, panel] of [['left', app.querySelector('.parts')], ['right', app.querySelector('.explain')]]) {
    const grip = document.createElement('div');
    grip.className = 'panel-resizer';
    grip.tabIndex = 0;
    grip.setAttribute('role', 'separator');
    grip.setAttribute('aria-orientation', 'vertical');
    grip.setAttribute('aria-label', side === 'left' ? '调整左栏宽度' : '调整右栏宽度');
    side === 'left' ? panel.after(grip) : panel.before(grip);
    const resize = width => {
      const other = app.querySelector(side === 'left' ? '.explain' : '.parts').getBoundingClientRect().width;
      const value = Math.round(Math.max(170, Math.min(width, app.clientWidth - other - 256, 480)));
      app.style.setProperty(`--${side}-width`, `${value}px`);
      grip.setAttribute('aria-valuenow', value);
      window.dispatchEvent(new Event('resize'));
    };
    grip.onpointerdown = e => {
      const start = e.clientX, width = panel.getBoundingClientRect().width;
      grip.setPointerCapture(e.pointerId);
      grip.onpointermove = ev => resize(width + (ev.clientX - start) * (side === 'left' ? 1 : -1));
      grip.onpointerup = grip.onpointercancel = () => { grip.onpointermove = null; };
      e.preventDefault();
    };
    grip.onkeydown = e => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      resize(panel.getBoundingClientRect().width + (e.key === 'ArrowRight' ? 16 : -16) * (side === 'left' ? 1 : -1));
    };
  }
})();
