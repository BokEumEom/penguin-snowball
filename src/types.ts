export type Team = 'player' | 'enemy';

export type UnitId = 'Small' | 'Speed' | 'Shooter' | 'Tank' | 'King';

export type UnitRole = 'Swarm' | 'Speed' | 'Shooter' | 'Tank' | 'Boss';

export type TargetMode = 'NearestEnemy' | 'CastleOnly';

export interface UnitConfig {
  id: UnitId;
  nameKo: string;
  nameJa: string;
  role: UnitRole;
  roleKo: string;
  roleJa: string;
  cost: number;
  maxHp: number;
  moveSpeed: number;
  reloadSeconds: number;
  attackPower: number;
  attackRange: number;
  ballMoveSpeed: number;
  ballArcHeight: number;
  ballRadius: number;
  splashRadius?: number;
  descriptionKo: string;
  descriptionJa: string;
  color: string;
  accentColor: string;
  size: number;
}

export type UnitState = 'spawning' | 'moving' | 'reloading' | 'attacking' | 'defeated';

export interface BattleUnit {
  uid: string;
  id: UnitId;
  team: Team;
  x: number;
  y: number; // Lane offset (-30 to +30)
  hp: number;
  maxHp: number;
  state: UnitState;
  stateTimer: number;
  isFacingRight: boolean;
  walkFrame: number;
  walkTimer: number;
  reloadProgress: number; // 0 to 1
  attackProgress: number;
  targetUid: string | null;
  targetCastle: boolean;
  defeatedKnockback: {
    vx: number;
    vy: number;
    rotation: number;
    vRot: number;
    opacity: number;
  } | null;
}

export interface Snowball {
  id: string;
  team: Team;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  progress: number; // 0 to 1
  arcHeight: number;
  speed: number;
  damage: number;
  radius: number;
  splashRadius?: number;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  damage: number;
  team: Team;
  opacity: number;
  vy: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  rotation?: number;
  vRot?: number;
  type?: 'snow' | 'sparkle' | 'flag' | 'dust';
}

export type Difficulty = 'easy' | 'normal' | 'hard';

export type MatchTimeOption = 120 | 180 | 300 | 0; // 0 = unlimited

export interface MatchSettings {
  difficulty: Difficulty;
  timeLimit: MatchTimeOption;
  bgmVolume: number;
  seVolume: number;
  language: 'ko' | 'ja';
}

export type GamePhase = 'title' | 'battle_start' | 'playing' | 'paused' | 'result';

export type MatchResult = 'victory' | 'defeat' | 'draw' | 'time_up';

export interface MatchStats {
  unitsSpawnedPlayer: number;
  unitsSpawnedEnemy: number;
  snowballsThrownPlayer: number;
  damageDealtPlayer: number;
  damageDealtEnemy: number;
  elapsedSeconds: number;
}
