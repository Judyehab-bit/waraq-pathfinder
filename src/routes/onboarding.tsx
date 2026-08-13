import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Lock, Trash2, LogIn, UserPlus, ShieldCheck } from "lucide-react";
import AppShell from "@/components/waraq/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GOVERNORATES } from "@/lib/waraq/services";
import { useDocs, useProfile, useAuthUser, type StoredDoc } from "@/lib/waraq/store";
import { signUpWithUsername, signInWithUsername } from "@/lib/waraq/profile-sync";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "حساب WARAQ — تسجيل الدخول أو إنشاء حساب" },
      {
        name: "description",
        content: "أنشئ حسابك في WARAQ باسم المستخدم وكلمة المرور لمتابعة خطوات وإجراءات أوراقك.",
      },
      { property: "og:title", content: "حساب WARAQ" },
      { property: "og:description", content: "سجل دخولك أو أنشئ حسابك وحافظ على متابعة إجراءاتك." },
    ],
  }),
  component: Onboarding,
});

const DOC_TYPES = [
  "بطاقة الرقم القومي",
  "شهادة الميلاد المميكنة",
  "جواز سفر",
  "رخصة قيادة",
  "صور شخصية",
  "أخرى",
];

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const { profile, refreshProfile } = useProfile();
  const { docs, addDocs, removeDoc } = useDocs();

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("القاهرة");
  const [area, setArea] = useState("");
  const [docType, setDocType] = useState(DOC_TYPES[0]!);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && profile) {
      // User is already logged in
      toast.info(`مرحباً بك مجدداً يا ${profile.name || profile.username}`);
    }
  }, [user, profile]);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const ok: StoredDoc[] = [];
    for (const f of files) {
      const isAllowed = f.type === "application/pdf" || f.type.startsWith("image/");
      if (!isAllowed || f.size > 5 * 1024 * 1024) {
        toast.error("الملف مرفعش. جرّب صورة أو PDF أصغر.");
        continue;
      }
      ok.push({
        id: crypto.randomUUID(),
        name: docType,
        type: f.type === "application/pdf" ? "PDF" : "صورة",
        fileName: f.name,
        uploadedAt: new Date().toISOString(),
      });
    }
    if (ok.length) {
      addDocs(ok);
      toast.success(`اتسجل ${ok.length} مستند في محفظتك`);
    }
    e.target.value = "";
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const nextErrs: Record<string, string> = {};

    if (!username.trim() || username.trim().length < 3) {
      nextErrs["username"] = "اكتب اسم مستخدم من 3 حروف أو أرقام على الأقل.";
    }
    if (!email.trim() || !email.includes("@")) {
      nextErrs["email"] = "اكتب بريد إلكتروني صحيح (مثال: user@example.com).";
    }
    if (!password || password.length < 6) {
      nextErrs["password"] = "كلمة المرور يجب أن تكون 6 خانات على الأقل.";
    }
    if (password !== confirmPassword) {
      nextErrs["confirmPassword"] = "كلمتا المرور غير متطابقتين.";
    }
    if (!name.trim()) {
      nextErrs["name"] = "اكتب اسمك الكامل.";
    }
    if (!age.trim() || Number(age) < 5 || Number(age) > 110) {
      nextErrs["age"] = "اكتب سن صحيح.";
    }
    if (!city) {
      nextErrs["city"] = "اختار المحافظة.";
    }

    setErrors(nextErrs);
    if (Object.keys(nextErrs).length > 0) return;

    setSubmitting(true);
    try {
      await signUpWithUsername({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        fullName: name.trim(),
        age: age.trim(),
        city,
        area: area.trim(),
      });
      await refreshProfile();
      toast.success("تم إنشاء الحساب بنجاح! أهلاً بيك في WARAQ 👋");
      navigate({ to: "/services" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const nextErrs: Record<string, string> = {};

    const identifier = loginIdentifier.trim().toLowerCase();

    if (!identifier || !identifier.includes("@")) {
      nextErrs["loginIdentifier"] = "اكتب البريد الإلكتروني المسجل به حسابك.";
    }
    if (!password) {
      nextErrs["password"] = "اكتب كلمة المرور.";
    }

    setErrors(nextErrs);
    if (Object.keys(nextErrs).length > 0) return;

    setSubmitting(true);
    try {
      const authenticatedUser = await signInWithUsername(identifier, password);
      if (!authenticatedUser) {
        throw new Error("تعذر التحقق من جلسة الدخول. حاول مرة أخرى.");
      }
      await refreshProfile();
      toast.success("تم تسجيل الدخول بنجاح! مرحباً بعودتك 👋");
      navigate({ to: "/services" });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "البريد الإلكتروني / اسم المستخدم أو كلمة المرور غير صحيحة.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell showChat={false}>
      <div className="animate-rise mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {mode === "signup" ? "أنشئ حسابك في WARAQ" : "تسجيل الدخول إلى حسابك"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "بيانات حسابك لحفظ خطوات أوراقك ومتابعة تقدمك من أي جهاز."
              : "ادخل البريد الإلكتروني وكلمة المرور لمتابعة إجراءاتك."}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex rounded-2xl bg-secondary p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrors({});
            }}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
              mode === "signup"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="ml-1.5 inline-block size-4" aria-hidden="true" />
            أنشئ حساب جديد
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrors({});
            }}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
              mode === "login"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LogIn className="ml-1.5 inline-block size-4" aria-hidden="true" />
            تسجيل الدخول
          </button>
        </div>

        {mode === "login" ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="card-soft space-y-5 p-5">
            <div>
              <Label htmlFor="login-identifier">البريد الإلكتروني</Label>
              <Input
                id="login-identifier"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="مثال: user@example.com"
                className="mt-2 min-h-12 rounded-xl"
                aria-invalid={Boolean(errors["loginIdentifier"])}
              />
              {errors["loginIdentifier"] && (
                <p className="mt-1 text-sm text-destructive">⚠ {errors["loginIdentifier"]}</p>
              )}
            </div>

            <div>
              <Label htmlFor="login-password">كلمة المرور</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 min-h-12 rounded-xl"
                aria-invalid={Boolean(errors["password"])}
              />
              {errors["password"] && (
                <p className="mt-1 text-sm text-destructive">⚠ {errors["password"]}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="min-h-14 w-full rounded-2xl text-base font-bold"
            >
              {submitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="card-soft space-y-5 p-5">
              <h2 className="text-base font-bold text-foreground">بيانات الحساب الأساسية</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="username">اسم المستخدم (Username)</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="اختر اسم مستخدم متميز"
                    className="mt-2 min-h-12 rounded-xl"
                    aria-invalid={Boolean(errors["username"])}
                  />
                  {errors["username"] && (
                    <p className="mt-1 text-sm text-destructive">⚠ {errors["username"]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">البريد الإلكتروني (Email)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="mt-2 min-h-12 rounded-xl"
                    aria-invalid={Boolean(errors["email"])}
                  />
                  {errors["email"] && (
                    <p className="mt-1 text-sm text-destructive">⚠ {errors["email"]}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 min-h-12 rounded-xl"
                    aria-invalid={Boolean(errors["password"])}
                  />
                  {errors["password"] && (
                    <p className="mt-1 text-sm text-destructive">⚠ {errors["password"]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2 min-h-12 rounded-xl"
                    aria-invalid={Boolean(errors["confirmPassword"])}
                  />
                  {errors["confirmPassword"] && (
                    <p className="mt-1 text-sm text-destructive">⚠ {errors["confirmPassword"]}</p>
                  )}
                </div>
              </div>

              <hr className="border-border" />

              <h2 className="text-base font-bold text-foreground">البيانات الشخصية</h2>

              <div>
                <Label htmlFor="name">الاسم بالكامل</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  placeholder="مثال: أحمد محمد"
                  className="mt-2 min-h-12 rounded-xl"
                  aria-invalid={Boolean(errors["name"])}
                />
                {errors["name"] && (
                  <p className="mt-1 text-sm text-destructive">⚠ {errors["name"]}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="age">السن</Label>
                  <Input
                    id="age"
                    type="number"
                    inputMode="numeric"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="مثال: 25"
                    className="mt-2 min-h-12 rounded-xl"
                    aria-invalid={Boolean(errors["age"])}
                  />
                  {errors["age"] && (
                    <p className="mt-1 text-sm text-destructive">⚠ {errors["age"]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">المحافظة</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger id="city" className="mt-2 min-h-12 rounded-xl">
                      <SelectValue placeholder="اختار المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOVERNORATES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors["city"] && (
                    <p className="mt-1 text-sm text-destructive">⚠ {errors["city"]}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="area">المنطقة أو الحي (اختياري)</Label>
                <Input
                  id="area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="مثال: المعادي / سموحة"
                  className="mt-2 min-h-12 rounded-xl"
                />
              </div>
            </div>

            {/* OPTIONAL DOCUMENT UPLOAD SECTION */}
            <div className="card-soft space-y-4 p-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">عندك أوراق بالفعل؟ (اختياري)</h2>
                <p className="mt-1 text-sm text-accent font-semibold">
                  لو عندك أي ورق معاك بالفعل وحابب تضيفه لملفاتك، ممكن ترفعه هنا.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  رفع المستندات اختياري تمامًا، والمستندات المرفوعة بتنضاف لمحفظة أوراقك في WARAQ
                  عشان نحدد إيه اللي ناقصك فقط.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger className="min-h-12 rounded-xl" aria-label="نوع المستند">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">
                  <Upload className="size-4" aria-hidden="true" />
                  اختار ملف
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    multiple
                    onChange={onFiles}
                    className="sr-only"
                  />
                </label>
              </div>

              {docs.length > 0 && (
                <ul className="space-y-2">
                  {docs.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm">
                        {d.name} · <span className="text-muted-foreground">{d.type}</span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`حذف ${d.name}`}
                        onClick={() => removeDoc(d.id)}
                        className="min-h-10 min-w-10 shrink-0 text-destructive"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <p className="flex items-start gap-2 rounded-xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                معلوماتك ومستنداتك محفوظة بأمان في حسابك الخاص بيك فقط، ولا يمكن لأي مستخدم آخر
                الوصول إليها.
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="min-h-14 w-full rounded-2xl text-base font-bold"
            >
              {submitting ? "جاري إنشاء الحساب..." : "إنشاء الحساب وبدء الاستخدام"}
            </Button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
