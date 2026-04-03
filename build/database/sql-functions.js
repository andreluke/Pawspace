function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
function toSqliteBool(value, fallback = false) {
  return value !== void 0 ? value ? 1 : 0 : fallback ? 1 : 0;
}
function mergeWithExisting(existing, data, defaults = {}) {
  return {
    ...defaults,
    ...existing ?? {},
    ...data
  };
}
export {
  mergeWithExisting,
  safeParse,
  toSqliteBool
};
