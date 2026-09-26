import type { EnemyTypes as TEnemyTypes, EnemiesConfig } from "@/types/enemies";

export const EnemyTypes: TEnemyTypes = {
  Drifter: "drifter",
  Seeker: "seeker",
};

export default {
  drifter: {
    // Dimensions
    width: 48,
    height: 48,
    // Statistics
    speed: 80,
    maxHealth: 8,
    damage: 1,
    // Collision
    collisionRadius: 22,
    invincibilityDuration: 0.6,
    pushbackForce: 0,
    pushbackImmune: true,
    // Behavior
    behaviorType: "drift",
    // Visual
    color: "#008cff",
    imageName: "enemy_drifter",
    imagePath: "enemy_drifter.png",
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
  } as const,
  seeker: {
    // Dimensions
    width: 38,
    height: 25,
    // Statistics
    speed: 120,
    maxHealth: 5,
    damage: 2,
    // Collision
    collisionRadius: 16,
    invincibilityDuration: 0.6,
    pushbackForce: 580,
    pushbackImmune: false,
    // Behavior
    behaviorType: "seek",
    // Visual
    color: "#ff0000",
    imageName: "enemy_seeker",
    imagePath: "enemy_seeker.png",
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
  } as const,
} satisfies EnemiesConfig;
