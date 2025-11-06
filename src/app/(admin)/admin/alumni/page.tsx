import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import { ApproveButton } from "./approve-button";
import { RejectButton } from "./reject-button";

async function getPending() {
  try {
    const supabase = await createClient();
    
    // First get pending admin flags - admins should have access to this table
    const { data: flagsData, error: flagsError } = await supabase
      .from("admin_flags")
      .select("user_id, status")
      .eq("status", "pending");

    if (flagsError) {
      console.error("Error fetching admin flags:", flagsError);
      return [];
    }

    if (!flagsData || flagsData.length === 0) {
      return [];
    }

    // Get user IDs from pending flags
    const userIds = flagsData.map((f: any) => f.user_id);

    // Now get staged data for these specific users
    const { data: stagedData, error: stagedError } = await supabase
      .from("staged_alumni_details")
      .select("user_id, headline, grad_year, department, current_company, current_title, enrollment_number, roll_number, registration_number, certificate_number")
      .in("user_id", userIds);

    if (stagedError) {
      console.error("Error fetching staged data:", {
        message: stagedError.message,
        details: stagedError.details,
        hint: stagedError.hint,
        code: stagedError.code,
      });
      // If RLS error, return empty array
      return [];
    }

    if (!stagedData || stagedData.length === 0) {
      return [];
    }

    // Get profiles for these users
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Create maps for quick lookup
    const profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]));
    const flagsMap = new Map(flagsData.map((f: any) => [f.user_id, f]));

    // Combine data - all stagedData should have pending flags
    const pending = stagedData.map((item: any) => {
      const profile = profilesMap.get(item.user_id);
      return {
        ...item,
        profiles: profile || { full_name: "", id: item.user_id },
        flags: flagsMap.get(item.user_id),
      };
    });

    return pending;
  } catch (error: any) {
    console.error("Error in getPending:", error);
    return [];
  }
}


export default async function AdminAlumniApprovals() {
  try {
    await requireAdmin();
    const pending = await getPending();

    return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
          Pending Approvals
        </h1>
        <p className="text-zinc-600 mb-2">Review and approve alumni profile submissions</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mt-4">
          <strong>📋 How it works:</strong> When a user registers and completes their profile setup, they appear here. Click <strong>"Approve"</strong> to make their profile public, or <strong>"Reject"</strong> to remove their submission.
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-zinc-400" />
          <h2 className="text-xl font-semibold mb-2 text-zinc-700">No Pending Submissions</h2>
          <p className="text-zinc-500">All alumni profiles have been reviewed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">Headline</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">Graduation</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">Department</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">Company / Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">Unique IDs</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {pending.map((row: any) => {
                  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
                  // Get name from profile, with fallback
                  const fullName = profile?.full_name?.trim();
                  const displayName = fullName || `User ${row.user_id.slice(0, 8)}`;
                  return (
                    <tr key={row.user_id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900" title={fullName ? undefined : `Profile ID: ${row.user_id}`}>
                        {displayName}
                        {!fullName && <span className="text-xs text-zinc-400 ml-2">(Name missing)</span>}
                      </td>
                    <td className="px-6 py-4 text-zinc-600">{row.headline ?? "—"}</td>
                    <td className="px-6 py-4 text-zinc-600">{row.grad_year ?? "—"}</td>
                    <td className="px-6 py-4 text-zinc-600">{row.department ?? "—"}</td>
                    <td className="px-6 py-4 text-zinc-600">
                      {row.current_company ?? "—"}
                      {row.current_title && ` / ${row.current_title}`}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 text-sm">
                      <div className="space-y-1">
                        {row.enrollment_number && (
                          <div><strong>Enroll:</strong> {row.enrollment_number}</div>
                        )}
                        {row.roll_number && (
                          <div><strong>Roll:</strong> {row.roll_number}</div>
                        )}
                        {row.registration_number && (
                          <div><strong>Reg:</strong> {row.registration_number}</div>
                        )}
                        {row.certificate_number && (
                          <div><strong>Cert:</strong> {row.certificate_number}</div>
                        )}
                        {!row.enrollment_number && !row.roll_number && !row.registration_number && !row.certificate_number && (
                          <span className="text-zinc-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <ApproveButton userId={row.user_id} />
                        <RejectButton userId={row.user_id} />
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    );
  } catch (error: any) {
    console.error("Admin page error:", error);
    return (
      <div className="max-w-6xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Page</h2>
          <p className="text-red-700">{error?.message || "An error occurred while loading the admin page."}</p>
          <p className="text-sm text-red-600 mt-2">Please check the console for more details.</p>
        </div>
      </div>
    );
  }
}
