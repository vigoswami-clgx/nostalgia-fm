import { KolkataClock } from "@/components/clock";
import { NostalgiaPlayer } from "@/components/player";

const safeTop = "max(1rem, env(safe-area-inset-top))";
const safeBottom = "max(1rem, env(safe-area-inset-bottom))";
const safeLeft = "max(1rem, env(safe-area-inset-left))";
const safeRight = "max(1rem, env(safe-area-inset-right))";

const grainDataUri =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.65'/%3E%3C/svg%3E\")";

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      <div className="hero-bg fixed inset-0 -z-20 bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
      </div>

      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: grainDataUri,
          mixBlendMode: "overlay",
          opacity: 0.3,
        }}
      />

      <div className="fixed z-10" style={{ top: safeTop, left: safeLeft }}>
        <KolkataClock />
      </div>

      <div className="fixed z-10" style={{ top: safeTop, left: "50%", transform: "translateX(-50%)" }}>
        <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs text-white/85">
          108 listeners
        </span>
      </div>

      <div className="fixed z-10 flex items-center gap-2 text-xs text-white/90" style={{ top: safeTop, right: safeRight }}>
        <a href="https://github.com" target="_blank" rel="noreferrer" className="rounded-full border border-white/20 bg-black/35 px-3 py-1 hover:bg-white/15">
          GitHub
        </a>
        <a href="https://youtube.com" target="_blank" rel="noreferrer" className="rounded-full border border-white/20 bg-black/35 px-3 py-1 hover:bg-white/15">
          YouTube
        </a>
      </div>

      <div className="fixed z-10 w-full" style={{ left: safeLeft, right: safeRight, bottom: safeBottom }}>
        <div className="mx-auto w-full max-w-xl">
          <NostalgiaPlayer />
        </div>
      </div>
    </main>
  );
}
