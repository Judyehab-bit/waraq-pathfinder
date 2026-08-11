import { supabase } from "@/integrations/supabase/client";
import type { Profile, Procedure, StoredDoc } from "./store";

export async function signUpWithEmail(params: {
  username: string;
  email: string;
  password: string;
  fullName: string;
  age: string;
  city: string;
  area?: string;
}) {
  const cleanUsername = params.username.trim();
  const cleanEmail = params.email.trim().toLowerCase();

  // Check if username is already taken in profiles (if column exists)
  try {
    const { data: existingProfiles, error: checkError } = await supabase
      .from("profiles")
      .select("username")
      .ilike("username", cleanUsername)
      .limit(1);

    if (!checkError && existingProfiles && existingProfiles.length > 0) {
      throw new Error("اسم المستخدم هذا مستعمل بالفعل، اختر اسم أخر.");
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("مستعمل بالفعل")) {
      throw err;
    }
  }

  const { data, error: signUpError } = await supabase.auth.signUp({
    email: cleanEmail,
    password: params.password,
    options: {
      data: {
        username: cleanUsername,
        full_name: params.fullName.trim(),
        age: params.age.trim(),
        city: params.city.trim(),
        area: params.area?.trim() || "",
        procedures: [],
        documents: [],
      },
    },
  });

  if (signUpError) {
    if (
      signUpError.message.toLowerCase().includes("already registered") ||
      signUpError.message.toLowerCase().includes("already in use")
    ) {
      throw new Error("البريد الإلكتروني هذا مسجل بالفعل. يمكنك تسجيل الدخول.");
    }
    throw signUpError;
  }

  const user = data.user;
  if (!user) {
    throw new Error("لم نتمكن من إنشاء الحساب. حاول مرة أخرى.");
  }

  // If signUp succeeded but session is null, attempt immediate sign-in
  if (!data.session) {
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: params.password,
    });
    if (signInErr) {
      console.warn("Immediate sign-in after sign-up:", signInErr.message);
    }
  }

  // Create profile row linked strictly by user.id
  const baseProfileRow: Record<string, unknown> = {
    id: user.id,
    user_id: user.id,
    username: cleanUsername,
    full_name: params.fullName.trim(),
    age: params.age.trim(),
    city: params.city.trim(),
    area: params.area?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ ...baseProfileRow, email: cleanEmail }, { onConflict: "id" });

  if (
    profileError &&
    (profileError.code === "PGRST204" ||
      profileError.message.includes("email") ||
      profileError.message.includes("username"))
  ) {
    const { error: retryError } = await supabase
      .from("profiles")
      .upsert(baseProfileRow, { onConflict: "id" });
    if (retryError) {
      console.warn("Profile creation fallback notice:", retryError.message);
    }
  } else if (profileError) {
    console.warn("Profile creation notice:", profileError.message);
  }

  return user;
}

export async function signInWithEmail(emailOrUsername: string, password: string) {
  const cleanInput = emailOrUsername.trim();
  let targetEmail = cleanInput.toLowerCase();

  // If the user entered a username instead of an email, look up the profile email
  if (!cleanInput.includes("@")) {
    try {
      const { data: matchedProfiles, error: matchErr } = await supabase
        .from("profiles")
        .select("email, username")
        .ilike("username", cleanInput)
        .limit(1);

      if (!matchErr && matchedProfiles?.[0]?.email) {
        targetEmail = matchedProfiles[0].email;
      }
    } catch {
      // Ignore if email column is absent on profiles
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: targetEmail,
    password,
  });

  if (error) {
    throw new Error("البريد الإلكتروني / اسم المستخدم أو كلمة المرور غير صحيحة.");
  }

  return data.user;
}

// Keep backward compatibility aliases
export const signUpWithUsername = signUpWithEmail;
export const signInWithUsername = signInWithEmail;

export async function signOutCurrentSession() {
  await supabase.auth.signOut();
}

export async function fetchProfileFromCloud(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      return {
        username: data.username || user.user_metadata?.username || "",
        name: data.full_name || user.user_metadata?.full_name || "",
        age: data.age || user.user_metadata?.age || "",
        city: data.city || user.user_metadata?.city || "",
        area: data.area || user.user_metadata?.area || undefined,
      };
    }
  } catch {
    // Fallback to user_metadata
  }

  const meta = user.user_metadata || {};
  return {
    username: meta.username || "",
    name: meta.full_name || "",
    age: meta.age || "",
    city: meta.city || "",
    area: meta.area || undefined,
  };
}

export async function saveProfileToCloud(profile: Profile) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const baseRow: Record<string, unknown> = {
    id: user.id,
    user_id: user.id,
    username: profile.username || undefined,
    full_name: profile.name,
    age: profile.age,
    city: profile.city,
    area: profile.area?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  try {
    await supabase.from("profiles").upsert(baseRow, { onConflict: "id" });
  } catch {
    // Ignore
  }

  await supabase.auth.updateUser({
    data: {
      username: profile.username || user.user_metadata?.username,
      full_name: profile.name,
      age: profile.age,
      city: profile.city,
      area: profile.area,
    },
  });
}

export async function fetchProceduresFromCloud(): Promise<Procedure[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Try DB table first
  try {
    const { data, error } = await supabase
      .from("procedures")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((row: Record<string, unknown>) => ({
        serviceId: String(row.service_id),
        serviceName: String(row.service_name || row.service_id),
        status: (row.status as "in_progress" | "completed") || "in_progress",
        progress: Number(row.progress) || 0,
        answers: (row.answers as Record<string, string>) || {},
        answered: true,
        done: (row.done as string[]) || [],
        startedAt: String(row.created_at || row.started_at || new Date().toISOString()),
        updatedAt: String(row.updated_at || new Date().toISOString()),
        completedAt: row.completed_at ? String(row.completed_at) : undefined,
      }));
    }
  } catch {
    // Table absent or error
  }

  // Fallback to user.user_metadata.procedures
  const metaProcs = (user.user_metadata?.procedures as Procedure[]) || [];
  return metaProcs;
}

export async function saveProcedureToCloud(proc: Procedure) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // 1. Save to procedures table if available
  try {
    await supabase.from("procedures").upsert(
      {
        user_id: user.id,
        service_id: proc.serviceId,
        service_name: proc.serviceName || proc.serviceId,
        status: proc.status || (proc.progress === 100 ? "completed" : "in_progress"),
        progress: proc.progress,
        answers: proc.answers || {},
        done: proc.done || [],
        updated_at: new Date().toISOString(),
        ...(proc.completedAt ? { completed_at: proc.completedAt } : {}),
      },
      { onConflict: "user_id,service_id" },
    );
  } catch {
    // Ignore
  }

  // 2. Save to user_metadata on auth.users (strictly tied to user.id)
  const currentProcs = (user.user_metadata?.procedures as Procedure[]) || [];
  const existingIdx = currentProcs.findIndex((p) => p.serviceId === proc.serviceId);
  let updatedProcs: Procedure[];

  if (existingIdx >= 0) {
    updatedProcs = [...currentProcs];
    updatedProcs[existingIdx] = proc;
  } else {
    updatedProcs = [proc, ...currentProcs];
  }

  await supabase.auth.updateUser({
    data: {
      procedures: updatedProcs,
    },
  });
}

export async function deleteProcedureFromCloud(serviceId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from("procedures").delete().eq("user_id", user.id).eq("service_id", serviceId);
  } catch {
    // Ignore
  }

  const currentProcs = (user.user_metadata?.procedures as Procedure[]) || [];
  const filtered = currentProcs.filter((p) => p.serviceId !== serviceId);

  await supabase.auth.updateUser({
    data: {
      procedures: filtered,
    },
  });
}

export async function fetchDocumentsFromCloud(): Promise<StoredDoc[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((row: Record<string, unknown>) => ({
        id: String(row.id),
        name: String(row.document_type),
        type: String(row.file_type || "مستند"),
        fileName: row.file_name ? String(row.file_name) : undefined,
        uploadedAt: String(row.created_at),
        expiresAt: row.expiration_date ? String(row.expiration_date) : undefined,
      }));
    }
  } catch {
    // Table absent or error
  }

  const metaDocs = (user.user_metadata?.documents as StoredDoc[]) || [];
  return metaDocs;
}

export async function saveDocumentToCloud(doc: StoredDoc) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from("documents").insert({
      id: doc.id,
      user_id: user.id,
      document_type: doc.name,
      file_name: doc.fileName || null,
      file_type: doc.type,
      expiration_date: doc.expiresAt || null,
    });
  } catch {
    // Ignore
  }

  const currentDocs = (user.user_metadata?.documents as StoredDoc[]) || [];
  const filtered = currentDocs.filter((d) => d.id !== doc.id);
  const updatedDocs = [doc, ...filtered];

  await supabase.auth.updateUser({
    data: {
      documents: updatedDocs,
    },
  });
}

export async function deleteDocumentFromCloud(docId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from("documents").delete().eq("user_id", user.id).eq("id", docId);
  } catch {
    // Ignore
  }

  const currentDocs = (user.user_metadata?.documents as StoredDoc[]) || [];
  const filtered = currentDocs.filter((d) => d.id !== docId);

  await supabase.auth.updateUser({
    data: {
      documents: filtered,
    },
  });
}
