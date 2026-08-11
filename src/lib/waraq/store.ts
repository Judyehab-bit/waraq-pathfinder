import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getService, requiredDocsFor } from "./services";
import {
  fetchProfileFromCloud,
  saveProfileToCloud,
  fetchProceduresFromCloud,
  saveProcedureToCloud,
  deleteProcedureFromCloud,
  fetchDocumentsFromCloud,
  saveDocumentToCloud,
  deleteDocumentFromCloud,
} from "./profile-sync";

export type Profile = {
  username?: string;
  name: string;
  age: string;
  city: string;
  area?: string;
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
  serviceName?: string;
  status?: "in_progress" | "completed";
  progress: number;
  answers: Record<string, string>;
  answered: boolean;
  done: string[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
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
  settings: "waraq.settings",
  feedback: "waraq.feedback",
} as const;

/** Canonical single-source-of-truth progress calculation for a procedure */
export function calculateProcedureProgress(
  serviceId: string,
  answers: Record<string, string>,
  doneDocIds: string[],
) {
  const service = getService(serviceId);
  if (!service) {
    return {
      progress: 0,
      status: "in_progress" as const,
      isComplete: false,
      requiredCount: 0,
      doneCount: 0,
    };
  }

  const required = requiredDocsFor(service, answers);
  const doneCount = doneDocIds.filter((id) => required.some((d) => d.id === id)).length;
  const isComplete = required.length > 0 && doneCount === required.length;
  const progress = required.length ? Math.round((doneCount / required.length) * 100) : 0;
  const status = isComplete ? ("completed" as const) : ("in_progress" as const);

  return {
    progress,
    status,
    isComplete,
    requiredCount: required.length,
    doneCount,
  };
}

// Global in-memory state shared across components
let globalProfile: Profile | null = null;
let globalProcedures: Procedure[] = [];
let globalDocs: StoredDoc[] = [];

const stateListeners = new Set<() => void>();
function notifyListeners() {
  stateListeners.forEach((fn) => fn());
}

export function DEFAULT_SETTINGS(): Settings {
  return { lang: "ar", text: "normal", contrast: false };
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS();
    try {
      const raw = localStorage.getItem(KEYS.settings);
      return raw ? JSON.parse(raw) : DEFAULT_SETTINGS();
    } catch {
      return DEFAULT_SETTINGS();
    }
  });

  const setSettings = useCallback((next: Settings) => {
    setSettingsState(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(KEYS.settings, JSON.stringify(next));
      } catch (err) {
        console.error("Failed to write settings to localStorage:", err);
      }
    }
  }, []);

  return { settings, setSettings };
}

export function useAuthUser() {
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setLoading(false);

      if (!nextUser) {
        // Clear global state on logout
        globalProfile = null;
        globalProcedures = [];
        globalDocs = [];
        notifyListeners();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useProfile() {
  const [profile, setProfileState] = useState<Profile | null>(globalProfile);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const p = await fetchProfileFromCloud();
      globalProfile = p;
      setProfileState(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();

    const updateFromGlobal = () => setProfileState(globalProfile);
    stateListeners.add(updateFromGlobal);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) {
        loadProfile();
      } else {
        globalProfile = null;
        setProfileState(null);
        setLoading(false);
      }
    });

    return () => {
      stateListeners.delete(updateFromGlobal);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const setProfile = useCallback(async (next: Profile) => {
    globalProfile = next;
    setProfileState(next);
    notifyListeners();
    try {
      await saveProfileToCloud(next);
    } catch (e) {
      console.error("Failed to sync profile:", e);
    }
  }, []);

  return { profile, setProfile, loading, refreshProfile: loadProfile };
}

export function useProcedures() {
  const [procedures, setProceduresState] = useState<Procedure[]>(globalProcedures);
  const [loading, setLoading] = useState(true);

  const loadProcedures = useCallback(async () => {
    try {
      const procs = await fetchProceduresFromCloud();
      globalProcedures = procs;
      setProceduresState(procs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProcedures();

    const updateFromGlobal = () => setProceduresState(globalProcedures);
    stateListeners.add(updateFromGlobal);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) {
        loadProcedures();
      } else {
        globalProcedures = [];
        setProceduresState([]);
        setLoading(false);
      }
    });

    return () => {
      stateListeners.delete(updateFromGlobal);
      subscription.unsubscribe();
    };
  }, [loadProcedures]);

  const upsert = useCallback(async (serviceId: string, patch: Partial<Procedure>) => {
    const service = getService(serviceId);
    const now = new Date().toISOString();
    const existing = globalProcedures.find((p) => p.serviceId === serviceId);

    const answers = patch.answers ?? existing?.answers ?? {};
    const done = patch.done ?? existing?.done ?? [];
    const { progress, status, isComplete } = calculateProcedureProgress(serviceId, answers, done);

    const next: Procedure = {
      serviceId,
      serviceName: service?.serviceName || serviceId,
      answers,
      answered: patch.answered ?? existing?.answered ?? true,
      done,
      status: patch.status ?? status,
      progress,
      startedAt: existing?.startedAt ?? now,
      updatedAt: now,
      completedAt: isComplete ? now : existing?.completedAt,
    };

    const updatedList = [next, ...globalProcedures.filter((p) => p.serviceId !== serviceId)];
    globalProcedures = updatedList;
    setProceduresState(updatedList);
    notifyListeners();

    try {
      await saveProcedureToCloud(next);
    } catch (e) {
      console.error("Failed to save procedure:", e);
    }

    return next;
  }, []);

  const remove = useCallback(async (serviceId: string) => {
    const nextList = globalProcedures.filter((p) => p.serviceId !== serviceId);
    globalProcedures = nextList;
    setProceduresState(nextList);
    notifyListeners();

    try {
      await deleteProcedureFromCloud(serviceId);
    } catch (e) {
      console.error("Failed to delete procedure:", e);
    }
  }, []);

  return { procedures, upsert, remove, loading, refreshProcedures: loadProcedures };
}

export function useDocs() {
  const [docs, setDocsState] = useState<StoredDoc[]>(globalDocs);
  const [loading, setLoading] = useState(true);

  const loadDocs = useCallback(async () => {
    try {
      const d = await fetchDocumentsFromCloud();
      globalDocs = d;
      setDocsState(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocs();

    const updateFromGlobal = () => setDocsState(globalDocs);
    stateListeners.add(updateFromGlobal);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) {
        loadDocs();
      } else {
        globalDocs = [];
        setDocsState([]);
        setLoading(false);
      }
    });

    return () => {
      stateListeners.delete(updateFromGlobal);
      subscription.unsubscribe();
    };
  }, [loadDocs]);

  const addDocs = useCallback(async (newDocs: StoredDoc[]) => {
    const updatedList = [...globalDocs, ...newDocs];
    globalDocs = updatedList;
    setDocsState(updatedList);
    notifyListeners();

    for (const d of newDocs) {
      try {
        await saveDocumentToCloud(d);
      } catch (e) {
        console.error("Failed to save doc:", e);
      }
    }
  }, []);

  const removeDoc = useCallback(async (id: string) => {
    const updatedList = globalDocs.filter((d) => d.id !== id);
    globalDocs = updatedList;
    setDocsState(updatedList);
    notifyListeners();

    try {
      await deleteDocumentFromCloud(id);
    } catch (e) {
      console.error("Failed to delete doc:", e);
    }
  }, []);

  const setDocs = useCallback(async (nextDocs: StoredDoc[]) => {
    const prev = globalDocs;
    globalDocs = nextDocs;
    setDocsState(nextDocs);
    notifyListeners();

    if (nextDocs.length === 0) {
      for (const d of prev) {
        try {
          await deleteDocumentFromCloud(d.id);
        } catch (e) {
          console.error("Failed to clear doc:", e);
        }
      }
    }
  }, []);

  return { docs, addDocs, removeDoc, setDocs, loading, refreshDocs: loadDocs };
}

export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const addFeedback = (f: Feedback) => setFeedback((prev) => [f, ...prev]);
  return { feedback, addFeedback };
}

export function readProfile(): Profile | null {
  return globalProfile;
}
