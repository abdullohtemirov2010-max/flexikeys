import React, { useEffect, useRef, useState } from "react";
import logoUrl from "@/assets/flexikeys-logo.png";

interface Props {
  onComplete: () => void;
}

/**
 * Cinematic "EA SPORTS"-style brand intro.
 * - Black screen → whoosh/shhh white-noise sweep → logo blooms in
 * - Voice over: "Flexi Keys. Growth to a better future."
 * - Fades out and calls onComplete (~5s total)
 */
const BrandIntro: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<"black" | "logo" | "tagline" | "fade">(
    "black"
  );
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase("fade");
    setTimeout(onComplete, 700);
  };

  useEffect(() => {
    // Play the whoosh/shhh noise sweep with WebAudio (no asset needed).
    let ctx: AudioContext | null = null;
    try {
      const AC =
        (window as unknown as { AudioContext?: typeof AudioContext })
          .AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AC) {
        ctx = new AC();
        const duration = 1.4;
        const sampleRate = ctx.sampleRate;
        const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          // White noise with a soft attack/decay envelope
          const t = i / data.length;
          const env = Math.sin(Math.PI * t); // 0 → 1 → 0
          data[i] = (Math.random() * 2 - 1) * env * 0.55;
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;

        // Filter sweep low → high for that "shhhhh-WHOOSH" feel
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.Q.value = 0.9;
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(
          6000,
          ctx.currentTime + duration
        );

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + duration
        );

        src.connect(filter).connect(gain).connect(ctx.destination);
        src.start();
        src.stop(ctx.currentTime + duration + 0.05);
      }
    } catch {
      /* audio not allowed; visuals still play */
    }

    // Kick the announcer voice slightly after the whoosh peaks
    const audio = new Audio("/api/public/brand-voice");
    audio.preload = "auto";
    audio.volume = 1;
    const voiceTimer = setTimeout(() => {
      audio.play().catch(() => {});
    }, 700);

    // Animation timeline
    const t1 = setTimeout(() => setPhase("logo"), 600);
    const t2 = setTimeout(() => setPhase("tagline"), 1800);
    const t3 = setTimeout(finish, 5200);

    return () => {
      clearTimeout(voiceTimer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      audio.pause();
      audio.src = "";
      if (ctx && ctx.state !== "closed") ctx.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden bg-black transition-opacity duration-700 ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      }`}
      onClick={finish}
      role="button"
      aria-label="Skip intro"
    >
      {/* Radial cinematic glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(140,200,255,0.25) 0%, rgba(0,0,0,0) 60%)",
          opacity: phase === "black" ? 0 : 1,
        }}
      />

      {/* Sweeping light bar */}
      <div
        className="pointer-events-none absolute inset-y-0 w-[40%]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          transform:
            phase === "black"
              ? "translateX(-120vw) skewX(-15deg)"
              : "translateX(180vw) skewX(-15deg)",
          transition: "transform 1.6s cubic-bezier(0.22, 1, 0.36, 1)",
          filter: "blur(6px)",
        }}
      />

      {/* Logo */}
      <img
        src={logoUrl}
        alt="FlexiKeys"
        className="relative z-10 select-none drop-shadow-[0_0_60px_rgba(140,200,255,0.55)]"
        style={{
          width: "min(46vw, 340px)",
          height: "auto",
          opacity: phase === "black" ? 0 : 1,
          transform:
            phase === "black"
              ? "scale(0.6) translateY(20px)"
              : phase === "logo"
                ? "scale(1.08)"
                : "scale(1)",
          filter:
            phase === "black"
              ? "blur(24px) brightness(1.4)"
              : phase === "logo"
                ? "blur(0px) brightness(1.15)"
                : "blur(0px) brightness(1)",
          transition:
            "opacity 900ms ease-out, transform 1200ms cubic-bezier(0.22, 1, 0.36, 1), filter 900ms ease-out",
        }}
        draggable={false}
      />

      {/* Wordmark */}
      <div
        className="relative z-10 mt-6 select-none text-center"
        style={{
          opacity: phase === "tagline" ? 1 : 0,
          transform:
            phase === "tagline" ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 700ms ease-out, transform 800ms ease-out",
        }}
      >
        <div
          className="font-bold tracking-[0.18em] text-white"
          style={{
            fontSize: "clamp(28px, 5vw, 56px)",
            letterSpacing: "0.18em",
            textShadow:
              "0 0 24px rgba(140,200,255,0.55), 0 2px 4px rgba(0,0,0,0.6)",
          }}
        >
          FLEXIKEYS
        </div>
        <div
          className="mt-2 font-light uppercase tracking-[0.4em]"
          style={{
            fontSize: "clamp(11px, 1.4vw, 14px)",
            color: "rgba(200,225,255,0.85)",
          }}
        >
          Growth to a better future
        </div>
      </div>

      {/* Skip hint */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
        className="absolute bottom-6 right-6 text-xs uppercase tracking-[0.3em] text-white/40 transition hover:text-white/80"
      >
        Skip
      </button>
    </div>
  );
};

export default BrandIntro;
