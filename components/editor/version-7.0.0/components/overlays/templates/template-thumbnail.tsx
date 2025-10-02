import { Play } from "lucide-react";
import { useState } from "react";

interface TemplateThumbnailProps {
  thumbnail?: string;
  name: string;
  className?: string;
}

export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  thumbnail,
  name,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  // Show fallback if no thumbnail or if image failed to load
  if (!thumbnail || imageError) {
    return (
      <div
        className={`relative aspect-video overflow-hidden rounded-md ${className} bg-gradient-to-br from-blue-500/80 to-purple-600/80 flex items-center justify-center`}
      >
        <Play className="w-12 h-12 text-white/90" />
        <div className="absolute inset-0 bg-black/10" />
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-md ${className}`}
    >
      <img
        src={thumbnail}
        alt={name}
        className="object-cover w-full h-full"
        onError={() => setImageError(true)}
      />
    </div>
  );
};
