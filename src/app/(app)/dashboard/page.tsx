import { requireUser, getApprovalStatus } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getDashboardStats(userId: string) {
  const supabase = await createClient();
  
  // Get total approved alumni count
  const { data: alumniData } = await supabase
    .from("alumni_details")
    .select("id");
  
  const totalAlumni = alumniData?.length || 0;

  // Get user's profile completion status
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", userId)
    .single();

  const { data: details } = await supabase
    .from("alumni_details")
    .select("headline, bio, grad_year, department, current_company, current_title")
    .eq("id", userId)
    .single();

  const profileComplete = !!(profile?.full_name && details?.headline);

  return {
    totalAlumni,
    profileComplete,
    profileName: profile?.full_name || "User",
  };
}

export default async function DashboardPage() {
  const user = await requireUser();
  const status = await getApprovalStatus(user.id);
  
  if (status !== "approved") {
    redirect("/profile/pending");
  }

  const stats = await getDashboardStats(user.id);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
          Welcome back, {stats.profileName}!
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 mt-2">Here's what's happening in your alumni network.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlumni}</div>
            <p className="text-xs text-muted-foreground">Approved members in directory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.profileComplete ? "Complete" : "Incomplete"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.profileComplete 
                ? "Your profile is up to date" 
                : "Update your profile to get started"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Approved</div>
            <p className="text-xs text-muted-foreground">You can access all features</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/alumni">
                <Users className="w-4 h-4 mr-2" />
                Browse Alumni Directory
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/profile">
                <User className="w-4 h-4 mr-2" />
                Edit My Profile
              </Link>
            </Button>
            {!stats.profileComplete && (
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/profile/setup">
                  <FileText className="w-4 h-4 mr-2" />
                  Complete Profile Setup
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600">No recent activity to display.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

