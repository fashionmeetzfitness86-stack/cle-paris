import { useRef, useState, useEffect } from "react";

/** Detects video source type from URL */
function getVideoType(url: string): "youtube" | "vimeo" | "direct" | "none" {
  if (!url || url.trim() === "") return "none";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("vimeo.com")) return "vimeo";
  return "direct";
}

function getYouTubeEmbedUrl(url: string): string {
  // Handle: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
  const match =
    url.match(/youtu\.be\/([^?&]+)/) ??
    url.match(/[?&]v=([^?&]+)/) ??
    url.match(/embed\/([^?&]+)/);
  const id = match?.[1] ?? "";
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&playsinline=1`;
}

function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const id = match?.[1] ?? "";
  return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&controls=0&background=1`;
}

interface VideoHeroProps {
  /** Supabase storage URL, YouTube, Vimeo, or any direct .mp4/.webm URL */
  videoUrl?: string;
  /** Fallback poster image — shown while video loads, or if no video */
  posterUrl?: string;
  /** If true, video is disabled (respects prefers-reduced-motion) */
  noMotion?: boolean;
  className?: string;
}

/**
 * VideoHero — Cinematic full-bleed background video/image.
 *
 * Handles YouTube iframes, Vimeo iframes, direct video files,
 * and image-only fallback. Ken Burns zoom on the poster image.
 * Always respects prefers-reduced-motion.
 */
export default function VideoHero({
  videoUrl = "",
  posterUrl = "",
  noMotion = false,
  className = "",
}: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const shouldAnimate = !noMotion && !prefersReduced;
  const type = getVideoType(videoUrl);
  const hasVideo = type !== "none" && shouldAnimate;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* ── Poster / fallback image ────────────────────────────── */}
      {posterUrl && (
        <img
          src={posterUrl}
          alt=""
          aria-hidden
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            hasVideo && videoLoaded ? "opacity-0" : "opacity-100"
          } ${shouldAnimate ? "animate-ken-burns" : ""}`}
        />
      )}

      {/* ── Direct video file (.mp4/.webm/.mov) ───────────────── */}
      {type === "direct" && shouldAnimate && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={videoUrl} />
        </video>
      )}

      {/* ── YouTube embed ─────────────────────────────────────── */}
      {type === "youtube" && shouldAnimate && (
        <iframe
          src={getYouTubeEmbedUrl(videoUrl)}
          allow="autoplay; encrypted-media"
          allowFullScreen
          onLoad={() => setVideoLoaded(true)}
          className="absolute inset-[-60px] w-[calc(100%+120px)] h-[calc(100%+120px)] pointer-events-none"
          title="Hero background video"
        />
      )}

      {/* ── Vimeo embed ──────────────────────────────────────── */}
      {type === "vimeo" && shouldAnimate && (
        <iframe
          src={getVimeoEmbedUrl(videoUrl)}
          allow="autoplay; fullscreen"
          onLoad={() => setVideoLoaded(true)}
          className="absolute inset-[-60px] w-[calc(100%+120px)] h-[calc(100%+120px)] pointer-events-none"
          title="Hero background video"
        />
      )}

      {/* ── Cinematic gradient overlay ────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 pointer-events-none"
      />
    </div>
  );
}
