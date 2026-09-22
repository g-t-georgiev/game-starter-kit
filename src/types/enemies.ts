import type { EntityConfig } from "@/types/properties";
import type { EnemyBehaviorArgsMap, EnemyBehaviorType } from "@/types/enemyBehaviors";
import type { ParticleType } from "@/types/particleBehaviors";

/** Explicit mapping registry decoupling enemy types from behavior types */
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
export type GetBehaviorFromEnemy<T extends EnemyType> =
  T extends keyof EnemyBehaviorMap ? EnemyBehaviorMap[T] : EnemyBehaviorType;

/** Unpacks arrays into unions: ["drift", "seek"] becomes "drift" | "seek" */
export type FlattenEnemyBehaviors<T> = T extends readonly (infer U)[] ? U : T;

/** Safely maps complex behavior tuples into a union of their respective argument arrays */
export type ResolvedEnemyBehaviorArgs<TEnemy extends EnemyType> =
  "seek" extends FlattenEnemyBehaviors<GetBehaviorFromEnemy<TEnemy>>
  ? EnemyBehaviorArgsMap[FlattenEnemyBehaviors<GetBehaviorFromEnemy<TEnemy>> & EnemyBehaviorType] : [];

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
