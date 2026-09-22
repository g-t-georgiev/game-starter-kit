import enemyData from "@/data/enemyData";
import Enemy from "@/entities/Enemy";
import ObjectPooler from "@/utils/ObjectPooler";
import EnemyBehaviorFactory from "@/entities/behaviors/enemies/EnemyBehaviorFactory";
import type { EnemiesConfig, EnemyType } from "@/types/enemies";
import type Player from "@/entities/Player";
import { ENEMY_SPAWN_COUNT } from "@/core/constants";

type EnemyPools = Record<EnemyType, ObjectPooler<Enemy>>;

export default class EnemyManager {
  private pools: EnemyPools;

  constructor() {
    const enemyDataKeys = Object.keys(enemyData) as EnemyType[];

    this.pools = enemyDataKeys.reduce<EnemyPools>(
      (pool, type) => {
        pool[type] = new ObjectPooler(() => {
          const data: EnemiesConfig[typeof type] = enemyData[type];
          const behavior = EnemyBehaviorFactory.create(data.behaviorType);
          return new Enemy(type, behavior, data);
        }, ENEMY_SPAWN_COUNT);

        return pool;
      },
      {} as EnemyPools
    );
  }

  spawn<Type extends EnemyType>(type: Type, x: number, y: number): Enemy<Type> | void {
    const pool = this.pools[type];

    if (!pool) {
      console.warn(`Unknown enemy type: ${type}`);

      return;
    }

    const enemy = pool.get() as Enemy<Type>;

    enemy.spawn(x, y);

    return enemy;
  }

  *getActive() {
    for (const pool of Object.values(this.pools)) {
      yield* pool.getActive();
    }
  }

  update(deltaTime: number, player: Player): void {
    for (const pool of Object.values(this.pools)) {
      pool.updateAll(deltaTime, player)
    }
  }

  reset(): void {
    for (const pool of Object.values(this.pools)) {
      pool.releaseAll();
    }
  }
}
