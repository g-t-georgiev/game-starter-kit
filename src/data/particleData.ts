import type { ParticlesConfig } from "@/types/particleBehaviors";

export default {
  sparks: {
    count: 12,
    color: "#ffffff",
    speed: 180,
    lifetime: 0.5,
    size: 10,
    opacity: 1,
    fade: false,
    shrink: true,
    gravity: { x: 0, y: 250 },
    behaviorType: "radial",
  },
  smoke: {
    count: 12,
    color: "#ffffff",
    speed: 70,
    lifetime: 1.5,
    size: 15,
    opacity: 1,
    fade: true,
    shrink: false,
    gravity: { x: 0, y: -250 },
    behaviorType: "radial",
  },
  implosion: {
    count: 40,
    color: "#ffffff",
    speed: 600,
    lifetime: 2.0,
    size: 10,
    opacity: 1,
    fade: false,
    shrink: true,
    gravity: { x: 0, y: 0 },
    behaviorType: "implosion",
  }
} as const satisfies ParticlesConfig;
