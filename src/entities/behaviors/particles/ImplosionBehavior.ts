import type Particle from "@/entities/Particle";
import type { IParticleBehavior } from "@/types/particleBehaviors";

/** Hover phase minimal duration time. */
const HOVER_DURATION_MIN = 0.2;
/** Hover phase maximal duration time. */
const HOVER_DURATION_MAX = 0.6;
/** Total duration time. */
const BURST_DURATION = 0.25;
/** Burst friction value used for slowing down the particle burst over time. */
const BURST_DRAG = 3;
/** Threshold value for considering a particle close enough or arrived at the origin point. */
const ARRIVE_RADIUS = 5;
/** Phase 3 acceleration speed multiplier. */
const IMPLODE_ACCEL = 700;

export default class ImplosionBehavior implements IParticleBehavior<"implosion"> {
  readonly type = "implosion";

  private originX!: number;
  private originY!: number;
  private hoverDuration!: number;

  init(originX: number, originY: number) {
    this.originX = originX;
    this.originY = originY;
    this.hoverDuration = HOVER_DURATION_MIN + Math.random() * (HOVER_DURATION_MAX - HOVER_DURATION_MIN);
  }

  update(particle: Particle, deltaTime: number) {
    const age = particle.age;

    if (age < BURST_DURATION) {
      // Phase 1: Burst outward with drag
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.vx *= Math.exp(-BURST_DRAG * deltaTime);
      particle.vy *= Math.exp(-BURST_DRAG * deltaTime);

    } else if (age < BURST_DURATION + this.hoverDuration) {
      // Phase 2: Hover in place for any amount of time
      // Add logic here if we want some movement pattern whenever particle enters this phase
    } else {
      // Phase 3: Accelerates back towards origin point
      const dx = this.originX - particle.x;
      const dy = this.originY - particle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < ARRIVE_RADIUS) {
        particle.active = false;
        return;
      }

      const nx = dx / dist;
      const ny = dy / dist;

      particle.vx += nx * IMPLODE_ACCEL * deltaTime;
      particle.vy += ny * IMPLODE_ACCEL * deltaTime;
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
    }
  }
}
