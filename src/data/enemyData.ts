import type { EnemyTypes as TEnemyTypes, EnemyConfig } from "../types/enemies";

export const EnemyTypes: TEnemyTypes = {
  Drifter: "drifter",
  Seeker: "seeker",
};

export default Object.freeze({
  drifter: Object.freeze({
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
    sounds: {
      hit: "enemy_drifter_hit",
      death: "enemy_drifter_death",
    }
  } as const),
  seeker: Object.freeze({
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
    sounds: {
      hit: "enemy_seeker_hit",
      death: "enemy_seeker_death",
    }
  } as const),
}) satisfies EnemyConfig;
