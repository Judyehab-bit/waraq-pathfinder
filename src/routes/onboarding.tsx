import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Upload, Lock, Trash2 } from "lucide-react";
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
import { useDocs, useProfile, type StoredDoc } from "@/lib/waraq/store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "ابدأ مع WARAQ — بياناتك وأوراقك" },
      {
        name: "description",
        content: "اكتب اسمك ومحافظتك، وارفع أوراقك اختياريًا عشان WARAQ يحدد إيه اللي ناقصك.",
      },
      { property: "og:title", content: "ابدأ مع WARAQ" },
      { property: "og:description", content: "خطوة واحدة بسيطة وبعدها نجهّز خطواتك." },
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
  const { setProfile } = useProfile();
  const { docs, addDocs, removeDoc } = useDocs();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [docType, setDocType] = useState(DOC_TYPES[0]!);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function askLocation() {
    if (!("geolocation" in navigator)) {
      toast.info("مفيش مشكلة! تقدر تختار المحافظة والمنطقة يدويًا.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("تمام! هنستخدم موقعك عشان نقرّبلك الأماكن.");
      },
      () => toast.info("مفيش مشكلة! تقدر تختار المحافظة والمنطقة يدويًا."),
    );
  }

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next["name"] = "اكتب اسمك عشان نكلمك باسمك.";
    if (!age.trim() || Number(age) < 5 || Number(age) > 110) next["age"] = "اكتب سن صحيح.";
    if (!city) next["city"] = "اختار المحافظة.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const data = { name: name.trim(), age, city, area: area.trim(), geo };
    setProfile(data);
    try {
      await saveProfileToCloud(data);
    } catch {
      toast.error("مقدرناش نحفظ بياناتك دلوقتي. بياناتك محفوظة على جهازك، جرّب تاني بعد شوية.");
      return;
    }
    toast.success("أهلاً بيك في WARAQ 👋");
    navigate({ to: "/services" });
  }

  return (
    <AppShell showChat={false}>
      <form onSubmit={submit} className="animate-rise mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">نتعرف عليك بسرعة</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            3 حقول بس، وبعدها نجهّز خطواتك على مقاس حالتك.
          </p>
        </div>

        <div className="card-soft space-y-5 p-5">
          <div>
            <Label htmlFor="name">الاسم بالكامل</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="mt-2 min-h-12 rounded-xl"
              aria-invalid={Boolean(errors["name"])}
              aria-describedby={errors["name"] ? "name-err" : undefined}
            />
            {errors["name"] && (
              <p id="name-err" className="mt-1 text-sm text-destructive">
                ⚠ {errors["name"]}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="age">السن</Label>
            <Input
              id="age"
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-2 min-h-12 rounded-xl"
              aria-invalid={Boolean(errors["age"])}
              aria-describedby={errors["age"] ? "age-err" : undefined}
            />
            {errors["age"] && (
              <p id="age-err" className="mt-1 text-sm text-destructive">
                ⚠ {errors["age"]}
              </p>
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

          <div>
            <Label htmlFor="area">المنطقة أو الحي (اختياري)</Label>
            <Input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="mt-2 min-h-12 rounded-xl"
            />
          </div>

          <div className="rounded-2xl bg-secondary/60 p-4">
            <p className="text-sm text-secondary-foreground">
              هنستخدم موقعك فقط عشان نساعدك تلاقي أقرب مكان تقدر تطلع منه الورق اللي محتاجه.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={askLocation}
              className="mt-3 min-h-12 rounded-xl bg-card"
            >
              <MapPin className="size-4" aria-hidden="true" />
              {geo ? "تم تحديد موقعك ✔" : "اسمح بالموقع (اختياري)"}
            </Button>
          </div>
        </div>

        <div className="card-soft space-y-4 p-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">عندك أوراق بالفعل؟</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ارفعها هنا واختار إيه اللي معاك، وهنستخدمها عشان نحدد إيه اللي ناقصك.
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
            معلوماتك الشخصية ومستنداتك حساسة. لا ترفع أي مستند إلا إذا كنت مرتاحًا لذلك. في هذه النسخة
            التجريبية بيتم تسجيل اسم ونوع المستند على جهازك فقط، وملفاتك مش بتترفع على أي سيرفر.
          </p>
        </div>

        <Button type="submit" size="lg" className="min-h-14 w-full rounded-2xl text-base font-bold">
          كمّل
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-12 w-full rounded-2xl"
          onClick={() => {
            setProfile({ name: name.trim() || "صديقنا", age: age || "—", city: city || "القاهرة", geo: null });
            navigate({ to: "/services" });
          }}
        >
          تخطّي رفع الأوراق ودخول مباشر
        </Button>
      </form>
    </AppShell>
  );
}
