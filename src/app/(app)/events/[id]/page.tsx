import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, MapPin, Clock, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format } from "date-fns";
import { RegisterButton } from "./register-button";
import { getAvatarPublicUrl } from "@/lib/avatar";

async function getEvent(id: string) {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      created_by_profile:profiles!events_created_by_fkey(id, full_name, avatar_url)
    `)
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !event) {
    return null;
  }

  return event;
}

async function getAttendees(eventId: string) {
  const supabase = await createClient();

  const { data: attendees, error } = await supabase
    .from("event_attendees")
    .select(`
      *,
      user:profiles!event_attendees_user_id_fkey(id, full_name, avatar_url)
    `)
    .eq("event_id", eventId)
    .eq("status", "registered")
    .order("registered_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching attendees:", error);
    return [];
  }

  return attendees || [];
}

async function checkRegistration(eventId: string, userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("event_attendees")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .eq("status", "registered")
    .single();

  return !!data;
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const event = await getEvent(params.id);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Event Not Found</h1>
          <p className="text-zinc-600 mb-4">
            The event you're looking for doesn't exist or is not published.
          </p>
          <Button asChild>
            <a href="/events">Back to Events</a>
          </Button>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const isFull = event.max_attendees && event.current_attendees >= event.max_attendees;
  const isRegistered = await checkRegistration(event.id, user.id);
  const attendees = await getAttendees(event.id);

  // Get avatar URLs for attendees
  const attendeesWithAvatars = await Promise.all(
    attendees.map(async (attendee: any) => {
      if (attendee.user?.avatar_url) {
        const avatarUrl = await getAvatarPublicUrl(supabase, attendee.user.avatar_url);
        return { ...attendee, user: { ...attendee.user, avatar_url: avatarUrl } };
      }
      return attendee;
    })
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <a href="/events">← Back to Events</a>
        </Button>
      </div>

      {event.image_url && (
        <div className="relative h-96 w-full rounded-lg overflow-hidden mb-8">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-bold text-zinc-900">{event.title}</h1>
            {isPast && <Badge variant="secondary">Past Event</Badge>}
            {isFull && !isPast && <Badge variant="destructive">Full</Badge>}
          </div>

          {event.description && (
            <div className="prose max-w-none mb-8">
              <p className="text-zinc-700 whitespace-pre-line">{event.description}</p>
            </div>
          )}

          {event.registration_required && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
                Attendees ({attendees.length}
                {event.max_attendees ? ` / ${event.max_attendees}` : ""})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {attendeesWithAvatars.map((attendee: any) => (
                  <div
                    key={attendee.id}
                    className="flex flex-col items-center p-3 bg-zinc-50 rounded-lg"
                  >
                    {attendee.user?.avatar_url ? (
                      <Image
                        src={attendee.user.avatar_url}
                        alt={attendee.user.full_name || "User"}
                        width={48}
                        height={48}
                        className="rounded-full mb-2"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                    )}
                    <p className="text-sm text-zinc-700 text-center line-clamp-1">
                      {attendee.user?.full_name || "Anonymous"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-zinc-200 p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6">
              Event Details
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-zinc-900">Date & Time</p>
                  <p className="text-sm text-zinc-600">
                    {format(eventDate, "PPP 'at' p")}
                  </p>
                  {event.event_end_date && (
                    <p className="text-sm text-zinc-600 mt-1">
                      Ends: {format(new Date(event.event_end_date), "PPP 'at' p")}
                    </p>
                  )}
                </div>
              </div>

              {(event.location || event.venue) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-zinc-900">Location</p>
                    <p className="text-sm text-zinc-600">
                      {event.venue || event.location}
                    </p>
                  </div>
                </div>
              )}

              {event.registration_required && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-zinc-900">Registration</p>
                    <p className="text-sm text-zinc-600">
                      {event.current_attendees}
                      {event.max_attendees ? ` / ${event.max_attendees}` : ""} registered
                    </p>
                  </div>
                </div>
              )}

              {event.created_by_profile && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-zinc-900">Created by</p>
                    <p className="text-sm text-zinc-600">
                      {event.created_by_profile.full_name || "Admin"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {event.registration_required && !isPast && (
              <RegisterButton
                eventId={event.id}
                isRegistered={isRegistered}
                isFull={isFull || false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

