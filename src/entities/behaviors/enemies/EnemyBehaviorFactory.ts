import type {
  EnemyBehaviorType,
  EnemyBehaviorRegistry,
  EnemyBehaviorConfigMap,
} from "@/types/enemyBehaviors";
import SeekBehavior from "./SeekBehavior";
import DriftBehavior from "./DriftBehavior";
import type { Movable, Transform } from "@/types/properties";

export const behaviorRegistry: EnemyBehaviorRegistry = {
  seek: (options) => new SeekBehavior(options),
  drift: (options) => new DriftBehavior(options),
};

export default class EnemyBehaviorFactory {
  static create<
    K extends EnemyBehaviorType,
    TSource extends Movable = Movable,
    TTarget extends Transform = Transform
  >(behaviorType: K, options?: EnemyBehaviorConfigMap[K]) {
    const createBehavior = behaviorRegistry[behaviorType];
    return createBehavior<TSource, TTarget>(options);
  }
}
