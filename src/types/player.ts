import type { EntityConfig } from "@/types/entity";

export interface PlayerConfig extends EntityConfig {
  collisionDamage: number;
  strokeColor: string;
}
