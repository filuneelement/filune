/** Strict, dependency-free JSON contract schemas. No calculation or judgment takes place here. */
export class ContractValidationError extends TypeError {
  constructor(path: string, message: string) { super(`${path}: ${message}`) }
}
export interface Schema<T> {
  parse(value: unknown, path?: string): T
  is(value: unknown): value is T
}
export type Infer<S> = S extends Schema<infer T> ? T : never
export function schema<T>(check: (value: unknown, path: string) => T): Schema<T> {
  return {
    parse: (value, path = '$') => check(value, path),
    is(value): value is T {
      try { check(value, '$'); return true } catch (error) {
        if (error instanceof ContractValidationError) return false
        throw error
      }
    },
  }
}
export function requireContract(condition: unknown, path: string, message: string): asserts condition {
  if (!condition) throw new ContractValidationError(path, message)
}
export const text = schema<string>((value, path) => {
  requireContract(typeof value === 'string', path, 'expected string')
  return value
})
export const id = refine(text, (value) => value.trim().length > 0, 'expected non-empty identifier')
export const boolean = schema<boolean>((value, path) => {
  requireContract(typeof value === 'boolean', path, 'expected boolean'); return value
})
export const positiveInteger = schema<number>((value, path) => {
  requireContract(typeof value === 'number' && Number.isSafeInteger(value) && value > 0,
    path, 'expected positive safe integer'); return value
})
export function literal<const T extends string | null>(expected: T): Schema<T> {
  return schema((value, path) => {
    requireContract(value === expected, path, `expected ${String(expected)}`); return expected
  })
}
export function enumeration<const T extends readonly string[]>(values: T): Schema<T[number]> {
  return schema((value, path) => {
    requireContract(typeof value === 'string' && values.includes(value), path, `expected ${values.join(' / ')}`)
    return value as T[number]
  })
}
export function optional<T>(inner: Schema<T>): Schema<T | undefined> {
  return schema((value, path) => value === undefined ? undefined : inner.parse(value, path))
}
export function array<T>(inner: Schema<T>): Schema<T[]> {
  return schema((value, path) => {
    requireContract(Array.isArray(value), path, 'expected array')
    return value.map((item, index) => inner.parse(item, `${path}[${index}]`))
  })
}
export function union<const S extends readonly Schema<unknown>[]>(...members: S): Schema<Infer<S[number]>> {
  return schema((value, path) => {
    for (const member of members) {
      try { return member.parse(value, path) as Infer<S[number]> } catch (error) {
        if (!(error instanceof ContractValidationError)) throw error
      }
    }
    throw new ContractValidationError(path, 'does not match a contract variant')
  })
}
type Shape = Record<string, Schema<unknown>>
type ObjectValue<S extends Shape> =
  { [K in keyof S as undefined extends Infer<S[K]> ? never : K]: Infer<S[K]> } &
  { [K in keyof S as undefined extends Infer<S[K]> ? K : never]?: Infer<S[K]> }
export function object<const S extends Shape>(shape: S): Schema<ObjectValue<S>> {
  return schema((value, path) => {
    requireContract(value !== null && typeof value === 'object' && !Array.isArray(value)
      && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null),
    path, 'expected plain object')
    const source = value as Record<string, unknown>
    for (const key of Reflect.ownKeys(source)) {
      requireContract(typeof key === 'string' && Object.hasOwn(shape, key), path, `unexpected field ${String(key)}`)
      requireContract('value' in Object.getOwnPropertyDescriptor(source, key)!, path, 'accessor fields are not contract data')
    }
    const result: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(shape)) {
      const item = child.parse(Object.hasOwn(source, key) ? source[key] : undefined, `${path}.${key}`)
      if (item !== undefined) result[key] = item
    }
    return result as ObjectValue<S>
  })
}
export function refine<T>(inner: Schema<T>, predicate: (value: T) => boolean, message: string): Schema<T> {
  return schema((value, path) => {
    const parsed = inner.parse(value, path)
    requireContract(predicate(parsed), path, message); return parsed
  })
}
export const uniqueIds = refine(array(id), (items) => new Set(items).size === items.length, 'duplicate identifiers')
export const nonEmptyIds = refine(uniqueIds, (items) => items.length > 0, 'expected at least one identifier')
