import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const supabase = await createClient();
    const body = await req.json();

    const { event_id } = body;

    if (!event_id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if event exists and is published
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, registration_required, max_attendees, current_attendees, is_published")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.is_published) {
      return NextResponse.json(
        { error: "Event is not published" },
        { status: 400 }
      );
    }

    if (!event.registration_required) {
      return NextResponse.json(
        { error: "Event does not require registration" },
        { status: 400 }
      );
    }

    if (event.max_attendees && event.current_attendees >= event.max_attendees) {
      return NextResponse.json(
        { error: "Event is full" },
        { status: 400 }
      );
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from("event_attendees")
      .select("id")
      .eq("event_id", event_id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Already registered for this event" },
        { status: 400 }
      );
    }

    // Register
    const { data: registration, error: regError } = await supabase
      .from("event_attendees")
      .insert({
        event_id,
        user_id: user.id,
        status: "registered",
      })
      .select()
      .single();

    if (regError) {
      console.error("Error registering:", regError);
      return NextResponse.json(
        { error: regError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ registration }, { status: 201 });
  } catch (error: any) {
    console.error("Error in register for event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}


