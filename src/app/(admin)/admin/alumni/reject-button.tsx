"use client";

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { useState } from "react";

export function RejectButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Are you sure you want to reject this profile? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/approval/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject");
      }

      showToast.success("Profile rejected successfully");
      router.refresh();
    } catch (error: any) {
      showToast.error(error.message || "Failed to reject profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleReject} className="inline">
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="border-red-300 text-red-600 hover:bg-red-50"
        disabled={loading}
      >
        <XCircle className="w-4 h-4 mr-1" />
        {loading ? "Rejecting..." : "Reject"}
      </Button>
    </form>
  );
}

