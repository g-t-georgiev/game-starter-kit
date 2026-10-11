import type { Position } from "@/types/utils";
import type { ParticleBehavior, ParticleConfig, ParticleRenderLayer, ParticleShapeType } from "@/types/particleBehaviors";

export default class Particle {
  private config: ParticleConfig;

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

  shape: ParticleShapeType = "rectangle";
  cachedAssetKey?: string;

  /** By default set to "foreground". */
  layer: ParticleRenderLayer;

  constructor(
    config: ParticleConfig,
    behavior?: ParticleBehavior,
  ) {
    this.config = config;

    this.lifetime = config.lifetime;
    this.size = config.size;
    this.baseSize = config.size;
    this.opacity = config.opacity;
    this.baseOpacity = config.opacity;
    this.color = config.color;

    this.fade = config.fade;
    this.shrink = config.shrink;
    this.gravity = { ...config.gravity };

    if (behavior) this.behavior = behavior;

    this.layer = config.layer ?? "foreground";

    if (config.shape !== "image") {
      this.shape = config.shape;
    } else if (config.imageName) {
      this.shape = config.shape;
      this.cachedAssetKey = config.imageName;
    } else {
      console.warn("Missing particle asset key for an \"image\" particle type. Falls back to simple rectangle shape.");
    }
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

    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.age = 0;

    this.lifetime = this.config.lifetime;
    this.gravity.x = this.config.gravity.x;
    this.gravity.y = this.config.gravity.y;
    this.color = this.config.color;

    this.size = this.baseSize;
    this.opacity = this.baseOpacity;

    this.layer = this.config.layer ?? "foreground";
  }
}
