"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { Calendar, MapPin, Users, Image as ImageIcon } from "lucide-react";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_end_date: "",
    location: "",
    venue: "",
    image_url: "",
    is_published: true,
    registration_required: false,
    max_attendees: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          event_date: formData.event_date,
          event_end_date: formData.event_end_date || null,
          location: formData.location || null,
          venue: formData.venue || null,
          image_url: formData.image_url || null,
          is_published: formData.is_published,
          registration_required: formData.registration_required,
          max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast.error(data.error || "Failed to create event");
        return;
      }

      showToast.success("Event created successfully!");
      router.push("/events");
    } catch (error) {
      console.error("Error creating event:", error);
      showToast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent mb-2">
          Create New Event
        </h1>
        <p className="text-zinc-600">
          Add a new event that will be visible to all users
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Event Information</h2>

          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Annual Alumni Meet 2024"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the event, agenda, speakers, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Event Image URL</Label>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-zinc-500" />
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/event-image.jpg"
              />
            </div>
            <p className="text-xs text-zinc-500">
              Optional: URL to an image for this event
            </p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Date & Time
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Start Date & Time *</Label>
              <Input
                id="event_date"
                type="datetime-local"
                required
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_end_date">End Date & Time</Label>
              <Input
                id="event_end_date"
                type="datetime-local"
                value={formData.event_end_date}
                onChange={(e) => setFormData({ ...formData, event_end_date: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="Grand Hotel Ballroom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (City/Address)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ajmer, Rajasthan"
              />
            </div>
          </div>
        </div>

        {/* Registration */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Registration Settings
          </h2>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="registration_required"
              checked={formData.registration_required}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  registration_required: e.target.checked,
                })
              }
              className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="registration_required" className="cursor-pointer">
              Require registration for this event
            </Label>
          </div>

          {formData.registration_required && (
            <div className="space-y-2">
              <Label htmlFor="max_attendees">Maximum Attendees</Label>
              <Input
                id="max_attendees"
                type="number"
                min="1"
                value={formData.max_attendees}
                onChange={(e) =>
                  setFormData({ ...formData, max_attendees: e.target.value })
                }
                placeholder="Leave empty for unlimited"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_published: e.target.checked,
                })
              }
              className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="is_published" className="cursor-pointer">
              Publish event immediately (users will be notified)
            </Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
