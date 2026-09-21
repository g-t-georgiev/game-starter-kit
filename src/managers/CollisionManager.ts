import type EventEmitter from "@/core/EventEmitter";
import type CollisionSystem from "@/systems/CollisionSystem";
import type Player from "@/entities/Player";
import type Enemy from "@/entities/Enemy";
import { EVENTS } from "@/core/constants";

export default class CollisionManager {
  eventEmitter: EventEmitter;
  collisionSystem: CollisionSystem;

  constructor(collisionSystem: CollisionSystem, eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this.collisionSystem = collisionSystem;
  }

  update(player: Player, enemies: Iterable<Enemy>) {
    this.checkPlayerEnemyCollision(player, enemies);
  }

  checkPlayerEnemyCollision(player: Player, enemies: Iterable<Enemy>) {
    for (const enemy of enemies) {
      if (this.collisionSystem.checkCircleCircle(player, enemy)) {
        const dx = player.centerX - enemy.centerX;
        const dy = player.centerY - enemy.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const nx = dist > 0 ? dx / dist : 1;
        const ny = dist > 0 ? dy / dist : 0;

        const enemyDamage = enemy.takeDamage(player.collisionDamage);

        if (enemyDamage) {
          this.eventEmitter.emit(EVENTS.ENEMY_DAMAGED, enemy);

          if (enemy.isDead()) {
            enemy.active = false;
            this.eventEmitter.emit(EVENTS.ENEMY_DIED, enemy);
          } else if (!enemy.data.pushbackImmune) {
            enemy.applyPushback(-nx, -ny, enemy.pushbackForce);
          }
        }

        const playerDamage = player.takeDamage(enemy.damage);

        if (playerDamage) {
          this.eventEmitter.emit(EVENTS.PLAYER_DAMAGED, player.health, player.data.maxHealth);

          if (player.isDead()) {
            this.eventEmitter.emit(EVENTS.PLAYER_DIED);

            return;
          }

          if (enemy.data.pushbackImmune) {
            player.applyPushback(nx, ny, player.pushbackForce);
          }
        }
      }
    }
  }
}
