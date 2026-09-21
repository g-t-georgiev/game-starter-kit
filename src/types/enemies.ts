import type { EntityData } from "./properties";
import type { EnemyBehaviorTypes, EnemyBehaviorType } from "./enemyBehaviors";

export type EnemyType = `${Lowercase<keyof EnemyBehaviorTypes>}er`;

export type EnemyTypes = {
  [K in EnemyType as `${Capitalize<K>}`]: `${K}`;
};

/**
 * @typedef {object} EnemySounds
 * @property {`enemy_${EnemyType}_hit`} hit
 * @property {`enemy_${EnemyType}_death`} death
 */
export interface EnemySounds<Type extends EnemyType, Prefix extends "enemy" = "enemy"> {
  hit: `${Prefix}_${Type}_hit`;
  death: `${Prefix}_${Type}_death`;
};

export interface EnemyData<
  BehaviorType extends EnemyBehaviorType,
  Type extends EnemyType = `${BehaviorType}er`
> extends EntityData {
  damage: number;
  pushbackImmune: boolean;
  behaviorType: BehaviorType;
  imageName: `enemy_${Type}`;
  sounds: EnemySounds<Type>;
};

/** Maps a specific EnemyType back to its corresponding EnemyBehaviorType */
export type GetBehaviorFromEnemy<T extends EnemyType> =
  T extends `${infer B}er` ? (B extends EnemyBehaviorType ? B : never) : never;

/** Mapped configuration type of EnemyType and corresponding EnemyData pairs */
export type EnemyConfig = {
  [Type in EnemyType]: EnemyData<GetBehaviorFromEnemy<Type>, Type>;
};
