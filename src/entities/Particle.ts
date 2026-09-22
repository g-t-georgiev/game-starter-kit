import type { Position } from "@/types/utils";
import type { ParticleBehavior, ParticleConfig } from "@/types/particleBehaviors";

export default class Particle {
  active: boolean = false;
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  lifetime: number = 1;
  age: number = 0;
  size: number = 4;
  baseSize: number = 4;
  opacity: number = 1;
  baseOpacity: number = 1;
  color: string = "#ffffff";
  gravity: Position = { x: 0, y: 0 };
  fade: boolean = false;
  shrink: boolean = false;
  behavior: ParticleBehavior | null = null;

  constructor(
    config?: Partial<ParticleConfig>,
    behavior?: ParticleBehavior
  ) {

    if (config?.lifetime != null) this.lifetime = config.lifetime;

    if (config?.size != null) {
      this.size = config.size;
      this.baseSize = config.size;
    }

    if (config?.opacity != null) {
      this.opacity = config.opacity;
      this.baseOpacity = config.opacity;
    }

    if (config?.color != null)
      this.color = config.color;

    if (config?.fade != null) this.fade = config.fade;
    if (config?.shrink != null) this.shrink = config.shrink;
    if (config?.gravity != null) this.gravity = { ...config.gravity };

    if (behavior) this.behavior = behavior;
  }

  update(deltaTime: number) {
    if (!this.active) return;

    this.age += deltaTime;
    if (this.age >= this.lifetime) {
      this.active = false;
      return;
    }

    if (this.shrink)
      this.size = this.baseSize * (1 - this.age / this.lifetime);

    if (this.fade)
      this.opacity = this.baseOpacity * (1 - this.age / this.lifetime);

    this.behavior?.update(this, deltaTime);
  }

  reset() {
    this.active = false;
    this.age = 0;
    this.vx = 0;
    this.vy = 0;
    this.size = this.baseSize;
    this.opacity = this.baseOpacity;
  }
}
