import { requireAdmin } from "@/lib/auth";
import { AdminLayout } from "@/components/AdminLayoutWrapper";

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <AdminLayout>{children}</AdminLayout>;
}

