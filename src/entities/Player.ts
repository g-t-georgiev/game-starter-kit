import type { PlayerConfig } from "@/types/player.js";
import { type DirectionVector, type Movable } from "@/types/utils";
import { GAME_WIDTH, GAME_HEIGHT, PUSHBACK_DECAY } from "@/core/constants";
import playerData from "@/data/playerData";
import AnimatorController from "@/utils/AnimatorController";
import type { EntityState } from "@/types/entity";


export default class Player implements Movable {
  private directionX: DirectionVector = 0;
  private directionY: DirectionVector = 0;

  // Position and dimensions
  x = 0;
  y = 0;
  width: number;
  height: number;

  // Collision
  invincible = false;
  invincibilityTimer = 0;

  pushVx = 0;
  pushVy = 0;

  speed: number;
  collisionRadius: number;
  collisionDamage: number;

  invincibilityDuration: number;
  knockbackPower: number;

  // Multipliers
  speedMultiplier = 1;

  health: number;
  maxHealth: number;

  animator: AnimatorController;

  readonly data: PlayerConfig = {
    ...playerData,
  };

  constructor(overrides: Partial<PlayerConfig> = {}) {
    Object.assign(this.data, overrides);

    this.width = this.data.width;
    this.height = this.data.height;

    this.x = (GAME_WIDTH - this.width) / 2;
    this.y = (GAME_HEIGHT - this.height) / 2;

    // Statistics
    this.maxHealth = this.data.maxHealth;
    this.health = this.maxHealth;
    this.speed = this.data.speed;

    // Collision
    this.collisionRadius = this.data.collisionRadius;
    this.collisionDamage = this.data.collisionDamage;

    this.invincibilityDuration = this.data.invincibilityDuration;
    this.knockbackPower = this.data.knockbackPower;

    // Animations
    this.animator = new AnimatorController(this.data.animations!, true);
  }

  get centerX() {
    return this.x + this.width / 2;
  }

  get centerY() {
    return this.y + this.height / 2;
  }

  reset() {
    this.x = (GAME_WIDTH - this.width) / 2;
    this.y = (GAME_HEIGHT - this.height) / 2;

    this.speed = this.data.speed;
    this.speedMultiplier = 1;

    this.health = this.maxHealth;

    this.invincible = false;
    this.invincibilityTimer = 0;

    this.pushVx = 0;
    this.pushVy = 0;

    this.animator.reset(this.data.animations?.initialState);
  }

  update(deltaTime: number, inputs: Record<string, boolean>) {
    this._updatePushback(deltaTime);
    this._updateInvincibility(deltaTime);

    if (!this.animator.isCurrentLabel("death") && !this.animator.isCurrentLabel("hit")) {
      this._updateDirection(inputs);
      this._updatePosition(deltaTime);
      this._flipDirection();
    }

    this.animator.update(deltaTime);
    this._clampToBounds();
  }

  /** Keep player in bounds. */
  private _clampToBounds() {
    this.x = Math.max(0, Math.min(GAME_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(GAME_HEIGHT - this.height, this.y));
  }

  private _updatePosition(deltaTime: number) {
    if (!this.directionX && !this.directionY) return;

    // Normalize diagonal movement
    const len = Math.sqrt(this.directionX * this.directionX + this.directionY * this.directionY);

    this.directionX /= len;
    this.directionY /= len;

    this.x += this.directionX * this.speed * this.speedMultiplier * deltaTime;
    this.y += this.directionY * this.speed * this.speedMultiplier * deltaTime;
  }

  private _updateDirection(inputs: Record<string, boolean>) {
    this.directionX = 0;
    this.directionY = 0;

    if (inputs["w"] || inputs["arrowup"]) this.directionY -= 1;
    if (inputs["s"] || inputs["arrowdown"]) this.directionY += 1;
    if (inputs["a"] || inputs["arrowleft"]) this.directionX -= 1;
    if (inputs["d"] || inputs["arrowright"]) this.directionX += 1;
  }

  private _flipDirection() {
    let intent: Exclude<EntityState, "hit" | "death">;
    if (this.directionX < 0) intent = "moveLeft";
    else if (this.directionX > 0) intent = "moveRight";
    else if (this.directionY < 0) intent = "moveUp";
    else if (this.directionY > 0) intent = "moveDown";
    else intent = "idle";
    this.animator.play(intent);
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
    this.invincibilityTimer = this.invincibilityDuration;

    const label = this.isDead() ? "death" : "hit";
    this.animator.play(label, { force: true });

    return true;
  }

  isDead() {
    return this.health <= 0;
  }

  hasDeathAnimationFinished() {
    return this.animator.isCurrentLabel("death") && this.animator.finished;
  }
}
