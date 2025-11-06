import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const body = await req.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      description,
      event_date,
      event_end_date,
      location,
      venue,
      image_url,
      is_published = true,
      registration_required = false,
      max_attendees,
    } = body;

    if (!title || !event_date) {
      return NextResponse.json(
        { error: "Title and event date are required" },
        { status: 400 }
      );
    }

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        title,
        description,
        event_date,
        event_end_date: event_end_date || null,
        location,
        venue,
        image_url: image_url || null,
        created_by: user.id,
        is_published,
        registration_required,
        max_attendees: max_attendees || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    console.error("Error in create event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}


