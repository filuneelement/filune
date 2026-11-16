export type Serialized<T> = T extends Date ? string
  : T extends readonly (infer Item)[] ? Serialized<Item>[]
  : T extends object ? { [Key in keyof T]: Serialized<T[Key]> }
  : T

/** Produce detached JSON data, rejecting values JSON would silently corrupt. */
export function serializeCanonical<T>(value: T): Serialized<T> {
  const ancestors = new Set<object>()
  function visit(input: unknown): unknown {
    if (input === null || typeof input === 'string' || typeof input === 'boolean') return input
    if (typeof input === 'number') {
      if (!Number.isFinite(input)) throw new TypeError('Non-finite number in canonical data.')
      return input
    }
    if (input instanceof Date) {
      if (!Number.isFinite(input.getTime())) throw new TypeError('Invalid Date in canonical data.')
      return input.toISOString()
    }
    if (typeof input !== 'object') throw new TypeError('Non-JSON value in canonical data.')
    if (ancestors.has(input)) throw new TypeError('Circular canonical data.')
    ancestors.add(input)
    try {
      if (Array.isArray(input)) return Array.from(input, visit)
      if (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) {
        throw new TypeError('Non-plain object in canonical data.')
      }
      return Object.fromEntries(Object.entries(input)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, visit(item)]))
    } finally {
      ancestors.delete(input)
    }
  }
  return visit(value) as Serialized<T>
}
