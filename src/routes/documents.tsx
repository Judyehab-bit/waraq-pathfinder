import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Trash2, Upload, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AppShell from "@/components/waraq/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDocs, type StoredDoc } from "@/lib/waraq/store";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "أوراقي — WARAQ" },
      {
        name: "description",
        content: "محفظة أوراقك: نوع المستند، تاريخ الإضافة، وتاريخ الانتهاء والتنبيهات.",
      },
      { property: "og:title", content: "أوراقي في WARAQ" },
      { property: "og:description", content: "شوف الأوراق اللي معاك واللي قربت تنتهي." },
    ],
  }),
  component: Documents,
});

const TYPES = [
  "بطاقة الرقم القومي",
  "شهادة الميلاد المميكنة",
  "جواز سفر",
  "رخصة قيادة",
  "صور شخصية",
  "أخرى",
];

function statusOf(doc: StoredDoc) {
  if (!doc.expiresAt) return { label: "سارية", tone: "success" as const };
  const days = Math.ceil((new Date(doc.expiresAt).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "انتهت — محتاجة تجديد", tone: "destructive" as const };
  if (days < 180)
    return {
      label: `بتنتهي بعد ${Math.max(1, Math.round(days / 30))} شهر`,
      tone: "warning" as const,
    };
  return { label: "سارية", tone: "success" as const };
}

function Documents() {
  const { docs, addDocs, removeDoc, setDocs } = useDocs();
  const [type, setType] = useState(TYPES[0]!);
  const [expires, setExpires] = useState("");

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const ok: StoredDoc[] = [];
    for (const f of files) {
      if (
        !(f.type === "application/pdf" || f.type.startsWith("image/")) ||
        f.size > 5 * 1024 * 1024
      ) {
        toast.error("الملف مرفعش. جرّب صورة أو PDF أصغر.");
        continue;
      }
      ok.push({
        id: crypto.randomUUID(),
        name: type,
        type: f.type === "application/pdf" ? "PDF" : "صورة",
        fileName: f.name,
        uploadedAt: new Date().toISOString(),
        ...(expires ? { expiresAt: expires } : {}),
      });
    }
    if (ok.length) {
      addDocs(ok);
      toast.success("تمت الإضافة لمحفظتك");
      setExpires("");
    }
    e.target.value = "";
  }

  return (
    <AppShell>
      <div className="animate-rise space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">أوراقي</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            محفظة بسيطة على جهازك بس. الملفات نفسها مش بتترفع على أي سيرفر في النسخة التجريبية.
          </p>
        </div>

        <div className="card-soft space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>نوع المستند</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-2 min-h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="exp">تاريخ الانتهاء (اختياري)</Label>
              <Input
                id="exp"
                type="date"
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                className="mt-2 min-h-12 rounded-xl"
              />
            </div>
          </div>
          <label className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90">
            <Upload className="size-4" aria-hidden="true" />
            أضف مستند
            <input
              type="file"
              accept="application/pdf,image/*"
              multiple
              onChange={onFiles}
              className="sr-only"
            />
          </label>
        </div>

        {docs.length === 0 ? (
          <div className="card-soft p-8 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 font-bold">محفظتك فاضية</p>
            <p className="mt-1 text-sm text-muted-foreground">
              أضف الأوراق اللي معاك عشان نعرف إيه الناقص.
            </p>
            <Button asChild variant="outline" className="mt-4 min-h-12 rounded-2xl">
              <Link to="/services">اختار خدمة</Link>
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {docs.map((d) => {
              const st = statusOf(d);
              return (
                <li key={d.id} className="card-soft p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-foreground">{d.name}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {d.type} · أُضيف {new Date(d.uploadedAt).toLocaleDateString("ar-EG")}
                      </p>
                      {d.fileName ? (
                        <p className="mt-1 truncate text-xs text-muted-foreground">{d.fileName}</p>
                      ) : null}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`حذف ${d.name}`}
                      onClick={() => {
                        removeDoc(d.id);
                        toast.success("تم حذف المستند من محفظتك");
                      }}
                      className="min-h-11 min-w-11 shrink-0 text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                  <Badge className="mt-3" variant={st.tone === "success" ? "secondary" : "outline"}>
                    {st.tone !== "success" ? (
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                    ) : null}
                    {st.label}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}

        {docs.length > 0 && (
          <Button
            variant="outline"
            className="min-h-12 w-full rounded-2xl text-destructive"
            onClick={() => {
              setDocs([]);
              toast.success("تم مسح كل الأوراق من جهازك");
            }}
          >
            مسح كل الأوراق
          </Button>
        )}
      </div>
    </AppShell>
  );
}
