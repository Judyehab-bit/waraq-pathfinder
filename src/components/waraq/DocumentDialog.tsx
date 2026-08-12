import { useState } from "react";
import {
  BadgeCheck,
  Clock,
  Coins,
  ExternalLink,
  MapPin,
  Printer,
  Stamp,
  Volume2,
  Accessibility,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { DocumentDetail } from "@/lib/waraq/types";
import { placesFor } from "@/lib/waraq/services";
import { useProfile } from "@/lib/waraq/store";

function Row({
  Icon,
  label,
  value,
}: {
  Icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-secondary/50 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
      <p className="text-sm">
        <span className="font-bold">{label}: </span>
        <span className="text-muted-foreground">{value}</span>
      </p>
    </div>
  );
}

export default function DocumentDialog({
  doc,
  open,
  onOpenChange,
  onHave,
  have,
}: {
  doc: DocumentDetail | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onHave: () => void;
  have: boolean;
}) {
  const { profile } = useProfile();
  const [speaking, setSpeaking] = useState(false);

  if (!doc) return null;
  const places = placesFor(profile?.city ?? "", profile?.area);
  const relevant = places.filter((p) => {
    if (doc.id === "photos") return p.type === "استوديو تصوير" || p.type === "طباعة وخدمات";
    if (doc.id === "medical" || doc.id === "drivingTest") return p.name.includes("المرور");
    if (doc.id === "form") return p.type === "طباعة وخدمات" || p.type === "جهة حكومية";
    return p.type === "جهة حكومية" || p.type === "بنك";
  });

  function readAloud() {
    if (!doc) return;
    const text = [
      doc.name,
      doc.why,
      `تجيبها من: ${doc.where}`,
      ...(doc.howTo ?? []),
      `التكلفة ${doc.cost}. المدة ${doc.time}.`,
    ].join(". ");
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ar-EG";
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }

  function printForm() {
    if (!doc) return;
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
      <title>${doc.name} — نموذج تحضيري من WARAQ</title>
      <style>body{font-family:system-ui,sans-serif;padding:32px;line-height:2;color:#123}
      h1{font-size:22px} .line{border-bottom:1px dashed #999;height:28px;margin:6px 0}
      .note{background:#f2f7f7;padding:12px;border-radius:12px;font-size:13px}</style></head><body>
      <h1>${doc.name} — نموذج تحضيري (WARAQ)</h1>
      <p class="note">ده نموذج تحضيري للتدريب وتجهيز بياناتك قبل ما تروح. النسخة الرسمية بتتسلم من الجهة المختصة.</p>
      ${doc.requirements.map((r) => `<p>${r}</p><div class="line"></div>`).join("")}
      <p>ملاحظات:</p><div class="line"></div><div class="line"></div>
      <p style="font-size:12px;color:#666">تكلفة تقديرية: ${doc.cost}</p>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{doc.name}</DialogTitle>
          <DialogDescription>{doc.why}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={doc.online ? "secondary" : "outline"}>
              {doc.online ? "متاحة أونلاين ✔" : "مش متاحة أونلاين"}
            </Badge>
            <Badge variant="outline">{doc.needsVisit ? "محتاجة تروح بنفسك" : "من غير مشاوير"}</Badge>
          </div>

          <Button variant="outline" onClick={readAloud} className="min-h-12 w-full rounded-2xl">
            <Volume2 className="size-4" aria-hidden="true" />
            {speaking ? "إيقاف القراءة" : "اسمع الشرح بصوت عالي"}
          </Button>

          <Row Icon={MapPin} label="تجيبها منين" value={doc.where} />
          <Row Icon={Coins} label="التكلفة المتوقعة" value={doc.cost} />
          <Row Icon={Clock} label="الوقت التقديري" value={doc.time} />
          {doc.openingHours ? <Row Icon={Clock} label="مواعيد العمل" value={doc.openingHours} /> : null}
          {doc.requiredId ? <Row Icon={BadgeCheck} label="إثبات الشخصية" value={doc.requiredId} /> : null}
          {doc.accessibilityInfo ? (
            <Row Icon={Accessibility} label="معلومات إتاحة" value={doc.accessibilityInfo} />
          ) : null}

          <div>
            <h3 className="font-bold">المطلوب لاستخراجها</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {doc.requirements.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </div>

          {doc.howTo ? (
            <div className="rounded-2xl bg-muted p-4">
              <h3 className="font-bold">لو مش معاك {doc.name}</h3>
              <ol className="mt-2 list-decimal space-y-1 text-sm text-muted-foreground ltr:pl-5 rtl:pr-5">
                {doc.howTo.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          ) : null}

          {doc.onlineNote ? <p className="text-sm text-accent">🌐 {doc.onlineNote}</p> : null}
          {doc.notes ? <p className="text-sm text-muted-foreground">📝 {doc.notes}</p> : null}

          {doc.printable ? (
            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm font-bold">تقدر تطبع النموذج ده في البيت.</p>
              <Button onClick={printForm} className="mt-3 min-h-12 w-full rounded-2xl">
                <Printer className="size-4" aria-hidden="true" />
                تحميل PDF / طباعة
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                نموذج تحضيري للتدريب فقط، وليس نموذجًا رسميًا.
              </p>
            </div>
          ) : null}

          {doc.stamp ? (
            <div className="rounded-2xl bg-secondary/60 p-4">
              <h3 className="flex items-center gap-2 font-bold">
                <Stamp className="size-4 text-accent" aria-hidden="true" />
                محتاجة ختم أو توقيع
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>المكان: {doc.stamp.where}</li>
                <li>الجهة: {doc.stamp.institution}</li>
                <li>خد معاك: {doc.stamp.bring.join(" · ")}</li>
                {doc.stamp.hours ? <li>المواعيد: {doc.stamp.hours}</li> : null}
                {doc.stamp.appointment ? <li>الميعاد: {doc.stamp.appointment}</li> : null}
              </ul>
            </div>
          ) : null}

          {doc.needsVisit && relevant.length > 0 ? (
            <div>
              <h3 className="font-bold">أماكن قريبة منك</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                نتائج بحث في محافظة {profile?.city} — اضغط «الخريطة» لعرض الأماكن الفعلية.
              </p>
              <ul className="mt-3 space-y-3">
                {relevant.map((p) => (
                  <li key={p.id} className="rounded-2xl border border-border p-3">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-bold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.address}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {p.hours}
                          {p.distanceKm ? ` · ${p.distanceKm} كم` : ""}
                          {p.travelMinutes ? ` · حوالي ${p.travelMinutes} دقيقة` : ""}
                        </p>
                        {p.accessibility ? (
                          <p className="mt-1 text-xs text-accent">♿ {p.accessibility}</p>
                        ) : null}
                      </div>
                      <Button asChild variant="outline" size="sm" className="shrink-0">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.mapQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="size-3.5" aria-hidden="true" />
                          الخريطة
                        </a>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Button
            onClick={onHave}
            variant={have ? "outline" : "default"}
            className="min-h-13 w-full rounded-2xl text-base font-bold"
          >
            {have ? "شيل علامة «معايا»" : "أيوه، الورقة دي معايا ✔"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
