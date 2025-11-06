import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  await requireAdmin();
  const { filename, rows } = await req.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "rows required" }, { status: 400 });
  }

  const supabase = await createClient();

  // create import batch
  const { data: batch, error: be } = await supabase
    .from("import_batches")
    .insert({ filename, row_count: rows.length, status: "committed" })
    .select("id")
    .single();

  if (be) return NextResponse.json({ error: be.message }, { status: 400 });

  // insert imported rows with all profile fields
  const toInsert = rows.map((r: any) => ({
    batch_id: batch.id,
    full_name: r.full_name,
    email: r.email,
    headline: r.headline || null,
    bio: r.bio || null,
    grad_year: r.grad_year ? Number(r.grad_year) : null,
    department: r.department || null,
    company: r.company || null,
    role: r.role || null,
    location: r.location || null,
    father_name: r.father_name || null,
    primary_mobile: r.primary_mobile || null,
    whatsapp_number: r.whatsapp_number || null,
    linkedin_url: r.linkedin_url || null,
    twitter_url: r.twitter_url || null,
    facebook_url: r.facebook_url || null,
    instagram_url: r.instagram_url || null,
    github_url: r.github_url || null,
    website_url: r.website_url || null,
  }));

  const { error: ie } = await supabase.from("imported_alumni").insert(toInsert);
  if (ie) return NextResponse.json({ error: ie.message }, { status: 400 });

  return NextResponse.json({ ok: true, inserted: toInsert.length, batch_id: batch.id });
}
