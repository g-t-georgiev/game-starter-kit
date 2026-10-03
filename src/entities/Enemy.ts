import type {
  EnemyState,
  EnemiesConfig,
  EnemyConfig,
  EnemyType,
  GetBehaviorFromEnemy,
  ResolvedEnemyBehaviorArgs
} from "@/types/enemies";
import type { Behavior } from "@/types/enemyBehaviors";
import { Direction, type DirectionVector, type Movable } from "@/types/utils";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  ENEMY_DESPAWN_MARGIN,
  PUSHBACK_DECAY,
} from "@/core/constants";
import enemyData from "@/data/enemyData";
import AnimatorController from "@/utils/AnimatorController";

export default class Enemy<TEnemy extends EnemyType = EnemyType> implements Movable {
  type: TEnemy;
  behavior: Behavior<this, ResolvedEnemyBehaviorArgs<TEnemy>>;
  readonly data: EnemyConfig<TEnemy, GetBehaviorFromEnemy<TEnemy>>;

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
  knockbackPower: number;

  pushVx = 0;
  pushVy = 0;

  animator: AnimatorController;

  constructor(
    enemyType: TEnemy,
    behavior: Behavior<Enemy<TEnemy>, ResolvedEnemyBehaviorArgs<TEnemy>>,
    overrides: Partial<EnemyConfig<TEnemy, GetBehaviorFromEnemy<TEnemy>>> = {}
  ) {
    const DEFAULT_CONFIG: EnemiesConfig[TEnemy] = enemyData[enemyType];

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
    this.knockbackPower = this.data.knockbackPower;

    // Animations
    this.animator = new AnimatorController<EnemyState>(this.data.animations!, true);
  }

  get centerX() {
    return this.x + this.width / 2;
  }

  get centerY() {
    return this.y + this.height / 2;
  }

  spawn(x: number, y: number) {
    this.reset();
    this.x = x;
    this.y = y;
    this.active = true;
  }

  reset() {
    this.active = false;
    this.health = this.maxHealth;
    this.pushVx = 0;
    this.pushVy = 0;
    this.invincible = false;
    this.invincibilityTimer = 0;
    this.behavior.reset?.();
    this.animator.reset(this.data.animations?.initialState);
  }

  update(
    deltaTime: number,
    ...args: ResolvedEnemyBehaviorArgs<TEnemy>
  ) {
    if (!this.active) return;

    if (
      this.x < -ENEMY_DESPAWN_MARGIN ||
      this.x > GAME_WIDTH + ENEMY_DESPAWN_MARGIN ||
      this.y < -ENEMY_DESPAWN_MARGIN ||
      this.y > GAME_HEIGHT + ENEMY_DESPAWN_MARGIN
    ) {
      this.active = false;
      return;
    }

    if (this.invincible) this._updateInvincibility(deltaTime);
    if (this.pushVx !== 0 || this.pushVy !== 0) this._updatePushback(deltaTime);

    if (this.animator.isCurrentLabel("death")) {
      this.animator.update(deltaTime);

      if (this.animator.finished) this.active = false;

      return;
    }

    if (!this.animator.isCurrentLabel("hit")) {
      const oldX = this.x;
      const oldY = this.y;

      this.behavior.update(this, deltaTime, ...args);
      const label = "idling" in this.behavior && this.behavior.idling ? "idle" : "move";
      this.animator.play(label);
      this._flipDirection(oldX, oldY);
    }

    this.animator.update(deltaTime);
  }

  private _flipDirection(prevX: number, prevY: number) {
    this.directionX = Math.sign(this.x - prevX) as DirectionVector;
    this.directionY = Math.sign(this.y - prevY) as DirectionVector;

    // Only update flip state if entity moves horizontally
    if (this.directionX !== 0) {
      this.flipHorizontal =
        (this.orientation === Direction.Right && this.directionX === -1) ||
        (this.orientation === Direction.Left && this.directionX === 1);
    }
  }

  private _updateInvincibility(deltaTime: number) {
    if (!this.invincible) return;

    this.invincibilityTimer -= deltaTime;

    if (this.invincibilityTimer <= 0) {
      this.invincible = false;
      this.invincibilityTimer = 0;
    }
  }

  /** Apply pushback velocity. */
  private _updatePushback(deltaTime: number) {
    if (!this.pushVx && !this.pushVy) return;

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

  applyKnockback(x: number, y: number, force: number) {
    this.pushVx = x * force;
    this.pushVy = y * force;
  }

  takeDamage(amount: number): boolean {
    if (this.invincible) return false;

    this.health -= amount;

    if (this.health < 0) this.health = 0;

    this.invincible = true;
    this.invincibilityTimer = this.data.invincibilityDuration;

    const label = this.isDead() ? "death" : "hit";
    this.animator.play(label, { force: true });

    return true;
  }

  isDead() {
    return this.health <= 0;
  }
}
