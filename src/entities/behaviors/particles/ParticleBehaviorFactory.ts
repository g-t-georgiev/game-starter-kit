import type { ParticleBehaviorType, ParticleBehaviorRegistry, IParticleBehavior, ParticleBehaviorInitMap } from "@/types/particleBehaviors";
import RadialBehavior from "@/entities/behaviors/particles/RadialBehavior";
import ImplosionBehavior from "@/entities/behaviors/particles/ImplosionBehavior";

const behaviorRegistry: ParticleBehaviorRegistry = {
  radial: () => new RadialBehavior(),
  implosion: () => new ImplosionBehavior(),
};

export default class ParticleBehaviorFactory {
  static init<T extends ParticleBehaviorType>(
    behavior: IParticleBehavior<T> | null,
    ...args: ParticleBehaviorInitMap[T]
  ) {
    if (!behavior || !behavior.init) return;

    behavior.init(...args);
  }

  static create<T extends ParticleBehaviorType>(type: T) {
    return behaviorRegistry[type]?.();
  }
}
