import React, { useState } from 'react';
import { Play, Settings } from 'lucide-react';
import { Difficulty, MatchSettings, MatchTimeOption, UnitId } from '../types';
import { soundManager } from '../audio/soundManager';
import { UNIT_CONFIGS, UNIT_ORDER } from '../game/unitData';
import { PenguinPortrait } from './PenguinPortraits';

interface TitleScreenProps {
  settings: MatchSettings;
  onUpdateSettings: (newSettings: Partial<MatchSettings>) => void;
  onStartBattle: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  settings,
  onUpdateSettings,
  onStartBattle,
  onOpenSettings,
}) => {
  const [selectedUnitPreview, setSelectedUnitPreview] = useState<UnitId>('Small');
  const previewConfig = UNIT_CONFIGS[selectedUnitPreview];

  const difficulties: { id: Difficulty; label: string }[] = [
    { id: 'easy', label: '쉬움' },
    { id: 'normal', label: '보통' },
    { id: 'hard', label: '어려움' },
  ];

  const timeOptions: { value: MatchTimeOption; label: string }[] = [
    { value: 120, label: '2분' },
    { value: 180, label: '3분' },
    { value: 300, label: '5분' },
    { value: 0, label: '∞' },
  ];

  return (
    <div className="relative h-full w-full overflow-y-auto overflow-x-hidden select-none bg-[#FAF6E9] text-[#1A1A1A]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg className="absolute inset-x-0 bottom-0 h-[42%] w-full" viewBox="0 0 1200 330" preserveAspectRatio="none">
          <path
            d="M0 142 C155 111 249 177 390 142 C560 100 666 170 823 135 C985 99 1080 143 1200 119 L1200 330 L0 330 Z"
            fill="#FFFFFF"
            stroke="#1A1A1A"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="absolute left-[8%] top-[16%] rotate-[-10deg] text-xl">❄</div>
        <div className="absolute right-[10%] top-[22%] rotate-[8deg] text-lg">❄</div>
        <div className="absolute left-[18%] top-[53%] text-sm">✦</div>
        <div className="absolute right-[19%] top-[50%] text-sm">✦</div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-4xl flex-col px-3 pb-[max(16px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))] sm:px-5">
        <header className="flex items-center justify-end">
          <button
            onClick={() => {
              soundManager.playSe('select');
              onOpenSettings();
            }}
            className="flex h-10 items-center gap-1.5 rounded-full border-[3px] border-[#1A1A1A] bg-white px-4 text-xs font-black transition active:translate-y-0.5"
          >
            <Settings className="h-4 w-4" />
            설정
          </button>
        </header>

        <main className="my-auto flex w-full flex-col items-center py-3 sm:py-5">
          <div className="relative flex h-28 w-full max-w-xl items-end justify-center sm:h-36">
            <div className="absolute bottom-1 h-8 w-[85%] rounded-[50%] border-[3px] border-[#1A1A1A] bg-white" />
            <div className="relative z-10 translate-x-2 translate-y-1 -rotate-6">
              <PenguinPortrait unitId="Small" size={70} />
            </div>
            <div className="relative z-20 translate-y-[-3px] rotate-3">
              <PenguinPortrait unitId="Tank" size={86} />
            </div>
            <div className="relative z-30 -mx-1 translate-y-[-9px]">
              <PenguinPortrait unitId="King" size={104} />
            </div>
            <div className="relative z-20 translate-y-[-3px] -rotate-3">
              <PenguinPortrait unitId="Shooter" size={84} />
            </div>
            <div className="relative z-10 -translate-x-2 translate-y-1 rotate-6">
              <PenguinPortrait unitId="Speed" size={70} />
            </div>
          </div>

          <div className="relative mt-1 text-center">
            <span className="absolute -left-8 top-2 rotate-[-15deg] text-2xl">❄</span>
            <span className="absolute -right-8 top-0 rotate-[12deg] text-2xl">❄</span>
            <h1 className="rotate-[-1deg] text-5xl font-black leading-[0.9] tracking-[-0.08em] sm:text-7xl">
              펭귄 눈싸움
            </h1>
            <div className="mx-auto mt-2 w-fit rotate-[1deg] border-b-[4px] border-[#18B7D6] px-3 pb-1 text-[11px] font-black sm:text-sm">
              와글와글 펭귄 군단의 눈싸움!
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playSe('battle_start');
              onStartBattle();
            }}
            className="mt-5 flex min-h-14 items-center gap-2 rounded-full border-[4px] border-[#1A1A1A] bg-[#18B7D6] px-10 py-3 text-lg font-black text-white transition hover:-rotate-1 active:translate-y-1 sm:text-xl"
          >
            <Play className="h-5 w-5 fill-white" />
            게임 시작
          </button>

          <section className="mt-5 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rotate-[-0.5deg] rounded-[22px] border-[3px] border-[#1A1A1A] bg-white p-3">
              <div className="mb-2 text-center text-xs font-black">난이도</div>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map((d) => {
                  const active = settings.difficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        soundManager.playSe('select');
                        onUpdateSettings({ difficulty: d.id });
                      }}
                      className={`rounded-full border-[3px] border-[#1A1A1A] py-2 text-xs font-black ${
                        active ? 'bg-[#18B7D6] text-white' : 'bg-[#FAF6E9]'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>

              <div className="mb-2 mt-4 text-center text-xs font-black">경기 시간</div>
              <div className="grid grid-cols-4 gap-1.5">
                {timeOptions.map((t) => {
                  const active = settings.timeLimit === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => {
                        soundManager.playSe('select');
                        onUpdateSettings({ timeLimit: t.value });
                      }}
                      className={`rounded-xl border-[3px] border-[#1A1A1A] py-1.5 text-[11px] font-black ${
                        active ? 'bg-[#FFD600]' : 'bg-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rotate-[0.5deg] rounded-[22px] border-[3px] border-[#1A1A1A] bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">펭귄 선택</span>
                <span className="rounded-full border-[2px] border-[#1A1A1A] bg-[#FFD600] px-2 py-0.5 text-[10px] font-black">
                  비용 {previewConfig.cost}
                </span>
              </div>

              <div className="mt-2 flex items-end justify-between gap-1">
                {UNIT_ORDER.map((uid) => {
                  const active = uid === selectedUnitPreview;
                  return (
                    <button
                      key={uid}
                      onClick={() => {
                        soundManager.playSe('select');
                        setSelectedUnitPreview(uid);
                      }}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#1A1A1A] sm:h-13 sm:w-13 ${
                        active ? '-translate-y-1 bg-[#DDF7FB]' : 'bg-[#FAF6E9]'
                      }`}
                    >
                      <PenguinPortrait unitId={uid} size={uid === 'King' ? 44 : 38} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center gap-2 border-t-[3px] border-dashed border-[#1A1A1A] pt-2">
                <PenguinPortrait unitId={selectedUnitPreview} size={54} />
                <div className="min-w-0">
                  <div className="font-black">{previewConfig.nameKo}</div>
                  <div className="text-[10px] font-bold leading-relaxed text-[#555]">
                    {previewConfig.descriptionKo}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-4 rotate-[-1deg] rounded-full border-[2px] border-[#1A1A1A] bg-[#FFD600] px-4 py-1 text-[10px] font-black sm:text-xs">
            📣 응원 버튼을 연타하면 눈덩이 만들기가 빨라져요!
          </div>
        </main>
      </div>
    </div>
  );
};
