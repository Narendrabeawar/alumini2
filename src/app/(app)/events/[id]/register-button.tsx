"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function RegisterButton({
  eventId,
  isRegistered,
  isFull,
}: {
  eventId: string;
  isRegistered: boolean;
  isFull: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister() {
    if (isRegistered) return;

    setLoading(true);
    trackEvent("event_register_submit", { eventId });
    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast.error(data.error || "Failed to register");
        return;
      }

      showToast.success("Successfully registered for the event!");
      trackEvent("event_register_success", { eventId });
      router.refresh();
    } catch (error) {
      showToast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isRegistered) {
    return (
      <Button disabled className="w-full" variant="outline">
        Already Registered
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button disabled className="w-full" variant="outline">
        Event Full
      </Button>
    );
  }

  return (
    <Button
      onClick={handleRegister}
      disabled={loading}
      className="w-full"
    >
      {loading ? "Registering..." : "Register for Event"}
    </Button>
  );
}

