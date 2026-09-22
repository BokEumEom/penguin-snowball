import React from 'react';
import { UnitId } from '../types';

interface PortraitProps {
  unitId: UnitId;
  size?: number;
  className?: string;
  isEnemy?: boolean;
}

const OUTLINE = '#1A1A1A';
const BELLY = '#FFFFFF';
const BEAK = '#FFB800';

export const PenguinPortrait: React.FC<PortraitProps> = ({
  unitId,
  size = 64,
  className = '',
  isEnemy = false,
}) => {
  const body = isEnemy ? '#EF5A59' : '#18B7D6';

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
      {/* very light ground mark — no glossy/vector shading */}
      <ellipse cx="50" cy="89" rx={unitId === 'Tank' ? 27 : 23} ry="4.5" fill="#DDD7C7" opacity="0.75" />

      {/* feet */}
      <path d="M29 82 C25 87 27 92 38 91 C43 90 43 85 38 82 Z" fill={BEAK} stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      <path d="M58 82 C55 87 57 92 68 91 C73 90 73 85 68 82 Z" fill={BEAK} stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />

      {/* silhouette accents */}
      {unitId === 'Speed' && (
        <path d="M42 19 C31 9 20 13 12 20 C23 21 31 25 39 30 Z" fill={body} stroke={OUTLINE} strokeWidth="4.5" strokeLinejoin="round" />
      )}
      {unitId === 'King' && (
        <path d="M30 28 L34 9 L45 22 L56 5 L65 20 L76 10 L72 30 Z" fill="#FFD600" stroke={OUTLINE} strokeWidth="4.5" strokeLinejoin="round" />
      )}

      {/* body: one flat team color, deliberately simple */}
      <path
        d={
          unitId === 'Shooter'
            ? 'M50 11 C34 11 26 29 26 57 C26 79 35 87 50 87 C65 87 74 79 74 57 C74 29 66 11 50 11 Z'
            : unitId === 'Tank'
            ? 'M50 15 C23 15 12 37 13 63 C14 82 27 88 50 88 C73 88 86 82 87 63 C88 37 77 15 50 15 Z'
            : unitId === 'Speed'
            ? 'M57 16 C38 14 26 31 23 56 C21 75 33 85 52 85 C73 85 82 71 81 52 C79 31 72 18 57 16 Z'
            : 'M50 15 C29 15 18 35 18 60 C18 79 29 87 50 87 C71 87 82 79 82 60 C82 35 71 15 50 15 Z'
        }
        fill={body}
        stroke={OUTLINE}
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* white belly — large, flat, graphic */}
      <path
        d={
          unitId === 'Shooter'
            ? 'M51 30 C41 30 34 43 34 64 C34 77 41 82 51 82 C61 82 68 76 68 62 C68 43 61 30 51 30 Z'
            : unitId === 'Tank'
            ? 'M51 34 C33 34 24 49 24 67 C24 79 34 83 51 83 C68 83 77 79 77 67 C77 49 69 34 51 34 Z'
            : 'M52 34 C39 34 31 48 31 66 C31 78 39 82 51 82 C63 82 71 77 71 64 C71 48 64 34 52 34 Z'
        }
        fill={BELLY}
        stroke={OUTLINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* left flipper */}
      <path
        d={unitId === 'Tank' ? 'M15 50 C5 54 4 65 10 72 C14 76 19 67 21 57 Z' : 'M20 49 C11 53 10 63 15 69 C19 72 22 65 23 57 Z'}
        fill={body}
        stroke={OUTLINE}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* right flipper / unit personality */}
      <path
        d={
          unitId === 'Speed'
            ? 'M78 49 C89 50 95 58 96 67 C88 66 82 62 76 56 Z'
            : unitId === 'Tank'
            ? 'M85 50 C95 54 96 65 90 72 C86 76 81 67 79 57 Z'
            : unitId === 'King'
            ? 'M80 51 C88 55 89 65 82 69 C77 69 76 62 77 56 Z'
            : 'M80 49 C89 53 90 63 85 69 C81 72 78 65 77 57 Z'
        }
        fill={body}
        stroke={OUTLINE}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* face is intentionally primitive: dots/lines, no blush or realistic mask */}
      {unitId === 'Shooter' ? (
        <>
          <path d="M38 36 Q44 31 50 36" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
          <path d="M55 36 Q61 31 67 36" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          {unitId === 'Speed' && <path d="M41 33 L52 37" stroke={OUTLINE} strokeWidth="3.5" strokeLinecap="round" />}
          {unitId === 'King' && (
            <>
              <path d="M36 41 L47 45" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
              <path d="M64 41 L53 45" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
            </>
          )}
          <circle cx={unitId === 'Speed' ? 51 : 43} cy={unitId === 'King' ? 49 : 42} r="4.6" fill={OUTLINE} />
          <circle cx={unitId === 'Speed' ? 69 : 59} cy={unitId === 'King' ? 49 : 42} r="4.6" fill={OUTLINE} />
        </>
      )}

      {/* yellow beak */}
      <path
        d={
          unitId === 'Speed'
            ? 'M52 48 L78 52 L52 59 Z'
            : unitId === 'Shooter'
            ? 'M48 45 L74 48 L48 54 Z'
            : unitId === 'Tank'
            ? 'M38 48 L63 48 L50 63 Z'
            : unitId === 'King'
            ? 'M43 55 Q50 65 57 55 Q50 57 43 55 Z'
            : 'M43 48 Q50 57 57 48 Q50 50 43 48 Z'
        }
        fill={BEAK}
        stroke={OUTLINE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* shooter only: simple snowball prop like the in-game doodle */}
      {unitId === 'Shooter' && (
        <circle cx="79" cy="63" r="11" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="3.5" />
      )}

      {/* second imperfect contour pass: subtle wobble instead of glossy rendering */}
      <path
        d={
          unitId === 'Tank'
            ? 'M25 25 C18 34 16 47 17 61 M78 29 C83 40 84 53 82 66'
            : 'M28 27 C23 37 22 49 22 59 M74 30 C79 40 79 53 77 64'
        }
        stroke="#000000"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.18"
      />
    </svg>
  );
};
