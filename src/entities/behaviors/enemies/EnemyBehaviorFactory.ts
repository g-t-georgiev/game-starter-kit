import type { DriftBehaviorConfig, EnemyBehaviorType, SeekBehaviorConfig } from "@/types/enemyBehaviors";
import SeekBehavior from "./SeekBehavior";
import DriftBehavior from "./DriftBehavior";
import type { Movable, Transform } from "@/types/properties";

/** Maps behavior types to their instantiated class types */
export interface BehaviorMap<
  TSource extends Movable = Movable,
  TTarget extends Transform = Transform
> {
  seek: SeekBehavior<TSource, TTarget>;
  drift: DriftBehavior<TSource>;
}

/** Maps behavior types to their respective config options */
export interface BehaviorConfigMap {
  seek: Partial<SeekBehaviorConfig>;
  drift: Partial<DriftBehaviorConfig>;
}

/** Registry mapping behavior keys to creator functions */
type BehaviorRegistry = {
  [K in EnemyBehaviorType]: <
    TSource extends Movable,
    TTarget extends Transform
  >(
    options?: BehaviorConfigMap[K]
  ) => BehaviorMap<TSource, TTarget>[K];
};

export const behaviorRegistry: BehaviorRegistry = {
  seek: (options) => new SeekBehavior(options),
  drift: (options) => new DriftBehavior(options),
};

export default class EnemyBehaviorFactory {
  static create<
    K extends EnemyBehaviorType,
    TSource extends Movable = Movable,
    TTarget extends Transform = Transform
  >(behaviorType: K, options?: BehaviorConfigMap[K]) {
    const createBehavior = behaviorRegistry[behaviorType];
    return createBehavior<TSource, TTarget>(options);
  }
}
