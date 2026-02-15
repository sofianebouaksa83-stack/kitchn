// src/lib/authStorage.ts
// Permet de switcher dynamiquement entre localStorage (remember) et sessionStorage (temporaire)

const KEY = "kitchn:remember";

export function setRememberMe(remember: boolean) {
  try {
    window.localStorage.setItem(KEY, remember ? "1" : "0");
  } catch {
    // ignore
  }
}

export function getRememberMe(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== "0";
  } catch {
    return true; // par défaut: remember
  }
}

function currentStorage(): Storage {
  return getRememberMe() ? window.localStorage : window.sessionStorage;
}

export const rememberAwareStorage = {
  getItem(key: string) {
    return currentStorage().getItem(key);
  },
  setItem(key: string, value: string) {
    return currentStorage().setItem(key, value);
  },
  removeItem(key: string) {
    return currentStorage().removeItem(key);
  },
};
