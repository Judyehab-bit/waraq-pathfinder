import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProcedures } from "@/lib/waraq/store";
import { getService, requiredDocsFor, stepsFor } from "@/lib/waraq/services";

type Msg = { role: "bot" | "user"; text: string };

const WELCOME = "أهلاً! محتاج مساعدة في أي خطوة؟";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: WELCOME }]);
  const { procedures } = useProcedures();
  const endRef = useRef<HTMLDivElement>(null);

  const ctx = useMemo(() => {
    const proc = procedures[0];
    if (!proc) return null;
    const service = getService(proc.serviceId);
    if (!service) return null;
    const docs = requiredDocsFor(service, proc.answers);
    const missing = docs.filter((d) => !proc.done.includes(d.id));
    const steps = stepsFor(service, proc.answers);
    return { service, docs, missing, steps, proc };
  }, [procedures]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [msgs, open]);

  function answer(q: string): string {
    const text = q.trim();
    if (!ctx) {
      return "لسه ما بدأتش إجراء. افتح صفحة الخدمات واختار الخدمة اللي محتاجها، وبعد كده أقدر أساعدك في خطواتها بالتفصيل.";
    }
    const { service, docs, missing } = ctx;

    const namedDoc = docs.find((d) => text.includes(d.name.replace("المميكنة", "").trim()));
    if (namedDoc) {
      return `${namedDoc.name}: ${namedDoc.why}\nتجيبها من: ${namedDoc.where}\nالتكلفة ${namedDoc.cost} — المدة ${namedDoc.time}\nافتح كارت الورقة في صفحة «${service.serviceName}» عشان تشوف كل التفاصيل والأماكن القريبة.`;
    }
    if (/ناقص|فاضل|كام ورقة|missing/.test(text)) {
      if (missing.length === 0)
        return "مبروك، مفيش حاجة ناقصة! كل المستندات مكتملة وتقدر تكمل التقديم.";
      return `فاضل ${missing.length} من ${docs.length}:\n${missing.map((d) => `• ${d.name}`).join("\n")}`;
    }
    if (/منين|فين|مكان|أطلع/.test(text)) {
      const target = missing[0] ?? docs[0];
      if (!target) return "مفيش مستندات مطلوبة في الإجراء الحالي.";
      return `${target.name} تجيبها من: ${target.where}\n${target.online ? "متاحة أونلاين كذلك." : "بتحتاج تروح بنفسك."}\nفي صفحة الإجراء فيه قائمة أماكن قريبة (بيانات تجريبية للعرض).`;
    }
    if (/الخطوة|الجاي|بعد كده|next/.test(text)) {
      const target = missing[0];
      if (target)
        return `الخطوة الجاية: جهّز «${target.name}». ${target.howTo ? target.howTo[0] : target.where}`;
      return "خلصت المستندات! الخطوة الجاية تقدّم الطلب من منصة مصر الرقمية أو من المكتب.";
    }
    if (/تكلفة|فلوس|كام جنيه|سعر/.test(text)) {
      return `تقديرات التكلفة للإجراء الحالي:\n${docs.map((d) => `• ${d.name}: ${d.cost}`).join("\n")}\nكل الأرقام تقديرية وقد تختلف حسب المكان.`;
    }
    if (/وقت|مدة|هياخد قد إيه/.test(text)) {
      return `المدة التقديرية:\n${docs.map((d) => `• ${d.name}: ${d.time}`).join("\n")}`;
    }
    return `أنا مساعد بسيط بيجاوب من بيانات إجراء «${service.serviceName}» بس. تقدر تسألني: إيه اللي ناقصني؟ / أطلع الورقة دي منين؟ / الخطوة الجاية إيه؟ / كام ورقة فاضلة؟`;
  }

  function send(text: string) {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }, { role: "bot", text: answer(text) }]);
    setInput("");
  }

  const quick = [
    "إيه اللي ناقصني؟",
    "أطلع الورقة دي منين؟",
    "الخطوة الجاية إيه؟",
    "كام ورقة فاضلة؟",
  ];

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="محتاج مساعدة؟"
          aria-label="محتاج مساعدة؟ افتح مساعد WARAQ"
          className="group fixed bottom-20 z-50 flex min-h-14 min-w-14 items-center gap-2 rounded-full bg-primary px-4 text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-105 md:bottom-6 ltr:right-4 rtl:left-4"
        >
          <MessageCircle className="size-6" aria-hidden="true" />
          <span className="hidden text-sm font-semibold group-hover:inline">محتاج مساعدة؟</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="WARAQ Assistant"
          className="animate-rise fixed bottom-20 z-50 flex max-h-[70dvh] w-[min(94vw,22rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-lift)] md:bottom-6 ltr:right-4 rtl:left-4"
        >
          <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3 text-primary-foreground">
            <p className="font-bold">WARAQ Assistant 🤖</p>
            <Button
              variant="ghost"
              size="icon"
              aria-label="إغلاق المحادثة"
              onClick={() => setOpen(false)}
              className="min-h-10 min-w-10 text-primary-foreground hover:bg-primary-foreground/15"
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <p
                  className={
                    m.role === "user"
                      ? "max-w-[85%] whitespace-pre-line rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[90%] whitespace-pre-line text-sm leading-relaxed text-foreground"
                  }
                >
                  {m.text}
                </p>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border px-3 py-2">
            {quick.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك…"
              aria-label="اكتب سؤالك"
              className="rounded-xl"
            />
            <Button
              type="submit"
              size="icon"
              aria-label="إرسال"
              className="min-h-11 min-w-11 shrink-0"
            >
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
