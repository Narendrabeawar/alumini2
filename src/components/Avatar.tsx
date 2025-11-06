"use client";

import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  alt: string;
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-12 h-12 text-base",
  md: "w-16 h-16 text-xl",
  lg: "w-24 h-24 text-2xl",
};

export default function Avatar({ src, alt, initials, size = "md", className = "" }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClass = sizeClasses[size];

  if (!src || imageError) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-bold border-2 border-zinc-100 ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} relative rounded-full overflow-hidden border-2 border-zinc-100 ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-zinc-100 animate-pulse flex items-center justify-center">
          <span className="text-zinc-400 text-xs">Loading...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} rounded-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onError={(e) => {
          console.error(`Avatar image failed to load: ${src}`);
          setImageError(true);
          setImageLoading(false);
        }}
        onLoad={() => {
          setImageLoading(false);
        }}
      />
    </div>
  );
}

