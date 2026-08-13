import { supabase } from "@/integrations/supabase/client";
import type { Profile, Procedure, StoredDoc } from "./store";

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (m.includes("email not confirmed")) {
    return "لازم تأكيد البريد الإلكتروني الأول من الرسالة المُرسلة لك.";
  }
  if (m.includes("already registered") || m.includes("already in use")) {
    return "البريد الإلكتروني هذا مسجل بالفعل. يمكنك تسجيل الدخول.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "محاولات كثيرة في وقت قصير، استنى شوية وجرّب تاني.";
  }
  return message;
}

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
      },
    },
  });

  if (signUpError) throw new Error(friendlyAuthError(signUpError.message));

  const user = data.user;
  if (!user) throw new Error("لم نتمكن من إنشاء الحساب. حاول مرة أخرى.");

  // Auth intentionally obscures duplicate-email signups by returning a user
  // without identities. Treat that as an existing account instead of trying
  // to sign in with the password from the registration form.
  if (Array.isArray(user.identities) && user.identities.length === 0) {
    throw new Error("البريد الإلكتروني هذا مسجل بالفعل. يمكنك تسجيل الدخول.");
  }

  // Ensure a session exists so the profile insert passes RLS.
  if (!data.session) {
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: params.password,
    });
    if (signInErr) throw new Error(friendlyAuthError(signInErr.message));
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      user_id: user.id,
      username: cleanUsername,
      email: cleanEmail,
      full_name: params.fullName.trim(),
      age: params.age.trim(),
      city: params.city.trim(),
      area: params.area?.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileError) {
    if (profileError.code === "23505" || profileError.message.includes("username")) {
      throw new Error("اسم المستخدم هذا مستعمل بالفعل، اختر اسم أخر.");
    }
    throw new Error("تم إنشاء الحساب لكن لم نتمكن من حفظ بياناتك. جرّب تحديث الصفحة.");
  }

  return user;
}

export async function signInWithEmail(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    console.error("Supabase login error:", error);
    console.error("[auth] sign-in failed", {
      code: error.code,
      name: error.name,
      message: error.message,
      status: error.status,
    });
    throw new Error(friendlyAuthError(error.message));
  }

  if (!data.session || !data.user) {
    console.error("[auth] sign-in returned no authenticated session", {
      hasSession: Boolean(data.session),
      hasUser: Boolean(data.user),
    });
    throw new Error("تم قبول بيانات الدخول لكن تعذر بدء الجلسة. حاول مرة أخرى.");
  }

  const { data: verified, error: verificationError } = await supabase.auth.getUser();
  if (verificationError || !verified.user || verified.user.id !== data.user.id) {
    console.error("[auth] session verification failed", verificationError);
    await supabase.auth.signOut({ scope: "local" });
    throw new Error("تعذر التحقق من جلسة الدخول. حاول مرة أخرى.");
  }

  return verified.user;
}

// Keep backward compatibility aliases
export const signUpWithUsername = signUpWithEmail;
export const signInWithUsername = signInWithEmail;

export async function signOutCurrentSession() {
  await supabase.auth.signOut();
}

export async function clearLocalSession() {
  await supabase.auth.signOut({ scope: "local" });
}

export async function fetchProfileFromCloud(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;

  const { data, error } = await supabase
    .from("profiles")
    .select("username, full_name, age, city, area")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) console.error("[profile] fetch failed:", error.message);

  if (data) {
    const area = data.area ?? meta["area"];
    return {
      username: data.username ?? meta["username"] ?? "",
      name: data.full_name || meta["full_name"] || "",
      age: data.age || meta["age"] || "",
      city: data.city || meta["city"] || "",
      ...(area ? { area } : {}),
    };
  }

  const metaArea = meta["area"];
  return {
    username: meta["username"] ?? "",
    name: meta["full_name"] ?? "",
    age: meta["age"] ?? "",
    city: meta["city"] ?? "",
    ...(metaArea ? { area: metaArea } : {}),
  };
}

export async function saveProfileToCloud(profile: Profile) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      user_id: user.id,
      username: profile.username ?? null,
      email: user.email ?? null,
      full_name: profile.name,
      age: profile.age,
      city: profile.city,
      area: profile.area?.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("[profile] save failed:", error.message);
    throw new Error("لم نتمكن من حفظ بياناتك. جرّب تاني.");
  }

  await supabase.auth.updateUser({
    data: {
      username: profile.username ?? undefined,
      full_name: profile.name,
      age: profile.age,
      city: profile.city,
      area: profile.area ?? "",
    },
  });
}

export async function fetchProceduresFromCloud(): Promise<Procedure[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("procedures")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[procedures] fetch failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const status = row.status === "completed" ? ("completed" as const) : ("in_progress" as const);
    return {
      serviceId: row.service_id,
      serviceName: row.service_name ?? row.service_id,
      status,
      progress: row.progress ?? 0,
      answers: (row.answers as Record<string, string>) ?? {},
      answered: true,
      done: Array.isArray(row.done) ? (row.done as string[]) : [],
      startedAt: row.started_at ?? row.created_at,
      updatedAt: row.updated_at,
      ...(row.completed_at ? { completedAt: row.completed_at } : {}),
    };
  });
}

export async function saveProcedureToCloud(proc: Procedure) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("سجّل الدخول لحفظ تقدمك.");

  const { error } = await supabase.from("procedures").upsert(
    {
      user_id: user.id,
      service_id: proc.serviceId,
      service_name: proc.serviceName ?? proc.serviceId,
      status: proc.status ?? (proc.progress === 100 ? "completed" : "in_progress"),
      progress: proc.progress,
      answers: proc.answers ?? {},
      done: proc.done ?? [],
      started_at: proc.startedAt,
      completed_at: proc.completedAt ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,service_id" },
  );

  if (error) {
    console.error("[procedures] save failed:", error.message);
    throw new Error("لم نتمكن من حفظ التقدم. جرّب تاني.");
  }
}

export async function deleteProcedureFromCloud(serviceId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("procedures")
    .delete()
    .eq("user_id", user.id)
    .eq("service_id", serviceId);

  if (error) {
    console.error("[procedures] delete failed:", error.message);
    throw new Error("لم نتمكن من حذف الإجراء. جرّب تاني.");
  }
}

export async function fetchDocumentsFromCloud(): Promise<StoredDoc[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[documents] fetch failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.document_type,
    type: row.file_type ?? "مستند",
    ...(row.file_name ? { fileName: row.file_name } : {}),
    uploadedAt: row.created_at,
    ...(row.expiration_date ? { expiresAt: row.expiration_date } : {}),
  }));
}

export async function saveDocumentToCloud(doc: StoredDoc) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("سجّل الدخول لحفظ مستنداتك.");

  const { error } = await supabase.from("documents").upsert(
    {
      id: doc.id,
      user_id: user.id,
      document_type: doc.name,
      file_name: doc.fileName ?? null,
      file_type: doc.type,
      expiration_date: doc.expiresAt ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("[documents] save failed:", error.message);
    throw new Error("لم نتمكن من حفظ المستند. جرّب تاني.");
  }
}

export async function deleteDocumentFromCloud(docId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("user_id", user.id)
    .eq("id", docId);

  if (error) {
    console.error("[documents] delete failed:", error.message);
    throw new Error("لم نتمكن من حذف المستند. جرّب تاني.");
  }
}
