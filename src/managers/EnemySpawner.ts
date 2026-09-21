import type { EnemyType } from "@/types/enemies";
import type EnemyManager from "@/managers/EnemyManager";
import { GAME_WIDTH, GAME_HEIGHT, ENEMY_SPAWN_MARGIN, ENEMY_SPAWN_INTERVAL } from "@/core/constants";
import enemyData from "@/data/enemyData";

export default class EnemySpawner {
  private manager: EnemyManager;
  private spawnTime: number = 0;
  private spawnInterval: number = ENEMY_SPAWN_INTERVAL;
  private enemyTypes: EnemyType[];

  constructor(manager: EnemyManager) {
    this.manager = manager;
    this.enemyTypes = Object.keys(enemyData) as EnemyType[];
  }

  update(deltaTime: number): void {
    this.spawnTime += deltaTime;

    if (this.spawnTime >= this.spawnInterval) {
      this.spawn();
      this.spawnTime -= this.spawnInterval;
    }
  }

  spawn(): void {
    const index = Math.floor(Math.random() * this.enemyTypes.length);
    const type = this.enemyTypes[index];

    // Spawn enemies from random screen edge
    const edge = Math.floor(Math.random() * 4);

    let x, y;
    switch (edge) {
      case 0: // top
        x = Math.random() * GAME_WIDTH;
        y = -ENEMY_SPAWN_MARGIN;
        break;
      case 1: // right
        x = GAME_WIDTH + ENEMY_SPAWN_MARGIN;
        y = Math.random() * GAME_HEIGHT;
        break;
      case 2: // bottom
        x = Math.random() * GAME_WIDTH;
        y = GAME_HEIGHT + ENEMY_SPAWN_MARGIN;
        break;
      case 3: // left
        x = -ENEMY_SPAWN_MARGIN;
        y = Math.random() * GAME_HEIGHT;
        break;
      default: // left
        x = -ENEMY_SPAWN_MARGIN;
        y = Math.random() * GAME_HEIGHT;
    }

    this.manager.spawn(type, x, y);
  }

  reset(): void {
    this.spawnTime = 0;
  }
}
