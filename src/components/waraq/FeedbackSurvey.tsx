import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFeedback } from "@/lib/waraq/store";

function Stars({
  value,
  onChange,
  label,
  id,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  id: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-bold text-foreground">{label}</legend>
      <div className="mt-2 flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} من 5`}
            id={`${id}-${n}`}
            onClick={() => onChange(n)}
            className="min-h-11 min-w-11 rounded-xl transition-transform hover:scale-110"
          >
            <Star
              className={`mx-auto size-7 ${n <= value ? "fill-warning text-warning" : "text-muted-foreground"}`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{value ? `اخترت ${value} من 5` : "لم تختر بعد"}</p>
    </fieldset>
  );
}

function Choices({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-bold text-foreground">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <Button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            variant={value === o ? "default" : "outline"}
            onClick={() => onChange(o)}
            className="min-h-12 rounded-2xl"
          >
            {o}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}

export default function FeedbackSurvey() {
  const { addFeedback } = useFeedback();
  const [ease, setEase] = useState(0);
  const [clarity, setClarity] = useState(0);
  const [savedTime, setSavedTime] = useState("");
  const [best, setBest] = useState("");
  const [improve, setImprove] = useState("");
  const [again, setAgain] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="card-soft animate-pop p-6 text-center">
        <p className="text-lg font-bold">شكرًا! رأيك بيساعدنا نخلي WARAQ أسهل ❤️</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!ease || !clarity) {
          toast.error("قيّم السهولة والوضوح بالنجوم الأول 🙏");
          return;
        }
        addFeedback({
          ease,
          clarity,
          savedTime,
          best: best.trim(),
          improve: improve.trim(),
          again,
          createdAt: new Date().toISOString(),
        });
        setDone(true);
      }}
      className="card-soft space-y-6 p-5"
    >
      <h2 className="text-lg font-extrabold text-foreground">إيه رأيك في تجربتك مع WARAQ؟</h2>

      <Stars id="ease" label="سهولة استخدام WARAQ من 1 إلى 5" value={ease} onChange={setEase} />
      <Stars id="clarity" label="قد إيه WARAQ ساعدك تفهم المطلوب؟" value={clarity} onChange={setClarity} />
      <Choices
        label="هل وفّر عليك وقت أو مجهود؟"
        options={["نعم", "إلى حد ما", "لا"]}
        value={savedTime}
        onChange={setSavedTime}
      />

      <div>
        <Label htmlFor="best">إيه أكتر حاجة ساعدتك؟</Label>
        <Textarea
          id="best"
          value={best}
          onChange={(e) => setBest(e.target.value)}
          maxLength={500}
          className="mt-2 rounded-xl"
        />
      </div>
      <div>
        <Label htmlFor="improve">إيه الحاجة اللي محتاجين نحسنها؟</Label>
        <Textarea
          id="improve"
          value={improve}
          onChange={(e) => setImprove(e.target.value)}
          maxLength={500}
          className="mt-2 rounded-xl"
        />
      </div>

      <Choices
        label="هل هتستخدم WARAQ تاني؟"
        options={["أكيد", "ممكن", "لا"]}
        value={again}
        onChange={setAgain}
      />

      <Button type="submit" className="min-h-13 w-full rounded-2xl text-base font-bold">
        إرسال التقييم
      </Button>
      <p className="text-xs text-muted-foreground">
        تقييمك بيتسجل على جهازك في النسخة التجريبية.
      </p>
    </form>
  );
}
