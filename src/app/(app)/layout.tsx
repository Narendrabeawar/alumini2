import { getSession, getAdminStatus, getApprovalStatus } from "@/lib/auth";
import { AdminLayout } from "@/components/AdminLayoutWrapper";
import { UserDashboardLayout } from "@/components/UserDashboardLayout";
import Navbar from "@/components/Navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  let isAdmin = false;
  let isApproved = false;

  if (user) {
    isAdmin = await getAdminStatus(user.id);
    if (!isAdmin) {
      const status = await getApprovalStatus(user.id);
      isApproved = status === "approved";
    }
  }

  // If admin, show admin layout with sidebar
  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // If approved user, always show dashboard layout with sidebar
  // Dashboard layout will be used for dashboard, alumni, and profile pages
  if (isApproved) {
    return <UserDashboardLayout>{children}</UserDashboardLayout>;
  }

  // Regular user layout - with navbar (for pending/setup pages)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </div>
    </div>
  );
}

