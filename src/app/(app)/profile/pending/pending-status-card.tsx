"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle, Home, LogOut, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PendingStatusCardProps {
  status: string;
}

export default function PendingStatusCard({ status }: PendingStatusCardProps) {
  const router = useRouter();
  const supabase = createClient();

  const statusConfig = {
    pending: {
      icon: Clock,
      title: "Approval Pending",
      message: "Your profile is under review. We'll notify you once it's approved.",
      color: "text-yellow-600",
    },
    rejected: {
      icon: XCircle,
      title: "Approval Rejected",
      message: "Your profile submission was not approved. You can update your information and resubmit for review.",
      color: "text-red-600",
    },
    approved: {
      icon: CheckCircle2,
      title: "Approved",
      message: "Your profile has been approved!",
      color: "text-green-600",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  async function handleLogout() {
    await supabase.auth.signOut();
    // Use window.location for full page navigation after logout
    window.location.href = "/";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm"
    >
      <Icon className={`mx-auto mb-4 h-16 w-16 ${config.color}`} />
      <h1 className="text-2xl font-semibold mb-2">{config.title}</h1>
      <p className="text-zinc-600 mb-6">{config.message}</p>
      {status === "pending" && (
        <p className="text-sm text-zinc-500 mb-6">
          This usually takes 1-2 business days. Thank you for your patience!
        </p>
      )}

      {status === "rejected" && (
        <div className="mb-6 space-y-3">
          <p className="text-sm text-zinc-500">
            Please review your information and resubmit your profile for approval.
          </p>
          <Button
            onClick={() => {
              // Use window.location for full page navigation
              window.location.href = "/profile/setup";
            }}
            className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Resubmit Profile
          </Button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Button
          variant="outline"
          onClick={() => {
            // For rejected users, go to setup. For pending, go to home (which will redirect appropriately)
            if (status === "rejected") {
              window.location.href = "/profile/setup";
            } else {
              window.location.href = "/";
            }
          }}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          {status === "rejected" ? "Go to Setup" : "Go to Home"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            // Try to go back, if no history, go to home
            if (window.history.length > 1) {
              router.back();
            } else {
              window.location.href = "/";
            }
          }}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </motion.div>
  );
}

