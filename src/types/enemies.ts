import type { EntityConfig } from "@/types/entity";
import type { EnemyBehaviorArgsMap, EnemyBehaviorType } from "@/types/enemyBehaviors";
import type { ParticleType } from "@/types/particleBehaviors";
import type { UnpackUnions } from "@/types/utils";

/** Enemy behavior map per enemy type. Accepts an array or single enemy behavior type(s). */
type EnemyBehaviorMap = {
  drifter: "drift";
  seeker: "seek";
};

export type EnemyType = keyof EnemyBehaviorMap;

export type EnemyTypes = {
  [K in EnemyType as `${Capitalize<K>}`]: `${K}`;
};

export interface EnemySounds<Type extends EnemyType, Prefix extends "enemy" = "enemy"> {
  hit: `${Prefix}_${Type}_hit`;
  death: `${Prefix}_${Type}_death`;
};

/** Maps a specific EnemyType back to its corresponding EnemyBehaviorType */
export type GetBehaviorFromEnemy<T extends EnemyType> = T extends EnemyType ? EnemyBehaviorMap[T] : never;

/** Safely maps complex behavior tuples into a union of their respective argument arrays */
export type ResolvedEnemyBehaviorArgs<TEnemy extends EnemyType> =
  EnemyBehaviorArgsMap[UnpackUnions<GetBehaviorFromEnemy<TEnemy>>];

export interface EnemyConfig<
  Type extends EnemyType = EnemyType,
  BehaviorType extends EnemyBehaviorType | readonly EnemyBehaviorType[] = EnemyBehaviorType | readonly EnemyBehaviorType[]
> extends EntityConfig {
  damage: number;
  pushbackImmune: boolean;
  behaviorType: BehaviorType;
  imageName: `enemy_${Type}`;
  soundEffects?: EnemySounds<Type>;
  particleEffects?: Record<string, ParticleType>;
};

/** Mapped configuration type of EnemyType and corresponding EnemyData pairs */
export type EnemiesConfig = {
  [Type in EnemyType]: EnemyConfig<Type, GetBehaviorFromEnemy<Type>>;
};
