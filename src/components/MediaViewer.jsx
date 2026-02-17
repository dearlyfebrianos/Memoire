import { useState } from "react";
import { isVideoUrl } from "../data/githubSync";

function getYouTubeId(url) {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

function getGDriveId(url) {
  const m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function VideoPlayer({ url, className = "", style = {} }) {
  const ytId = getYouTubeId(url);
  const gdId = getGDriveId(url);

  if (ytId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
        className={className}
        style={{ ...style, border: "none" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    );
  }

  if (gdId) {
    return (
      <iframe
        src={`https://drive.google.com/file/d/${gdId}/preview`}
        className={className}
        style={{ ...style, border: "none" }}
        allow="autoplay"
        allowFullScreen
        title="Google Drive video"
      />
    );
  }

  return (
    <video
      src={url}
      className={className}
      style={style}
      controls
      playsInline
      preload="metadata"
    />
  );
}

export function MediaItem({
  url,
  type,
  alt = "",
  className = "",
  style = {},
  onLoad,
  onError,
}) {
  const [errored, setErrored] = useState(false);
  const resolvedType = type || (isVideoUrl(url) ? "video" : "image");

  if (!url || errored) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ background: "rgba(255,255,255,0.03)", ...style }}
      >
        <div
          className="flex flex-col items-center gap-2"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span style={{ fontSize: "0.65rem" }}>Tidak dapat dimuat</span>
        </div>
      </div>
    );
  }

  if (resolvedType === "video") {
    return <VideoPlayer url={url} className={className} style={style} />;
  }

  return (
    <img
      src={url}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      style={style}
      onLoad={onLoad}
      onError={() => {
        setErrored(true);
        if (onError) onError();
      }}
    />
  );
}

export function MediaTypeBadge({ type, accentColor }) {
  if (type === "video") {
    return (
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-lg"
        style={{
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          border: `1px solid ${accentColor || "#e8c4a0"}35`,
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill={accentColor || "#e8c4a0"}
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <span style={{ fontSize: "0.6rem", color: accentColor || "#e8c4a0" }}>
          VIDEO
        </span>
      </div>
    );
  }
  return null;
}
