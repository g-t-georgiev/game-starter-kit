import type { EntityConfig } from "@/types/properties";

export interface PlayerConfig extends EntityConfig {
  collisionDamage: number;
  strokeColor: string;
}
