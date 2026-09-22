import type { Position } from "@/types/properties";
import type ObjectPooler from "@/utils/ObjectPooler";
import type Particle from "@/entities/Particle";
import type RadialBehavior from "@/entities/behaviors/particles/RadialBehavior";

export type ParticleType = "sparks" | "smoke";
export type ParticlePools = Record<ParticleType, ObjectPooler<Particle>>;

export type ParticleBehaviorType = "radial";

export interface ParticleConfig {
  count: number;
  color: string;
  speed: number;
  lifetime: number;
  size: number;
  opacity: number;
  fade: boolean;
  shrink: boolean;
  gravity: Position;
  behaviorType: ParticleBehaviorType;
};

export type ParticlesConfig = {
  [Type in ParticleType]: ParticleConfig;
}

export interface ParticleBehaviorMap {
  radial: RadialBehavior;
};

export type ParticleBehaviorRegistry = {
  [K in ParticleBehaviorType]: () => ParticleBehaviorMap[K];
};

export type ParticleBehavior = ParticleBehaviorMap[keyof ParticleBehaviorMap];
