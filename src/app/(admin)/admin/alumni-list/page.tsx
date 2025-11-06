import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AlumniListTable from "./alumni-list-table";
import { ExportButton } from "./export-button";

const PAGE_SIZE = 50;
async function getApprovedAlumniPage(pageParam?: string | null) {
  try {
    const supabase = await createClient();
    const page = Math.max(1, Number(pageParam ?? "1"));
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Get all approved alumni (those with approved status in admin_flags)
    const { data: approvedFlags, error: flagsError } = await supabase
      .from("admin_flags")
      .select("user_id")
      .eq("status", "approved");

    if (flagsError) {
      console.error("Error fetching approved flags:", flagsError);
      return [];
    }

    if (!approvedFlags || approvedFlags.length === 0) {
      return { data: [], count: 0, page };
    }

    const userIds = approvedFlags.map((f) => f.user_id);

    // Count approved alumni present in alumni_details
    const { count, error: countError } = await supabase
      .from("alumni_details")
      .select("id", { count: "exact", head: true })
      .in("id", userIds);
    if (countError) {
      console.error("Error counting alumni:", countError);
      return { data: [], count: 0, page };
    }

    // Get paged alumni details
    const { data: alumniData, error: alumniError } = await supabase
      .from("alumni_details")
      .select("id, headline, grad_year, department, current_company, current_title, location")
      .in("id", userIds)
      .order("grad_year", { ascending: false })
      .range(from, to);

    if (alumniError) {
      console.error("Error fetching alumni details:", alumniError);
      return { data: [], count: count || 0, page };
    }

    if (!alumniData || alumniData.length === 0) {
      return { data: [], count: count || 0, page };
    }

    // Get profiles for names
    const pageUserIds = alumniData.map((a) => a.id);
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", pageUserIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Get user emails from auth.users using admin client
    // We'll use the admin API to get emails
    const emailsMap = new Map<string, string>();
    
    // Try to get emails via admin API route if available
    // For now, we'll skip email or fetch it separately
    // The admin client might have access to auth.admin.listUsers()

    // Combine data
    const profilesMap = new Map((profilesData || []).map((p) => [p.id, p]));
    
    const alumni = alumniData.map((alumni) => {
      const profile = profilesMap.get(alumni.id);
      return {
        id: alumni.id,
        name: profile?.full_name || "Unknown",
        email: emailsMap.get(alumni.id) || "", // Will be empty for now
        gradYear: alumni.grad_year,
        department: alumni.department,
        currentCompany: alumni.current_company,
        currentTitle: alumni.current_title,
        location: alumni.location,
      };
    });

    return { data: alumni, count: count || alumni.length, page };
  } catch (error) {
    console.error("Error in getAllAlumni:", error);
    return { data: [], count: 0, page: 1 };
  }
}

export default async function AlumniListPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const page = (params.page as string) || null;
  const { data: alumni, count } = await getApprovedAlumniPage(page);

  return (
    <div className="max-w-7xl">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
            Alumni List
          </h1>
          <p className="text-zinc-600">
            Complete list of all registered and approved alumni ({count} total)
          </p>
        </div>
        <ExportButton data={alumni} />
      </div>

      <AlumniListTable initialData={alumni} />

      {/* Pagination */}
      {count > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-2 pt-6">
          {Array.from({ length: Math.ceil(count / PAGE_SIZE) }, (_, i) => i + 1).map((pageNum) => (
            <a
              key={pageNum}
              href={`/admin/alumni-list?page=${pageNum}`}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                Number(page ?? "1") === pageNum
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {pageNum}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
