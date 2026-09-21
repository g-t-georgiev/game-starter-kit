import type { Movable, Transform } from "@/types/properties";
import type { Behavior, SeekBehaviorConfig } from "@/types/enemyBehaviors";

const DEFAULT_OPTIONS: SeekBehaviorConfig = {
  stoppingDistance: 2,
};

export default class SeekBehavior<
  TSource extends Movable = Movable,
  TTarget extends Transform = Transform
> implements Behavior<TSource, [TTarget]> {
  readonly options: SeekBehaviorConfig = {
    ...DEFAULT_OPTIONS,
  };

  constructor(options: Partial<SeekBehaviorConfig> = {}) {
    Object.assign(this.options, options);
  }

  update(source: TSource, deltaTime: number, target: TTarget) {
    // Calculate distance to player
    const dx = target.x + target.width / 2 - (source.x + source.width / 2);
    const dy = target.y + target.height / 2 - (source.y + source.height / 2);
    const dist = Math.sqrt(dx ** 2 + dy ** 2);

    if (dist > this.options.stoppingDistance) {
      const normalizedDx = dx / dist;
      const normalizedDy = dy / dist;

      source.x += normalizedDx * source.speed * deltaTime;
      source.y += normalizedDy * source.speed * deltaTime;
    }
  }
}
