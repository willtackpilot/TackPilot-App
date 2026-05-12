import * as SecureStore from 'expo-secure-store';

/**
 * Thin AsyncStorage-shaped wrapper over expo-secure-store. Keeps callers
 * (api/client, AuthContext) decoupled from the underlying secure backend
 * — if Expo ever ships a different keychain primitive we swap here.
 *
 * expo-secure-store's native methods:
 *   - getItemAsync(key)    → Promise<string | null>
 *   - setItemAsync(key, v) → Promise<void>
 *   - deleteItemAsync(key) → Promise<void>
 *
 * Keys must match /^[A-Za-z0-9._-]+$/. Our keys ("jwt", "refreshToken")
 * are fine.
 */
export const secureStore = {
  async getItem(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
  async multiRemove(keys: string[]): Promise<void> {
    await Promise.all(keys.map((k) => SecureStore.deleteItemAsync(k)));
  },
};
