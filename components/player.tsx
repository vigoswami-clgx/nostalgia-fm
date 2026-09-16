"use client";

import { track as trackEvent } from "@vercel/analytics";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { playlists, type Track } from "@/lib/tracks";

type YouTubePlayerState = -1 | 0 | 1 | 2 | 3 | 5;

interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  loadVideoById(videoId: string): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

interface YouTubePlayerEvent {
  data: number;
}

interface YouTubePlayerErrorEvent {
  data: number;
}

interface YouTubePlayerConstructor {
  new (
    elementId: string,
    options: {
      videoId?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: YouTubePlayerEvent) => void;
        onError?: (event: YouTubePlayerErrorEvent) => void;
      };
    },
  ): YouTubePlayer;
}

declare global {
  interface Window {
    YT?: {
      Player?: YouTubePlayerConstructor;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const DESKTOP_PLAYER_NODE_ID = "nostalgia-youtube-player-desktop";
const MOBILE_PLAYER_NODE_ID = "nostalgia-youtube-player-mobile";

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const wholeSeconds = Math.floor(totalSeconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const seconds = wholeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type SeekBarProps = {
  value: number;
  disabled: boolean;
  onSeek: (ratio: number) => void;
};

function SeekBar({ value, disabled, onSeek }: SeekBarProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const activePointerId = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const updatePosition = useCallback(
    (clientX: number) => {
      const rail = railRef.current;
      if (!rail || disabled) {
        return;
      }

      const rect = rail.getBoundingClientRect();
      if (rect.width === 0) {
        return;
      }

      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onSeek(ratio);
    },
    [disabled, onSeek],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      activePointerId.current = event.pointerId;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      updatePosition(event.clientX);
    },
    [disabled, updatePosition],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (activePointerId.current !== event.pointerId) {
        return;
      }

      updatePosition(event.clientX);
    },
    [updatePosition],
  );

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId) {
      return;
    }

    activePointerId.current = null;
    setDragging(false);
  }, []);

  const percentage = `${Math.min(100, Math.max(0, value * 100))}%`;

  return (
    <div
      ref={railRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="group relative flex h-6 touch-none items-center"
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-disabled={disabled}
      aria-label="Seek track"
    >
      <div className="h-[3px] w-full rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_rgba(102,217,255,0.8)]"
          style={{ width: percentage }}
        />
      </div>
      <span
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-opacity group-hover:opacity-100"
        style={{ left: percentage, opacity: dragging ? 1 : 0 }}
      />
    </div>
  );
}

type IconButtonProps = {
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
  className?: string;
  label: string;
};

function IconButton({ onClick, disabled, children, className, label }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex h-11 min-h-11 w-11 min-w-11 items-center justify-center rounded-full text-white transition ${
        disabled ? "cursor-not-allowed opacity-40" : "hover:bg-white/10"
      } ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

type VinylProps = {
  size: number;
  isPlaying: boolean;
};

function VinylDisc({ size, isPlaying }: VinylProps) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border border-white/20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25)_0%,rgba(120,120,120,0.2)_8%,rgba(20,20,20,0.98)_60%,rgba(0,0,0,0.98)_100%)] shadow-inner"
      style={{
        width: size,
        height: size,
        animation: "spin 8s linear infinite",
        animationPlayState: isPlaying ? "running" : "paused",
      }}
    >
      <div className="absolute inset-[16%] rounded-full border border-white/10" />
      <div className="absolute inset-[32%] rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 ring-2 ring-white/40" />
    </div>
  );
}

type YouTubeViewportProps = {
  nodeId?: string;
  compact?: boolean;
};

function YouTubeViewport({ nodeId, compact = false }: YouTubeViewportProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/15 bg-black/65 ${
        compact ? "aspect-video w-[124px]" : "aspect-video w-[156px]"
      }`}
    >
      {nodeId ? <div id={nodeId} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" /> : null}
    </div>
  );
}

function getNextIndex(currentIndex: number, tracks: Track[]) {
  if (tracks.length === 0) {
    return 0;
  }
  return (currentIndex + 1) % tracks.length;
}

export function NostalgiaPlayer() {
  const [activePlaylistId, setActivePlaylistId] = useState(playlists[0]?.id ?? "");
  const [trackIndex, setTrackIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.YT?.Player),
  );
  const [isMobile, setIsMobile] = useState(false);

  const playerRef = useRef<YouTubePlayer | null>(null);

  const playlist = useMemo(
    () =>
      playlists.find((item) => item.id === activePlaylistId) ??
      playlists[0] ?? {
        id: "",
        name: "",
        tracks: [] as Track[],
      },
    [activePlaylistId],
  );

  const tracks = playlist.tracks;
  const currentTrack = tracks[trackIndex];
  const hasTracks = tracks.length > 0;
  const tracksRef = useRef<Track[]>(tracks);
  const currentTrackRef = useRef<Track | undefined>(currentTrack);

  useEffect(() => {
    tracksRef.current = tracks;
    currentTrackRef.current = currentTrack;
  }, [currentTrack, tracks]);

  const advanceTrack = useCallback(() => {
    if (tracks.length === 0) {
      return;
    }

    setElapsed(0);
    setTrackIndex((current) => getNextIndex(current, tracks));
  }, [tracks]);

  const rewindTrack = useCallback(() => {
    if (tracks.length === 0) {
      return;
    }

    setElapsed(0);
    setTrackIndex((current) => (current - 1 + tracks.length) % tracks.length);
  }, [tracks]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);

    return () => {
      media.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const scriptId = "youtube-iframe-api";
    const existingScript = document.getElementById(scriptId);

    if (window.YT?.Player) {
      queueMicrotask(() => setApiReady(true));
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, []);

  useEffect(() => {
    if (!apiReady || !window.YT?.Player) {
      return;
    }

    const targetNodeId = isMobile ? MOBILE_PLAYER_NODE_ID : DESKTOP_PLAYER_NODE_ID;
    playerRef.current?.destroy();
    playerRef.current = new window.YT.Player(targetNodeId, {
      videoId: currentTrackRef.current?.videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        playsinline: 1,
        rel: 0,
      },
      events: {
        onStateChange: (event) => {
          const state = event.data as YouTubePlayerState;
          if (state === 1) {
            setIsPlaying(true);
            return;
          }

          if (state === 2) {
            setIsPlaying(false);
            return;
          }

          if (state === 0) {
            setIsPlaying(false);
            if (tracksRef.current.length > 1) {
              setElapsed(0);
              setTrackIndex((current) => getNextIndex(current, tracksRef.current));
            }
          }
        },
        onError: (event) => {
          setIsPlaying(false);
          trackEvent("youtube_player_error", {
            code: event.data,
            videoId: currentTrackRef.current?.videoId ?? "unknown",
          });

          if (tracksRef.current.length > 1) {
            setElapsed(0);
            setTrackIndex((current) => getNextIndex(current, tracksRef.current));
          }
        },
      },
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [apiReady, isMobile]);

  useEffect(() => {
    if (!playerRef.current) {
      return;
    }

    if (!currentTrack) {
      playerRef.current.stopVideo();
      return;
    }

    playerRef.current.loadVideoById(currentTrack.videoId);
  }, [currentTrack]);

  useEffect(() => {
    if (!playerRef.current || !currentTrack) {
      return;
    }

    const interval = window.setInterval(() => {
      if (!playerRef.current) {
        return;
      }

      const currentTime = playerRef.current.getCurrentTime();
      const playerDuration = playerRef.current.getDuration();
      setElapsed(Number.isFinite(currentTime) ? currentTime : 0);
      setDuration(
        Number.isFinite(playerDuration) && playerDuration > 0
          ? playerDuration
          : currentTrack.duration,
      );
    }, 333);

    return () => {
      window.clearInterval(interval);
    };
  }, [currentTrack]);

  const handlePlayPause = useCallback(() => {
    if (!playerRef.current || !currentTrack) {
      return;
    }

    if (isPlaying) {
      playerRef.current.pauseVideo();
      return;
    }

    playerRef.current.playVideo();
  }, [currentTrack, isPlaying]);

  const handleSeek = useCallback(
    (ratio: number) => {
      if (!playerRef.current || duration <= 0) {
        return;
      }

      const target = ratio * duration;
      playerRef.current.seekTo(target, true);
      setElapsed(target);
    },
    [duration],
  );

  const displayedDuration = currentTrack ? (duration > 0 ? duration : currentTrack.duration) : 0;
  const displayedElapsed = currentTrack ? elapsed : 0;
  const progress =
    displayedDuration > 0
      ? Math.min(1, Math.max(0, displayedElapsed / displayedDuration))
      : 0;

  const handlePlaylistSelect = useCallback((nextPlaylistId: string) => {
    setActivePlaylistId(nextPlaylistId);
    setTrackIndex(0);
    setElapsed(0);
    setDuration(0);
    setIsPlaying(false);
  }, []);

  return (
    <section className="w-full">
      <div className="mx-auto hidden max-w-xl sm:flex">
        <div className="w-full rounded-full border border-white/10 bg-gradient-to-b from-white/[0.15] to-white/[0.055] p-3 pr-5 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-3xl backdrop-saturate-[1.7]">
          <div className="flex items-center gap-3">
            <VinylDisc size={80} isPlaying={isPlaying} />
            <YouTubeViewport nodeId={!isMobile ? DESKTOP_PLAYER_NODE_ID : undefined} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold">
                {currentTrack?.title ?? "Your playlist is currently empty"}
              </div>
              <div className="truncate text-[12.5px] text-white/70">
                {currentTrack
                  ? `${currentTrack.artist} • ${currentTrack.film} (${currentTrack.year})`
                  : "Add a verified YouTube track to any playlist in lib/tracks.ts"}
              </div>
              <SeekBar value={progress} disabled={!hasTracks} onSeek={handleSeek} />
            </div>
            <div className="w-[74px] shrink-0 text-right text-[10.5px] tabular-nums text-white/85">
              <div>{formatTime(displayedElapsed)}</div>
              <div>{formatTime(displayedDuration)}</div>
            </div>
            <div className="flex items-center">
              <IconButton onClick={rewindTrack} disabled={!hasTracks} label="Previous track">
                ⏮
              </IconButton>
              <IconButton
                onClick={handlePlayPause}
                disabled={!hasTracks}
                label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? "⏸" : "▶"}
              </IconButton>
              <IconButton onClick={advanceTrack} disabled={!hasTracks} label="Next track">
                ⏭
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:hidden">
        <div className="rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[0.15] to-white/[0.055] p-4 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-3xl backdrop-saturate-[1.7]">
          <div className="flex items-center gap-3">
            <VinylDisc size={64} isPlaying={isPlaying} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold">
                {currentTrack?.title ?? "Your playlist is currently empty"}
              </div>
              <div className="truncate text-[12.5px] text-white/70">
                {currentTrack ? currentTrack.artist : "Paste tracks into lib/tracks.ts"}
              </div>
            </div>
            <YouTubeViewport nodeId={isMobile ? MOBILE_PLAYER_NODE_ID : undefined} compact />
          </div>

          <div className="mt-3">
            <SeekBar value={progress} disabled={!hasTracks} onSeek={handleSeek} />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-[10.5px] tabular-nums text-white/85">
              {formatTime(displayedElapsed)} / {formatTime(displayedDuration)}
            </div>
            <div className="flex items-center justify-center gap-1">
              <IconButton onClick={rewindTrack} disabled={!hasTracks} label="Previous track">
                ⏮
              </IconButton>
              <button
                type="button"
                onClick={handlePlayPause}
                disabled={!hasTracks}
                aria-label={isPlaying ? "Pause" : "Play"}
                className={`inline-flex h-[52px] min-h-[52px] w-[52px] min-w-[52px] items-center justify-center rounded-full bg-gradient-to-b from-[var(--color-accent)] to-[#2cbbe8] text-black ring-1 ring-white/25 shadow-[0_8px_22px_rgba(60,180,220,0.55)] transition ${
                  hasTracks ? "" : "cursor-not-allowed opacity-40"
                }`}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <IconButton onClick={advanceTrack} disabled={!hasTracks} label="Next track">
                ⏭
              </IconButton>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {playlists.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePlaylistSelect(item.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  item.id === playlist?.id
                    ? "border-white/40 bg-white/15 text-white"
                    : "border-white/15 bg-black/25 text-white/80 hover:border-white/30"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 hidden justify-center gap-2 sm:flex">
        {playlists.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handlePlaylistSelect(item.id)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              item.id === playlist?.id
                ? "border-white/40 bg-white/15 text-white"
                : "border-white/15 bg-black/25 text-white/80 hover:border-white/30"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {!hasTracks ? (
        <p className="mt-3 text-center text-xs text-white/70">
          This playlist is empty right now. Add verified tracks in lib/tracks.ts to start playback.
        </p>
      ) : null}
    </section>
  );
}
