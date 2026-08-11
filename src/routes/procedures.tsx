import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/waraq/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getService, requiredDocsFor } from "@/lib/waraq/services";
import { useProcedures, calculateProcedureProgress } from "@/lib/waraq/store";

export const Route = createFileRoute("/procedures")({
  head: () => ({
    meta: [
      { title: "إجراءاتي — WARAQ" },
      {
        name: "description",
        content: "كل الإجراءات اللي بدأتها ونسبة اكتمالها، وكمّل من حيث ما وقفت.",
      },
      { property: "og:title", content: "إجراءاتي في WARAQ" },
      { property: "og:description", content: "كمّل إجراءك من حيث ما وقفت." },
    ],
  }),
  component: Procedures,
});

function Procedures() {
  const { procedures, remove } = useProcedures();

  return (
    <AppShell>
      <div className="animate-rise space-y-6">
        <h1 className="text-2xl font-extrabold text-foreground">إجراءاتي</h1>

        {procedures.length === 0 ? (
          <div className="card-soft p-8 text-center">
            <ClipboardList className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 font-bold">لسه ما بدأتش إجراء</p>
            <p className="mt-1 text-sm text-muted-foreground">
              اختار خدمة وهنجهّزلك الخطوات على مقاسك.
            </p>
            <Button asChild className="mt-4 min-h-12 rounded-2xl">
              <Link to="/services">ابدأ إجراء</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {procedures.map((p) => {
              const service = getService(p.serviceId);
              if (!service) return null;
              const docs = requiredDocsFor(service, p.answers);
              const { progress: pct, isComplete } = calculateProcedureProgress(
                service.id,
                p.answers,
                p.done,
              );

              return (
                <li key={p.serviceId} className="card-soft p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-foreground">
                        {service.serviceName}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        آخر تحديث {new Date(p.updatedAt).toLocaleDateString("ar-EG")} ·{" "}
                        {p.done.length} من {docs.length} مستند
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`حذف إجراء ${service.serviceName}`}
                      onClick={() => {
                        remove(p.serviceId);
                        toast.success("تم حذف الإجراء");
                      }}
                      className="min-h-11 min-w-11 shrink-0 text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                  <div className="mt-3">
                    <Progress value={pct} className="h-2.5" />
                    <p className="mt-1 text-sm font-semibold text-accent">
                      {isComplete ? "جاهز ✔ 100%" : `مكمّل ${pct}%`}
                    </p>
                  </div>
                  <Button asChild className="mt-4 min-h-12 w-full rounded-2xl">
                    <Link to="/service/$serviceId" params={{ serviceId: service.id }}>
                      {isComplete ? "افتح الإجراء" : "كمّل من حيث ما وقفت"}
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
