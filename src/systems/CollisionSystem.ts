import type { CircularCollider } from "@/types/collisions";

export default class CollisionSystem {
  checkCircleCircle(a: CircularCollider, b: CircularCollider): boolean {
    const ax = a.x + a.width / 2;
    const ay = a.y + a.height / 2;

    const bx = b.x + b.width / 2;
    const by = b.y + b.height / 2;

    const dx = ax - bx;
    const dy = ay - by;

    const distSq = dx * dx + dy * dy;
    const radiiSumSq = (a.collisionRadius + b.collisionRadius) ** 2;

    return distSq < radiiSumSq;
  }
}
