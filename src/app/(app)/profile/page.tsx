import { requireUser, getApprovalStatus } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileEditForm from "./profile-edit-form";
import { ProfileCompletionProgress } from "@/components/ProfileCompletionProgress";

async function loadData(userId: string) {
  const supabase = await createClient();
  const [{ data: profile }, { data: details }, { data: education }, { data: work }, { data: skills }] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url").eq("id", userId).single(),
    supabase.from("alumni_details").select("headline,bio,grad_year,department,current_company,current_title,location,father_name,primary_mobile,whatsapp_number,linkedin_url,twitter_url,facebook_url,instagram_url,github_url,website_url").eq("id", userId).single(),
    supabase.from("education").select("id,degree,major,start_year,end_year").eq("user_id", userId).order("start_year", { ascending: true }),
    supabase.from("work_history").select("id,company,role,start_date,end_date,description").eq("user_id", userId).order("start_date", { ascending: true }),
    supabase.from("skills").select("id,name").eq("user_id", userId).order("name"),
  ]);
  return { profile, details, education: education ?? [], work: work ?? [], skills: skills ?? [] };
}

export default async function ProfilePage() {
  const user = await requireUser();
  const status = await getApprovalStatus(user.id);
  if (status !== "approved") {
    redirect("/profile/pending");
  }

  const data = await loadData(user.id);

  // Calculate profile completion
  const profileCompletion = {
    fullName: !!data.profile?.full_name,
    avatar: !!data.profile?.avatar_url,
    headline: !!data.details?.headline,
    bio: !!data.details?.bio,
    gradYear: !!data.details?.grad_year,
    department: !!data.details?.department,
    company: !!data.details?.current_company,
    location: !!data.details?.location,
    education: data.education.length > 0,
    workHistory: data.work.length > 0,
    skills: data.skills.length > 0,
    contactDetails: !!(data.details?.primary_mobile || data.details?.linkedin_url || data.details?.whatsapp_number),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Edit Profile</h1>
        <p className="text-zinc-600">Update your alumni profile information</p>
      </div>
      
      <ProfileCompletionProgress profile={profileCompletion} />
      
      <ProfileEditForm userId={user.id} initialData={data} />
    </div>
  );
}
