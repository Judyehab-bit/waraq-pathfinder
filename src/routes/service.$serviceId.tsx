import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  ExternalLink,
  PartyPopper,
  RotateCcw,
  Coins,
  Clock,
  Accessibility,
} from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/waraq/AppShell";
import DocumentDialog from "@/components/waraq/DocumentDialog";
import FeedbackSurvey from "@/components/waraq/FeedbackSurvey";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getService, requiredDocsFor, stepsFor, visibleQuestions } from "@/lib/waraq/services";
import { useDocs, useProcedures } from "@/lib/waraq/store";
import type { DocumentDetail } from "@/lib/waraq/types";

export const Route = createFileRoute("/service/$serviceId")({
  head: () => ({
    meta: [
      { title: "خطواتك خطوة بخطوة — WARAQ" },
      {
        name: "description",
        content: "أسئلة سريعة، وبعدها قائمة مستندات وخطوات مخصّصة لحالتك مع التكلفة والوقت التقديري.",
      },
      { property: "og:title", content: "خطة إجراءك في WARAQ" },
      { property: "og:description", content: "اعرف المطلوب، الناقص، والخطوة الجاية." },
    ],
  }),
  component: ServicePage,
});

function ServicePage() {
  const { serviceId } = Route.useParams();
  const navigate = useNavigate();
  const service = getService(serviceId);
  const { procedures, upsert } = useProcedures();
  const { docs: walletDocs } = useDocs();

  const proc = procedures.find((p) => p.serviceId === serviceId);
  const [openDoc, setOpenDoc] = useState<DocumentDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (proc) setAnswers(proc.answers);
  }, [proc?.serviceId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!service || service.comingSoon) {
    return (
      <AppShell>
        <div className="card-soft mx-auto max-w-md p-8 text-center">
          <CircleAlert className="mx-auto size-10 text-warning" aria-hidden="true" />
          <p className="mt-3 font-bold">الخدمة دي مش متاحة دلوقتي</p>
          <p className="mt-1 text-sm text-muted-foreground">
            بنضيف خدمات جديدة باستمرار. جرّب خدمة تانية من الصفحة الرئيسية.
          </p>
          <Button asChild className="mt-4 min-h-12 rounded-2xl">
            <Link to="/services">رجوع للخدمات</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const answered = proc?.answered ?? false;
  const questions = visibleQuestions(service, answers);
  const allAnswered = questions.every((q) => answers[q.id]);
  const requiredDocs = requiredDocsFor(service, proc?.answers ?? answers);
  const suggested = requiredDocs.filter((d) =>
    walletDocs.some((w) => w.name.includes(d.name.split(" ")[0] ?? "___")),
  );
  const steps = stepsFor(service, proc?.answers ?? answers);
  const done = proc?.done ?? [];
  const pct = requiredDocs.length ? Math.round((done.length / requiredDocs.length) * 100) : 0;
  const complete = requiredDocs.length > 0 && done.length === requiredDocs.length;

  function saveAnswers() {
    if (!service) return;
    upsert(service.id, { answers, answered: true, done: suggestedIds(), });
    toast.success("تمام! جهزنا لك الخطوات المناسبة لحالتك.");
  }

  function suggestedIds() {
    if (!service) return [];
    const fromWallet = requiredDocsFor(service, answers)
      .filter((d) => walletDocs.some((w) => w.name.includes(d.name.split(" ")[0] ?? "___")))
      .map((d) => d.id);
    return Array.from(new Set([...(proc?.done ?? []), ...fromWallet]));
  }

  function toggle(docId: string) {
    if (!service) return;
    const next = done.includes(docId) ? done.filter((d) => d !== docId) : [...done, docId];
    upsert(service.id, { done: next, answers: proc?.answers ?? answers, answered: true });
    if (!done.includes(docId)) toast.success("تمام ✔ اتحدثت الخطوات");
  }

  /* ---------------- questionnaire ---------------- */
  if (!answered) {
    return (
      <AppShell>
        <div className="animate-rise mx-auto max-w-xl space-y-6">
          <Button asChild variant="ghost" className="min-h-11 rounded-2xl px-2">
            <Link to="/services">
              <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
              كل الخدمات
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{service.serviceName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              أسئلة سريعة عشان نجهز خطوات على مقاس حالتك، مش قائمة عامة.
            </p>
          </div>

          <ol className="space-y-4">
            {questions.map((q, i) => (
              <li key={q.id} className="card-soft animate-rise p-5">
                <p className="text-xs font-bold text-accent">سؤال {i + 1}</p>
                <h2 className="mt-1 text-lg font-bold text-foreground">{q.text}</h2>
                <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={q.text}>
                  {q.options.map((o) => {
                    const active = answers[q.id] === o.value;
                    return (
                      <Button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        variant={active ? "default" : "outline"}
                        onClick={() => {
                          const next = { ...answers, [q.id]: o.value };
                          // drop answers of questions that no longer apply
                          const cleaned: Record<string, string> = {};
                          for (const vq of visibleQuestions(service, next)) {
                            if (next[vq.id]) cleaned[vq.id] = next[vq.id]!;
                          }
                          cleaned[q.id] = o.value;
                          setAnswers(cleaned);
                        }}
                        className="min-h-12 rounded-2xl"
                      >
                        {active ? <Check className="size-4" aria-hidden="true" /> : null}
                        {o.label}
                      </Button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>

          <Button
            onClick={saveAnswers}
            disabled={!allAnswered}
            className="min-h-14 w-full rounded-2xl text-base font-bold"
          >
            {allAnswered ? "جهّزلي الخطوات" : "جاوب على كل الأسئلة"}
          </Button>
        </div>
      </AppShell>
    );
  }

  /* ---------------- personalized plan ---------------- */
  return (
    <AppShell>
      <div className="animate-rise space-y-6">
        <Button asChild variant="ghost" className="min-h-11 rounded-2xl px-2">
          <Link to="/services">
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
            كل الخدمات
          </Link>
        </Button>

        <div className="card-soft p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">{service.serviceName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {done.length} / {requiredDocs.length} مكتمل · {steps.length} خطوات
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => {
                upsert(service.id, { answered: false });
                toast.info("تقدر تعدّل إجاباتك دلوقتي");
              }}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              عدّل إجاباتي
            </Button>
          </div>
          <Progress value={pct} className="mt-4 h-3 transition-all" />
          <p className="mt-2 text-sm font-bold text-accent">{pct}% جاهز</p>
          {suggested.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              علّمنا تلقائيًا الأوراق اللي موجودة في محفظتك. راجعها وعدّل لو لازم.
            </p>
          )}
        </div>

        {/* Checklist */}
        <section aria-labelledby="checklist-h" className="space-y-3">
          <h2 id="checklist-h" className="text-lg font-bold text-foreground">
            الChecklist الخاصة بيك
          </h2>
          <ul className="space-y-3">
            {requiredDocs.map((d) => {
              const have = done.includes(d.id);
              return (
                <li key={d.id} className="card-soft p-4">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggle(d.id)}
                      aria-pressed={have}
                      aria-label={`${have ? "شيل علامة" : "علّم كمكتمل"}: ${d.name}`}
                      className={`grid size-11 shrink-0 place-items-center rounded-2xl border-2 transition-colors ${
                        have
                          ? "animate-pop border-success bg-success text-success-foreground"
                          : "border-input bg-card text-muted-foreground"
                      }`}
                    >
                      {have ? <Check className="size-5" aria-hidden="true" /> : <span aria-hidden="true">☐</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenDoc(d)}
                      className="min-w-0 text-start"
                    >
                      <p className="truncate font-bold text-foreground">{d.name}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Coins className="size-3.5" aria-hidden="true" />
                          {d.cost}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" aria-hidden="true" />
                          {d.time}
                        </span>
                      </p>
                    </button>
                    <Badge
                      variant={have ? "secondary" : "outline"}
                      className={`shrink-0 ${have ? "text-success" : "text-muted-foreground"}`}
                    >
                      {have ? "✅ معاك" : "❌ ناقصة"}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Steps */}
        <section aria-labelledby="steps-h" className="space-y-3">
          <h2 id="steps-h" className="text-lg font-bold text-foreground">
            خطوات الإجراء
          </h2>
          <div className="card-soft p-2">
            <Accordion type="single" collapsible>
              {steps.map((s, i) => (
                <AccordionItem key={s.id} value={s.id}>
                  <AccordionTrigger className="px-3 text-start">
                    <span className="min-w-0">
                      <span className="text-xs font-bold text-accent">
                        خطوة {i + 1} من {steps.length}
                      </span>
                      <span className="block font-bold text-foreground">{s.title}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 px-3 text-sm text-muted-foreground">
                    <p>{s.detail}</p>
                    {s.cost ? <p>💰 {s.cost}</p> : null}
                    {s.time ? <p>⏱ {s.time}</p> : null}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          {service.accessibilityInfo ? (
            <p className="flex items-start gap-2 rounded-2xl bg-secondary/60 p-3 text-sm text-secondary-foreground">
              <Accessibility className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {service.accessibilityInfo}
            </p>
          ) : null}
        </section>

        {/* Completion */}
        {complete ? (
          <section className="animate-pop card-soft space-y-4 border-success/40 bg-success/5 p-6 text-center">
            <PartyPopper className="mx-auto size-10 text-success" aria-hidden="true" />
            <h2 className="text-xl font-extrabold text-foreground">🎉 أنت جاهز!</h2>
            <p className="text-sm text-muted-foreground">
              جمعت كل المستندات المطلوبة. دلوقتي تقدر تكمل الإجراء من خلال منصة مصر الرقمية.
            </p>
            <Button asChild className="min-h-14 w-full rounded-2xl text-base font-bold">
              <a href={service.officialLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-5" aria-hidden="true" />
                الانتقال إلى مصر الرقمية
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              WARAQ مساعد تحضير وتوجيه فقط، والجهة الرسمية هي المسؤولة عن تنفيذ المعاملة.
            </p>
            {!showFeedback ? (
              <Button
                variant="outline"
                onClick={() => setShowFeedback(true)}
                className="min-h-12 w-full rounded-2xl"
              >
                رجعت من المنصة؟ قيّم تجربتك
              </Button>
            ) : null}
          </section>
        ) : (
          <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
            كمّل الأوراق الناقصة وهنفتحلك خطوة التقديم الرسمية. الخطوة الجاية:{" "}
            <span className="font-bold text-foreground">
              {requiredDocs.find((d) => !done.includes(d.id))?.name}
            </span>
          </p>
        )}

        {showFeedback ? <FeedbackSurvey /> : null}

        <Button
          variant="ghost"
          className="min-h-12 w-full rounded-2xl"
          onClick={() => navigate({ to: "/procedures" })}
        >
          شوف كل إجراءاتي
        </Button>

        <p className="text-xs text-muted-foreground">
          آخر تحديث لبيانات الخدمة: {service.lastUpdated} · البيانات نموذجية للتوضيح وليست بيانات رسمية
          موثّقة.
        </p>
      </div>

      <DocumentDialog
        doc={openDoc}
        open={Boolean(openDoc)}
        onOpenChange={(v) => !v && setOpenDoc(null)}
        have={openDoc ? done.includes(openDoc.id) : false}
        onHave={() => {
          if (openDoc) toggle(openDoc.id);
          setOpenDoc(null);
        }}
      />
    </AppShell>
  );
}
