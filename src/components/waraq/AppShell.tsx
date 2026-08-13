import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import {
  Home,
  ClipboardList,
  FileText,
  HelpCircle,
  Settings2,
  LogOut,
  User,
  MapPin,
  Trash2,
} from "lucide-react";
import logo from "@/assets/waraq-full-logo.png.asset.json";
import mark from "@/assets/waraq-mark.png.asset.json";
import { useSettings, useProfile, useAuthUser } from "@/lib/waraq/store";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GOVERNORATES } from "@/lib/waraq/services";
import { clearLocalSession, signOutCurrentSession } from "@/lib/waraq/profile-sync";
import { toast } from "sonner";
import Chatbot from "./Chatbot";
import { deleteCurrentAccount } from "@/lib/waraq/account.functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
      width={770}
      height={873}
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

function SettingsAndProfileMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteAccount = useServerFn(deleteCurrentAccount);
  const { user } = useAuthUser();
  const { profile, setProfile } = useProfile();
  const { settings, setSettings } = useSettings();
  const { t } = useT();

  const [name, setName] = useState(profile?.name || "");
  const [city, setCity] = useState(profile?.city || "القاهرة");
  const [area, setArea] = useState(profile?.area || "");
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setCity(profile.city || "القاهرة");
      setArea(profile.area || "");
    }
  }, [profile]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    await setProfile({
      ...profile,
      name,
      city,
      area,
    });
    toast.success("تم تحديث بيانات ملفك الشحصي والمحافظة بنجاح");
  }

  async function handleLogout() {
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await signOutCurrentSession();
      toast.success("تم تسجيل الخروج");
      setOpen(false);
      navigate({ to: "/onboarding", replace: true });
    } catch (error) {
      console.error("[auth] sign-out failed", error);
      toast.error("تعذر تسجيل الخروج. حاول مرة أخرى.");
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteAccount();
      await queryClient.cancelQueries();
      queryClient.clear();
      await clearLocalSession();
      setOpen(false);
      toast.success("تم حذف حسابك وبياناتك نهائيًا");
      navigate({ to: "/onboarding", replace: true });
    } catch (error) {
      console.error("[auth] account deletion failed", error);
      toast.error(error instanceof Error ? error.message : "تعذر حذف الحساب. حاول مرة أخرى.");
    } finally {
      setDeleting(false);
    }
  }

  const sizes: { value: "normal" | "large" | "xl"; label: string }[] = [
    { value: "normal", label: t("normal") },
    { value: "large", label: t("large") },
    { value: "xl", label: t("xl") },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 rounded-xl"
          aria-label={t("settings")}
        >
          <Settings2 className="size-5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>الإعدادات والملف الشخصي</DialogTitle>
          <DialogDescription>تعديل بيانات المحافظة وإعدادات العرض</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {user && profile && (
            <form
              onSubmit={handleSaveProfile}
              className="space-y-4 rounded-2xl bg-secondary/50 p-4"
            >
              <div className="flex items-center gap-2 font-bold text-foreground">
                <User className="size-4 text-accent" />
                حسابي الشخصي ({profile.username || "مستخدم"})
              </div>

              <div>
                <Label htmlFor="prof-name">الاسم</Label>
                <Input
                  id="prof-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 min-h-11 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="prof-city" className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-accent" />
                  المحافظة (لتصفية الأماكن القريبة)
                </Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger id="prof-city" className="mt-1.5 min-h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOVERNORATES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prof-area">المنطقة أو الحي</Label>
                <Input
                  id="prof-area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="مثال: المعادي"
                  className="mt-1.5 min-h-11 rounded-xl"
                />
              </div>

              <Button type="submit" size="sm" className="w-full rounded-xl font-bold">
                حفظ تعديلات الملف والمحافظة
              </Button>
            </form>
          )}

          <hr className="border-border" />

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

          {user && (
            <div className="space-y-3 pt-2">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="min-h-12 w-full rounded-xl font-bold"
              >
                <LogOut className="ml-2 size-4" />
                تسجيل الخروج
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="min-h-12 w-full rounded-xl border-destructive/50 font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="ml-2 size-4" />
                    حذف الحساب نهائيًا
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir="rtl">
                  <AlertDialogHeader className="text-right sm:text-right">
                    <AlertDialogTitle>حذف الحساب نهائيًا؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم حذف ملفك الشخصي وإجراءاتك ومستنداتك نهائيًا، ولا يمكن التراجع عن ذلك.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2 sm:space-x-0">
                    <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={deleting}
                      onClick={(event) => {
                        event.preventDefault();
                        void handleDeleteAccount();
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? "جاري الحذف..." : "نعم، احذف حسابي"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
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
            <WaraqMark className="h-11 sm:h-14" />
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
            <SettingsAndProfileMenu />
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
