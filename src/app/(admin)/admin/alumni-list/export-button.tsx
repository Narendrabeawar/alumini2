"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { showToast } from "@/lib/toast";

type Alumni = {
  id: string;
  name: string;
  email: string;
  gradYear: number | null;
  department: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  location: string | null;
};

export function ExportButton({ data }: { data: Alumni[] }) {
  function exportAll() {
    try {
      // Stream full export from server to avoid client memory limits
      window.location.href = "/api/admin/alumni/export";
      if (!data.length) {
        // still provide feedback if current page empty
        showToast.info("Export started. Generating CSV...");
      }
    } catch (error) {
      console.error("Export error:", error);
      showToast.error("Failed to start export");
    }
  }

  return (
    <Button onClick={exportAll} variant="outline" className="gap-2">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}

