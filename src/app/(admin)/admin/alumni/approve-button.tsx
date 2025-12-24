"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { useState } from "react";

export function ApproveButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleApprove(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/approval/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || error?.error || "Failed to approve");
      }

      showToast.success("Alumni profile approved successfully!");
      router.refresh();
    } catch (error: any) {
      showToast.error(error?.message || "Failed to approve profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleApprove} className="inline">
      <Button
        type="submit"
        size="sm"
        className="bg-green-600 hover:bg-green-700"
        disabled={loading}
      >
        <CheckCircle2 className="w-4 h-4 mr-1" />
        {loading ? "Approving..." : "Approve"}
      </Button>
    </form>
  );
}

