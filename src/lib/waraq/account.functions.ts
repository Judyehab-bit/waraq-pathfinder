import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteCurrentAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);

    if (error) {
      console.error("[auth] account deletion failed", {
        name: error.name,
        message: error.message,
        status: error.status,
      });
      throw new Error("تعذر حذف الحساب. حاول مرة أخرى.");
    }

    return { deleted: true };
  });