import type SeekBehavior from "@/entities/behaviors/enemies/SeekBehavior";
import type { Movable, Transform } from "@/types/properties";
import type DriftBehavior from "@/entities/behaviors/enemies/DriftBehavior";

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

export type EnemyBehaviorArgsMap = {
  seek: [target: Transform];
  drift: [];
};

/** Maps behavior types to their instantiated class types */
export interface EnemyBehaviorMap<
  TSource extends Movable = Movable,
  TTarget extends Transform = Transform
> {
  seek: SeekBehavior<TSource, TTarget>;
  drift: DriftBehavior<TSource>;
}

/** Maps behavior types to their respective config options */
export interface EnemyBehaviorConfigMap {
  seek: Partial<SeekBehaviorConfig>;
  drift: Partial<DriftBehaviorConfig>;
}

/** Registry mapping behavior keys to creator functions */
export type EnemyBehaviorRegistry = {
  [K in EnemyBehaviorType]: <
    TSource extends Movable,
    TTarget extends Transform
  >(
    options?: EnemyBehaviorConfigMap[K]
  ) => EnemyBehaviorMap<TSource, TTarget>[K];
};

/** Single unified union of all concrete behavior instances */
export type AnyEnemyBehavior<
  TSource extends Movable = Movable,
  TTarget extends Transform = Transform
> = EnemyBehaviorMap<TSource, TTarget>[EnemyBehaviorType];

/** Maps behavior types to their respective config options */
export interface EnemyBehaviorConfigMap {
  seek: Partial<SeekBehaviorConfig>;
  drift: Partial<DriftBehaviorConfig>;
}

/** Unified union of all possible behavior configuration options */
export type AnyEnemyBehaviorConfig = EnemyBehaviorConfigMap[EnemyBehaviorType];

/** Deduces required update parameters for a composite collection of behavior types */
export type InferBehaviorArgs<TTypes extends readonly EnemyBehaviorType[]> =
  "seek" extends TTypes[number] ? [target: Transform] : [];
