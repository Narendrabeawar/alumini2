"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { getAvatarPublicUrlSync } from "@/lib/avatar";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface AdminImageUploaderProps {
  value: string | null;
  onChange: (path: string | null) => void;
  userId?: string; // Optional: for temporary uploads before user creation
}

export default function AdminImageUploader({ value, onChange, userId }: AdminImageUploaderProps) {
  const supabase = createClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);

  useEffect(() => {
    if (value) {
      const publicUrl = getAvatarPublicUrlSync(supabase, value);
      setPreviewUrl(publicUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [value, supabase]);

  function validateFile(selectedFile: File): string | null {
    // Check file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      return `Invalid file type. Allowed types: JPG, PNG, WebP`;
    }

    return null;
  }

  async function compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1, // Maximum file size in MB
      maxWidthOrHeight: 1920, // Maximum width or height
      useWebWorker: true,
      fileType: file.type.includes('png') ? 'image/png' : 'image/jpeg',
    };

    try {
      const compressed = await imageCompression(file, options);
      return compressed;
    } catch (error) {
      console.error("Compression error:", error);
      throw new Error("Failed to compress image");
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      e.target.value = ""; // Reset input
      return;
    }

    setError(null);
    setFile(selectedFile);
    setCompressedFile(null);
    setOriginalFileSize(selectedFile.size);

    // If file is larger than 1MB, compress it automatically
    let fileToPreview = selectedFile;
    if (selectedFile.size > MAX_FILE_SIZE) {
      setCompressing(true);
      try {
        const compressed = await compressImage(selectedFile);
        setCompressedFile(compressed);
        setFile(compressed); // Use compressed file for upload
        fileToPreview = compressed; // Use compressed for preview
        
        // Show info message
        const originalSize = (selectedFile.size / 1024 / 1024).toFixed(2);
        const newSize = (compressed.size / 1024 / 1024).toFixed(2);
        console.log(`Image compressed from ${originalSize}MB to ${newSize}MB`);
      } catch (err: any) {
        setError(err.message || "Failed to compress image. Please try a smaller image.");
        e.target.value = "";
        setFile(null);
        setCompressedFile(null);
        setOriginalFileSize(0);
        return;
      } finally {
        setCompressing(false);
      }
    } else {
      setOriginalFileSize(0); // No compression needed
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(fileToPreview);
  }

  async function handleUpload() {
    const fileToUpload = compressedFile || file;
    if (!fileToUpload) return;

    setUploading(true);
    setError(null);

    try {
      // Generate a unique path for temporary uploads or use userId if available
      const uploadId = userId || `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const ext = fileToUpload.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${uploadId}/avatar.${ext}`;

      // Delete old file if exists
      if (value) {
        await supabase.storage.from("avatars").remove([value]);
      }

      // Upload new file (use compressed if available)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, fileToUpload, { upsert: true });

      if (uploadError) throw uploadError;

      // Update parent with new path
      onChange(path);
      setFile(null);
      setCompressedFile(null);
      setOriginalFileSize(0);
    } catch (e: any) {
      console.error("Image upload error:", e);
      setError(e.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setFile(null);
    setCompressedFile(null);
    setOriginalFileSize(0);
    setPreviewUrl(value ? getAvatarPublicUrlSync(supabase, value) : null);
    setError(null);
  }

  function handleCancel() {
    setFile(null);
    setCompressedFile(null);
    setOriginalFileSize(0);
    setPreviewUrl(value ? getAvatarPublicUrlSync(supabase, value) : null);
    setError(null);
  }

  const hasNewFile = file !== null;
  const showPreview = previewUrl !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="h-32 w-32 overflow-hidden rounded-lg border-2 border-zinc-200 bg-zinc-50 flex items-center justify-center">
          {showPreview ? (
            <Image
              src={previewUrl}
              alt="Profile preview"
              width={128}
              height={128}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-400">
              <ImageIcon className="w-8 h-8 mb-2" />
              <span className="text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              id="admin-image-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="admin-image-upload">
              <Button type="button" asChild disabled={uploading || compressing} variant="outline">
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {hasNewFile ? "Change Image" : value ? "Change Image" : "Upload Image"}
                </span>
              </Button>
            </label>

            {hasNewFile && (
              <>
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading || compressing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {compressing ? "Compressing..." : uploading ? "Uploading..." : "Save Image"}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  disabled={uploading}
                  variant="outline"
                >
                  Cancel
                </Button>
              </>
            )}

            {value && !hasNewFile && (
              <Button
                type="button"
                onClick={async () => {
                  if (confirm("Are you sure you want to remove this image?")) {
                    try {
                      await supabase.storage.from("avatars").remove([value]);
                      onChange(null);
                    } catch (e) {
                      console.error("Error removing image:", e);
                    }
                  }
                }}
                variant="outline"
                disabled={uploading}
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            )}
          </div>

          {compressing && (
            <p className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded px-3 py-2">
              Compressing image to reduce file size...
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          {compressedFile && originalFileSize > MAX_FILE_SIZE && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
              ✓ Image compressed from {(originalFileSize / 1024 / 1024).toFixed(2)}MB to {(compressedFile.size / 1024 / 1024).toFixed(2)}MB
            </p>
          )}

          <p className="text-xs text-zinc-500">
            Maximum file size: 1MB (will be automatically compressed if larger). Allowed formats: JPG, PNG, WebP
          </p>
        </div>
      </div>
    </div>
  );
}

