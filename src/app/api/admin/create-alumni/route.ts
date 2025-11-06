import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Check if admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if user already exists with this email
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id, full_name")
      .ilike("full_name", `%${body.fullName}%`)
      .limit(1);

    // For now, we'll add to imported_alumni and create an invite
    // This way admin can send invite later
    
    // Create import batch if needed
    const { data: batch, error: batchError } = await supabase
      .from("import_batches")
      .insert({
        filename: "manual_entry",
        uploaded_by: user.id,
        status: "committed",
        row_count: 1,
      })
      .select()
      .single();

    if (batchError && !batchError.message.includes("duplicate")) {
      return NextResponse.json({ error: batchError.message }, { status: 500 });
    }

    const batchId = batch?.id || (await supabase.from("import_batches").select("id").order("created_at", { ascending: false }).limit(1).single()).data?.id;

    // Add to imported_alumni
    const { data: imported, error: importError } = await supabase
      .from("imported_alumni")
      .insert({
        batch_id: batchId,
        external_id: `MANUAL_${Date.now()}`,
        full_name: body.fullName,
        email: body.email,
        grad_year: body.gradYear ? parseInt(body.gradYear) : null,
        department: body.department,
        company: body.currentCompany,
        role: body.currentTitle,
        invite_status: "pending",
      })
      .select()
      .single();

    if (importError) {
      return NextResponse.json({ error: importError.message }, { status: 500 });
    }

    // If we have existing user data, we can also create profile directly
    // But for safety, we'll use the invite system
    
    return NextResponse.json({ 
      success: true, 
      message: "Alumni added to imported list. You can now send an invite from the Invites page.",
      importedId: imported.id 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create alumni" }, { status: 500 });
  }
}

