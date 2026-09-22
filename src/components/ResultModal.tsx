import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Award, Clock, Zap, Shield } from 'lucide-react';
import { MatchResult, MatchSettings, MatchStats } from '../types';
import { soundManager } from '../audio/soundManager';

interface ResultModalProps {
  result: MatchResult;
  stats: MatchStats;
  playerCastleHp: number;
  enemyCastleHp: number;
  maxCastleHp: number;
  settings: MatchSettings;
  onRetry: () => void;
  onReturnTitle: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  result,
  stats,
  playerCastleHp,
  enemyCastleHp,
  maxCastleHp,
  onRetry,
  onReturnTitle,
}) => {
  const isVictory = result === 'victory';
  const isDefeat = result === 'defeat';

  useEffect(() => {
    if (isVictory) {
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00AEEF', '#FFFFFF', '#FFD600', '#FFB300'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#00AEEF', '#FFFFFF', '#FFD600', '#FFB300'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isVictory]);

  const titleText = isVictory ? '눈싸움 승리!' : isDefeat ? '눈싸움 패배…' : '무승부!';
  const subtitleText = isVictory
    ? '상대 진영의 이글루가 함락되었습니다! 완벽한 승리입니다!'
    : isDefeat
    ? '아군 이글루가 무너졌습니다… 다시 도전해보세요!'
    : '제한 시간이 종료되었습니다!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#FAF6E9] text-[#1A1A1A] rounded-3xl border-3 border-[#1A1A1A] shadow-2xl w-full max-w-md overflow-hidden text-center">
        {/* Header */}
        <div
          className={`p-6 border-b-2 border-[#1A1A1A] ${
            isVictory
              ? 'bg-[#00AEEF] text-white'
              : isDefeat
              ? 'bg-[#EF4444] text-white'
              : 'bg-[#FFD600] text-[#1A1A1A]'
          }`}
        >
          <div className="text-5xl mb-2 animate-bounce">
            {isVictory ? '👑' : isDefeat ? '🏳️' : '⏱️'}
          </div>
          <h2 className="text-3xl font-black font-['Noto_Sans_KR',sans-serif] tracking-tight">
            {titleText}
          </h2>
          <p className="text-xs font-bold mt-1 opacity-95">
            {subtitleText}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2.5 text-left text-xs font-bold">
            {/* Player Castle HP */}
            <div className="bg-white p-3 rounded-2xl border-2 border-[#1A1A1A] flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[#00AEEF] shrink-0" />
              <div>
                <span className="text-[10px] text-[#1A1A1A]/70 block">아군 기지 잔여 HP</span>
                <span className="font-black text-sm text-[#1A1A1A]">
                  {playerCastleHp} / {maxCastleHp}
                </span>
              </div>
            </div>

            {/* Enemy Castle HP */}
            <div className="bg-white p-3 rounded-2xl border-2 border-[#1A1A1A] flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[#EF4444] shrink-0" />
              <div>
                <span className="text-[10px] text-[#1A1A1A]/70 block">적군 기지 잔여 HP</span>
                <span className="font-black text-sm text-[#1A1A1A]">
                  {enemyCastleHp} / {maxCastleHp}
                </span>
              </div>
            </div>

            {/* Snowballs Thrown */}
            <div className="bg-white p-3 rounded-2xl border-2 border-[#1A1A1A] flex items-center gap-2.5">
              <span className="text-lg">❄️</span>
              <div>
                <span className="text-[10px] text-[#1A1A1A]/70 block">던진 눈뭉치</span>
                <span className="font-black text-sm text-[#1A1A1A]">
                  {stats.snowballsThrownPlayer}개
                </span>
              </div>
            </div>

            {/* Total Damage */}
            <div className="bg-white p-3 rounded-2xl border-2 border-[#1A1A1A] flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-[#FFB300] shrink-0" />
              <div>
                <span className="text-[10px] text-[#1A1A1A]/70 block">총 입힌 피해</span>
                <span className="font-black text-sm text-[#1A1A1A]">
                  {stats.damageDealtPlayer}
                </span>
              </div>
            </div>

            {/* Units Spawned */}
            <div className="bg-white p-3 rounded-2xl border-2 border-[#1A1A1A] flex items-center gap-2.5">
              <Award className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <span className="text-[10px] text-[#1A1A1A]/70 block">출격 펭귄 수</span>
                <span className="font-black text-sm text-[#1A1A1A]">
                  {stats.unitsSpawnedPlayer}마리
                </span>
              </div>
            </div>

            {/* Battle Time */}
            <div className="bg-white p-3 rounded-2xl border-2 border-[#1A1A1A] flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-[#1A1A1A]/70 block">전투 시간</span>
                <span className="font-black text-sm text-[#1A1A1A]">
                  {Math.floor(stats.elapsedSeconds / 60)}:
                  {String(Math.floor(stats.elapsedSeconds % 60)).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => {
                soundManager.playSe('decide');
                onRetry();
              }}
              className="flex-1 py-3 px-4 bg-[#00AEEF] hover:bg-[#0284c7] text-white font-black rounded-full border-2 border-[#1A1A1A] shadow-[0_3px_0_#1A1A1A] active:translate-y-[2px] active:shadow-none transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>다시 도전</span>
            </button>

            <button
              onClick={() => {
                soundManager.playSe('cancel');
                onReturnTitle();
              }}
              className="py-3 px-5 bg-white hover:bg-slate-50 text-[#1A1A1A] font-black rounded-full border-2 border-[#1A1A1A] shadow-[0_3px_0_#1A1A1A] active:translate-y-[2px] active:shadow-none transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>타이틀</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
