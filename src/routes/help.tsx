import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck, HelpCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/waraq/AppShell";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EGYPT_DIGITAL_URL } from "@/lib/waraq/services";
import { useDocs, useProcedures } from "@/lib/waraq/store";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "مساعدة — WARAQ" },
      {
        name: "description",
        content: "أسئلة شائعة عن WARAQ، الخصوصية، والفرق بينه وبين المنصات الرسمية.",
      },
      { property: "og:title", content: "مساعدة WARAQ" },
      { property: "og:description", content: "إجابات سريعة وواضحة عن استخدام WARAQ." },
    ],
  }),
  component: Help,
});

const FAQ = [
  {
    q: "WARAQ بيعمل الإجراء بدالي؟",
    a: "لا. WARAQ بيجهّزك: يقولك إيه المطلوب، تجيبه منين، بكام وبقد إيه وقت. الإجراء الرسمي نفسه بيتم من خلال الجهة الحكومية أو منصة مصر الرقمية.",
  },
  {
    q: "التكلفة والمواعيد دقيقة؟",
    a: "كل الأرقام تقديرية للتوضيح وقد تختلف حسب المكان ونوع الخدمة. راجع الجهة الرسمية قبل الدفع.",
  },
  {
    q: "أوراقي بتتخزن فين؟",
    a: "في النسخة التجريبية بيتم تسجيل اسم ونوع المستند على جهازك (المتصفح) فقط، وملفاتك مش بتترفع على أي سيرفر. تقدر تمسح كل حاجة في أي وقت.",
  },
  {
    q: "المساعد الذكي بيعرف كل حاجة؟",
    a: "لا. المساعد بيجاوب من بيانات الخدمة اللي فتحتها فقط، ولو مش عارف بيقولك بصراحة.",
  },
  {
    q: "مش لاقي الخدمة اللي محتاجها؟",
    a: "بنبدأ بأربع خدمات كاملة (جواز، رقم قومي، شهادة ميلاد، رخصة قيادة) وباقي الخدمات بنضيفها قريبًا.",
  },
];

function Help() {
  const { setDocs } = useDocs();
  const { procedures, remove } = useProcedures();

  return (
    <AppShell>
      <div className="animate-rise space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">مساعدة</h1>
          <p className="mt-1 text-sm text-muted-foreground">أسئلة بسيطة وإجابات واضحة.</p>
        </div>

        <div className="card-soft p-2">
          <Accordion type="single" collapsible>
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger className="px-3 text-start font-bold">
                  <span className="flex items-start gap-2">
                    <HelpCircle className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                    {f.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="card-soft space-y-3 p-5">
          <h2 className="flex items-center gap-2 font-bold">
            <ShieldCheck className="size-5 text-accent" aria-hidden="true" />
            خصوصيتك
          </h2>
          <p className="text-sm text-muted-foreground">
            تقدر تمسح بياناتك وأوراقك من الجهاز في أي وقت.
          </p>
          <Button
            variant="outline"
            className="min-h-12 w-full rounded-2xl text-destructive"
            onClick={() => {
              setDocs([]);
              procedures.forEach((p) => remove(p.serviceId));
              toast.success("تم مسح الأوراق والإجراءات من جهازك");
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            امسح أوراقي وإجراءاتي
          </Button>
        </div>

        <div className="card-soft space-y-3 p-5">
          <h2 className="font-bold">تحب تكمل الإجراء رسميًا؟</h2>
          <p className="text-sm text-muted-foreground">
            منصة مصر الرقمية هي الجهة المسؤولة عن المعاملة الرسمية.
          </p>
          <Button asChild variant="outline" className="min-h-12 w-full rounded-2xl">
            <a href={EGYPT_DIGITAL_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" aria-hidden="true" />
              الانتقال إلى مصر الرقمية
            </a>
          </Button>
        </div>

        <Button asChild variant="ghost" className="min-h-12 w-full rounded-2xl">
          <Link to="/services">رجوع للخدمات</Link>
        </Button>
      </div>
    </AppShell>
  );
}
