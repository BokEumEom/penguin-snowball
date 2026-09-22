import React, { useId } from 'react';
import { UnitId } from '../types';
import { UNIT_VISUALS } from '../game/unitData';

interface PortraitProps {
  unitId: UnitId;
  size?: number;
  className?: string;
  isEnemy?: boolean;
}

const BODY_PATHS: Record<UnitId, string> = {
  Small: 'M50 15 C31 15 20 31 20 57 C20 77 30 87 50 87 C70 87 80 77 80 57 C80 31 69 15 50 15 Z',
  Speed: 'M55 14 C36 14 25 31 24 55 C23 74 34 85 53 85 C73 85 82 72 80 52 C78 31 70 14 55 14 Z',
  Shooter: 'M50 10 C35 10 27 27 27 56 C27 78 35 88 50 88 C65 88 73 78 73 56 C73 27 65 10 50 10 Z',
  Tank: 'M50 15 C24 15 14 35 14 61 C14 81 27 89 50 89 C73 89 86 81 86 61 C86 35 76 15 50 15 Z',
  King: 'M50 19 C28 19 18 37 18 62 C18 81 29 89 50 89 C71 89 82 81 82 62 C82 37 72 19 50 19 Z',
};

const BELLY_PATHS: Record<UnitId, string> = {
  Small: 'M50 36 C38 36 31 48 31 66 C31 78 39 83 50 83 C61 83 69 78 69 66 C69 48 62 36 50 36 Z',
  Speed: 'M57 35 C45 35 38 48 39 65 C40 77 47 81 57 81 C67 81 74 73 72 60 C70 45 66 35 57 35 Z',
  Shooter: 'M51 28 C41 28 35 42 35 64 C35 78 41 83 51 83 C61 83 67 77 67 63 C67 42 61 28 51 28 Z',
  Tank: 'M50 35 C33 35 25 49 25 68 C25 80 35 84 50 84 C65 84 75 80 75 68 C75 49 67 35 50 35 Z',
  King: 'M50 38 C36 38 29 50 29 69 C29 80 37 84 50 84 C63 84 71 80 71 69 C71 50 64 38 50 38 Z',
};

export const PenguinPortrait: React.FC<PortraitProps> = ({
  unitId,
  size = 64,
  className = '',
  isEnemy = false,
}) => {
  const visual = UNIT_VISUALS[unitId];
  const teamColor = isEnemy ? '#E95B57' : '#45BDE3';
  const gradientId = `penguin-body-${useId().replace(/:/g, '')}`;
  const scarfShadow = isEnemy ? '#B93638' : '#238CB5';
  const eyeX = unitId === 'Speed' ? 57 : 50;
  const eyeY = unitId === 'Shooter' ? 35 : unitId === 'King' ? 45 : 39;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="28" y1="18" x2="70" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={visual.bodyTop} />
          <stop offset="1" stopColor={visual.bodyBottom} />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="89" rx={unitId === 'Tank' ? 30 : 25} ry="5" fill="#D8D4C6" opacity="0.68" />

      {/* feet */}
      <ellipse cx={unitId === 'Speed' ? 35 : 38} cy="86" rx="10" ry="5.5" fill={visual.feet} stroke={visual.outline} strokeWidth="3.3" />
      <ellipse cx={unitId === 'Speed' ? 66 : 62} cy="86" rx="10" ry="5.5" fill={visual.feet} stroke={visual.outline} strokeWidth="3.3" />

      {/* species silhouette accents */}
      {unitId === 'Speed' && (
        <path d="M39 21 C29 10 17 12 8 20 C20 23 28 26 39 29 Z" fill={visual.bodyTop} stroke={visual.outline} strokeWidth="3.5" strokeLinejoin="round" />
      )}
      {unitId === 'King' && (
        <path d="M29 28 L34 8 L45 21 L55 5 L64 20 L75 10 L72 31 Z" fill={visual.speciesAccent} stroke={visual.outline} strokeWidth="3.6" strokeLinejoin="round" />
      )}

      {/* flippers behind body */}
      <path
        d={unitId === 'Tank' ? 'M18 49 C7 52 4 64 10 73 C15 77 19 68 22 57 Z' : 'M23 48 C14 50 10 61 15 69 C19 72 23 64 25 56 Z'}
        fill={visual.bodyBottom}
        stroke={visual.outline}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d={unitId === 'Speed' ? 'M76 49 C87 50 94 58 96 67 C89 67 82 63 76 57 Z' : unitId === 'Tank' ? 'M82 49 C93 52 96 64 90 73 C85 77 81 68 78 57 Z' : 'M77 48 C86 50 90 61 85 69 C81 72 77 64 75 56 Z'}
        fill={visual.bodyBottom}
        stroke={visual.outline}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* body */}
      <path d={BODY_PATHS[unitId]} fill={`url(#${gradientId})`} stroke={visual.outline} strokeWidth="4" strokeLinejoin="round" />

      {/* soft painted highlight */}
      <path
        d={unitId === 'Tank' ? 'M27 34 C34 23 46 19 57 21 C43 29 35 41 31 56 C26 50 24 42 27 34 Z' : 'M30 31 C36 22 45 19 54 20 C43 27 36 38 33 51 C29 45 27 37 30 31 Z'}
        fill="#FFFFFF"
        opacity="0.12"
      />

      {/* face + belly */}
      <path d={BELLY_PATHS[unitId]} fill={visual.belly} stroke={visual.outline} strokeWidth="2.7" strokeLinejoin="round" />
      <path
        d={unitId === 'Speed'
          ? 'M37 27 C43 20 53 20 59 28 C65 20 73 23 76 31 C72 42 65 47 57 48 C47 47 40 40 37 27 Z'
          : unitId === 'Shooter'
          ? 'M34 25 C40 18 47 18 51 26 C56 18 64 19 68 26 C65 37 59 42 51 43 C43 42 37 37 34 25 Z'
          : 'M31 29 C37 21 45 20 50 29 C55 20 64 21 69 29 C66 41 59 47 50 47 C41 47 34 41 31 29 Z'}
        fill={visual.face}
      />

      {/* Emperor/King golden ear patches */}
      {(unitId === 'Tank' || unitId === 'King') && (
        <>
          <path d="M30 29 C23 33 22 43 29 49 C33 44 35 38 36 31 Z" fill={visual.speciesAccent} />
          <path d="M70 29 C77 33 78 43 71 49 C67 44 65 38 64 31 Z" fill={visual.speciesAccent} />
        </>
      )}

      {/* chinstrap marking */}
      {unitId === 'Shooter' && (
        <path d="M34 39 Q50 51 68 39" stroke={visual.speciesAccent} strokeWidth="4" strokeLinecap="round" />
      )}

      {/* eyes */}
      {unitId === 'Shooter' ? (
        <>
          <path d="M40 34 Q45 30 50 34" stroke={visual.outline} strokeWidth="3.3" strokeLinecap="round" />
          <path d="M54 34 Q59 30 64 34" stroke={visual.outline} strokeWidth="3.3" strokeLinecap="round" />
        </>
      ) : (
        <>
          {unitId === 'Speed' && <path d="M42 31 L51 35" stroke={visual.outline} strokeWidth="3" strokeLinecap="round" />}
          {unitId === 'King' && (
            <>
              <path d="M37 38 L47 42" stroke={visual.outline} strokeWidth="3.2" strokeLinecap="round" />
              <path d="M63 38 L53 42" stroke={visual.outline} strokeWidth="3.2" strokeLinecap="round" />
            </>
          )}
          <ellipse cx={eyeX - 7} cy={eyeY} rx="3.8" ry="4.7" fill={visual.outline} />
          <ellipse cx={eyeX + 7} cy={eyeY} rx="3.8" ry="4.7" fill={visual.outline} />
          <circle cx={eyeX - 8} cy={eyeY - 1.5} r="1.15" fill="#FFFFFF" />
          <circle cx={eyeX + 6} cy={eyeY - 1.5} r="1.15" fill="#FFFFFF" />
        </>
      )}

      {/* cheeks */}
      <ellipse cx="34" cy="46" rx="5" ry="2.7" fill={visual.cheek} opacity="0.46" />
      <ellipse cx="66" cy="46" rx="5" ry="2.7" fill={visual.cheek} opacity="0.46" />

      {/* beak */}
      <path
        d={unitId === 'Speed' || unitId === 'Shooter'
          ? 'M48 45 L72 49 L48 55 Z'
          : unitId === 'Tank'
          ? 'M39 47 Q50 43 61 47 L50 59 Z'
          : 'M42 47 Q50 44 58 47 L50 55 Z'}
        fill={visual.beak}
        stroke={visual.outline}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />

      {/* team scarf: team identity without recoloring the penguin */}
      <path d="M29 52 Q50 59 71 52 L69 61 Q50 67 31 61 Z" fill={teamColor} stroke={visual.outline} strokeWidth="2.7" strokeLinejoin="round" />
      <path d="M66 57 C77 60 82 65 84 74 L74 70 C72 64 69 61 64 60 Z" fill={scarfShadow} stroke={visual.outline} strokeWidth="2.5" strokeLinejoin="round" />

      {/* snowball cue for the ranged penguin */}
      {unitId === 'Shooter' && (
        <circle cx="80" cy="62" r="10" fill="#FFFFFF" stroke={visual.outline} strokeWidth="3" />
      )}
    </svg>
  );
};
