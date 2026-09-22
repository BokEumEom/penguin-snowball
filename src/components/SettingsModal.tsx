import React from 'react';
import { Volume2, Info, X } from 'lucide-react';
import { MatchSettings } from '../types';
import { soundManager } from '../audio/soundManager';

interface SettingsModalProps {
  settings: MatchSettings;
  onUpdateSettings: (newSettings: Partial<MatchSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#FAF6E9] text-[#1A1A1A] rounded-3xl border-3 border-[#1A1A1A] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white border-b-2 border-[#1A1A1A] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-lg font-black font-['Noto_Sans_KR',sans-serif]">
              설정 및 게임 방법
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playSe('cancel');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#FAF6E9] hover:bg-slate-200 border-2 border-[#1A1A1A] flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#1A1A1A]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs font-bold">
          {/* Sound Settings */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border-2 border-[#1A1A1A]">
            <h3 className="font-black text-[#1A1A1A] text-xs flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[#00AEEF]" />
              <span>사운드 설정</span>
            </h3>

            {/* BGM Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-[#1A1A1A]/80 mb-1">
                <span>배경음악 (BGM)</span>
                <span>{Math.round(settings.bgmVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.bgmVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  soundManager.setBgmVolume(val);
                  onUpdateSettings({ bgmVolume: val });
                }}
                className="w-full h-2 bg-[#FAF6E9] rounded-lg appearance-none cursor-pointer accent-[#00AEEF]"
              />
            </div>

            {/* SE Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-[#1A1A1A]/80 mb-1">
                <span>효과음 (SFX)</span>
                <span>{Math.round(settings.seVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.seVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  soundManager.setSeVolume(val);
                  onUpdateSettings({ seVolume: val });
                  soundManager.playSe('select');
                }}
                className="w-full h-2 bg-[#FAF6E9] rounded-lg appearance-none cursor-pointer accent-[#00AEEF]"
              />
            </div>
          </div>

          {/* How to Play Guide */}
          <div className="space-y-2.5 bg-white p-4 rounded-2xl border-2 border-[#1A1A1A]">
            <h3 className="font-black text-[#1A1A1A] text-xs flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#FFB300]" />
              <span>게임 규칙 및 조작법</span>
            </h3>
            <ul className="text-[11px] text-[#1A1A1A]/85 space-y-1.5 leading-relaxed list-disc list-inside">
              <li>
                <span className="font-black">눈뭉치 코스트:</span> 시간에 따라 최대 10까지 차오릅니다.
              </li>
              <li>
                <span className="font-black">5종류의 펭귄:</span> 아기(1), 스피드(3), 스나이퍼(5), 탱커(7), 킹(10)을 소환할 수 있습니다.
              </li>
              <li>
                <span className="font-black">응원 연타 (FEVER):</span> 왼쪽 아래 <span className="underline">응원 버튼</span>이나 <span className="underline">스페이스바</span>를 연타해 게이지를 채우면 고속 코스트 회복 피버가 발동합니다!
              </li>
              <li>
                <span className="font-black">단축키:</span> 숫자키 1~5 키로 펭귄 즉시 출격, 스페이스바로 응원 연타!
              </li>
              <li>
                <span className="font-black">승리 조건:</span> 상대의 이글루를 파괴하여 백기를 들게 만들면 승리합니다!
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-3 border-t-2 border-[#1A1A1A] flex justify-end">
          <button
            onClick={() => {
              soundManager.playSe('decide');
              onClose();
            }}
            className="px-6 py-2 bg-[#00AEEF] hover:bg-[#0284c7] text-white font-black rounded-full border-2 border-[#1A1A1A] shadow-[0_2px_0_#1A1A1A] active:translate-y-[2px] active:shadow-none transition cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
