export const INVALID_SAVED_URL_MESSAGE =
  'Saved server URL was invalid. Please enter a new one.';

export const normalizeUrl = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withScheme = trimmed.match(/^https?:\/\//i)
    ? trimmed
    : `http://${trimmed}`;

  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
};

export const readStoredUrl = (storage, key) => {
  const stored = storage.getItem(key);
  if (!stored) {
    return { url: null, error: null };
  }

  const normalized = normalizeUrl(stored);
  if (!normalized) {
    storage.removeItem(key);
    return { url: null, error: INVALID_SAVED_URL_MESSAGE };
  }

  return { url: normalized, error: null };
};
