import type { PlayerConfig } from "@/types/player";

export default {
  // Dimensions
  width: 64,
  height: 64,
  // Statistics
  speed: 90,
  maxHealth: 12,
  // Collisions
  collisionRadius: 24,
  collisionDamage: 1,
  invincibilityDuration: 2,
  knockbackPower: 520,
  // Visual
  color: "#1a1a2e",
  strokeColor: "#ffffff",
  animations: {
    spritesheets: {
      name: "player_spritesheet0",
      path: "player_spritesheet0.png"
    },
    frameWidth: 64,
    frameHeight: 64,
    initialState: "idle",
    states: {
      idle: { row: 24, frameCount: 2, frameInterval: 0.6, startFrame: 0, loop: true },
      moveDown: { row: 10, frameCount: 8, frameInterval: 0.15, startFrame: 1, loop: true },
      moveUp: { row: 8, frameCount: 8, frameInterval: 0.15, startFrame: 1, loop: true },
      moveLeft: { row: 9, frameCount: 8, frameInterval: 0.15, startFrame: 1, loop: true },
      moveRight: { row: 11, frameCount: 8, frameInterval: 0.15, startFrame: 1, loop: true },
      hit: { row: 2, frameCount: 3, frameInterval: 0.15, startFrame: 4, loop: false, locked: true, next: "idle" },
      death: { row: 20, frameCount: 6, frameInterval: 0.6, startFrame: 0, loop: false, locked: true },
    },
  }
} as const satisfies PlayerConfig;
