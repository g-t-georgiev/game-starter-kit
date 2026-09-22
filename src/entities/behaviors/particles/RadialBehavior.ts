import type Particle from "@/entities/Particle";
export default class RadialBehavior {
  update(particle: Particle, deltaTime: number) {
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    particle.vx += particle.gravity.x * deltaTime;
    particle.vy += particle.gravity.y * deltaTime;
  }
}
