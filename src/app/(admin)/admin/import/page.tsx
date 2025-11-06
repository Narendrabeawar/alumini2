import { requireAdmin } from "@/lib/auth";
import ImportClient from "./upload-client";
import { SampleCsvButton } from "./sample-csv-button";

export default async function ImportPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
          Import Alumni (CSV)
        </h1>
        <p className="text-sm text-zinc-600 mb-4">
          Upload a CSV file with headers. <strong>Required:</strong> <code className="bg-zinc-100 px-2 py-1 rounded text-xs">full_name, email</code>. 
          <strong> Optional:</strong> All profile fields (headline, bio, grad_year, department, company, role, location, father_name, contact details, etc.)
        </p>
        <div className="flex items-center gap-4">
          <SampleCsvButton />
          <p className="text-xs text-zinc-500">
            Download a sample CSV file to see the required format
          </p>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">CSV Format Requirements:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Required columns:</strong> full_name, email</li>
          <li><strong>Optional columns:</strong> headline, bio, grad_year, department, company, role, location, father_name, primary_mobile, whatsapp_number, linkedin_url, twitter_url, facebook_url, instagram_url, github_url, website_url</li>
          <li>First row must contain column headers</li>
          <li>Each row represents one alumni member</li>
          <li>Email addresses must be unique</li>
          <li>All imported data will be available when user claims their invite</li>
        </ul>
      </div>

      <ImportClient />
    </div>
  );
}
