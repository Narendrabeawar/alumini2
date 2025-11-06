import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/EventCard";
import { redirect } from "next/navigation";

async function getEvents() {
  const supabase = await createClient();
  
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return events || [];
}

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const events = await getEvents();

  const upcomingEvents = events.filter(
    (e) => new Date(e.event_date) >= new Date()
  );
  const pastEvents = events.filter((e) => new Date(e.event_date) < new Date());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent mb-2">
          Events
        </h1>
        <p className="text-zinc-600">
          Stay updated with our latest events and gatherings
        </p>
      </div>

      {upcomingEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-6">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-6">
            Past Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-lg">No events available at the moment.</p>
        </div>
      )}
    </div>
  );
}

