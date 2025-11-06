"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";

interface Row {
  full_name: string;
  email: string;
  headline?: string;
  bio?: string;
  grad_year?: string;
  department?: string;
  company?: string;
  role?: string;
  location?: string;
  father_name?: string;
  primary_mobile?: string;
  whatsapp_number?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  github_url?: string;
  website_url?: string;
}

export default function ImportClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filename, setFilename] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function onFile(file: File) {
    setFilename(file.name);
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const cleaned = (result.data || []).map((r) => ({
          full_name: (r.full_name || "").trim(),
          email: (r.email || "").trim(),
          headline: (r.headline || "").trim(),
          bio: (r.bio || "").trim(),
          grad_year: (r.grad_year || "").trim(),
          department: (r.department || "").trim(),
          company: (r.company || "").trim(),
          role: (r.role || "").trim(),
          location: (r.location || "").trim(),
          father_name: (r.father_name || "").trim(),
          primary_mobile: (r.primary_mobile || "").trim(),
          whatsapp_number: (r.whatsapp_number || "").trim(),
          linkedin_url: (r.linkedin_url || "").trim(),
          twitter_url: (r.twitter_url || "").trim(),
          facebook_url: (r.facebook_url || "").trim(),
          instagram_url: (r.instagram_url || "").trim(),
          github_url: (r.github_url || "").trim(),
          website_url: (r.website_url || "").trim(),
        })).filter((r) => r.full_name && r.email);
        setRows(cleaned);
      },
    });
  }

  async function commit() {
    setUploading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: filename || "upload.csv", rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Commit failed");
      setMessage(`Imported ${data.inserted} rows into batch ${data.batch_id}`);
    } catch (e: any) {
      setMessage(e.message || "Commit failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />

      {rows.length > 0 && (
        <div className="rounded-lg border">
          <div className="flex items-center justify-between p-3 text-sm">
            <div>
              <div className="font-medium">Preview</div>
              <div className="text-zinc-600">{rows.length} rows parsed</div>
            </div>
            <Button onClick={commit} disabled={uploading}>Commit</Button>
          </div>
          <div className="max-h-[360px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Headline</th>
                  <th className="p-2 text-left">Year</th>
                  <th className="p-2 text-left">Department</th>
                  <th className="p-2 text-left">Company</th>
                  <th className="p-2 text-left">Role</th>
                  <th className="p-2 text-left">Location</th>
                  <th className="p-2 text-left">Mobile</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{r.full_name}</td>
                    <td className="p-2">{r.email}</td>
                    <td className="p-2 text-zinc-600 text-xs">{r.headline || "—"}</td>
                    <td className="p-2">{r.grad_year || "—"}</td>
                    <td className="p-2">{r.department || "—"}</td>
                    <td className="p-2">{r.company || "—"}</td>
                    <td className="p-2">{r.role || "—"}</td>
                    <td className="p-2 text-zinc-600 text-xs">{r.location || "—"}</td>
                    <td className="p-2 text-zinc-600 text-xs">{r.primary_mobile || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {message && (
        <div className="rounded-md border p-3 text-sm">{message}</div>
      )}
    </div>
  );
}
