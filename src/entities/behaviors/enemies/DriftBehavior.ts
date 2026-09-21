import type { Movable } from "@/types/properties";
import type { Behavior, DriftBehaviorConfig } from "@/types/enemyBehaviors";

const DEFAULT_OPTIONS: DriftBehaviorConfig = {
  changeInterval: 2,
};

export default class DriftBehavior<
  TSource extends Movable = Movable
> implements Behavior<TSource, [void]> {
  private angle: number;
  private changeTime: number;

  readonly options: DriftBehaviorConfig = {
    ...DEFAULT_OPTIONS,
  };

  constructor(options: Partial<DriftBehaviorConfig> = {}) {
    Object.assign(this.options, options);

    this.angle = Math.random() * Math.PI * 2;
    this.changeTime = 0;
  }

  update(source: TSource, deltaTime: number): void {
    this.changeTime += deltaTime;

    if (this.changeTime >= this.options.changeInterval) {
      this.angle = Math.random() * Math.PI * 2;
      this.changeTime -= this.options.changeInterval;
    }

    const dx = Math.cos(this.angle);
    const dy = Math.sin(this.angle);

    source.x += dx * source.speed * deltaTime;
    source.y += dy * source.speed * deltaTime;
  }

  reset() {
    this.angle = Math.random() * Math.PI * 2;
    this.changeTime = 0;
  }
}
