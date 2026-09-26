import type { EntityConfig } from "@/types/entity";
import type { EnemyBehaviorArgsMap, EnemyBehaviorType } from "@/types/enemyBehaviors";
import type { ParticleConfig, ParticleType } from "@/types/particleBehaviors";
import type { UnpackUnions } from "@/types/utils";

/** Enemy behavior map per enemy type. Accepts an array or single enemy behavior type(s). */
type EnemyBehaviorMap = {
  drifter: "drift";
  seeker: "seek";
};

type EnemyEvents = "hit" | "death";

export type EnemyType = keyof EnemyBehaviorMap;

export type EnemyTypes = {
  [K in EnemyType as `${Capitalize<K>}`]: `${K}`;
};

export type EnemySounds<
  Type extends EnemyType,
  Prefix extends "enemy" = "enemy"
> = { [K in EnemyEvents]?: `${Prefix}_${Type}_${K}`; };

export type EnemyParticleConfig = { type: ParticleType } & Partial<ParticleConfig>;
export type EnemyParticles = { [K in EnemyEvents]?: EnemyParticleConfig; };

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
  particleEffects?: EnemyParticles;
};

/** Mapped configuration type of EnemyType and corresponding EnemyData pairs */
export type EnemiesConfig = {
  [Type in EnemyType]: EnemyConfig<Type, GetBehaviorFromEnemy<Type>>;
};
