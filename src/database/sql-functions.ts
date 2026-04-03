export function safeParse<T>(value: string | null | undefined, fallback: T): T {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function toSqliteBool(value: boolean | undefined, fallback = false): number {
  return value !== undefined ? (value ? 1 : 0) : (fallback ? 1 : 0);
}

export function mergeWithExisting<T extends Record<string, any>>(
  existing: T | null,
  data: Partial<T>,
  defaults: Partial<T> = {},
): T {
  return {
    ...defaults,
    ...(existing ?? {}),
    ...data,
  } as T;
}