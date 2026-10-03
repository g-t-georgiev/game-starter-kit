import type { EnemyTypes as TEnemyTypes, EnemiesConfig } from "@/types/enemies";

export const EnemyTypes: TEnemyTypes = {
  Drifter: "drifter",
  Seeker: "seeker",
};

export default {
  drifter: {
    // Dimensions
    width: 64,
    height: 48,
    // Statistics
    speed: 30,
    maxHealth: 8,
    damage: 2,
    // Collision
    collisionRadius: 22,
    invincibilityDuration: 0.6,
    knockbackPower: 0,
    knockbackResistance: 1.0,
    // Behavior
    behaviorType: "drift",
    // Visual
    color: "#008cff",
    // Sounds
    soundEffects: {
      hit: "enemy_drifter_hit",
      death: "enemy_drifter_death",
    },
    particleEffects: {
      hit: {
        type: "smoke",
        count: 6,
      },
      death: {
        type: "implosion",
        count: 25,
      },
    },
    animations: {
      spritesheets: [
        "enemy_drifter_spritesheet0",
        "enemy_drifter_spritesheet1"
      ],
      frameWidth: 64,
      frameHeight: 48,
      initialState: "idle",
      states: {
        idle: { row: 0, frameCount: 8, frameInterval: 0.15, startFrame: 0, loop: true },
        move: { row: 1, frameCount: 6, frameInterval: 0.15, startFrame: 0, loop: true },
        hit: { row: 2, frameCount: 6, frameInterval: 0.15, startFrame: 0, loop: false, locked: true, next: "idle" },
        death: { row: 3, frameCount: 8, frameInterval: 0.1, startFrame: 0, loop: false, locked: true },
      }
    }
  } as const,
  seeker: {
    // Dimensions
    width: 64,
    height: 64,
    // Statistics
    speed: 60,
    maxHealth: 5,
    damage: 1,
    // Collision
    collisionRadius: 16,
    invincibilityDuration: 0.6,
    knockbackPower: 580,
    knockbackResistance: 0.0,
    // Behavior
    behaviorType: "seek",
    // Visual
    color: "#ff0000",
    // Sounds
    soundEffects: {
      hit: "enemy_seeker_hit",
      death: "enemy_seeker_death",
    },
    particleEffects: {
      hit: {
        type: "sparks",
        count: 10,
      },
      death: {
        type: "implosion",
        count: 17,
      },
    },
    animations: {
      spritesheets: [
        "enemy_seeker_spritesheet0",
        "enemy_seeker_spritesheet1"
      ],
      frameWidth: 64,
      frameHeight: 64,
      initialState: "move",
      states: {
        move: { row: 0, frameCount: 9, frameInterval: 0.15, startFrame: 0, loop: true },
        hit: { row: 1, frameCount: 7, frameInterval: 0.15, startFrame: 0, loop: false, locked: true, next: "move" },
        death: { row: 2, frameCount: 11, frameInterval: 0.1, startFrame: 0, loop: false, locked: true },
      }
    }
  } as const,
} satisfies EnemiesConfig;
