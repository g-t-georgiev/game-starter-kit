import type { ParticleBehaviorType, ParticleBehaviorRegistry } from "@/types/particleBehaviors";
import RadialBehavior from "./RadialBehavior";

const behaviorRegistry: ParticleBehaviorRegistry = {
  radial: () => new RadialBehavior(),
};

export default class ParticleBehaviorFactory {
  static create<K extends ParticleBehaviorType>(behaviorType: K) {
    return behaviorRegistry[behaviorType]?.();
  }
}
