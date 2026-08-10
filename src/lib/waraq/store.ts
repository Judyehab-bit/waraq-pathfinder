import { useCallback, useEffect, useState } from "react";

export type Profile = {
  name: string;
  age: string;
  city: string;
  area?: string;
  geo?: { lat: number; lng: number } | null;
};

export type StoredDoc = {
  id: string;
  name: string;
  type: string;
  fileName?: string;
  uploadedAt: string;
  expiresAt?: string;
};

export type Procedure = {
  serviceId: string;
  answers: Record<string, string>;
  answered: boolean;
  done: string[];
  startedAt: string;
  updatedAt: string;
};

export type Settings = {
  lang: "ar" | "en";
  text: "normal" | "large" | "xl";
  contrast: boolean;
};

export type Feedback = {
  ease: number;
  clarity: number;
  savedTime: string;
  best: string;
  improve: string;
  again: string;
  createdAt: string;
};

const KEYS = {
  profile: "waraq.profile",
  docs: "waraq.docs",
  procedures: "waraq.procedures",
  settings: "waraq.settings",
  feedback: "waraq.feedback",
} as const;

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
  emit();
}

function useStored<T>(key: string, fallback: T) {
  const fallbackRef = useRef(fallback);
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  const sync = useCallback(() => {
    const next = read<T>(key, fallbackRef.current);
    setValue((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [key]);

  useEffect(() => {
    sync();
    setHydrated(true);
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, [sync]);


  const set = useCallback(
    (next: T) => {
      write(key, next);
      setValue(next);
    },
    [key],
  );

  return { value, set, hydrated };
}

export const DEFAULT_SETTINGS: Settings = { lang: "ar", text: "normal", contrast: false };

export function useSettings() {
  const { value, set } = useStored<Settings>(KEYS.settings, DEFAULT_SETTINGS);
  return { settings: value, setSettings: set };
}

export function useProfile() {
  const { value, set, hydrated } = useStored<Profile | null>(KEYS.profile, null);
  return { profile: value, setProfile: set, hydrated };
}

export function useDocs() {
  const { value, set } = useStored<StoredDoc[]>(KEYS.docs, []);
  const addDocs = (docs: StoredDoc[]) => set([...value, ...docs]);
  const removeDoc = (id: string) => set(value.filter((d) => d.id !== id));
  return { docs: value, addDocs, removeDoc, setDocs: set };
}

export function useProcedures() {
  const { value, set, hydrated } = useStored<Procedure[]>(KEYS.procedures, []);

  const upsert = (serviceId: string, patch: Partial<Procedure>) => {
    const now = new Date().toISOString();
    const existing = value.find((p) => p.serviceId === serviceId);
    const next: Procedure = {
      serviceId,
      answers: {},
      answered: false,
      done: [],
      startedAt: now,
      ...existing,
      ...patch,
      updatedAt: now,
    };
    set([next, ...value.filter((p) => p.serviceId !== serviceId)]);
    return next;
  };

  const remove = (serviceId: string) => set(value.filter((p) => p.serviceId !== serviceId));

  return { procedures: value, upsert, remove, hydrated };
}

export function useFeedback() {
  const { value, set } = useStored<Feedback[]>(KEYS.feedback, []);
  const add = (f: Feedback) => set([f, ...value]);
  return { feedback: value, addFeedback: add };
}

export function readProfile() {
  return read<Profile | null>(KEYS.profile, null);
}
