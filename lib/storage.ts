import Storage from 'expo-sqlite/kv-store';

export async function getItem<T>(key: string): Promise<T | null> {
  const value = await Storage.getItem(key);
  try {
    return value ? JSON.parse(value) || null : null;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
}

export function setItem<T>(key: string, value: T) {
  Storage.setItem(key, JSON.stringify(value));
}

export function removeItem(key: string) {
  Storage.removeItem(key);
}
