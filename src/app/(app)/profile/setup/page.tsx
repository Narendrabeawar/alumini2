import { requireUser, getApprovalStatus } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileSetupForm from "./profile-setup-form";

export default async function ProfileSetupPage() {
  const user = await requireUser();
  const status = await getApprovalStatus(user.id);

  // If already approved, redirect to profile page
  if (status === "approved") {
    redirect("/profile");
  }

  // Allow rejected users to access setup page to resubmit
  // Don't redirect rejected users - they need to resubmit

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold mb-6">
        {status === "rejected" ? "Resubmit Your Profile" : "Complete Your Profile"}
      </h1>
      <p className="text-zinc-600 mb-8">
        {status === "rejected" 
          ? "Please update your information and resubmit for review. Your previous submission was not approved."
          : "Please fill in your details below. Your profile will be reviewed before being made public."}
      </p>
      <ProfileSetupForm userId={user.id} />
    </div>
  );
}

