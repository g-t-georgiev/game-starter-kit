export interface Poolable {
  active: boolean;
  update(deltaTime: number, ...args: unknown[]): void;
  reset(): void;
}

export default class ObjectPooler<T extends Poolable> {
  private factoryFn: (() => T);
  public readonly activeEntities: T[] = [];
  private inactiveEntities: T[] = [];

  constructor(factoryFn: (() => T), length: number) {
    this.factoryFn = factoryFn;

    // Pre-populate inactive entities pool
    this.inactiveEntities = Array.from({ length }, () => this.factoryFn());
  }

  /**
   * Get an entity from the inactive objects pool or create a brand new one if no
   * available inactive objects to reuse. Then, adds it to the active objects pool.
   */
  get(): T {
    let obj: T;

    if (this.inactiveEntities.length > 0) {
      obj = this.inactiveEntities.pop()!;
    } else {
      obj = this.factoryFn();
      console.warn(`[DEV] Pool expanded, crearted new object.`);
    }

    this.activeEntities.push(obj);

    return obj;
  }

  /** Update all entities from active objects pool and release them if inactive. */
  updateAll(deltaTime: number, ...args: unknown[]): void {
    for (let len = this.activeEntities.length, i = len - 1; i >= 0; i--) {
      const obj = this.activeEntities[i];

      obj.update(deltaTime, ...args);

      if (obj.active) continue;

      this.release(obj);
    }
  }

  /**
   * Fast O(1) release by index using the Swap-to-Pop trick.
   * Eliminates indexOf() searches and array shifting.
   */
  private releaseAt(index: number): void {
    const obj = this.activeEntities[index];
    const lastIndex = this.activeEntities.length - 1;

    // Swap the dead object with the very last active object in the array
    if (index < lastIndex) {
      this.activeEntities[index] = this.activeEntities[lastIndex];
    }

    // Pop the last element off the array (O(1) operation, no shifting)
    this.activeEntities.pop();

    obj.reset();
    this.inactiveEntities.push(obj);
  }

  /** Release an entity and push it back to inactive objects pool. */
  release(obj: T): void {
    // ✨ NOTES ON IMPROVEMENT:
    // Consider tracking the index directly on the object
    // or structuralize the logic so that ObjectPooler can release by index.
    const index = this.activeEntities.indexOf(obj);

    if (index === -1) return;

    this.releaseAt(index);
  }

  /** Release all entities and empty active objects pool. */
  releaseAll(): void {
    for (let i = 0, len = this.activeEntities.length; i < len; i++) {
      const obj = this.activeEntities[i];

      obj.reset();
      this.inactiveEntities.push(obj);
    }

    this.activeEntities.length = 0;
  }
}
