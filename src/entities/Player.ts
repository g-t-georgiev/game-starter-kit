import type { PlayerConfig } from "@/types/player.js";
import { Direction, type DirectionVector, type Movable } from "@/types/utils";
import { GAME_WIDTH, GAME_HEIGHT, PUSHBACK_DECAY } from "@/core/constants";
import playerData from "@/data/playerData";


export default class Player implements Movable {
  flipHorizontal: boolean = false;
  private orientation: Direction = Direction.Right;
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
  pushbackForce: number;

  // Multipliers
  speedMultiplier = 1;

  health: number;
  maxHealth: number;

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
    this.pushbackForce = this.data.pushbackForce;
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
  }

  update(deltaTime: number, keys: Record<string, boolean>) {
    if (this.invincible) {
      this.invincibilityTimer -= deltaTime;

      if (this.invincibilityTimer <= 0) {
        this.invincible = false;
        this.invincibilityTimer = 0;
      }
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

    this.directionX = 0;
    this.directionY = 0;

    if (keys["w"] || keys["arrowup"]) this.directionY -= 1;
    if (keys["s"] || keys["arrowdown"]) this.directionY += 1;
    if (keys["a"] || keys["arrowleft"]) this.directionX -= 1;
    if (keys["d"] || keys["arrowright"]) this.directionX += 1;

    // Normalize diagonal movement
    if (this.directionX || this.directionY) {
      const len = Math.sqrt(this.directionX * this.directionX + this.directionY * this.directionY);

      this.directionX /= len;
      this.directionY /= len;

      this.x += this.directionX * this.speed * this.speedMultiplier * deltaTime;
      this.y += this.directionY * this.speed * this.speedMultiplier * deltaTime;
    }

    // Keep player in bounds
    this.x = Math.max(0, Math.min(GAME_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(GAME_HEIGHT - this.height, this.y));

    // Only update flip state if the entity is actually moving horizontally
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
    this.invincibilityTimer = this.invincibilityDuration;

    return true;
  }

  isDead() {
    return this.health <= 0;
  }
}
