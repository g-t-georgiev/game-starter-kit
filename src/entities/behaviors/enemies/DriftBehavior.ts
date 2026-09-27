import type { Movable, Transform } from "@/types/utils";
import type { Behavior, DriftBehaviorConfig } from "@/types/enemyBehaviors";

const DEFAULT_OPTIONS: DriftBehaviorConfig = {
  moveDuration: 8,
  phaseDuration: 2,
  idleDurationMin: 2,
  idleDurationMax: 5,
};

export default class DriftBehavior<
  TSource extends Movable = Movable,
  TTarget extends Transform = Transform,
> implements Behavior<TSource, [target: TTarget]> {
  private angle: number;
  private phaseTimer: number;
  private phaseDuration: number;
  private idling: boolean;
  private firstMove: boolean;

  readonly options: DriftBehaviorConfig = {
    ...DEFAULT_OPTIONS,
  };

  constructor(options: Partial<DriftBehaviorConfig> = {}) {
    Object.assign(this.options, options);

    this.angle = 0;
    this.phaseTimer = 0;
    this.phaseDuration = this.options.phaseDuration;

    this.idling = false;
    this.firstMove = true;
  }

  update(source: TSource, deltaTime: number, target: TTarget): void {
    if (this.firstMove) {
      // Upon initial move select a moving trajectory towards the current position of a target
      this.firstMove = false;
      this.angle = Math.atan2(target.y - source.y, target.x - source.x);
    }

    this.phaseTimer += deltaTime;
    if (this.phaseTimer >= this.phaseDuration) {
      // Signal state change whenever the current phase duration time has passed
      this.phaseTimer = 0;
      if (this.idling) {
        // If current state is "idling", choose random angle for the moving phase
        this.angle = Math.random() * Math.PI * 2;
        this.phaseDuration = this.options.moveDuration;
      } else {
        // If current phase is "moving", only update the idle phase duration
        // Calculate an idle phase duration from [min, max] interval
        const { idleDurationMin, idleDurationMax } = this.options;
        this.phaseDuration = idleDurationMin + Math.random() * (idleDurationMax - idleDurationMin);
      }
      // Switch state (currently there is either idling or not idling, i.e., moving)
      this.idling = !this.idling;
    }

    if (this.idling) return;

    const dx = Math.cos(this.angle);
    const dy = Math.sin(this.angle);

    source.x += dx * source.speed * deltaTime;
    source.y += dy * source.speed * deltaTime;
  }

  reset() {
    this.angle = 0;
    this.idling = false;
    this.phaseTimer = 0;
    this.phaseDuration = this.options.moveDuration;
    this.firstMove = true;
  }
}
