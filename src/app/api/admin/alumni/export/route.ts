import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  await requireAdmin();
  const supabase = await createClient();

  // 1) Fetch approved user ids
  const { data: approvedFlags, error: flagsError } = await supabase
    .from("admin_flags")
    .select("user_id")
    .eq("status", "approved");

  if (flagsError) {
    return NextResponse.json({ error: flagsError.message }, { status: 400 });
  }

  const userIds: string[] = (approvedFlags || []).map((f: any) => f.user_id);

  const encoder = new TextEncoder();
  const headers = [
    "Name",
    "Email",
    "Graduation Year",
    "Department",
    "Company",
    "Title",
    "Location",
  ];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // write header
      controller.enqueue(encoder.encode(headers.join(",") + "\n"));

      if (!userIds.length) {
        controller.close();
        return;
      }

      // Process in batches to avoid large IN() lists
      const BATCH = 500;
      for (let i = 0; i < userIds.length; i += BATCH) {
        const batchIds = userIds.slice(i, i + BATCH);

        const { data: alumniData, error: alumniError } = await supabase
          .from("alumni_details")
          .select("id, grad_year, department, current_company, current_title, location")
          .in("id", batchIds);

        if (alumniError) {
          controller.enqueue(encoder.encode(`# error: ${alumniError.message}\n`));
          continue;
        }

        const pageUserIds = (alumniData || []).map((a: any) => a.id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", pageUserIds);

        const profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]));

        for (const row of alumniData || []) {
          const profile = profilesMap.get(row.id);
          const record = [
            profile?.full_name ?? "",
            "", // email omitted (requires admin auth.users)
            row.grad_year?.toString() ?? "",
            row.department ?? "",
            row.current_company ?? "",
            row.current_title ?? "",
            row.location ?? "",
          ];
          // escape CSV cells
          const escaped = record.map((cell) => {
            const str = String(cell);
            return str.includes(",") || str.includes('"') || str.includes("\n")
              ? '"' + str.replace(/"/g, '""') + '"'
              : str;
          });
          controller.enqueue(encoder.encode(escaped.join(",") + "\n"));
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=alumni_export_${new Date().toISOString().split("T")[0]}.csv`,
      "Cache-Control": "no-store",
    },
  });
}


