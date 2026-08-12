import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Lock, Plus } from "lucide-react";
import AppShell from "@/components/waraq/AppShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SERVICES } from "@/lib/waraq/services";
import { useProcedures, useProfile, calculateProcedureProgress } from "@/lib/waraq/store";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "الخدمات — WARAQ" },
      {
        name: "description",
        content: "اختار الخدمة: جواز سفر، بطاقة رقم قومي، شهادة ميلاد، رخصة قيادة، وغيرها.",
      },
      { property: "og:title", content: "خدمات WARAQ" },
      { property: "og:description", content: "اختار الخدمة اللي محتاج تخلصها وابدأ خطوة بخطوة." },
    ],
  }),
  component: Services,
});

function Services() {
  const { profile } = useProfile();
  const { procedures } = useProcedures();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const term = q.trim();
    if (!term) return SERVICES;
    return SERVICES.filter(
      (s) =>
        s.serviceName.includes(term) || s.description.includes(term) || s.shortName.includes(term),
    );
  }, [q]);

  return (
    <AppShell>
      <div className="animate-rise space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            أهلاً يا {profile?.username || profile?.name || "صديقنا"} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile?.city ? `محافظة ${profile.city}` : "اختار خدمتك ونجهّزلك الخطوات"}
          </p>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 size-5 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3"
            aria-hidden="true"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بتدور على خدمة معينة؟"
            aria-label="ابحث عن خدمة"
            className="min-h-13 rounded-2xl ltr:pl-11 rtl:pr-11"
          />
        </div>

        <h2 className="text-lg font-bold text-foreground">اختار الخدمة اللي محتاج تخلصها</h2>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const proc = procedures.find((p) => p.serviceId === s.id);
            const { progress: pct, isComplete } = proc
              ? calculateProcedureProgress(s.id, proc.answers, proc.done)
              : { progress: 0, isComplete: false };

            const card = (
              <>
                <img
                  src={s.image}
                  alt={s.serviceName}
                  loading="lazy"
                  width={768}
                  height={512}
                  className="h-36 w-full rounded-2xl object-cover"
                />
                <div className="mt-3 flex items-start justify-between gap-2">
                  <h3 className="font-bold text-foreground">{s.serviceName}</h3>
                  {s.comingSoon ? (
                    <Badge variant="secondary" className="shrink-0">
                      قريبًا
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                {proc && !s.comingSoon ? (
                  <div className="mt-3">
                    <Progress value={pct} className="h-2" />
                    <p className="mt-1 text-xs font-semibold text-accent">
                      {isComplete ? "مكتمل ✔ 100%" : `مكمّل ${pct}%`}
                    </p>
                  </div>
                ) : null}
              </>
            );

            return (
              <li key={s.id}>
                {s.comingSoon ? (
                  <button
                    type="button"
                    onClick={() =>
                      toast.info("الخدمة دي قريبًا في WARAQ. جرّب الخدمات المتاحة دلوقتي.")
                    }
                    className="card-soft h-full w-full p-4 text-start opacity-80 transition-transform hover:scale-[1.01]"
                  >
                    {card}
                  </button>
                ) : (
                  <Link
                    to="/service/$serviceId"
                    params={{ serviceId: s.id }}
                    className="card-soft block h-full p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
                  >
                    {card}
                  </Link>
                )}
              </li>
            );
          })}

          <li>
            <button
              type="button"
              onClick={() =>
                toast.info("بنضيف خدمات جديدة باستمرار. قولنا محتاج إيه من صفحة المساعدة.")
              }
              className="card-soft flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 border-dashed p-4 text-muted-foreground transition-colors hover:bg-secondary/50"
            >
              <Plus className="size-7" aria-hidden="true" />
              <span className="font-bold">خدمة أخرى</span>
              <span className="text-xs">اطلب خدمة مش موجودة</span>
            </button>
          </li>
        </ul>

        <p className="flex items-start gap-2 rounded-2xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          بيانات الخدمات والأماكن في النسخة التجريبية بيانات نموذجية للتوضيح، وليست بيانات رسمية
          موثّقة. الإجراء الرسمي نفسه بيتم من خلال الجهة الحكومية.
        </p>

        {procedures.length > 0 && (
          <Button asChild variant="outline" className="min-h-12 w-full rounded-2xl">
            <Link to="/procedures">كمّل إجراء بدأته</Link>
          </Button>
        )}
      </div>
    </AppShell>
  );
}
