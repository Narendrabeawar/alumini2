"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getAvatarPublicUrlSync } from "@/lib/avatar";

export default function AvatarUploader({ userId, value, onChange }: { userId: string; value: string | null; onChange: (path: string) => void }) {
  const supabase = createClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      // Use getPublicUrl for preview instead of download
      const publicUrl = getAvatarPublicUrlSync(supabase, value);
      setPreviewUrl(publicUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [value, supabase]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      // Delete old avatar files in the user's folder
      if (value) {
        // Delete the old file
        const oldPath = value;
        await supabase.storage.from("avatars").remove([oldPath]);
      }
      
      // Also clean up any other old files in the user's folder
      const { data: oldFiles } = await supabase.storage.from("avatars").list(userId);
      if (oldFiles && oldFiles.length > 0) {
        const oldPaths = oldFiles.map(f => `${userId}/${f.name}`);
        await supabase.storage.from("avatars").remove(oldPaths);
      }
      
      // Upload new avatar with a simple name
      const ext = file.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      
      // Update the database with the new path
      onChange(path);
    } catch (e) {
      console.error("Avatar upload error:", e);
      setError("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 overflow-hidden rounded-full border bg-zinc-100">
        {previewUrl ? (
          <img src={previewUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">No Image</div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input id="avatar" type="file" accept="image/*" onChange={onFileChange} className="hidden" disabled={uploading} />
        <label htmlFor="avatar">
          <Button type="button" asChild disabled={uploading}>
            <span>{uploading ? "Uploading..." : value ? "Change Avatar" : "Upload Avatar"}</span>
          </Button>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
