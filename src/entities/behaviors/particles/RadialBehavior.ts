import type Particle from "@/entities/Particle";
import type { IParticleBehavior } from "@/types/particleBehaviors";
export default class RadialBehavior implements IParticleBehavior<"radial"> {
  readonly type = "radial";

  update(particle: Particle, deltaTime: number) {
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    particle.vx += particle.gravity.x * deltaTime;
    particle.vy += particle.gravity.y * deltaTime;
  }
}
