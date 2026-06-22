import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { TOTAL_STAGES } from '@/lib/gameData';
import EarthIntro from '@/components/EarthIntro';
import WorldMapSVG from '@/components/WorldMapSVG';
import { STAGE_GEO, project, MAP_W, MAP_H } from '@/lib/geo';
import iconBack from '@/assets/icon-back.png';
import flagUz from '@/assets/flags/uz.svg';
import flagTr from '@/assets/flags/tr.svg';
import flagEg from '@/assets/flags/eg.svg';
import flagKe from '@/assets/flags/ke.svg';
import flagIn from '@/assets/flags/in.svg';
import flagJp from '@/assets/flags/jp.svg';
import flagAu from '@/assets/flags/au.svg';
import flagBr from '@/assets/flags/br.svg';
import flagUs from '@/assets/flags/us.svg';

const FLAG_URL: Record<string, string> = {
  uz: flagUz, tr: flagTr, eg: flagEg, ke: flagKe, in: flagIn,
  jp: flagJp, au: flagAu, br: flagBr, us: flagUs,
};

interface StageTheme {
  title: string;
  desc: string;
}

const stageThemes: Record<number, StageTheme> = {
  1:  { title: 'Master Alphabets',   desc: 'Recognize letters A–Z' },
  2:  { title: 'Write Alphabets',    desc: 'Trace & form each letter' },
  3:  { title: 'Numbers 1–20',       desc: 'Count and recognize numbers' },
  4:  { title: 'Shapes & Colors',    desc: 'Match shapes and primary colors' },
  5:  { title: 'First Words',        desc: 'CVC words: cat, dog, sun' },
  6:  { title: 'Emotions & Faces',   desc: 'Identify happy, sad, calm' },
  7:  { title: 'Daily Routines',     desc: 'Brush teeth, eat, sleep' },
  8:  { title: 'Sentence Builder',   desc: 'I am happy. I see a cat.' },
  9:  { title: 'Reading Together',   desc: 'Short stories aloud' },
  10: { title: 'Grand Mastery',      desc: 'Final test of all skills' },
};

const HIGHLIGHT_ISO = ['uz', 'tr', 'eg', 'ke', 'in', 'jp', 'au', 'br', 'us'];

const StageScreen: React.FC = () => {
  const { unlockedStages, startLevel, setScreen } = useGame();
  const [showIntro, setShowIntro] = useState(
    () => sessionStorage.getItem('fk_seen_earth') !== '1',
  );
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  // Map zoom + pan controls
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = React.useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const clampZoom = (z: number) => Math.min(5, Math.max(1, z));
  const zoomIn = () => setZoom(z => clampZoom(z + 0.5));
  const zoomOut = () => setZoom(z => {
    const next = clampZoom(z - 0.5);
    if (next === 1) setPan({ x: 0, y: 0 });
    return next;
  });
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const onWheel = (e: React.WheelEvent) => {
    if (e.deltaY === 0) return;
    e.preventDefault();
    setZoom(z => clampZoom(z + (e.deltaY < 0 ? 0.3 : -0.3)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setPan({ x: dragRef.current.px + dx, y: dragRef.current.py + dy });
  };
  const onPointerUp = () => { dragRef.current = null; };

  const handleIntroComplete = () => {
    sessionStorage.setItem('fk_seen_earth', '1');
    setShowIntro(false);
  };

  const handleStageClick = (n: number) => {
    if (n > unlockedStages) return;
    setSelectedStage(n);
  };

  if (showIntro) return <EarthIntro onComplete={handleIntroComplete} />;

  const selected = selectedStage ? STAGE_GEO[selectedStage] : null;
  const selectedTheme = selectedStage ? stageThemes[selectedStage] : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-100 via-sky-50 to-blue-50 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-card/80 backdrop-blur-md border-b border-border/50 z-20 shadow-sm">
        <button
          onClick={() => setScreen('welcomeBack')}
          className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
          aria-label="Back"
        >
          <img src={iconBack} alt="Back" className="w-10 h-10 drop-shadow-md" />
        </button>
        <h2 className="flex-1 text-center text-xl font-black text-foreground">
          🌍 World Adventure Map
        </h2>
        <div className="w-10" />
      </div>

      {/* Map area */}
      <div className="relative w-full bg-[#bfe3ff] overflow-hidden select-none">
        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-1 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-white p-1">
          <button
            onClick={zoomIn}
            className="w-9 h-9 rounded-lg bg-white hover:bg-sky-100 active:scale-95 transition text-xl font-black text-sky-700 flex items-center justify-center"
            aria-label="Zoom in"
          >+</button>
          <button
            onClick={zoomOut}
            className="w-9 h-9 rounded-lg bg-white hover:bg-sky-100 active:scale-95 transition text-xl font-black text-sky-700 flex items-center justify-center"
            aria-label="Zoom out"
          >−</button>
          <button
            onClick={resetView}
            className="w-9 h-9 rounded-lg bg-white hover:bg-sky-100 active:scale-95 transition text-[10px] font-bold text-sky-700 flex items-center justify-center"
            aria-label="Reset view"
          >RESET</button>
        </div>

        <div
          className="relative w-full"
          style={{ aspectRatio: `${MAP_W} / ${MAP_H}`, cursor: zoom > 1 ? 'grab' : 'default' }}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="absolute inset-0 origin-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: dragRef.current ? 'none' : 'transform 250ms ease-out',
              willChange: 'transform',
            }}
          >
            <WorldMapSVG
              highlighted={HIGHLIGHT_ISO}
              className="absolute inset-0 w-full h-full [&_svg]:w-full [&_svg]:h-full animate-map-reveal"
            />

            {/* Pin overlay — uses absolute % positioning matching the projection */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1).map(n => {
                const geo = STAGE_GEO[n];
                const { x, y } = project(geo.lon, geo.lat);
                const xPct = (x / MAP_W) * 100;
                const yPct = (y / MAP_H) * 100;
                const unlocked = n <= unlockedStages;
                const isCurrent = n === unlockedStages;
                const flagSrc = FLAG_URL[geo.iso];
                // Counter-scale markers a bit so they stay readable but still grow with zoom
                const markerScale = 1 / Math.sqrt(zoom);
                return (
                  <button
                    key={n}
                    onClick={() => handleStageClick(n)}
                    disabled={!unlocked}
                    className="absolute pointer-events-auto group animate-pin-drop -translate-x-1/2 -translate-y-full"
                    style={{
                      left: `${xPct}%`,
                      top: `${yPct}%`,
                      animationDelay: `${0.4 + n * 0.07}s`,
                      transform: `translate(-50%, -100%) scale(${markerScale})`,
                      transformOrigin: 'bottom center',
                    }}
                    aria-label={`Stage ${n} ${geo.country}`}
                  >
                    <div className="flex flex-col items-center">
                      {/* Big eye-catching flag marker */}
                      <div
                        className={`relative rounded-full overflow-hidden border-[3px] shadow-xl transition-transform ${
                          unlocked
                            ? 'border-white bg-white hover:scale-125 cursor-pointer'
                            : 'border-white/70 grayscale opacity-70 cursor-not-allowed'
                        } ${isCurrent ? 'ring-4 ring-red-500/70 animate-pulse-slow' : ''}`}
                        style={{
                          width: 48,
                          height: 48,
                          boxShadow: unlocked
                            ? '0 6px 14px rgba(0,0,0,0.35), 0 0 0 2px rgba(255,255,255,0.9)'
                            : '0 2px 6px rgba(0,0,0,0.25)',
                        }}
                      >
                        {flagSrc ? (
                          <img
                            src={flagSrc}
                            alt=""
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-amber-300 text-lg">
                            🏆
                          </div>
                        )}
                        {/* Stage number badge */}
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-black rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-md">
                          {n}
                        </span>
                      </div>
                      {/* Tail */}
                      <div className="w-[2px] h-3 bg-slate-700/80" />
                      {/* Anchor dot — sits exactly on the geo coordinate */}
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          unlocked ? 'bg-red-600' : 'bg-slate-400'
                        } shadow-md border border-white`}
                      />
                      {!unlocked && (
                        <span className="absolute -top-3 -right-3 text-base">🔒</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum list */}
      <div className="px-4 py-6 bg-gradient-to-b from-blue-50 to-white">
        <p className="text-center text-sm font-semibold text-muted-foreground mb-3">
          ✈️ Your Learning Journey
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
          {Array.from({ length: TOTAL_STAGES }, (_, i) => i + 1).map(n => {
            const geo = STAGE_GEO[n];
            const theme = stageThemes[n];
            const unlocked = n <= unlockedStages;
            const flagSrc = FLAG_URL[geo.iso];
            return (
              <button
                key={n}
                onClick={() => handleStageClick(n)}
                disabled={!unlocked}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition ${
                  unlocked
                    ? 'bg-white border-primary/20 hover:border-primary hover:shadow-md cursor-pointer'
                    : 'bg-muted/30 border-muted opacity-60 cursor-not-allowed'
                }`}
              >
                {flagSrc ? (
                  <img
                    src={flagSrc}
                    alt={geo.country}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
                  />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center text-xl border-2 border-white shadow">🏆</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Stage {n} · {geo.country}</p>
                  <p className="font-bold text-sm text-foreground truncate">{theme.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{theme.desc}</p>
                </div>
                {!unlocked && <span className="text-lg">🔒</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage detail modal */}
      {selected && selectedStage && selectedTheme && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up"
          onClick={() => setSelectedStage(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 border-primary/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-3">
              {FLAG_URL[selected.iso] ? (
                <img
                  src={FLAG_URL[selected.iso]}
                  alt={selected.country}
                  className="mx-auto w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="text-7xl">🏆</div>
              )}
              <p className="text-xs font-medium text-muted-foreground">
                Stage {selectedStage} · {selected.country}
              </p>
              <h3 className="text-2xl font-black text-foreground">{selectedTheme.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedTheme.desc}</p>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelectedStage(null)}
                className="flex-1 py-3 rounded-2xl border-2 border-border text-foreground font-semibold hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={() => startLevel(selectedStage, 1)}
                className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 active:scale-95 transition"
              >
                Start ✈️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageScreen;
