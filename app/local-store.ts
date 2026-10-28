"use client";

import { useMemo, useSyncExternalStore } from "react";

// 以 localStorage 保存一份清單，並讓所有使用中的元件同步更新
export function createLocalStore<T>(key: string, sample: T[]) {
  const listeners = new Set<() => void>();

  function subscribe(listener: () => void) {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  }

  function read() {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) return saved;
      // 第一次使用（瀏覽器內還沒有任何資料）時，自動載入範例資料
      const json = JSON.stringify(sample);
      localStorage.setItem(key, json);
      return json;
    } catch {
      return "[]";
    }
  }

  function save(items: T[]) {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {}
    listeners.forEach((l) => l());
  }

  function useItems() {
    const raw = useSyncExternalStore(subscribe, read, () => "[]");
    return useMemo<T[]>(() => {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }, [raw]);
  }

  return { save, useItems, loadSample: () => save(sample) };
}
