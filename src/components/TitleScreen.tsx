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
    {
      id: 'easy',
      label: '쉬움',
      desc: '적의 출격이 느리고 여유롭게 눈싸움을 즐길 수 있습니다.',
    },
    {
      id: 'normal',
      label: '보통',
      desc: '균형 잡힌 적절한 난이도의 표준 대결입니다.',
    },
    {
      id: 'hard',
      label: '어려움',
      desc: '빠른 코스트 회복과 킹 펭귄을 앞세운 적의 맹공격!',
    },
  ];

  const timeOptions: { value: MatchTimeOption; label: string }[] = [
    { value: 120, label: '2분' },
    { value: 180, label: '3분 (기본)' },
    { value: 300, label: '5분' },
    { value: 0, label: '무제한' },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 md:p-8 bg-[#FAF6E9] overflow-y-auto select-none text-[#1A1A1A]">
      {/* Top Header */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border-2 border-[#1A1A1A] shadow-sm">
          <span className="text-base">❄️</span>
          <span className="font-black text-xs sm:text-sm tracking-wide text-[#1A1A1A]">
            펭귄 눈싸움 (Penguin Snowball Fight)
          </span>
        </div>

        <button
          onClick={() => {
            soundManager.playSe('select');
            onOpenSettings();
          }}
          className="flex items-center gap-1.5 bg-white text-[#1A1A1A] px-3.5 py-1.5 rounded-full border-2 border-[#1A1A1A] font-bold text-xs sm:text-sm shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>설정</span>
        </button>
      </header>

      {/* Hero Title & Mascot Penguins */}
      <div className="w-full max-w-3xl flex flex-col items-center my-auto z-10 text-center py-2">
        {/* Animated Mascot Penguins row */}
        <div className="flex items-end justify-center gap-3 sm:gap-4 mb-3">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-[#1A1A1A] shadow-sm flex items-center justify-center animate-bounce">
            <PenguinPortrait unitId="Small" size={42} />
          </div>
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white border-2 border-[#1A1A1A] shadow-md flex items-center justify-center animate-bounce [animation-delay:150ms]">
            <PenguinPortrait unitId="King" size={56} />
          </div>
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-[#1A1A1A] shadow-sm flex items-center justify-center animate-bounce [animation-delay:300ms]">
            <PenguinPortrait unitId="Speed" size={42} />
          </div>
        </div>

        {/* Title text */}
        <h1 className="text-4xl sm:text-6xl font-black text-[#1A1A1A] tracking-tight font-['Noto_Sans_KR',sans-serif] drop-shadow-sm">
          펭귄 눈싸움
        </h1>
        <p className="text-xs sm:text-sm font-bold text-[#1A1A1A]/80 mt-1.5 max-w-md bg-white/80 px-4 py-1.5 rounded-full border-2 border-[#1A1A1A] shadow-sm">
          눈뭉치를 던져 상대 진영의 이글루를 무너뜨리세요!
        </p>

        {/* Settings & Unit Preview Box */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-left">
          {/* Left Column: Difficulty & Time */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-sm space-y-4">
            {/* Difficulty */}
            <div>
              <div className="flex items-center gap-1.5 mb-2 font-black text-xs sm:text-sm text-[#1A1A1A]">
                <Zap className="w-4 h-4 text-[#FFB300] fill-[#FFB300]" />
                <span>난이도 선택</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map((d) => {
                  const isSelected = settings.difficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        soundManager.playSe('select');
                        onUpdateSettings({ difficulty: d.id });
                      }}
                      className={`py-2 px-1 rounded-2xl font-black text-xs transition cursor-pointer border-2 ${
                        isSelected
                          ? 'bg-[#00AEEF] text-white border-[#1A1A1A] shadow-sm scale-102'
                          : 'bg-[#FAF6E9] text-[#1A1A1A] border-[#1A1A1A] hover:bg-sky-50'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] font-bold text-[#1A1A1A]/70 mt-1.5">
                {difficulties.find((d) => d.id === settings.difficulty)?.desc}
              </p>
            </div>

            {/* Match Time */}
            <div>
              <div className="flex items-center gap-1.5 mb-2 font-black text-xs sm:text-sm text-[#1A1A1A]">
                <Clock className="w-4 h-4 text-[#00AEEF]" />
                <span>경기 시간</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {timeOptions.map((t) => {
                  const isSelected = settings.timeLimit === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => {
                        soundManager.playSe('select');
                        onUpdateSettings({ timeLimit: t.value });
                      }}
                      className={`py-1.5 rounded-xl font-black text-xs transition cursor-pointer border-2 ${
                        isSelected
                          ? 'bg-[#00AEEF] text-white border-[#1A1A1A] shadow-sm'
                          : 'bg-[#FAF6E9] text-[#1A1A1A] border-[#1A1A1A] hover:bg-sky-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: 5 Unit Catalog Preview */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-[#1A1A1A] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xs sm:text-sm text-[#1A1A1A]">펭귄 군단 도감</span>
                <span className="text-[11px] font-bold text-[#00AEEF] bg-sky-50 px-2 py-0.5 rounded-full border border-[#00AEEF]/40">
                  비용 {previewConfig.cost}
                </span>
              </div>

              {/* 5 Circular Unit Selector Buttons */}
              <div className="flex items-center justify-between gap-1.5 mb-3">
                {UNIT_ORDER.map((uid) => {
                  const isCur = selectedUnitPreview === uid;
                  return (
                    <button
                      key={uid}
                      onClick={() => {
                        soundManager.playSe('select');
                        setSelectedUnitPreview(uid);
                      }}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border-2 flex items-center justify-center cursor-pointer transition ${
                        isCur
                          ? 'border-[#00AEEF] ring-2 ring-[#00AEEF] scale-110 shadow-sm'
                          : 'border-[#1A1A1A] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <PenguinPortrait unitId={uid} size={30} />
                    </button>
                  );
                })}
              </div>

              {/* Selected Unit Details */}
              <div className="bg-[#FAF6E9] p-3 rounded-2xl border border-[#1A1A1A] flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-[#1A1A1A] flex items-center justify-center shrink-0 shadow-sm">
                  <PenguinPortrait unitId={selectedUnitPreview} size={42} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-[#1A1A1A]">{previewConfig.nameKo}</h3>
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-300">
                      {previewConfig.roleKo}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-[#1A1A1A]/80 mt-1 line-clamp-2">
                    {previewConfig.descriptionKo}
                  </p>
                </div>
              </div>
            </div>

            {/* Keyboard Guide */}
            <div className="mt-2 text-center text-[11px] font-bold text-[#1A1A1A]/70">
              💡 팁: 숫자키(1~5)로 즉시 출격, 스페이스바로 응원 연타!
            </div>
          </div>
        </div>

        {/* Big Start Battle Button */}
        <button
          onClick={() => {
            soundManager.playSe('battle_start');
            onStartBattle();
          }}
          className="mt-6 px-10 py-3.5 bg-[#00AEEF] hover:bg-[#0284c7] active:scale-95 text-white font-black text-lg sm:text-xl rounded-full border-3 border-[#1A1A1A] shadow-[0_4px_0_#1A1A1A] hover:shadow-[0_2px_0_#1A1A1A] hover:translate-y-[2px] transition-all cursor-pointer flex items-center gap-3"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>배틀 시작하기!</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] font-bold text-[#1A1A1A]/60 py-2">
        펭귄 눈싸움 • 순수 캔버스 물리 기반 타워 디펜스
      </footer>
    </div>
  );
};
