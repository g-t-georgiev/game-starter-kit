import type { EnemyConfig, EnemyData, EnemyType, GetBehaviorFromEnemy } from "@/types/enemies";
import type { Behavior } from "@/types/enemyBehaviors";
import type { BehaviorArgsMap } from "@/types/enemyBehaviors";
import { Direction, type DirectionVector, type Movable } from "@/types/properties";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  ENEMY_DESPAWN_MARGIN,
  PUSHBACK_DECAY,
} from "@/core/constants";
import enemyData from "@/data/enemyData";

export default class Enemy<TEnemy extends EnemyType = EnemyType> implements Movable {
  type: TEnemy;
  behavior: Behavior<this, BehaviorArgsMap[GetBehaviorFromEnemy<TEnemy>]>;
  readonly data: EnemyData<GetBehaviorFromEnemy<TEnemy>, TEnemy>;

  flipHorizontal = false;
  orientation: Direction = Direction.Right;
  private directionX: DirectionVector = 0;
  /** @ts-ignore */
  private directionY: DirectionVector = 0;

  // Position and dimensions
  x = 0;
  y = 0;
  width: number;
  height: number;

  /** Used for pooling / managing the entity in an object pool */
  active = false;

  // Collision and health
  invincible = false;
  invincibilityTimer = 0;

  health: number;
  maxHealth: number;
  speed: number;
  damage: number;

  collisionRadius: number;
  invincibilityDuration: number;
  pushbackForce: number;

  pushVx = 0;
  pushVy = 0;

  constructor(
    enemyType: TEnemy,
    behavior: Behavior<Enemy<TEnemy>, BehaviorArgsMap[GetBehaviorFromEnemy<TEnemy>]>,
    overrides: Partial<EnemyData<GetBehaviorFromEnemy<TEnemy>, TEnemy>> = {}
  ) {
    const DEFAULT_CONFIG: EnemyConfig[TEnemy] = enemyData[enemyType];

    this.data = {
      ...DEFAULT_CONFIG,
      ...overrides,
    };

    this.type = enemyType;
    this.behavior = behavior;

    // Position and dimensions
    this.width = this.data.width;
    this.height = this.data.height;

    // Statistics
    this.maxHealth = this.data.maxHealth;
    this.health = this.maxHealth;
    this.damage = this.data.damage;
    this.speed = this.data.speed;

    // Collision
    this.collisionRadius = this.data.collisionRadius;
    this.invincibilityDuration = this.data.invincibilityDuration;
    this.pushbackForce = this.data.pushbackForce;
  }

  get centerX() {
    return this.x + this.width / 2;
  }

  get centerY() {
    return this.y + this.height / 2;
  }

  spawn(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.health = this.maxHealth;
    this.active = true;
    this.invincible = false;
    this.invincibilityTimer = 0;
  }

  reset() {
    this.active = false;
    this.health = this.maxHealth;
    this.pushVx = 0;
    this.pushVy = 0;
    this.behavior.reset?.();
  }

  update(
    deltaTime: number,
    ...args: BehaviorArgsMap[GetBehaviorFromEnemy<TEnemy>]
  ) {
    if (!this.active) return;

    if (this.invincible) {
      this.invincibilityTimer -= deltaTime;

      if (this.invincibilityTimer <= 0) {
        this.invincible = false;
        this.invincibilityTimer = 0;
      }
    }

    if (
      this.x < -ENEMY_DESPAWN_MARGIN ||
      this.x > GAME_WIDTH + ENEMY_DESPAWN_MARGIN ||
      this.y < -ENEMY_DESPAWN_MARGIN ||
      this.y > GAME_HEIGHT + ENEMY_DESPAWN_MARGIN
    ) {
      this.active = false;
      return;
    }

    if (this.pushVx !== 0 || this.pushVy !== 0) {
      // Apply pushback velocity
      this.x += this.pushVx * deltaTime;
      this.y += this.pushVy * deltaTime;

      // Decay pushback velocity
      const speed = Math.sqrt(this.pushVx * this.pushVx + this.pushVy * this.pushVy);
      const decay = PUSHBACK_DECAY * deltaTime;

      if (speed <= decay) {
        this.pushVx = 0;
        this.pushVy = 0;
      } else {
        const ratio = (speed - decay) / speed;

        this.pushVx *= ratio;
        this.pushVy *= ratio;
      }
    }

    const oldX = this.x;
    const oldY = this.y;

    // TypeScript guarantees correct arguments for this specific behavior type
    this.behavior.update(this, deltaTime, ...args);

    const dx = this.x - oldX;
    const dy = this.y - oldY;

    this.directionX = Math.sign(dx) as DirectionVector;
    this.directionY = Math.sign(dy) as DirectionVector;

    // Only update flip state if entity moves horizontally
    if (this.directionX !== 0) {
      this.flipHorizontal =
        (this.orientation === Direction.Right && this.directionX === -1) ||
        (this.orientation === Direction.Left && this.directionX === 1);
    }
  }

  applyPushback(x: number, y: number, force: number) {
    this.pushVx = x * force;
    this.pushVy = y * force;
  }

  takeDamage(amount: number): boolean {
    if (this.invincible) return false;

    this.health -= amount;

    if (this.health < 0) this.health = 0;

    this.invincible = true;
    this.invincibilityTimer = this.data.invincibilityDuration;

    return true;
  }

  isDead() {
    return this.health <= 0;
  }
}
