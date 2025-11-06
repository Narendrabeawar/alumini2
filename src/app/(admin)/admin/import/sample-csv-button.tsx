"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { showToast } from "@/lib/toast";

export function SampleCsvButton() {
  function downloadSampleCSV() {
    try {
      // Sample CSV data with all profile fields as headers
      const headers = [
        "full_name",
        "email",
        "headline",
        "bio",
        "grad_year",
        "department",
        "company",
        "role",
        "location",
        "father_name",
        "primary_mobile",
        "whatsapp_number",
        "linkedin_url",
        "twitter_url",
        "facebook_url",
        "instagram_url",
        "github_url",
        "website_url",
      ];

      // Sample rows with example data
      const sampleRows = [
        [
          "John Doe",
          "john.doe@example.com",
          "Senior Software Engineer",
          "Passionate developer with 5+ years of experience in full-stack development",
          "2020",
          "Computer Science",
          "Tech Corp",
          "Software Engineer",
          "Bangalore, India",
          "John Doe Sr.",
          "+91 9876543210",
          "+91 9876543210",
          "https://linkedin.com/in/johndoe",
          "https://twitter.com/johndoe",
          "https://facebook.com/johndoe",
          "https://instagram.com/johndoe",
          "https://github.com/johndoe",
          "https://johndoe.com",
        ],
        [
          "Jane Smith",
          "jane.smith@example.com",
          "Senior Developer",
          "Experienced in building scalable applications",
          "2019",
          "Electronics Engineering",
          "Innovation Labs",
          "Senior Developer",
          "Hyderabad, India",
          "Jane Smith Sr.",
          "+91 9876543211",
          "+91 9876543211",
          "https://linkedin.com/in/janesmith",
          "",
          "",
          "",
          "https://github.com/janesmith",
          "",
        ],
        [
          "Rajesh Kumar",
          "rajesh.kumar@example.com",
          "Mechanical Designer",
          "Expert in product design and development",
          "2021",
          "Mechanical Engineering",
          "Auto Industries",
          "Mechanical Designer",
          "Pune, India",
          "Rajesh Kumar Sr.",
          "+91 9876543212",
          "+91 9876543212",
          "https://linkedin.com/in/rajeshkumar",
          "",
          "",
          "",
          "",
          "",
        ],
      ];

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...sampleRows.map((row) =>
          row
            .map((cell) => {
              // Escape commas and quotes in cells
              const cellStr = String(cell);
              if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
                return `"${cellStr.replace(/"/g, '""')}"`;
              }
              return cellStr;
            })
            .join(",")
        ),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "sample_alumni_import.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast.success("Sample CSV downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      showToast.error("Failed to download sample CSV");
    }
  }

  return (
    <Button
      onClick={downloadSampleCSV}
      variant="outline"
      className="gap-2"
    >
      <FileText className="h-4 w-4" />
      Download Sample CSV
    </Button>
  );
}

