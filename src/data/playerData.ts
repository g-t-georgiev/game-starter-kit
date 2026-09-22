import type { PlayerConfig } from "@/types/player";

export default {
  // Dimensions
  width: 64,
  height: 64,
  // Statistics
  speed: 300,
  maxHealth: 12,
  // Collisions
  collisionRadius: 24,
  collisionDamage: 1,
  invincibilityDuration: 2,
  pushbackForce: 520,
  // Visual
  color: "#1a1a2e",
  strokeColor: "#ffffff",
  imageName: "player",
  imagePath: "player.png",
} as const satisfies PlayerConfig;
