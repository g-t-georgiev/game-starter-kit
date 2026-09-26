import type { Movable, Transform } from "@/types/utils";
import type {
  EnemyBehaviorType,
  EnemyBehaviorRegistry,
  Behavior,
  AnyEnemyBehaviorConfig,
  AnyEnemyBehavior,
} from "@/types/enemyBehaviors";
import SeekBehavior from "@/entities/behaviors/enemies/SeekBehavior";
import DriftBehavior from "@/entities/behaviors/enemies/DriftBehavior";
import CompositeBehavior from "@/entities/behaviors/enemies/CompositeBehavior";
import RandomDriftBehavior from "@/entities/behaviors/enemies/RandomDriftBehavior";

export const behaviorRegistry: EnemyBehaviorRegistry = {
  seek: (options) => new SeekBehavior(options),
  drift: (options) => new DriftBehavior(options),
  randomDrift: (options) => new RandomDriftBehavior(options),
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
