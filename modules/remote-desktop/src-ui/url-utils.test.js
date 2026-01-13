import { describe, expect, it } from 'vitest';
import {
  INVALID_SAVED_URL_MESSAGE,
  normalizeUrl,
  readStoredUrl,
} from './url-utils.js';

describe('normalizeUrl', () => {
  it('returns origin for http urls', () => {
    expect(normalizeUrl('http://example.com/path')).toBe('http://example.com');
  });

  it('returns origin for https urls', () => {
    expect(normalizeUrl('https://example.com/app')).toBe(
      'https://example.com',
    );
  });

  it('adds scheme when missing', () => {
    expect(normalizeUrl('example.com:8080')).toBe('http://example.com:8080');
  });

  it('rejects invalid protocols', () => {
    expect(normalizeUrl('ftp://example.com')).toBeNull();
  });

  it('rejects invalid urls', () => {
    expect(normalizeUrl('not a url')).toBeNull();
  });
});

describe('readStoredUrl', () => {
  const createStorage = (value) => {
    const store = new Map();
    if (value !== undefined) {
      store.set('key', value);
    }
    return {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, val) => store.set(key, val),
      removeItem: (key) => store.delete(key),
      dump: () => store,
    };
  };

  it('returns null when storage is empty', () => {
    const storage = createStorage();
    expect(readStoredUrl(storage, 'key')).toEqual({ url: null, error: null });
  });

  it('returns normalized url when valid', () => {
    const storage = createStorage('https://example.com/app');
    expect(readStoredUrl(storage, 'key')).toEqual({
      url: 'https://example.com',
      error: null,
    });
  });

  it('clears invalid stored value', () => {
    const storage = createStorage('ftp://example.com');
    expect(readStoredUrl(storage, 'key')).toEqual({
      url: null,
      error: INVALID_SAVED_URL_MESSAGE,
    });
    expect(storage.getItem('key')).toBeNull();
  });
});
