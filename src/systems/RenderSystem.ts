import type Enemy from "@/entities/Enemy";
import type Player from "@/entities/Player";
import type ImageManager from "@/managers/ImageManager";

import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRID_SIZE,
  GAME_STATES,
  FLASH_MIN_ALPHA,
  FLASH_ALPHA_RANGE,
  FLASH_SPEED,
  HEALTHBAR_HEIGHT,
  HEALTHBAR_OFFSET,
  HEALTHBAR_BACKGROUND,
  HEALTHBAR_FILL,
  // PUSHBACK_DECAY,
  type GameState,
} from "@/core/constants";
import type Particle from "@/entities/Particle";

export default class RenderSystem {
  private context: CanvasRenderingContext2D;
  private imageManager: ImageManager;

  constructor(canvas: HTMLCanvasElement, imageManager: ImageManager) {
    this.context = canvas.getContext("2d")!;
    this.context.imageSmoothingEnabled = false;

    this.imageManager = imageManager;
  }

  render(
    state: GameState,
    player: Player,
    enemies: Enemy[],
    particles: Particle[],
    debug: boolean = false
  ): void {
    if (state === GAME_STATES.MENU) {
      this.renderMenuBackground();

      return;
    }

    // Background
    this.context.fillStyle = "#0f3460";
    this.context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.renderGrid();
    this.renderPlayer(player);
    this.renderEnemies(enemies);
    this.renderParticles(particles);

    if (debug) this.renderDebugOverlay(player, enemies);
  }

  renderPlayer(player: Player): void {
    const playerImage = this.imageManager.get(player.data.imageName);

    if (player.invincible) {
      this.context.globalAlpha =
        FLASH_MIN_ALPHA + FLASH_ALPHA_RANGE * Math.abs(Math.sin(player.invincibilityTimer * FLASH_SPEED));
    }

    if (playerImage) {
      this.context.save();
      if (player.flipHorizontal) {
        this.context.translate(player.x + player.width, player.y);
        this.context.scale(-1, 1);
        this.context.drawImage(playerImage, 0, 0, player.width, player.height);
      } else {
        this.context.drawImage(playerImage, player.x, player.y, player.width, player.height);
      }
      this.context.restore();
    } else {
      // fallback
      this.context.fillStyle = player.data.color;
      this.context.fillRect(player.x, player.y, player.width, player.height);
      this.context.strokeStyle = player.data.strokeColor;
      this.context.strokeRect(player.x, player.y, player.width, player.height);
    }

    this.context.globalAlpha = 1;
  }

  renderParticles(particles: Particle[]) {
    for (const particle of particles) {
      if (!particle.active) continue;

      const x = particle.x - particle.size / 2;
      const y = particle.y - particle.size / 2;

      this.context.save();
      this.context.fillStyle = particle.color;
      this.context.globalAlpha = particle.opacity;
      this.context.fillRect(x, y, particle.size, particle.size);
      this.context.restore();
    }
  }

  renderEnemies(enemies: Enemy[]): void {
    for (const enemy of enemies) {
      if (!enemy.active) continue;

      const enemyImage = this.imageManager.get(enemy.data.imageName);

      if (enemy.invincible) {
        this.context.globalAlpha =
          FLASH_MIN_ALPHA + FLASH_ALPHA_RANGE * Math.abs(Math.sin(enemy.invincibilityTimer * FLASH_SPEED));
      }

      if (enemyImage) {
        this.context.save();
        if (enemy.flipHorizontal) {
          this.context.translate(enemy.x + enemy.width, enemy.y);
          this.context.scale(-1, 1);
          this.context.drawImage(enemyImage, 0, 0, enemy.width, enemy.height);
        } else {
          this.context.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
        }
        this.context.restore();
      } else {
        // falback
        this.context.fillStyle = enemy.data.color;
        this.context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }

      this.context.globalAlpha = 1;

      if (enemy.health < enemy.maxHealth) {
        this.renderEnemyHealthBar(enemy);
      }
    }
  }

  renderEnemyHealthBar(enemy: Enemy): void {
    const ratio = enemy.health / enemy.maxHealth;

    const x = enemy.x;
    const y = enemy.y - HEALTHBAR_OFFSET - HEALTHBAR_HEIGHT;
    const w = enemy.width;

    this.context.fillStyle = HEALTHBAR_BACKGROUND;
    this.context.fillRect(x, y, w, HEALTHBAR_HEIGHT);

    this.context.fillStyle = HEALTHBAR_FILL;
    this.context.fillRect(x, y, Math.ceil(w * ratio), HEALTHBAR_HEIGHT);
  }

  renderGrid() {
    this.context.lineWidth = 1;
    this.context.strokeStyle = "rgba(255,255,255,0.2)";

    this.context.beginPath();

    for (let i = 0; i < GAME_WIDTH; i += GRID_SIZE) {
      this.context.moveTo(i, 0);
      this.context.lineTo(i, GAME_HEIGHT);
    }

    for (let i = 0; i < GAME_HEIGHT; i += GRID_SIZE) {
      this.context.moveTo(0, i);
      this.context.lineTo(GAME_WIDTH, i);
    }

    this.context.stroke();
  }

  renderMenuBackground() {
    this.context.fillStyle = "#0f3460";
    this.context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  renderDebugOverlay(player: Player, enemies: Enemy[]): void {
    this._drawHitBox(player);

    for (const enemy of enemies) {
      if (!enemy.active) continue;

      this._drawHitBox(enemy, "#ff8000");
    }
  }

  private _drawHitBox(entity: Player | Enemy, stroke = "#008000", fill?: string): void {
    this.context.save();

    this.context.lineWidth = 2;
    this.context.strokeStyle = stroke;

    if (fill) this.context.fillStyle = fill;

    this.context.beginPath();
    this.context.arc(entity.centerX, entity.centerY, entity.collisionRadius, 0, Math.PI * 2);
    this.context.stroke();

    if (fill) this.context.fill();

    this.context.restore();
  }
}
