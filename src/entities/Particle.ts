export default class Particle {
  active = false;
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  lifetime = 1;
  age = 0;
  size = 4;
  baseSize = 4;
  color = "#ffffff";
  gravity = { x: 0, y: 0 };

  constructor() {
    //
  }

  update(deltaTime: number) {
    if (!this.active) return;

    this.age += deltaTime;

    if (this.age >= this.lifetime) {
      this.active = false;
      return;
    }

    // ...
  }

  reset() {
    this.active = false;
    this.age = 0;
    this.vx = 0;
    this.vy = 0;
  }
}
