import React, { useState } from 'react';
import { Play, Settings, Zap, Clock } from 'lucide-react';
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

  const difficulties: { id: Difficulty; label: string; desc: string }[] = [
    { id: 'easy', label: '쉬움', desc: '느긋하게 펭귄 군단과 눈싸움을 익혀보세요.' },
    { id: 'normal', label: '보통', desc: '출격과 응원 타이밍을 함께 쓰는 표준 대결입니다.' },
    { id: 'hard', label: '어려움', desc: '빠른 적 출격과 왕펭귄의 압박을 버텨야 합니다.' },
  ];

  const timeOptions: { value: MatchTimeOption; label: string }[] = [
    { value: 120, label: '2분' },
    { value: 180, label: '3분' },
    { value: 300, label: '5분' },
    { value: 0, label: '∞' },
  ];

  return (
    <div className="relative w-full h-full overflow-y-auto overflow-x-hidden select-none bg-[#F3EFDF] text-[#20262E]">
      {/* Paper-snow background: broad shapes instead of a flat app background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[15%] h-52 w-72 rounded-[50%] border-[3px] border-[#20262E]/10 bg-white/65 rotate-[-7deg]" />
        <div className="absolute -right-24 top-[28%] h-44 w-72 rounded-[50%] border-[3px] border-[#20262E]/10 bg-white/70 rotate-[8deg]" />
        <div className="absolute -bottom-24 left-[-10%] h-52 w-[70%] rounded-[50%] bg-white/90 border-[3px] border-[#20262E]/10" />
        <div className="absolute -bottom-28 right-[-12%] h-56 w-[70%] rounded-[50%] bg-[#EAF7FA] border-[3px] border-[#20262E]/10" />
        <span className="absolute left-[8%] top-[18%] text-xl opacity-40">✦</span>
        <span className="absolute right-[11%] top-[14%] text-2xl opacity-35">❄</span>
        <span className="absolute left-[14%] top-[60%] text-lg opacity-30">❄</span>
        <span className="absolute right-[18%] top-[66%] text-xl opacity-25">✦</span>
      </div>

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-5xl flex-col px-3 pb-5 pt-[max(12px,env(safe-area-inset-top))] sm:px-6 sm:pb-7">
        {/* Small utility header, visually secondary to the poster title */}
        <header className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full border-[2.5px] border-[#20262E] bg-[#FFFDF5] px-3 py-1.5 shadow-[0_3px_0_#20262E]">
            <span className="text-base">❄️</span>
            <span className="text-[11px] font-black tracking-tight sm:text-sm">PENGUIN SNOWBALL</span>
          </div>

          <button
            onClick={() => {
              soundManager.playSe('select');
              onOpenSettings();
            }}
            className="flex min-h-10 items-center gap-1.5 rounded-full border-[2.5px] border-[#20262E] bg-white px-3.5 py-1.5 text-xs font-black shadow-[0_3px_0_#20262E] transition active:translate-y-[2px] active:shadow-[0_1px_0_#20262E]"
          >
            <Settings className="h-4 w-4" />
            설정
          </button>
        </header>

        <main className="my-auto flex w-full flex-col items-center py-5 sm:py-8">
          {/* Main illustrated poster */}
          <section className="relative w-full rounded-[34px] border-[3px] border-[#20262E] bg-[#FFFDF5] px-3 pb-5 pt-4 shadow-[0_8px_0_#20262E] sm:rounded-[44px] sm:px-7 sm:pb-7 sm:pt-6">
            {/* mascot ridge */}
            <div className="relative mx-auto flex h-24 max-w-xl items-end justify-center sm:h-32">
              <div className="absolute bottom-0 left-1/2 h-11 w-[92%] -translate-x-1/2 rounded-[50%] border-[3px] border-[#20262E] bg-[#EAF7FA]" />

              <div className="relative z-10 -mr-1 translate-y-1 -rotate-6 drop-shadow-[0_4px_0_rgba(32,38,46,0.16)]">
                <PenguinPortrait unitId="Small" size={66} />
              </div>
              <div className="relative z-20 -mr-1 -translate-y-2 rotate-3 drop-shadow-[0_5px_0_rgba(32,38,46,0.16)]">
                <PenguinPortrait unitId="Tank" size={82} />
              </div>
              <div className="relative z-30 -translate-y-4 drop-shadow-[0_6px_0_rgba(32,38,46,0.18)]">
                <PenguinPortrait unitId="King" size={96} />
              </div>
              <div className="relative z-20 -ml-1 -translate-y-2 -rotate-3 drop-shadow-[0_5px_0_rgba(32,38,46,0.16)]">
                <PenguinPortrait unitId="Shooter" size={82} />
              </div>
              <div className="relative z-10 -ml-1 translate-y-1 rotate-6 drop-shadow-[0_4px_0_rgba(32,38,46,0.16)]">
                <PenguinPortrait unitId="Speed" size={68} />
              </div>
            </div>

            <div className="relative z-20 -mt-1 text-center">
              <div className="mb-1 inline-flex rotate-[-2deg] items-center rounded-full border-2 border-[#20262E] bg-[#FFD65A] px-3 py-1 text-[11px] font-black shadow-[0_2px_0_#20262E] sm:text-xs">
                📣 응원 연타로 눈덩이를 더 빠르게!
              </div>
              <h1 className="mt-2 text-5xl font-black leading-none tracking-[-0.07em] text-[#20262E] [text-shadow:0_4px_0_#FFFFFF] sm:text-7xl">
                펭귄 눈싸움
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-xs font-extrabold leading-relaxed text-[#45515B] sm:text-sm">
                펭귄을 출격시키고 눈덩이를 던져 상대 이글루에 백기를 올리세요.
              </p>
            </div>

            {/* Compact game setup, styled like paper stickers rather than dashboard cards */}
            <div className="mx-auto mt-5 grid max-w-3xl grid-cols-1 gap-3 md:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[26px] border-[2.5px] border-[#20262E] bg-[#F8F3E5] p-3.5 shadow-[0_4px_0_#D8D1BD] sm:p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-black">
                  <Zap className="h-4 w-4 fill-[#FFD65A] text-[#20262E]" />
                  난이도
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {difficulties.map((d) => {
                    const active = settings.difficulty === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          soundManager.playSe('select');
                          onUpdateSettings({ difficulty: d.id });
                        }}
                        className={`rounded-full border-2 border-[#20262E] px-1 py-2 text-xs font-black transition active:translate-y-[1px] ${
                          active
                            ? 'bg-[#45BDE3] text-white shadow-[0_3px_0_#20262E]'
                            : 'bg-white text-[#20262E] shadow-[0_2px_0_#D8D1BD]'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 min-h-8 text-[10px] font-bold leading-relaxed text-[#59646D] sm:text-[11px]">
                  {difficulties.find((d) => d.id === settings.difficulty)?.desc}
                </p>

                <div className="mb-2 mt-3 flex items-center gap-1.5 text-xs font-black">
                  <Clock className="h-4 w-4 text-[#45BDE3]" />
                  경기 시간
                </div>
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
                        className={`rounded-xl border-2 border-[#20262E] py-1.5 text-[11px] font-black transition ${
                          active ? 'bg-[#FFD65A] shadow-[0_2px_0_#20262E]' : 'bg-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[26px] border-[2.5px] border-[#20262E] bg-white p-3.5 shadow-[0_4px_0_#D8D1BD] sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">출격 펭귄</span>
                  <span className="rounded-full border-2 border-[#20262E] bg-[#EAF7FA] px-2 py-0.5 text-[10px] font-black">
                    COST {previewConfig.cost}
                  </span>
                </div>

                <div className="mt-2 flex items-end justify-between gap-1">
                  {UNIT_ORDER.map((uid) => {
                    const active = selectedUnitPreview === uid;
                    return (
                      <button
                        key={uid}
                        onClick={() => {
                          soundManager.playSe('select');
                          setSelectedUnitPreview(uid);
                        }}
                        className={`relative flex h-12 w-12 items-center justify-center rounded-full border-[2.5px] border-[#20262E] bg-[#FFFDF5] transition sm:h-14 sm:w-14 ${
                          active
                            ? '-translate-y-1 bg-[#EAF7FA] ring-[3px] ring-[#45BDE3]/35 shadow-[0_4px_0_#20262E]'
                            : 'shadow-[0_2px_0_#D8D1BD]'
                        }`}
                      >
                        <PenguinPortrait
                          unitId={uid}
                          size={uid === 'King' ? 45 : uid === 'Tank' ? 42 : 38}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex min-h-[78px] items-center gap-3 rounded-[20px] border-2 border-[#20262E] bg-[#F8F3E5] px-3 py-2.5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#20262E] bg-white shadow-[0_2px_0_#D8D1BD]">
                    <PenguinPortrait unitId={selectedUnitPreview} size={54} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-sm font-black">{previewConfig.nameKo}</h3>
                      <span className="rounded-full border border-[#D59B21] bg-[#FFF0B5] px-2 py-0.5 text-[9px] font-black text-[#76510D]">
                        {previewConfig.roleKo}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[10px] font-bold leading-relaxed text-[#59646D] sm:text-[11px]">
                      {previewConfig.descriptionKo}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playSe('battle_start');
                onStartBattle();
              }}
              className="mx-auto mt-5 flex min-h-14 items-center gap-2.5 rounded-full border-[3px] border-[#20262E] bg-[#45BDE3] px-9 py-3 text-lg font-black text-white shadow-[0_6px_0_#20262E] transition hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-[0_3px_0_#20262E] sm:text-xl"
            >
              <Play className="h-5 w-5 fill-white" />
              눈싸움 시작!
            </button>
          </section>

          <div className="mt-4 rounded-full border-2 border-[#20262E]/70 bg-white/70 px-4 py-1.5 text-center text-[10px] font-extrabold text-[#4D5962] sm:text-[11px]">
            모바일: 펭귄 선택 → 눈밭 탭으로 출격 · 응원 버튼 연타
            <span className="hidden sm:inline"> · PC: 숫자 1~5 / Space</span>
          </div>
        </main>
      </div>
    </div>
  );
};
