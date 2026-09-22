import type { EntityConfig } from "@/types/properties";
import type { EnemyBehaviorTypes, EnemyBehaviorType } from "@/types/enemyBehaviors";
import type { ParticleType } from "@/types/particleBehaviors";

export type EnemyType = `${Lowercase<keyof EnemyBehaviorTypes>}er`;

export type EnemyTypes = {
  [K in EnemyType as `${Capitalize<K>}`]: `${K}`;
};

export interface EnemySounds<Type extends EnemyType, Prefix extends "enemy" = "enemy"> {
  hit: `${Prefix}_${Type}_hit`;
  death: `${Prefix}_${Type}_death`;
};

export interface EnemyConfig<
  BehaviorType extends EnemyBehaviorType,
  Type extends EnemyType = `${BehaviorType}er`
> extends EntityConfig {
  damage: number;
  pushbackImmune: boolean;
  behaviorType: BehaviorType;
  imageName: `enemy_${Type}`;
  soundEffects?: EnemySounds<Type>;
  particleEffects?: Record<string, ParticleType>;
};

/** Maps a specific EnemyType back to its corresponding EnemyBehaviorType */
export type GetBehaviorFromEnemy<T extends EnemyType> =
  T extends `${infer B}er` ? (B extends EnemyBehaviorType ? B : never) : never;

/** Mapped configuration type of EnemyType and corresponding EnemyData pairs */
export type EnemiesConfig = {
  [Type in EnemyType]: EnemyConfig<GetBehaviorFromEnemy<Type>, Type>;
};
