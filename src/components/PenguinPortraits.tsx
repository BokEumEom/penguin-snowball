import React from 'react';
import { UnitId } from '../types';

interface PortraitProps {
  unitId: UnitId;
  size?: number;
  className?: string;
  isEnemy?: boolean;
}

const OUTLINE = '#171717';
const WHITE = '#FFFFFF';
const YELLOW = '#FFC400';

const bodyPath: Record<UnitId, string> = {
  Small: 'M48 14 C31 12 20 27 18 49 C16 68 22 82 39 88 C57 93 77 85 82 66 C87 47 77 23 61 17 C56 15 53 14 48 14 Z',
  Speed: 'M57 15 C41 11 26 24 21 45 C17 61 21 76 35 83 C50 91 69 84 78 69 C87 54 84 34 73 22 C68 18 63 16 57 15 Z',
  Shooter: 'M49 10 C36 10 27 23 25 43 C23 64 27 80 40 87 C54 94 69 86 74 69 C79 51 75 27 63 16 C59 12 54 10 49 10 Z',
  Tank: 'M47 14 C25 12 11 28 10 51 C9 71 18 84 36 89 C58 95 82 85 89 67 C96 48 87 27 69 19 C61 16 54 14 47 14 Z',
  King: 'M48 18 C29 15 16 31 15 52 C14 71 23 84 40 89 C59 94 80 85 86 68 C92 49 83 30 67 22 C60 19 54 18 48 18 Z',
};

const bellyPath: Record<UnitId, string> = {
  Small: 'M50 33 C39 32 30 44 29 59 C28 73 34 81 46 83 C60 86 72 77 72 63 C72 48 63 35 50 33 Z',
  Speed: 'M56 34 C46 33 38 43 37 57 C36 70 42 79 53 81 C64 83 73 75 73 61 C73 47 66 36 56 34 Z',
  Shooter: 'M52 29 C43 29 35 40 34 56 C33 71 38 80 48 83 C59 86 68 77 69 62 C70 46 62 31 52 29 Z',
  Tank: 'M50 34 C35 32 24 44 23 59 C21 74 29 82 43 84 C60 87 76 79 78 65 C80 50 67 36 50 34 Z',
  King: 'M50 37 C38 35 28 45 27 59 C25 73 32 81 45 84 C59 87 72 79 74 65 C76 51 64 39 50 37 Z',
};

export const PenguinPortrait: React.FC<PortraitProps> = ({
  unitId,
  size = 64,
  className = '',
  isEnemy = false,
}) => {
  const body = isEnemy ? '#F05A5A' : '#16B8D4';
  const accent = isEnemy ? '#F58A8A' : '#68D4E6';

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
      <ellipse cx="50" cy="90" rx={unitId === 'Tank' ? 29 : 24} ry="4.5" fill="#D9D2BF" />

      {unitId === 'King' && (
        <path
          d="M29 30 L33 10 L44 23 L55 5 L65 21 L76 10 L72 31"
          fill="#FFD51A"
          stroke={OUTLINE}
          strokeWidth="4.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {unitId === 'Speed' && (
        <path
          d="M42 22 C31 10 19 13 10 20 C22 22 31 27 39 32"
          fill={body}
          stroke={OUTLINE}
          strokeWidth="4.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      <path
        d={unitId === 'Tank'
          ? 'M18 50 C6 54 3 65 10 73 C14 78 19 69 22 58'
          : 'M22 49 C11 52 9 61 14 69 C18 74 22 66 24 57'}
        fill={body}
        stroke={OUTLINE}
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path d={bodyPath[unitId]} fill={body} stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

      <path d={bellyPath[unitId]} fill={WHITE} stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      <path
        d={unitId === 'Speed'
          ? 'M77 47 C90 49 96 57 96 66 C88 65 82 61 76 55'
          : unitId === 'Tank'
          ? 'M85 48 C96 52 97 63 91 71 C86 77 81 68 79 57'
          : unitId === 'King'
          ? 'M80 50 C89 54 90 63 84 69 C79 71 76 63 77 56'
          : 'M79 49 C89 52 91 61 86 68 C82 72 78 65 77 57'}
        fill={body}
        stroke={OUTLINE}
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {unitId === 'Shooter' ? (
        <>
          <path d="M38 35 Q44 31 50 35" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
          <path d="M55 35 Q61 31 67 35" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          {unitId === 'Speed' && <path d="M42 32 L52 36" stroke={OUTLINE} strokeWidth="3.6" strokeLinecap="round" />}
          {unitId === 'King' && (
            <>
              <path d="M36 42 L47 46" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
              <path d="M64 42 L53 46" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
            </>
          )}
          <circle cx={unitId === 'Speed' ? 52 : 43} cy={unitId === 'King' ? 50 : 42} r="4.2" fill={OUTLINE} />
          <circle cx={unitId === 'Speed' ? 68 : 59} cy={unitId === 'King' ? 50 : 42} r="4.2" fill={OUTLINE} />
        </>
      )}

      <path
        d={unitId === 'Speed'
          ? 'M52 47 L78 51 L52 58'
          : unitId === 'Shooter'
          ? 'M48 44 L75 48 L48 54'
          : unitId === 'Tank'
          ? 'M39 47 L63 48 L50 63'
          : unitId === 'King'
          ? 'M43 54 Q50 64 58 54 Q50 57 43 54'
          : 'M43 47 Q50 56 57 47 Q50 50 43 47'}
        fill={YELLOW}
        stroke={OUTLINE}
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path d="M31 84 C26 87 27 92 38 92 C43 91 43 86 38 83" fill={YELLOW} stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M59 84 C55 88 57 92 68 92 C73 91 73 86 68 83" fill={YELLOW} stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {unitId === 'Shooter' && (
        <circle cx="80" cy="63" r="10.5" fill={WHITE} stroke={OUTLINE} strokeWidth="3.5" />
      )}

      {/* tiny misregistered accent strokes make it feel drawn, not polished vector */}
      <path d="M25 37 C20 48 20 59 23 69" stroke={accent} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
      <path d="M72 29 C79 39 82 50 80 61" stroke="#000000" strokeWidth="1.3" strokeLinecap="round" opacity="0.18" />
    </svg>
  );
};
