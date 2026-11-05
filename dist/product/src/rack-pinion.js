export class RackPinionModel {
  constructor({ pitchRadius = 48, minX = -160, maxX = 160 } = {}) {
    this.pitchRadius = pitchRadius;
    this.minX = minX;
    this.maxX = maxX;
    this.angle = 0;
    this.rackX = 0;
  }

  setAngle(angle) {
    const desiredX = -angle * this.pitchRadius;
    this.rackX = Math.max(this.minX, Math.min(this.maxX, desiredX));
    this.angle = -this.rackX / this.pitchRadius;
    return this.snapshot();
  }

  setRackX(x) {
    this.rackX = Math.max(this.minX, Math.min(this.maxX, x));
    this.angle = -this.rackX / this.pitchRadius;
    return this.snapshot();
  }

  snapshot() {
    return { angle: this.angle, rackX: this.rackX };
  }
}

export function rackDragTarget(pointerX, startPointerX, startRackX) {
  return startRackX + pointerX - startPointerX;
}

export function unwrapAngleDelta(current, previous) {
  let delta = current - previous;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}
