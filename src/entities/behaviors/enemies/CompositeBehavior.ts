import type { Movable } from "@/types/properties";
import type {
  Behavior,
  EnemyBehaviorType,
  AnyEnemyBehavior,
  InferBehaviorArgs,
} from "@/types/enemyBehaviors";

export default class CompositeBehavior<
  TSource extends Movable = Movable,
  TTypes extends readonly EnemyBehaviorType[] = EnemyBehaviorType[]
> implements Behavior<TSource, InferBehaviorArgs<TTypes>> {
  private behaviors: AnyEnemyBehavior<TSource, any>[];

  constructor(behaviors: AnyEnemyBehavior<TSource, any>[]) {
    this.behaviors = behaviors;
  }

  update(
    source: TSource,
    deltaTime: number,
    ...args: InferBehaviorArgs<TTypes>
  ): void {
    for (let i = 0; i < this.behaviors.length; i++) {
      const behavior = this.behaviors[i];
      (behavior.update as (src: TSource, dt: number, ...a: unknown[]) => void)(
        source,
        deltaTime,
        ...args
      );
    }
  }

  reset(): void {
    for (let i = 0; i < this.behaviors.length; i++) {
      const behavior = this.behaviors[i];

      if ("reset" in behavior) behavior.reset();
    }
  }
}
