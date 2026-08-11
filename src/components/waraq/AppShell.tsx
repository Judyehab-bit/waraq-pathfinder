import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Home, ClipboardList, FileText, HelpCircle, Settings2 } from "lucide-react";
import logo from "@/assets/waraq-logo.png.asset.json";
import { useSettings } from "@/lib/waraq/store";
import { useT } from "@/lib/waraq/i18n";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Chatbot from "./Chatbot";

const NAV = [
  { to: "/services", key: "home", Icon: Home },
  { to: "/procedures", key: "procedures", Icon: ClipboardList },
  { to: "/documents", key: "documents", Icon: FileText },
  { to: "/help", key: "help", Icon: HelpCircle },
] as const;

export function WaraqLogo({ className = "h-9" }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt="WARAQ — ورق من غير قلق"
      className={`${className} w-auto object-contain`}
      width={1536}
      height={1728}
    />
  );
}

export function WaraqMark({ className = "h-9" }: { className?: string }) {
  return (
    <img
      src={mark.url}
      alt="WARAQ"
      className={`${className} w-auto object-contain`}
      width={1920}
      height={1600}
    />
  );
}

function AccessibilityMenu() {
  const { settings, setSettings } = useSettings();
  const { t } = useT();

  const sizes: { value: "normal" | "large" | "xl"; label: string }[] = [
    { value: "normal", label: t("normal") },
    { value: "large", label: t("large") },
    { value: "xl", label: t("xl") },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label={t("settings")}>
          <Settings2 className="size-5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("settings")}</DialogTitle>
          <DialogDescription>اظبط الخط والتباين واللغة على راحتك.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">{t("textSize")}</Label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <Button
                  key={s.value}
                  variant={settings.text === s.value ? "default" : "outline"}
                  onClick={() => setSettings({ ...settings, text: s.value })}
                  aria-pressed={settings.text === s.value}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="hc-switch">{t("contrast")}</Label>
            <Switch
              id="hc-switch"
              checked={settings.contrast}
              onCheckedChange={(v) => setSettings({ ...settings, contrast: v })}
            />
          </div>
          <div>
            <Label className="mb-2 block">{t("language")}</Label>
            <div className="flex gap-2">
              <Button
                variant={settings.lang === "ar" ? "default" : "outline"}
                onClick={() => setSettings({ ...settings, lang: "ar" })}
                aria-pressed={settings.lang === "ar"}
              >
                العربية
              </Button>
              <Button
                variant={settings.lang === "en" ? "default" : "outline"}
                onClick={() => setSettings({ ...settings, lang: "en" })}
                aria-pressed={settings.lang === "en"}
              >
                English
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AppShell({
  children,
  showChat = true,
}: {
  children: ReactNode;
  showChat?: boolean;
}) {
  const { settings } = useSettings();
  const { t, dir } = useT();

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", dir);
    html.setAttribute("lang", settings.lang);
    html.setAttribute("data-text", settings.text);
    html.classList.toggle("hc", settings.contrast);
  }, [dir, settings.lang, settings.text, settings.contrast]);

  return (
    <div className="min-h-dvh bg-background pb-24 md:pb-0">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        تخطى إلى المحتوى
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Link to="/services" className="min-w-0" aria-label="WARAQ">
            <WaraqLogo className="h-8 sm:h-10" />
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <nav aria-label="التنقل" className="hidden md:flex md:items-center md:gap-1">
              {NAV.map(({ to, key, Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-primary"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {t(key)}
                </Link>
              ))}
            </nav>
            <AccessibilityMenu />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 py-5">
        {children}
      </main>

      <nav
        aria-label="التنقل السفلي"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1">
          {NAV.map(({ to, key, Icon }) => (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold text-muted-foreground transition-colors data-[status=active]:bg-secondary data-[status=active]:text-primary"
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="truncate">{t(key)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {showChat ? <Chatbot /> : null}
    </div>
  );
}
