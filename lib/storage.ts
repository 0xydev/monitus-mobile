import AsyncStorage from '@react-native-async-storage/async-storage';

// Synchronous cache for frequently accessed values
const cache: Record<string, string | null> = {};

// Initialize cache from AsyncStorage
AsyncStorage.getAllKeys().then((keys) => {
  keys.forEach((key) => {
    AsyncStorage.getItem(key).then((value) => {
      cache[key] = value;
    });
  });
});

export function getItem<T>(key: string): T | null {
  const value = cache[key];
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  const stringValue = JSON.stringify(value);
  cache[key] = stringValue;
  // Persist to AsyncStorage (fire and forget)
  AsyncStorage.setItem(key, stringValue).catch((error) => {
    console.error('Error saving to AsyncStorage:', error);
  });
}

export function removeItem(key: string): void {
  delete cache[key];
  AsyncStorage.removeItem(key).catch((error) => {
    console.error('Error removing from AsyncStorage:', error);
  });
}

// For compatibility, export a mock storage object
export const storage = {
  getString: (key: string) => cache[key] || null,
  set: (key: string, value: string) => {
    cache[key] = value;
    AsyncStorage.setItem(key, value);
  },
  delete: (key: string) => {
    delete cache[key];
    AsyncStorage.removeItem(key);
  },
};
