import React from 'react';
import { UnitId } from '../types';

interface PortraitProps {
  unitId: UnitId;
  size?: number;
  className?: string;
  isEnemy?: boolean;
}

export const PenguinPortrait: React.FC<PortraitProps> = ({
  unitId,
  size = 64,
  className = '',
  isEnemy = false,
}) => {
  const bodyColor = isEnemy ? '#EF4444' : '#00AEEF'; // Crimson red or Turquoise cyan
  const strokeColor = '#1A1A1A';

  switch (unitId) {
    case 'Small':
      // 1. 아기 펭귄: 작은 SD 원형 몸통, 흰 배, 작은 부리, 무구한 점 눈, 아기자기한 플리퍼
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Feet */}
          <path
            d="M32 82 C28 86, 26 92, 35 93 C42 93, 44 88, 40 82 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M60 82 C56 86, 54 92, 63 93 C70 93, 72 88, 68 82 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Chubby Round Turquoise Body */}
          <path
            d="M50 14 C28 14, 18 36, 18 60 C18 78, 28 86, 50 86 C72 86, 82 78, 82 60 C82 36, 72 14, 50 14 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* White Belly Patch */}
          <path
            d="M50 32 C38 32, 30 46, 30 64 C30 76, 38 82, 50 82 C62 82, 70 76, 70 64 C70 46, 62 32, 50 32 Z"
            fill="#FFFFFF"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Short Stubby Flippers (Wings) */}
          <path
            d="M19 46 C12 50, 10 60, 15 68 C18 71, 20 68, 21 62 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M81 46 C88 50, 90 60, 85 68 C82 71, 80 68, 79 62 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Innocent Dot Eyes */}
          <ellipse cx="42" cy="40" rx="4.5" ry="5.5" fill={strokeColor} />
          <circle cx="40.5" cy="38.5" r="1.8" fill="#FFFFFF" />

          <ellipse cx="58" cy="40" rx="4.5" ry="5.5" fill={strokeColor} />
          <circle cx="56.5" cy="38.5" r="1.8" fill="#FFFFFF" />

          {/* Cute Yellow Beak */}
          <path
            d="M44 47 Q50 56 56 47 Q50 49 44 47 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'Speed':
      // 2. 스피드 펭귄: 날렵한 유선형 몸통, 바람에 젖힌 깃털 머리, 날카로운 부리, 결의에 찬 점눈
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Running Feet */}
          <path
            d="M24 80 C18 84, 18 92, 26 92 C32 92, 34 86, 32 80 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M62 78 C58 84, 60 92, 70 92 C78 92, 78 84, 72 78 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Backwards Wind-blown Feather Crest / Hair */}
          <path
            d="M42 16 C30 8, 22 12, 14 18 C22 22, 30 22, 36 22 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Aerodynamic Forward-leaning Body */}
          <path
            d="M56 16 C36 16, 24 34, 22 58 C20 78, 30 84, 52 84 C74 84, 82 72, 82 54 C82 32, 74 16, 56 16 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* White Belly */}
          <path
            d="M58 34 C44 34, 36 46, 38 64 C40 76, 48 80, 58 80 C68 80, 76 72, 74 60 C72 44, 68 34, 58 34 Z"
            fill="#FFFFFF"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Swept-back Wings */}
          <path
            d="M23 48 C12 50, 6 56, 4 66 C8 66, 14 62, 20 56 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M78 50 C86 52, 92 60, 92 68 C88 68, 82 64, 76 58 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Determined Angled Eyebrows & Eyes */}
          <path
            d="M44 34 L54 38"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="50" cy="42" r="4.2" fill={strokeColor} />
          <circle cx="48.5" cy="40.5" r="1.5" fill="#FFFFFF" />

          <path
            d="M66 35 L74 38"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="70" cy="42" r="4.2" fill={strokeColor} />
          <circle cx="68.5" cy="40.5" r="1.5" fill="#FFFFFF" />

          {/* Pointy Sharp Speed Beak */}
          <path
            d="M54 48 L76 52 L54 59 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'Shooter':
      // 3. 스나이퍼 펭귄: 긴 달걀형 몸통, 여유로운 실눈(호선 눈), 긴 부리, 눈뭉치를 조준하는 포즈
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Small feet */}
          <path
            d="M34 84 C30 88, 30 94, 38 94 C44 94, 46 88, 42 84 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M58 84 C54 88, 54 94, 62 94 C68 94, 70 88, 66 84 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Tall Slender Body */}
          <path
            d="M50 10 C34 10, 26 28, 26 56 C26 78, 34 86, 50 86 C66 86, 74 78, 74 56 C74 28, 66 10, 50 10 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* White Chest / Belly */}
          <path
            d="M50 26 C40 26, 34 40, 34 62 C34 76, 40 82, 50 82 C60 82, 66 76, 66 62 C66 40, 60 26, 50 26 Z"
            fill="#FFFFFF"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Relaxed Zen/Squinting Eyes (Curved lines: ^ ^) */}
          <path
            d="M38 36 Q44 30 50 36"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M56 36 Q62 30 68 36"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Long Slender Aiming Beak */}
          <path
            d="M48 42 L72 45 L48 51 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Flipper holding a big snowball ready to toss */}
          <path
            d="M26 52 C20 54, 18 64, 22 70 C26 72, 28 66, 28 58 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Held Snowball */}
          <circle
            cx="72"
            cy="58"
            r="12"
            fill="#FFFFFF"
            stroke={strokeColor}
            strokeWidth="3.5"
          />
          <path
            d="M66 56 C68 62, 74 68, 80 62"
            stroke={bodyColor}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'Tank':
      // 4. 탱커 펭귄: 커다랗고 뚱뚱한 감자형 몸통, 활짝 벌려 웃는 커다란 부리, 작은 날개
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Big Wide Feet */}
          <path
            d="M24 84 C18 88, 16 95, 28 95 C38 95, 40 88, 36 84 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M64 84 C60 88, 62 95, 74 95 C84 95, 84 88, 76 84 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Giant Chubby Potato Body */}
          <path
            d="M50 14 C22 14, 12 36, 12 62 C12 82, 24 88, 50 88 C76 88, 88 82, 88 62 C88 36, 78 14, 50 14 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* Broad White Belly */}
          <path
            d="M50 32 C32 32, 24 46, 24 66 C24 78, 34 84, 50 84 C66 84, 76 78, 76 66 C76 46, 68 32, 50 32 Z"
            fill="#FFFFFF"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Small Flapping Wings */}
          <path
            d="M13 52 C4 56, 4 66, 10 72 C14 74, 16 68, 16 60 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M87 52 C96 56, 96 66, 90 72 C86 74, 84 68, 84 60 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Cheerful Dot Eyes */}
          <circle cx="40" cy="38" r="4.5" fill={strokeColor} />
          <circle cx="38.5" cy="36.5" r="1.6" fill="#FFFFFF" />

          <circle cx="60" cy="38" r="4.5" fill={strokeColor} />
          <circle cx="58.5" cy="36.5" r="1.6" fill="#FFFFFF" />

          {/* Exaggerated Open Laughing Beak (Wide open happy mouth!) */}
          <path
            d="M38 46 L62 46 L50 64 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Happy smile crease */}
          <path
            d="M44 52 Q50 58 56 52"
            stroke="#92400E"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'King':
      // 5. 킹 펭귄: 화려한 손그림 황금 볏/왕관 깃털, 위엄 있으면서도 우스꽝스러운 일자 눈썹과 점눈, 당당한 포즈
      return (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Royal Feet */}
          <path
            d="M28 84 C22 88, 20 94, 30 94 C38 94, 40 88, 36 84 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M64 84 C60 88, 62 94, 72 94 C80 94, 80 88, 74 84 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Wild Spiky Yellow Crown Crest (Marker-drawn spikes!) */}
          <path
            d="M30 26 L34 8 L46 20 L58 4 L68 18 L76 8 L74 28 Z"
            fill="#FFD600"
            stroke={strokeColor}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* Round Majestic Body */}
          <path
            d="M50 22 C28 22, 18 40, 18 64 C18 80, 28 88, 50 88 C72 88, 82 80, 82 64 C82 40, 72 22, 50 22 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* White Belly */}
          <path
            d="M50 38 C38 38, 30 50, 30 68 C30 78, 38 84, 50 84 C62 84, 70 78, 70 68 C70 50, 62 38, 50 38 Z"
            fill="#FFFFFF"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Proud Royal Flippers on Hips */}
          <path
            d="M19 50 C12 56, 12 66, 22 66 C24 66, 24 58, 22 52 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M81 50 C88 56, 88 66, 78 66 C76 66, 76 58, 78 52 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Fierce / Comical Stern Eyebrows & Eyes */}
          <path
            d="M36 40 L48 44"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="44" cy="48" r="4.2" fill={strokeColor} />
          <circle cx="42.5" cy="46.5" r="1.5" fill="#FFFFFF" />

          <path
            d="M64 40 L52 44"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="56" cy="48" r="4.2" fill={strokeColor} />
          <circle cx="54.5" cy="46.5" r="1.5" fill="#FFFFFF" />

          {/* Grand Yellow Beak */}
          <path
            d="M44 52 Q50 64 56 52 Q50 54 44 52 Z"
            fill="#FFB800"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
};
