import type EventEmitter from "@/core/EventEmitter";
import Particle from "@/entities/Particle";
import ObjectPooler from "@/utils/ObjectPooler";

const PARTICLE_POOL_SIZE = 200;
const particlePooler = new ObjectPooler(() => new Particle(), PARTICLE_POOL_SIZE);

export default class ParticleManager {
  /** @ts-ignore */
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  update(deltaTime: number): void {
    particlePooler.updateAll(deltaTime);
  }

  reset(): void {
    particlePooler.releaseAll();
  }

  *getActive() {
    yield* particlePooler.getActive();
  }
}
