import { redirect } from "next/navigation";
import { getSession, getApprovalStatus, getAdminStatus, hasProfileSetup } from "@/lib/auth";
import LandingContent from "./landing-content";

export default async function Home() {
  const user = await getSession();

  if (user) {
    // Check if admin first - redirect to admin panel
    const isAdmin = await getAdminStatus(user.id);
    if (isAdmin) {
      redirect("/admin/alumni");
      return;
    }

    // Check if user has completed profile setup
    const hasSetup = await hasProfileSetup(user.id);
    
    if (!hasSetup) {
      // New user hasn't filled profile setup yet
      redirect("/profile/setup");
      return;
    }

    // User has filled profile, check approval status
    const status = await getApprovalStatus(user.id);
    if (status === "pending" || status === "rejected") {
      redirect("/profile/pending");
      return;
    }
    if (status === "approved") {
      redirect("/dashboard");
      return;
    }
    
    // Fallback to setup
    redirect("/profile/setup");
  }

  return <LandingContent />;
}
