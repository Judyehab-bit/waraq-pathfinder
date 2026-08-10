import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, MapPin, ListChecks } from "lucide-react";
import { WaraqLogo } from "@/components/waraq/AppShell";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WARAQ — ورقك من غير قلق | دليل الأوراق الرسمية في مصر" },
      {
        name: "description",
        content:
          "WARAQ يوضّح لك المستندات المطلوبة، أماكن استخراجها، التكلفة والوقت التقديري، وخطوات إجراءك الرسمي خطوة بخطوة.",
      },
      { property: "og:title", content: "WARAQ — ورقك من غير قلق" },
      {
        property: "og:description",
        content: "اعرف إيه اللي محتاجه، تجيبه منين، وتخلصه خطوة بخطوة.",
      },
    ],
  }),
  component: Welcome,
});

const POINTS = [
  { Icon: ListChecks, title: "تعرف إيه المطلوب", text: "قائمة مستندات مخصّصة لحالتك أنت، مش قائمة عامة." },
  { Icon: MapPin, title: "تعرف تجيبه منين", text: "أماكن قريبة، مواعيد عمل، وتكلفة ووقت تقديري." },
  { Icon: ShieldCheck, title: "تخلص بثقة", text: "لما تجهز كل حاجة، نوجّهك للمنصة الرسمية." },
];

function Welcome() {
  return (
    <div dir="rtl" className="min-h-dvh bg-background">
      <main className="mx-auto max-w-5xl px-5 py-8 sm:py-14">
        <div className="animate-rise flex flex-col items-center text-center">
          <WaraqLogo className="h-16 sm:h-24" />
          <h1 className="mt-6 text-3xl font-extrabold leading-tight text-primary sm:text-5xl">
            ورقك من غير قلق
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            نعرفك إيه اللي محتاجه، تجيبه منين، وتخلصه خطوة بخطوة.
          </p>

          <img
            src={heroImg}
            alt="شخص بيجهّز أوراقه بهدوء مع قائمة مراجعة وموقع قريب"
            width={960}
            height={640}
            className="mt-8 w-full max-w-md rounded-3xl border border-border shadow-[var(--shadow-soft)]"
          />

          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-foreground sm:text-base">
            WARAQ يساعدك تفهم وتجهّز إجراءاتك الرسمية من غير لخبطة الأوراق الناقصة، ولا المتطلبات غير
            الواضحة، ولا المشاوير الزيادة.
          </p>

          <Button asChild size="lg" className="mt-8 min-h-14 w-full max-w-xs rounded-2xl text-base font-bold">
            <Link to="/onboarding">
              ابدأ دلوقتي
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
          </Button>

          <p className="mt-4 text-xs text-muted-foreground">
            WARAQ مساعد تحضير وتوجيه، وليس بديلًا عن الجهات الرسمية.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-3">
          {POINTS.map(({ Icon, title, text }) => (
            <li key={title} className="card-soft p-5 text-start">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-3 font-bold text-foreground">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
