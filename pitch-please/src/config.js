const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
export const API_BASE = configuredBaseUrl.replace(/\/+$/, "");

export function assetUrl(path) {
  if (!path) return path;
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) return path;
  return `${API_BASE}${path}`;
}
