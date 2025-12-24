"use client";

import Link from "next/link";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { format } from "date-fns";
import { CountdownTimer } from "@/components/CountdownTimer";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    event_end_date: string | null;
    location: string | null;
    venue: string | null;
    image_url: string | null;
    registration_required: boolean;
    max_attendees: number | null;
    current_attendees: number;
    created_at: string;
  };
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const isFull = event.max_attendees && event.current_attendees >= event.max_attendees;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {event.image_url && (
        <div className="relative h-40 sm:h-48 w-full">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 line-clamp-2 flex-1 pr-2">
            {event.title}
          </h3>
          {isPast && <Badge variant="secondary">Past</Badge>}
          {isFull && !isPast && <Badge variant="destructive">Full</Badge>}
        </div>

        {event.description && (
          <p className="text-zinc-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-2 text-xs sm:text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{format(eventDate, "PPP 'at' p")}</span>
          </div>

          {!isPast && (
            <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
              <CountdownTimer eventDate={event.event_date} />
            </div>
          )}

          {event.event_end_date && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Ends: {format(new Date(event.event_end_date), "PPP 'at' p")}</span>
            </div>
          )}

          {(event.location || event.venue) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{event.venue || event.location}</span>
            </div>
          )}

          {event.registration_required && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>
                {event.current_attendees}
                {event.max_attendees ? ` / ${event.max_attendees}` : ""} registered
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 sm:pb-6 px-4 sm:px-6">
        <Button asChild className="w-full text-sm sm:text-base">
          <Link href={`/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
