import type { AnimationsData, EntityConfig, EntityParticles, EntityState } from "@/types/entity";
import type { EnemyBehaviorArgsMap, EnemyBehaviorType } from "@/types/enemyBehaviors";
import type { UnpackUnions } from "@/types/utils";

/**
 * Enemy behavior map per enemy type.
 *
 * Accepts a single enemy value, union or array of values.
 */
type EnemyBehaviorMap = {
  drifter: "drift" | "randomDrift";
  seeker: "seek";
};

export type EnemyState = "move" | Extract<EntityState, "idle" | "hit" | "death">;

export type EnemyType = keyof EnemyBehaviorMap;

export type EnemyTypes = {
  [K in EnemyType as `${Capitalize<K>}`]: `${K}`;
}

export type EnemySounds<
  Type extends EnemyType,
  States extends EnemyState = EnemyState,
  Prefix extends "enemy" = "enemy"
> = { [K in States]?: `${Prefix}_${Type}_${K}`; }

/** Maps a specific EnemyType back to its corresponding EnemyBehaviorType */
export type GetBehaviorFromEnemy<T extends EnemyType> = T extends EnemyType ? EnemyBehaviorMap[T] : never;

/** Safely maps complex behavior tuples into a union of their respective argument arrays */
export type ResolvedEnemyBehaviorArgs<TEnemy extends EnemyType> =
  EnemyBehaviorArgsMap[UnpackUnions<GetBehaviorFromEnemy<TEnemy>>];

export interface EnemyConfig<
  Type extends EnemyType = EnemyType,
  BehaviorType extends EnemyBehaviorType | readonly EnemyBehaviorType[] = EnemyBehaviorType | readonly EnemyBehaviorType[]
> extends EntityConfig<EnemyState> {
  damage: number;
  /** Takes values between 0.0 and 1.0 */
  knockbackResistance: number;
  behaviorType: BehaviorType;
  soundEffects?: EnemySounds<Type>;
  particleEffects?: EntityParticles<EnemyState>;
  animations?: AnimationsData<EnemyState>;
}

/** Mapped configuration type of EnemyType and corresponding EnemyData pairs */
export type EnemiesConfig = {
  [Type in EnemyType]: EnemyConfig<Type, GetBehaviorFromEnemy<Type>>;
}
