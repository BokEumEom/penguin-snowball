import React from 'react';
import { Play, Settings } from 'lucide-react';
import { Difficulty, MatchSettings, MatchTimeOption, UnitId } from '../types';
import { soundManager } from '../audio/soundManager';
import { PenguinPortrait } from './PenguinPortraits';

interface TitleScreenProps {
  settings: MatchSettings;
  onUpdateSettings: (newSettings: Partial<MatchSettings>) => void;
  onStartBattle: () => void;
  onOpenSettings: () => void;
}

const DISPLAY_UNITS: UnitId[] = ['Small', 'Speed', 'King', 'Shooter', 'Tank'];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  settings,
  onUpdateSettings,
  onStartBattle,
  onOpenSettings,
}) => {
  const difficulties: { id: Difficulty; label: string }[] = [
    { id: 'easy', label: '쉬움' },
    { id: 'normal', label: '보통' },
    { id: 'hard', label: '어려움' },
  ];

  const times: { value: MatchTimeOption; label: string }[] = [
    { value: 120, label: '2분' },
    { value: 180, label: '3분' },
    { value: 300, label: '5분' },
    { value: 0, label: '∞' },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#FAF6E9] text-[#171717]">
      {/* broad, nearly empty paper/snow field */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1200 760" preserveAspectRatio="none">
        <path
          d="M0 520 C170 485 285 545 435 510 C610 468 755 540 905 505 C1032 476 1115 496 1200 484 L1200 760 L0 760 Z"
          fill="#FFFFFF"
          stroke="#171717"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M-50 575 C145 540 270 604 450 565"
          stroke="#DCD5C1"
          strokeWidth="3"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M800 552 C955 526 1085 568 1240 542"
          stroke="#DCD5C1"
          strokeWidth="3"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="pointer-events-none absolute left-[9%] top-[15%] rotate-[-11deg] text-xl">❄</div>
      <div className="pointer-events-none absolute right-[10%] top-[19%] rotate-[8deg] text-2xl">❄</div>
      <div className="pointer-events-none absolute left-[16%] top-[45%] text-sm">✦</div>
      <div className="pointer-events-none absolute right-[18%] top-[42%] text-sm">✦</div>

      <button
        onClick={() => {
          soundManager.playSe('select');
          onOpenSettings();
        }}
        className="absolute right-3 top-[max(12px,env(safe-area-inset-top))] z-20 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#171717] bg-white active:translate-y-0.5 sm:right-5"
        aria-label="설정"
      >
        <Settings className="h-4 w-4" />
      </button>

      <main className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))]">
        <div className="-mt-8 text-center sm:-mt-4">
          <div className="mb-1 rotate-[-2deg] text-xs font-black tracking-[0.24em] sm:text-sm">
            PENGUIN SNOWBALL FIGHT
          </div>
          <h1 className="rotate-[1deg] text-5xl font-black leading-[0.86] tracking-[-0.08em] sm:text-7xl md:text-8xl">
            펭귄
            <br />
            눈싸움
          </h1>
          <div className="mx-auto mt-3 h-[5px] w-36 rotate-[-2deg] rounded-full bg-[#16B8D4] sm:w-48" />
        </div>

        {/* Character group is the hero art; intentionally no card behind it */}
        <div className="relative mt-3 flex h-36 w-full max-w-2xl items-end justify-center sm:mt-5 sm:h-48">
          <div className="absolute bottom-3 h-10 w-[78%] rounded-[50%] border-[3px] border-[#171717] bg-white" />

          {DISPLAY_UNITS.map((unit, index) => {
            const classes = [
              'z-10 translate-x-5 translate-y-1 -rotate-[8deg]',
              'z-20 translate-x-2 -translate-y-2 rotate-[4deg]',
              'z-30 -mx-2 -translate-y-5 rotate-[-1deg]',
              'z-20 -translate-x-2 -translate-y-1 rotate-[5deg]',
              'z-10 -translate-x-5 translate-y-2 rotate-[-5deg]',
            ][index];
            const sizes = [76, 88, 118, 92, 96];

            return (
              <div key={unit} className={`relative ${classes}`}>
                <PenguinPortrait unitId={unit} size={sizes[index]} />
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            soundManager.playSe('battle_start');
            onStartBattle();
          }}
          className="mt-1 flex min-h-14 items-center gap-2 rounded-full border-[4px] border-[#171717] bg-[#16B8D4] px-11 py-3 text-xl font-black text-white transition active:translate-y-1 sm:min-h-16 sm:px-14 sm:text-2xl"
        >
          <Play className="h-5 w-5 fill-white sm:h-6 sm:w-6" />
          시작
        </button>

        {/* Settings are intentionally plain text-chip controls, not app cards */}
        <div className="mt-5 flex flex-col items-center gap-2 text-[11px] font-black sm:mt-6 sm:text-xs">
          <div className="flex items-center gap-2">
            <span className="w-12 text-right">난이도</span>
            <div className="flex gap-1.5">
              {difficulties.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    soundManager.playSe('select');
                    onUpdateSettings({ difficulty: item.id });
                  }}
                  className={`rounded-full border-[2.5px] border-[#171717] px-3 py-1.5 ${
                    settings.difficulty === item.id ? 'bg-[#FFD51A]' : 'bg-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-12 text-right">시간</span>
            <div className="flex gap-1.5">
              {times.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    soundManager.playSe('select');
                    onUpdateSettings({ timeLimit: item.value });
                  }}
                  className={`rounded-full border-[2.5px] border-[#171717] px-3 py-1.5 ${
                    settings.timeLimit === item.value ? 'bg-[#FFD51A]' : 'bg-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rotate-[-1deg] text-center text-[10px] font-black sm:text-[11px]">
          📣 응원을 연타하면 눈덩이 만들기가 빨라집니다
        </div>
      </main>
    </div>
  );
};
