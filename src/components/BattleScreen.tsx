import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Pause, Play, RotateCcw, Home, Sparkles } from 'lucide-react';
import { MatchResult, MatchSettings, MatchStats, UnitConfig, UnitId } from '../types';
import { GameEngine } from '../game/gameEngine';
import { GameRenderer } from '../game/renderer';
import { UNIT_CONFIGS, UNIT_ORDER } from '../game/unitData';
import { soundManager } from '../audio/soundManager';
import { PenguinPortrait } from './PenguinPortraits';

interface BattleScreenProps {
  settings: MatchSettings;
  onMatchFinish: (result: MatchResult, stats: MatchStats, playerHp: number, enemyHp: number) => void;
  onReturnTitle: () => void;
  onOpenSettings: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  settings,
  onMatchFinish,
  onReturnTitle,
  onOpenSettings,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer>(new GameRenderer());

  // React state for HUD
  const [cost, setCost] = useState(4);
  const [maxCost, setMaxCost] = useState(10);
  const [playerCastleHp, setPlayerCastleHp] = useState(30);
  const [enemyCastleHp, setEnemyCastleHp] = useState(30);
  const [maxCastleHp, setMaxCastleHp] = useState(30);
  const [cheerGauge, setCheerGauge] = useState(0);
  const [maxCheerGauge, setMaxCheerGauge] = useState(8);
  const [cheerActive, setCheerActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(settings.timeLimit);
  const [isPaused, setIsPaused] = useState(false);
  const [cheerBounce, setCheerBounce] = useState(false);

  // Selected unit for field placement
  const [selectedUnitId, setSelectedUnitId] = useState<UnitId | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Initialize Game Engine
  useEffect(() => {
    const engine = new GameEngine(settings);
    engineRef.current = engine;

    engine.listener = {
      onCostChange: (c, mc) => {
        setCost(c);
        setMaxCost(mc);
      },
      onCheerChange: (g, mg, active) => {
        setCheerGauge(g);
        setMaxCheerGauge(mg);
        setCheerActive(active);
      },
      onCastleHpChange: (pHp, eHp, mHp) => {
        setPlayerCastleHp(pHp);
        setEnemyCastleHp(eHp);
        setMaxCastleHp(mHp);
      },
      onTimeChange: (rem) => {
        setRemainingSeconds(rem);
      },
      onMatchFinish: (res, stats) => {
        onMatchFinish(res, stats, engine.playerCastleHp, engine.enemyCastleHp);
      },
    };

    engine.start();

    // Render loop
    let animId: number;
    const renderStep = () => {
      const canvas = canvasRef.current;
      if (canvas && engineRef.current) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          rendererRef.current.render({
            canvas,
            ctx,
            playerCastleHp: engineRef.current.playerCastleHp,
            enemyCastleHp: engineRef.current.enemyCastleHp,
            maxCastleHp: engineRef.current.maxCastleHp,
            units: engineRef.current.units,
            snowballs: engineRef.current.snowballs,
            particles: engineRef.current.particles,
            damageNumbers: engineRef.current.damageNumbers,
            selectedUnitToPlace: selectedUnitId ? UNIT_CONFIGS[selectedUnitId] : null,
            hoverX: hoverPos?.x ?? null,
            hoverY: hoverPos?.y ?? null,
            cheerActive: engineRef.current.cheerActive,
            isCastleDestroyed: engineRef.current.isFinished,
            winnerTeam: engineRef.current.winnerTeam,
          });
        }
      }
      animId = requestAnimationFrame(renderStep);
    };

    animId = requestAnimationFrame(renderStep);

    return () => {
      cancelAnimationFrame(animId);
      engine.stop();
    };
  }, [settings, onMatchFinish]);

  // Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current && engineRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);

        canvasRef.current.width = width * dpr;
        canvasRef.current.height = height * dpr;
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.resetTransform();
          ctx.scale(dpr, dpr);
        }

        engineRef.current.setDimensions(width, height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard hotkeys for quick unit spawning (1..5) & cheer mash (Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleCheerClick();
        return;
      }
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const targetUnitId = UNIT_ORDER[idx];
        if (targetUnitId) {
          handleSpawnUnitDirect(targetUnitId);
        }
      } else if (e.key.toLowerCase() === 'p') {
        togglePause();
      } else if (e.key === 'Escape') {
        setSelectedUnitId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cost, selectedUnitId]);

  // Spawn directly from igloo
  const handleSpawnUnitDirect = (unitId: UnitId) => {
    if (!engineRef.current) return;
    const config = UNIT_CONFIGS[unitId];
    if (cost < config.cost) {
      soundManager.playSe('cancel');
      return;
    }

    const success = engineRef.current.trySpawnPlayerUnit(unitId);
    if (success) {
      setSelectedUnitId(null);
    }
  };

  // Toggle selection for placement
  const handleUnitButtonClick = (unitId: UnitId) => {
    const config = UNIT_CONFIGS[unitId];
    if (cost < config.cost) {
      soundManager.playSe('cancel');
      return;
    }

    // Direct spawn on click or select
    handleSpawnUnitDirect(unitId);
  };

  // Cheer Button Tap (응원 연타!!)
  const handleCheerClick = () => {
    if (!engineRef.current) return;
    setCheerBounce(true);
    setTimeout(() => setCheerBounce(false), 120);
    engineRef.current.tapCheerButton();
  };

  // Canvas interaction
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !engineRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedUnitId) {
      const config = UNIT_CONFIGS[selectedUnitId];
      if (cost >= config.cost) {
        const spawned = engineRef.current.trySpawnPlayerUnit(selectedUnitId, x, y);
        if (spawned) {
          setSelectedUnitId(null);
        }
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setHoverPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCanvasMouseLeave = () => {
    setHoverPos(null);
  };

  const togglePause = () => {
    if (!engineRef.current) return;
    if (isPaused) {
      engineRef.current.resume();
      setIsPaused(false);
    } else {
      engineRef.current.pause();
      setIsPaused(true);
    }
  };

  const formattedTime = () => {
    if (settings.timeLimit === 0) return '∞';
    const m = Math.floor(remainingSeconds / 60);
    const s = Math.floor(remainingSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full h-full flex flex-col relative select-none bg-[#FAF6E9] overflow-hidden">
      {/* 1. TOP HEADER: Timer at Center & Control Buttons on Sides */}
      <div className="w-full absolute top-0 left-0 pt-3 px-4 z-30 flex items-center justify-between pointer-events-none">
        {/* Left: Home / Exit */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onReturnTitle}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] flex items-center justify-center shadow-sm cursor-pointer transition hover:scale-105 active:scale-95"
            title="타이틀로 돌아가기"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Monospace Bold Black Timer (Exact match to screenshot!) */}
        <div className="pointer-events-auto">
          <span className="font-['Fredoka',sans-serif] font-black text-2xl md:text-3xl text-[#1A1A1A] tracking-wider">
            {formattedTime()}
          </span>
        </div>

        {/* Right: Pause Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={togglePause}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] flex items-center justify-center shadow-sm cursor-pointer transition hover:scale-105 active:scale-95"
            title={isPaused ? '재개' : '일시정지'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-[#1A1A1A]" /> : <Pause className="w-3.5 h-3.5 fill-[#1A1A1A]" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN BATTLEFIELD CANVAS */}
      <div ref={containerRef} className="flex-1 w-full relative overflow-hidden bg-[#FAF6E9]">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          className="w-full h-full block cursor-pointer"
        />

        {/* Cheer Fever Banner Overlay when Active */}
        {cheerActive && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-[#FFD600] border-2 border-[#1A1A1A] px-4 py-1 rounded-full shadow-md pointer-events-none flex items-center gap-1.5 animate-bounce z-20">
            <Sparkles className="w-4 h-4 text-[#1A1A1A] fill-[#1A1A1A]" />
            <span className="font-black text-sm text-[#1A1A1A]">
              응원 피버 발동 중! (회복속도 2.5배)
            </span>
          </div>
        )}
      </div>

      {/* 3. EXACT BOTTOM HUD (1:1 Match with image.png) */}
      <div className="w-full bg-[#FAF6E9] px-4 pb-4 pt-1 z-30 flex items-end justify-between max-w-5xl mx-auto">
        {/* LEFT SIDE: Cloud with Castle HP + 8-step Vertical Meter + "응원 연타!!" Button */}
        <div className="flex items-end gap-3 sm:gap-4">
          {/* Cloud + Player Castle HP Number (e.g. 29) */}
          <div className="flex flex-col items-center">
            {/* Hand-Drawn Cloud SVG */}
            <svg viewBox="0 0 60 42" className="w-9 h-7 sm:w-11 sm:h-8" fill="none">
              <path
                d="M14 36 C8 36, 4 31, 6 24 C4 18, 12 12, 20 14 C24 6, 36 6, 42 12 C50 10, 56 16, 54 24 C58 29, 54 36, 46 36 Z"
                fill="#FFFFFF"
                stroke="#1A1A1A"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-black font-['Fredoka',sans-serif] text-xl sm:text-2xl text-[#1A1A1A] mt-0.5 leading-none">
              {playerCastleHp}
            </span>
          </div>

          {/* Vertical 8-Segment Meter (Thermometer Gauge) */}
          <div className="flex flex-col-reverse gap-0.5 pb-1">
            {Array.from({ length: 8 }).map((_, i) => {
              const isFilled = i < cheerGauge;
              return (
                <div
                  key={i}
                  className={`w-3 sm:w-3.5 h-1.5 sm:h-2 border border-[#1A1A1A] transition-colors duration-150 ${
                    cheerActive
                      ? 'bg-[#FFD600] animate-pulse'
                      : isFilled
                      ? 'bg-[#1A1A1A]'
                      : 'bg-[#FAF6E9]'
                  }`}
                />
              );
            })}
          </div>

          {/* "응원 연타!!" Circular Button */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-black text-[#1A1A1A] tracking-tight mb-0.5">
              응원
            </span>
            <button
              onClick={handleCheerClick}
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white border-2 border-[#1A1A1A] shadow-sm flex items-center justify-center cursor-pointer transition-transform ${
                cheerBounce ? 'scale-115 rotate-6' : 'hover:scale-105 active:scale-95'
              }`}
              title="클릭하여 응원 게이지를 채우세요! (스페이스바로도 가능)"
            >
              <PenguinPortrait unitId="Small" size={28} />
            </button>
            <span className="text-[11px] sm:text-xs font-black text-[#1A1A1A] tracking-tight mt-0.5">
              연타!!
            </span>
          </div>
        </div>

        {/* CENTER: Cost Bar + 5 Unit Circular Summon Buttons */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Cost Bar (Cyan circle with current cost on left + 10 segmented blocks) */}
          <div className="flex items-center">
            {/* Circular Cost Badge */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00AEEF] border-2 border-[#1A1A1A] flex items-center justify-center text-white font-black text-xs sm:text-sm font-['Fredoka',sans-serif] z-10 -mr-1 shadow-sm">
              {cost}
            </div>

            {/* Segmented Horizontal Bar (10 blocks with rounded ends) */}
            <div className="flex h-4 sm:h-5 rounded-md border-2 border-[#1A1A1A] overflow-hidden bg-[#FAF6E9]">
              {Array.from({ length: 10 }).map((_, i) => {
                const isFilled = i < cost;
                return (
                  <div
                    key={i}
                    className={`w-4 sm:w-6 h-full border-r border-[#1A1A1A] last:border-r-0 transition-colors duration-150 ${
                      isFilled ? 'bg-[#00AEEF]' : 'bg-[#FAF6E9]'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* 5 Circular Unit Buttons (Small, Speed, Shooter, Tank, King) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {UNIT_ORDER.map((uid) => {
              const config = UNIT_CONFIGS[uid];
              const canAfford = cost >= config.cost;

              return (
                <div key={uid} className="flex flex-col items-center">
                  <button
                    onClick={() => handleUnitButtonClick(uid)}
                    className={`w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-white border-2 border-[#1A1A1A] flex items-center justify-center cursor-pointer transition-all duration-150 overflow-hidden ${
                      canAfford
                        ? 'hover:scale-108 active:scale-95 shadow-sm'
                        : 'opacity-40 grayscale cursor-not-allowed'
                    }`}
                    title={`${config.nameKo} (비용: ${config.cost})`}
                  >
                    <PenguinPortrait unitId={uid} size={uid === 'King' ? 46 : uid === 'Tank' ? 44 : 38} />
                  </button>

                  {/* Cost Pill Badge Below (1, 3, 5, 7, 10) */}
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-2 border-[#1A1A1A] flex items-center justify-center -mt-2 z-10 shadow-sm">
                    <span className="font-['Fredoka',sans-serif] font-black text-[11px] sm:text-xs text-[#1A1A1A]">
                      {config.cost}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE: Cloud with Enemy Castle HP Number (e.g. 13) */}
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 60 42" className="w-9 h-7 sm:w-11 sm:h-8" fill="none">
            <path
              d="M14 36 C8 36, 4 31, 6 24 C4 18, 12 12, 20 14 C24 6, 36 6, 42 12 C50 10, 56 16, 54 24 C58 29, 54 36, 46 36 Z"
              fill="#FFFFFF"
              stroke="#1A1A1A"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-black font-['Fredoka',sans-serif] text-xl sm:text-2xl text-[#1A1A1A] mt-0.5 leading-none">
            {enemyCastleHp}
          </span>
        </div>
      </div>
    </div>
  );
};
