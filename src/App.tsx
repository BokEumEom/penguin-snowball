import React, { useState, useEffect } from 'react';
import { GamePhase, MatchResult, MatchSettings, MatchStats } from './types';
import { TitleScreen } from './components/TitleScreen';
import { BattleScreen } from './components/BattleScreen';
import { ResultModal } from './components/ResultModal';
import { SettingsModal } from './components/SettingsModal';
import { soundManager } from './audio/soundManager';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('title');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Match settings
  const [settings, setSettings] = useState<MatchSettings>({
    difficulty: 'normal',
    timeLimit: 180, // 3 minutes default
    bgmVolume: 0.6,
    seVolume: 0.8,
    language: 'ko',
  });

  // Result state
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [finalPlayerHp, setFinalPlayerHp] = useState(1500);
  const [finalEnemyHp, setFinalEnemyHp] = useState(1500);

  // Play Title BGM when in title phase
  useEffect(() => {
    if (phase === 'title') {
      soundManager.playBgm('title');
    }
  }, [phase]);

  const handleUpdateSettings = (newSettings: Partial<MatchSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleStartBattle = () => {
    setMatchResult(null);
    setMatchStats(null);
    setPhase('playing');
  };

  const handleMatchFinish = (
    result: MatchResult,
    stats: MatchStats,
    playerHp: number,
    enemyHp: number
  ) => {
    setMatchResult(result);
    setMatchStats(stats);
    setFinalPlayerHp(playerHp);
    setFinalEnemyHp(enemyHp);
    setPhase('result');
  };

  const handleRetry = () => {
    setMatchResult(null);
    setMatchStats(null);
    setPhase('playing');
  };

  const handleReturnTitle = () => {
    setMatchResult(null);
    setMatchStats(null);
    setPhase('title');
  };

  return (
    <main className="w-screen h-[100dvh] min-h-[100dvh] overflow-hidden bg-slate-950 flex flex-col items-center justify-center">
      {/* Title Phase */}
      {phase === 'title' && (
        <TitleScreen
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onStartBattle={handleStartBattle}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Battle Phase */}
      {(phase === 'playing' || phase === 'result') && (
        <BattleScreen
          settings={settings}
          onMatchFinish={handleMatchFinish}
          onReturnTitle={handleReturnTitle}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Result Modal Overlay */}
      {phase === 'result' && matchResult && matchStats && (
        <ResultModal
          result={matchResult}
          stats={matchStats}
          playerCastleHp={finalPlayerHp}
          enemyCastleHp={finalEnemyHp}
          maxCastleHp={1500}
          settings={settings}
          onRetry={handleRetry}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* Settings Modal Overlay */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </main>
  );
}
