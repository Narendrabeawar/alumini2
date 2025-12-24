import { createClient } from "@/lib/supabase/server";
import { AdminLayoutClient } from "@/components/AdminLayoutClient";

async function getStats() {
  try {
    const supabase = await createClient();
    
    // Get admin flags with pending status directly
    // This avoids needing to query staged_alumni_details first
    const { data: flagsData, error: flagsError } = await supabase
      .from("admin_flags")
      .select("user_id")
      .eq("status", "pending");

    if (flagsError) {
      console.error("Error fetching admin flags for stats:", flagsError);
      return { pending: 0 };
    }

    // Count unique pending users
    const pendingCount = flagsData ? new Set(flagsData.map((f: any) => f.user_id)).size : 0;

    return {
      pending: pendingCount,
    };
  } catch (error) {
    console.error("Error in getStats:", error);
    return { pending: 0 };
  }
}

export async function AdminLayout({ children }: { children: React.ReactNode }) {
  const stats = await getStats();

  return <AdminLayoutClient pendingCount={stats.pending}>{children}</AdminLayoutClient>;
}

