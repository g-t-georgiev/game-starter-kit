import type { Movable, Transform } from "@/types/properties";
import type {
  EnemyBehaviorType,
  EnemyBehaviorRegistry,
  Behavior,
  AnyEnemyBehaviorConfig,
  AnyEnemyBehavior,
} from "@/types/enemyBehaviors";
import SeekBehavior from "./SeekBehavior";
import DriftBehavior from "./DriftBehavior";
import CompositeBehavior from "./CompositeBehavior";

export const behaviorRegistry: EnemyBehaviorRegistry = {
  seek: (options) => new SeekBehavior(options),
  drift: (options) => new DriftBehavior(options),
};

export default class EnemyBehaviorFactory {
  static create<
    TSource extends Movable = Movable,
    TTarget extends Transform = Transform
  >(
    behaviorType: EnemyBehaviorType | readonly EnemyBehaviorType[],
    options?: AnyEnemyBehaviorConfig | AnyEnemyBehaviorConfig[]
  ): Behavior<TSource, any> {
    if (Array.isArray(behaviorType)) {
      return this.createComposite<TSource, TTarget>(
        behaviorType,
        options as AnyEnemyBehaviorConfig[]
      );
    }

    return this.createSingle<TSource, TTarget>(
      behaviorType as EnemyBehaviorType,
      options as AnyEnemyBehaviorConfig
    );
  }

  private static createComposite<
    TSource extends Movable,
    TTarget extends Transform
  >(
    behaviorTypes: EnemyBehaviorType[],
    options?: AnyEnemyBehaviorConfig[]
  ): CompositeBehavior<TSource, EnemyBehaviorType[]> {
    const behaviors = behaviorTypes.map((type, index) => {
      const config = options?.[index];
      return this.createSingle<TSource, TTarget>(type, config);
    });

    return new CompositeBehavior<TSource, EnemyBehaviorType[]>(behaviors);
  }

  private static createSingle<
    TSource extends Movable,
    TTarget extends Transform
  >(
    type: EnemyBehaviorType,
    options?: AnyEnemyBehaviorConfig
  ): AnyEnemyBehavior<TSource, TTarget> {
    const createBehavior = behaviorRegistry[type];

    if (!createBehavior) {
      throw new Error(`Behavior type "${type}" is not registered.`);
    }

    return createBehavior<TSource, TTarget>(options as any);
  }
}
