import type { Movable, Transform } from "./properties";

export type EnemyBehaviorType =
  | "seek"
  | "drift";

export type EnemyBehaviorTypes = {
  [K in EnemyBehaviorType as `${Capitalize<K>}`]: K;
};

export interface Behavior<TSource extends Movable, TArgs extends unknown[]> {
  update(source: TSource, deltaTime: number, ...args: TArgs): void;
  reset?(): void;
}

export interface SeekBehaviorConfig {
  /** Stopping distance from target origin point. */
  stoppingDistance: number;
};

export interface DriftBehaviorConfig {
  /** Elapsed time in seconds used to signal a change direction */
  changeInterval: number;
};

export type BehaviorArgsMap = {
  seek: [target: Transform];
  drift: [];
};
