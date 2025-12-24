import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/StatsCard";
import { Users, UserCheck, Clock, TrendingUp } from "lucide-react";

async function getAdminStats() {
  const supabase = await createClient();

  // Get total approved alumni
  const { data: approvedFlags } = await supabase
    .from("admin_flags")
    .select("user_id")
    .eq("status", "approved");

  const totalApproved = approvedFlags?.length || 0;

  // Get pending approvals
  const { data: pendingFlags } = await supabase
    .from("admin_flags")
    .select("user_id")
    .eq("status", "pending");

  const totalPending = pendingFlags?.length || 0;

  // Get total profiles (all registered users)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id");

  const totalUsers = profiles?.length || 0;

  // Get total alumni with details
  const { data: alumniDetails } = await supabase
    .from("alumni_details")
    .select("id");

  const totalAlumniWithDetails = alumniDetails?.length || 0;

  return {
    totalApproved,
    totalPending,
    totalUsers,
    totalAlumniWithDetails,
  };
}

export default async function AdminDashboard() {
  await requireAdmin();
  const stats = await getAdminStats();

  return (
    <div className="max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-sm sm:text-base text-zinc-600">Overview of your alumni management system</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <StatsCard
          title="Total Alumni"
          value={stats.totalApproved}
          icon={Users}
          description="Approved alumni profiles"
        />
        <StatsCard
          title="Pending Approvals"
          value={stats.totalPending}
          icon={Clock}
          description="Awaiting review"
          className={stats.totalPending > 0 ? "border-yellow-200 bg-yellow-50/50" : ""}
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={UserCheck}
          description="Registered users"
        />
        <StatsCard
          title="Active Profiles"
          value={stats.totalAlumniWithDetails}
          icon={TrendingUp}
          description="Profiles with complete details"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-zinc-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/alumni"
            className="p-3 sm:p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-blue-300 transition-colors"
          >
            <div className="text-sm sm:text-base font-medium text-zinc-900">Review Pending Approvals</div>
            <div className="text-xs sm:text-sm text-zinc-600 mt-1">
              {stats.totalPending} profile{stats.totalPending !== 1 ? "s" : ""} waiting
            </div>
          </a>
          <a
            href="/admin/create-alumni"
            className="p-3 sm:p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-blue-300 transition-colors"
          >
            <div className="text-sm sm:text-base font-medium text-zinc-900">Create New Alumni</div>
            <div className="text-xs sm:text-sm text-zinc-600 mt-1">Add alumni manually</div>
          </a>
          <a
            href="/admin/import"
            className="p-3 sm:p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-blue-300 transition-colors"
          >
            <div className="text-sm sm:text-base font-medium text-zinc-900">Import Alumni</div>
            <div className="text-xs sm:text-sm text-zinc-600 mt-1">Bulk import from CSV</div>
          </a>
          <a
            href="/admin/invites"
            className="p-3 sm:p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-blue-300 transition-colors"
          >
            <div className="text-sm sm:text-base font-medium text-zinc-900">Send Invites</div>
            <div className="text-xs sm:text-sm text-zinc-600 mt-1">Generate invite codes</div>
          </a>
          <a
            href="/admin/alumni-list"
            className="p-3 sm:p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-blue-300 transition-colors"
          >
            <div className="text-sm sm:text-base font-medium text-zinc-900">View All Alumni</div>
            <div className="text-xs sm:text-sm text-zinc-600 mt-1">Complete alumni directory</div>
          </a>
        </div>
      </div>
    </div>
  );
}

