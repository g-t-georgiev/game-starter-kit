import type EventEmitter from "@/core/EventEmitter";
import type { ParticlePools, ParticleConfig, ParticlesConfig, ParticleType } from "@/types/particleBehaviors";
import { EVENTS, PARTICLE_SPAWN_COUNT, PARTICLE_SPEED_SCALE } from "@/core/constants";
import ObjectPooler from "@/utils/ObjectPooler";
import Particle from "@/entities/Particle";
import particleData from "@/data/particleData";
import ParticleBehaviorFactory from "@/entities/behaviors/particles/ParticleBehaviorFactory";

export default class ParticleManager {
  private pools: ParticlePools;
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    const particleDataKeys = Object.keys(particleData) as ParticleType[];

    this.pools = particleDataKeys.reduce<ParticlePools>((pool, type) => {
      pool[type] = new ObjectPooler(() => {
        const data: ParticlesConfig[typeof type] = particleData[type];
        const behavior = ParticleBehaviorFactory.create(data.behaviorType);
        return new Particle(data, behavior);
      }, PARTICLE_SPAWN_COUNT);

      return pool;
    }, {} as ParticlePools);

    this.eventEmitter = eventEmitter;
    this._attachEventListeners(this.eventEmitter);
  }

  private _attachEventListeners(eventEmitter: EventEmitter) {
    if (!eventEmitter) return;

    eventEmitter.on(EVENTS.ENEMY_DAMAGED, (enemy) => {
      const { particleEffects } = enemy.data;
      const particleEffectType = particleEffects?.hit;

      if (!particleEffectType) return;

      this.spawnParticleEffect(
        particleEffectType,
        enemy.centerX,
        enemy.centerY,
        { count: 5, color: enemy.data.color }
      );
    });
    eventEmitter.on(EVENTS.ENEMY_DIED, (enemy) => {
      const { particleEffects } = enemy.data;
      const particleEffectType = particleEffects?.death;

      if (!particleEffectType) return;

      this.spawnParticleEffect(
        particleEffectType,
        enemy.centerX,
        enemy.centerY,
        { count: 15, color: enemy.data.color }
      );
    });
  }

  spawnParticleEffect(type: ParticleType, x: number, y: number, configOverrides?: Partial<ParticleConfig>) {
    const data = particleData[type];

    if (!data) {
      console.warn(`Unknown particle type: ${type}`);
      return;
    }

    const pool = this.pools[type];

    const count = configOverrides?.count ?? data.count;
    const color = configOverrides?.color ?? data.color;

    for (let i = 0; i < count; i++) {
      const particle = pool.get();

      if (!particle) continue;

      // yield random angle in the range 0-360deg
      const angle = Math.random() * Math.PI * 2;
      // yield random scaled speed value in the range 50%-100% per partivle
      const speed = data.speed * (PARTICLE_SPEED_SCALE + Math.random() * PARTICLE_SPEED_SCALE);

      particle.active = true;
      particle.x = x;
      particle.y = y;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.age = 0;
      particle.color = color;
    }
  }

  update(deltaTime: number): void {
    for (const pool of Object.values(this.pools)) {
      pool.updateAll(deltaTime)
    }
  }

  reset(): void {
    for (const pool of Object.values(this.pools)) {
      pool.releaseAll();
    }
  }

  *getActive() {
    for (const pool of Object.values(this.pools)) {
      yield* pool.getActive();
    }
  }
}
