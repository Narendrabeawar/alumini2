import { requireUser, getApprovalStatus } from "@/lib/auth";
import PendingStatusCard from "./pending-status-card";

export default async function PendingApprovalPage() {
  const user = await requireUser();
  const status = await getApprovalStatus(user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <PendingStatusCard status={status} />
    </div>
  );
}

