import React, { useEffect, useRef, useState } from "react";
import logoUrl from "@/assets/flexikeys-logo.png";

interface Props {
  onComplete: () => void;
}

type Phase = "gate" | "intro" | "logo" | "tagline" | "fade";

/**
 * Cinematic "EA SPORTS"-style brand intro.
 * Bright sky background, massive 3D-feeling logo, deep announcer voiceover.
 * A one-tap gate unlocks audio (browser autoplay policy) and then runs the show.
 */
const BrandIntro: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>("gate");
  const doneRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase("fade");
    setTimeout(onComplete, 700);
  };

  const begin = () => {
    if (phase !== "gate") return;
    setPhase("intro");

    // ----- WHOOSH (WebAudio white-noise sweep) -----
    let ctx: AudioContext | null = null;
    try {
      const AC =
        (window as unknown as { AudioContext?: typeof AudioContext })
          .AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AC) {
        ctx = new AC();
        const duration = 1.6;
        const sampleRate = ctx.sampleRate;
        const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / data.length;
          const env = Math.sin(Math.PI * t);
          data[i] = (Math.random() * 2 - 1) * env * 0.6;
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.Q.value = 0.9;
        filter.frequency.setValueAtTime(350, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(
          7000,
          ctx.currentTime + duration
        );
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(1.0, ctx.currentTime + 0.18);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + duration
        );
        src.connect(filter).connect(gain).connect(ctx.destination);
        src.start();
        src.stop(ctx.currentTime + duration + 0.05);
      }
    } catch {
      /* visuals still play */
    }

    // ----- ANNOUNCER VOICE -----
    // Pre-load then play. We're inside a user gesture so autoplay is allowed.
    const audio = new Audio("/api/public/brand-voice");
    audio.preload = "auto";
    audio.volume = 1;
    audioRef.current = audio;

    const playVoice = () => {
      audio.play().catch((err) => {
        console.warn("[BrandIntro] voice play failed, falling back:", err);
        // Fallback: browser SpeechSynthesis
        try {
          const u = new SpeechSynthesisUtterance(
            "Flexi Keys. Growth to a better future."
          );
          u.rate = 0.85;
          u.pitch = 0.6;
          u.volume = 1;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        } catch {
          /* no audio available */
        }
      });
    };

    // Kick the voice slightly after the whoosh peaks
    setTimeout(playVoice, 750);

    // ----- TIMELINE -----
    setTimeout(() => setPhase("logo"), 250);
    setTimeout(() => setPhase("tagline"), 1900);
    setTimeout(finish, 5800);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* noop */
      }
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(ellipse at 50% 35%, #ffffff 0%, #eaf4ff 38%, #c9e2ff 70%, #a7caef 100%)",
        perspective: "1400px",
      }}
      onClick={phase === "gate" ? begin : finish}
      role="button"
      aria-label={phase === "gate" ? "Begin" : "Skip intro"}
    >
      {/* Soft floating clouds in the background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute rounded-full bg-white/55 blur-3xl"
          style={{ width: 480, height: 280, top: "12%", left: "-8%" }}
        />
        <div
          className="absolute rounded-full bg-white/40 blur-3xl"
          style={{ width: 600, height: 320, top: "55%", right: "-10%" }}
        />
        <div
          className="absolute rounded-full bg-white/30 blur-3xl"
          style={{ width: 380, height: 220, top: "70%", left: "20%" }}
        />
      </div>

      {/* Sun-ray light sweep */}
      <div
        className="pointer-events-none absolute inset-y-0 w-[55%]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
          transform:
            phase === "gate" || phase === "intro"
              ? "translateX(-120vw) skewX(-18deg)"
              : "translateX(180vw) skewX(-18deg)",
          transition: "transform 1.9s cubic-bezier(0.22, 1, 0.36, 1)",
          filter: "blur(10px)",
          mixBlendMode: "screen",
        }}
      />

      {/* 3D logo stage */}
      <div
        className="relative z-10 select-none"
        style={{
          transformStyle: "preserve-3d",
          width: "min(86vw, 760px)",
          maxWidth: "92vw",
          opacity:
            phase === "gate" ? 0.85 : phase === "intro" ? 0 : 1,
          transform:
            phase === "gate"
              ? "rotateX(8deg) rotateY(-6deg) scale(0.92)"
              : phase === "intro"
                ? "rotateX(35deg) rotateY(-25deg) scale(0.55) translateZ(-400px)"
                : phase === "logo"
                  ? "rotateX(0deg) rotateY(0deg) scale(1.04) translateZ(0)"
                  : "rotateX(0deg) rotateY(0deg) scale(1) translateZ(0)",
          transition:
            "opacity 900ms ease-out, transform 1500ms cubic-bezier(0.18, 1.05, 0.3, 1)",
          filter:
            phase === "intro"
              ? "blur(18px) brightness(1.3)"
              : "blur(0) brightness(1.05)",
          willChange: "transform, filter, opacity",
        }}
      >
        <img
          src={logoUrl}
          alt="FlexiKeys"
          draggable={false}
          className="block w-full h-auto"
          style={{
            filter:
              "drop-shadow(0 30px 60px rgba(80,120,180,0.35)) drop-shadow(0 8px 16px rgba(80,120,180,0.25))",
          }}
        />
      </div>

      {/* Tagline */}
      <div
        className="relative z-10 mt-2 select-none text-center"
        style={{
          opacity: phase === "tagline" ? 1 : 0,
          transform:
            phase === "tagline" ? "translateY(0)" : "translateY(18px)",
          transition: "opacity 700ms ease-out, transform 800ms ease-out",
        }}
      >
        <div
          className="font-light uppercase"
          style={{
            fontSize: "clamp(13px, 1.8vw, 20px)",
            letterSpacing: "0.42em",
            color: "#2c4a6b",
            textShadow: "0 1px 2px rgba(255,255,255,0.7)",
          }}
        >
          Growth to a better future
        </div>
      </div>

      {/* Gate prompt */}
      {phase === "gate" && (
        <div
          className="absolute bottom-[12%] left-1/2 z-20 -translate-x-1/2 text-center"
          style={{ animation: "pulse 2s ease-in-out infinite" }}
        >
          <div
            className="px-8 py-3 rounded-full backdrop-blur-md bg-white/70 border border-white/80 shadow-xl text-[#2c4a6b] font-semibold uppercase tracking-[0.3em] text-sm cursor-pointer hover:bg-white/90 transition"
          >
            Tap to begin
          </div>
        </div>
      )}

      {/* Skip */}
      {phase !== "gate" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            finish();
          }}
          className="absolute bottom-6 right-6 text-xs uppercase tracking-[0.3em] text-[#2c4a6b]/50 transition hover:text-[#2c4a6b]"
        >
          Skip
        </button>
      )}
    </div>
  );
};

export default BrandIntro;
