import { BattleUnit, DamageNumber, Particle, Snowball, Team, UnitConfig } from '../types';
import { UNIT_CONFIGS } from './unitData';

interface RenderOptions {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  playerCastleHp: number;
  enemyCastleHp: number;
  maxCastleHp: number;
  units: BattleUnit[];
  snowballs: Snowball[];
  particles: Particle[];
  damageNumbers: DamageNumber[];
  selectedUnitToPlace: UnitConfig | null;
  hoverX: number | null;
  hoverY: number | null;
  cheerActive: boolean;
  isCastleDestroyed: boolean;
  winnerTeam: Team | null;
}

export class GameRenderer {
  public render(opts: RenderOptions) {
    const {
      canvas,
      ctx,
      playerCastleHp,
      enemyCastleHp,
      units,
      snowballs,
      particles,
      damageNumbers,
      selectedUnitToPlace,
      hoverX,
      hoverY,
      cheerActive,
    } = opts;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Warm cream paper background (#FAF6E9)
    ctx.fillStyle = '#FAF6E9';
    ctx.fillRect(0, 0, width, height);

    // 2. Playful Hand-Drawn Background Doodles (Drifting Clouds & Gentle Snow Horizon)
    this.drawBackgroundDoodles(ctx, width, height);

    // 3. Igloo Bases (Left: Player Base, Right: Enemy Base)
    const playerIglooX = 135;
    const playerIglooY = height * 0.65;
    const enemyIglooX = width - 135;
    const enemyIglooY = height * 0.35;

    const playerDead = playerCastleHp <= 0;
    const enemyDead = enemyCastleHp <= 0;

    // Left Player Igloo
    this.drawIgloo(ctx, 'player', playerIglooX, playerIglooY, playerDead);
    // Right Enemy Igloo
    this.drawIgloo(ctx, 'enemy', enemyIglooX, enemyIglooY, enemyDead);

    // 4. Deploy Zone overlay if a unit is currently selected
    if (selectedUnitToPlace) {
      this.drawDeployZone(ctx, width, height, selectedUnitToPlace, hoverX, hoverY);
    }

    // 5. Units & Shadows (sorted by Y for 2.5D visual depth)
    const sortedUnits = [...units].sort((a, b) => a.y - b.y);

    // Draw unit ground shadows first
    for (const unit of sortedUnits) {
      this.drawUnitShadow(ctx, unit, height);
    }

    // Draw units
    for (const unit of sortedUnits) {
      this.drawPenguinUnit(ctx, unit, height);
    }

    // 6. Snowballs (with ground shadows)
    for (const ball of snowballs) {
      this.drawSnowball(ctx, ball, height);
    }

    // 7. Particles (Snow bursts, cartoon stars, surrender flags)
    this.drawParticles(ctx, particles);

    // 8. Damage Numbers
    this.drawDamageNumbers(ctx, damageNumbers);

    // 9. Cheer Fever golden edge sparkle
    if (cheerActive) {
      ctx.save();
      ctx.strokeStyle = '#FFB800';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, width - 6, height - 6);
      ctx.restore();
    }
  }

  // --- BACKGROUND DOODLES (Paper aesthetic) ---
  private drawBackgroundDoodles(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();

    // Subtle hand-drawn snow horizon contour
    ctx.strokeStyle = '#E2DCBF';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.38);
    ctx.quadraticCurveTo(width * 0.25, height * 0.42, width * 0.5, height * 0.36);
    ctx.quadraticCurveTo(width * 0.75, height * 0.32, width, height * 0.38);
    ctx.stroke();

    // 3 Floating Hand-Drawn Doodle Clouds in the sky
    const time = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 0.0004;

    const cloud1X = ((time * 30 + 50) % (width + 160)) - 80;
    const cloud2X = ((time * 20 + width * 0.45) % (width + 160)) - 80;
    const cloud3X = ((time * 25 + width * 0.8) % (width + 160)) - 80;

    this.drawDoodleCloud(ctx, cloud1X, height * 0.12, 0.75);
    this.drawDoodleCloud(ctx, cloud2X, height * 0.22, 0.6);
    this.drawDoodleCloud(ctx, cloud3X, height * 0.15, 0.85);

    ctx.restore();
  }

  private drawDoodleCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(15, 30);
    ctx.bezierCurveTo(4, 30, 2, 20, 12, 14);
    ctx.bezierCurveTo(8, 4, 24, 0, 34, 6);
    ctx.bezierCurveTo(44, -4, 62, -2, 68, 10);
    ctx.bezierCurveTo(80, 8, 88, 18, 84, 26);
    ctx.bezierCurveTo(90, 32, 82, 38, 70, 38);
    ctx.bezierCurveTo(55, 40, 25, 39, 15, 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // --- IGLOO FORTRESS RENDERING ---
  private drawIgloo(
    ctx: CanvasRenderingContext2D,
    team: Team,
    x: number,
    baseY: number,
    isDestroyed: boolean
  ) {
    const isPlayer = team === 'player';
    const flagColor = isPlayer ? '#00AEEF' : '#EF4444';
    const iglooRadius = 68;

    ctx.save();

    if (isDestroyed) {
      // Destroyed: melted/crumbled snow pile with white surrender flag
      ctx.fillStyle = '#E5DFCD';
      ctx.beginPath();
      ctx.ellipse(x, baseY + 8, 75, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Melted snow mounds
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 3.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.arc(x - 30, baseY + 5, 24, Math.PI, 0);
      ctx.arc(x + 5, baseY + 8, 30, Math.PI, 0);
      ctx.arc(x + 40, baseY + 6, 20, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Surrender White Flag waving
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x, baseY + 5);
      ctx.lineTo(x, baseY - 50);
      ctx.stroke();

      // White flag cloth
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(x, baseY - 50);
      ctx.lineTo(x + 32, baseY - 42);
      ctx.lineTo(x + 28, baseY - 30);
      ctx.lineTo(x, baseY - 36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 1. Soft Shadow under igloo base
    ctx.fillStyle = '#E2DCBF';
    ctx.beginPath();
    ctx.ellipse(x, baseY + 12, iglooRadius + 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Fluffy Scalloped Snow Blanket under the Igloo (hand-drawn childlike waves)
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const bumpCount = 5;
    const bumpW = (iglooRadius * 2 + 12) / bumpCount;
    const startX = x - iglooRadius - 6;
    ctx.moveTo(startX, baseY + 10);
    for (let i = 0; i < bumpCount; i++) {
      const bx = startX + i * bumpW + bumpW / 2;
      ctx.quadraticCurveTo(bx, baseY + 18, startX + (i + 1) * bumpW, baseY + 10);
    }
    ctx.lineTo(startX + bumpCount * bumpW, baseY + 2);
    ctx.lineTo(startX, baseY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Main Igloo Dome (Pure White with slightly imperfect hand-drawn black outline)
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Hand-drawn slightly wonky dome
    ctx.moveTo(x - iglooRadius, baseY + 4);
    ctx.bezierCurveTo(
      x - iglooRadius - 2,
      baseY - iglooRadius * 0.7,
      x - iglooRadius * 0.45,
      baseY - iglooRadius * 1.15,
      x,
      baseY - iglooRadius * 1.15
    );
    ctx.bezierCurveTo(
      x + iglooRadius * 0.45,
      baseY - iglooRadius * 1.15,
      x + iglooRadius + 2,
      baseY - iglooRadius * 0.7,
      x + iglooRadius,
      baseY + 4
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4. Arched Entrance Doorway
    const doorW = 46;
    const doorH = 50;
    const doorX = x - doorW / 2;
    const doorY = baseY + 4 - doorH;

    ctx.fillStyle = '#DDD7C7'; // Neutral dark interior
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.roundRect(doorX, doorY, doorW, doorH + 2, [24, 24, 0, 0]);
    ctx.fill();
    ctx.stroke();

    // 5. Cute Baby Penguin Peeking Out from Doorway!
    this.drawDoorwayPenguin(ctx, x, baseY - 2, team);

    // 6. Flagpole & Triangular Flag on top of Igloo
    const poleTopY = baseY - iglooRadius * 1.15 - 40;
    const poleBottomY = baseY - iglooRadius * 1.15 + 6;

    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.moveTo(x, poleBottomY);
    ctx.lineTo(x + (isPlayer ? 1 : -1), poleTopY);
    ctx.stroke();

    // Triangular Flag pointing right (Player: Turquoise, Enemy: Crimson)
    ctx.fillStyle = flagColor;
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.moveTo(x, poleTopY);
    ctx.lineTo(x + (isPlayer ? 38 : -38), poleTopY + 14);
    ctx.lineTo(x, poleTopY + 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Draw cute baby penguin peeking out of the igloo entrance
  private drawDoorwayPenguin(ctx: CanvasRenderingContext2D, x: number, y: number, team: Team) {
    const isPlayer = team === 'player';
    const bodyColor = isPlayer ? '#00AEEF' : '#EF4444';

    ctx.save();
    // Head / Body inside doorway
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(x, y - 16, 15, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // White face patch
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(x + (isPlayer ? 4 : -4), y - 16, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(x + (isPlayer ? 4 : -4), y - 18, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Yellow beak
    ctx.fillStyle = '#FFB800';
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const beakDir = isPlayer ? 1 : -1;
    ctx.moveTo(x + beakDir * 8, y - 18);
    ctx.lineTo(x + beakDir * 18, y - 15);
    ctx.lineTo(x + beakDir * 8, y - 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // --- UNIT RENDERING ---
  private drawUnitShadow(ctx: CanvasRenderingContext2D, unit: BattleUnit, screenHeight: number) {
    if (unit.state === 'defeated' && unit.defeatedKnockback) return;
    const config = UNIT_CONFIGS[unit.id];
    const unitGroundY = screenHeight * 0.5 + unit.y;

    ctx.save();
    ctx.fillStyle = '#D8D1BD'; // Soft cream-grey ground shadow
    ctx.beginPath();
    ctx.ellipse(unit.x, unitGroundY + 4, config.size * 0.72, config.size * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawPenguinUnit(ctx: CanvasRenderingContext2D, unit: BattleUnit, screenHeight: number) {
    const config = UNIT_CONFIGS[unit.id];
    const isPlayer = unit.team === 'player';
    const groundY = screenHeight * 0.5 + unit.y;

    ctx.save();

    // Defeated spinning tumble with white surrender flag
    if (unit.state === 'defeated' && unit.defeatedKnockback) {
      const kb = unit.defeatedKnockback;
      ctx.globalAlpha = Math.max(0, kb.opacity);
      ctx.translate(unit.x, groundY + kb.vy);
      ctx.rotate(kb.rotation);
      this.drawPenguinIllustration(ctx, unit.id, isPlayer, 0, 'defeated', 0, 0);

      // White surrender flag
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(26, -24);
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(26, -24, 16, 10);
      ctx.strokeRect(26, -24, 16, 10);
      ctx.restore();
      return;
    }

    // Waddling & bouncing animation
    let waddleAngle = 0;
    let bounceY = 0;
    if (unit.state === 'moving') {
      waddleAngle = Math.sin(unit.walkFrame * 2.5) * 0.14;
      bounceY = -Math.abs(Math.sin(unit.walkFrame * 2.5)) * 5;
    } else if (unit.state === 'attacking') {
      waddleAngle = -0.2; // Leaning back to hurl
    }

    ctx.translate(unit.x, groundY + bounceY);
    if (!unit.isFacingRight) {
      ctx.scale(-1, 1);
    }
    ctx.rotate(waddleAngle);

    // Draw Hand-Drawn SD Doodle Penguin
    this.drawPenguinIllustration(
      ctx,
      unit.id,
      isPlayer,
      waddleAngle,
      unit.state,
      unit.reloadProgress,
      unit.attackProgress
    );

    ctx.restore();

    // Minimal HP indicator if damaged
    if (unit.hp < unit.maxHp && unit.hp > 0 && unit.state !== 'defeated') {
      this.drawUnitHpBar(ctx, unit.x, groundY - config.size * 1.15, unit.hp, unit.maxHp, isPlayer);
    }
  }

  // Render individual hand-drawn cartoon penguin unit
  // "작은 SD 비율의 손그림 펭귄 캐릭터, 둥근 청록색 몸통, 흰 배, 노란 부리와 발,
  // 굵고 살짝 흔들리는 검은 외곽선, 평면 색상, 명암 최소화, 단순한 점·선 형태의 얼굴"
  private drawPenguinIllustration(
    ctx: CanvasRenderingContext2D,
    id: UnitConfig['id'],
    isPlayer: boolean,
    waddle: number,
    state: BattleUnit['state'],
    reloadProgress: number,
    attackProgress: number
  ) {
    const config = UNIT_CONFIGS[id];
    const s = config.size;
    const bodyColor = isPlayer ? '#00AEEF' : '#EF4444'; // Turquoise Cyan (Player) vs Crimson Red (Enemy)
    const strokeColor = '#1A1A1A';

    ctx.lineWidth = 3.8;
    ctx.strokeStyle = strokeColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Waddling Feet (Yellow)
    ctx.fillStyle = '#FFB800';
    const footOffset = Math.sin(waddle * 4) * 3;

    ctx.beginPath();
    ctx.ellipse(-s * 0.2, s * 0.38 + footOffset, s * 0.18, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(s * 0.2, s * 0.38 - footOffset, s * 0.18, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2. Special King Penguin Spiky Mohawk / Crown Feathers!
    if (id === 'King') {
      ctx.fillStyle = '#FFD600';
      ctx.beginPath();
      ctx.moveTo(-s * 0.28, -s * 0.25);
      ctx.lineTo(-s * 0.16, -s * 0.78);
      ctx.lineTo(-s * 0.02, -s * 0.42);
      ctx.lineTo(s * 0.18, -s * 0.88);
      ctx.lineTo(s * 0.28, -s * 0.44);
      ctx.lineTo(s * 0.46, -s * 0.74);
      ctx.lineTo(s * 0.42, -s * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 3. Special Speed Penguin Swept-back Feather Tuft!
    if (id === 'Speed') {
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.moveTo(-s * 0.18, -s * 0.35);
      ctx.lineTo(-s * 0.55, -s * 0.55);
      ctx.lineTo(-s * 0.22, -s * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 4. Main Body (Turquoise/Red, Round SD Proportions)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    if (id === 'Shooter') {
      // Tall slender oval body
      ctx.ellipse(0, -s * 0.08, s * 0.42, s * 0.56, 0, 0, Math.PI * 2);
    } else if (id === 'Tank') {
      // Huge chubby round potato body
      ctx.ellipse(0, 0, s * 0.58, s * 0.52, 0, 0, Math.PI * 2);
    } else if (id === 'Speed') {
      // Streamlined forward-leaning egg
      ctx.ellipse(s * 0.05, 0, s * 0.5, s * 0.46, 0.18, 0, Math.PI * 2);
    } else {
      // Standard round baby SD
      ctx.ellipse(0, 0, s * 0.48, s * 0.5, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // 5. White Belly Patch
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    if (id === 'Shooter') {
      ctx.ellipse(s * 0.14, -s * 0.04, s * 0.28, s * 0.44, 0, 0, Math.PI * 2);
    } else if (id === 'Tank') {
      ctx.ellipse(s * 0.14, s * 0.05, s * 0.4, s * 0.42, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(s * 0.12, s * 0.04, s * 0.32, s * 0.38, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // 6. Facial Expressions (Minimal Dots & Lines!)
    if (id === 'Shooter') {
      // Zen/aiming closed line eye (^ or ⌒)
      ctx.beginPath();
      ctx.arc(s * 0.16, -s * 0.22, s * 0.1, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else if (id === 'King') {
      // Comical fierce angled eyebrow & dot eye
      ctx.beginPath();
      ctx.moveTo(s * 0.02, -s * 0.34);
      ctx.lineTo(s * 0.26, -s * 0.24);
      ctx.stroke();

      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      ctx.arc(s * 0.16, -s * 0.2, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'Speed') {
      // Determined forward gaze with speed brow
      ctx.beginPath();
      ctx.moveTo(s * 0.06, -s * 0.28);
      ctx.lineTo(s * 0.28, -s * 0.24);
      ctx.stroke();

      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      ctx.arc(s * 0.18, -s * 0.2, s * 0.085, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(s * 0.16, -s * 0.22, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Innocent round dot eye with cute shine
      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      ctx.arc(s * 0.16, -s * 0.2, s * 0.09, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(s * 0.14, -s * 0.22, s * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Beak (Exaggerated Yellow Beak)
    ctx.fillStyle = '#FFB800';
    ctx.beginPath();
    if (id === 'Tank') {
      // Wide open smiling laughing beak!
      ctx.moveTo(s * 0.32, -s * 0.22);
      ctx.lineTo(s * 0.68, -s * 0.16);
      ctx.lineTo(s * 0.34, 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Laugh crease
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(s * 0.38, -s * 0.14);
      ctx.lineTo(s * 0.52, -s * 0.12);
      ctx.stroke();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3.8;
    } else if (id === 'Speed') {
      // Pointy sharp beak
      ctx.moveTo(s * 0.32, -s * 0.22);
      ctx.lineTo(s * 0.72, -s * 0.16);
      ctx.lineTo(s * 0.32, -s * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (id === 'Shooter') {
      // Slender aiming beak
      ctx.moveTo(s * 0.3, -s * 0.22);
      ctx.lineTo(s * 0.68, -s * 0.18);
      ctx.lineTo(s * 0.3, -s * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Cute triangular baby beak
      ctx.moveTo(s * 0.3, -s * 0.22);
      ctx.lineTo(s * 0.58, -s * 0.16);
      ctx.lineTo(s * 0.3, -s * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 8. Short Stubby Flippers (Wings) - Animated for actions
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    if (state === 'attacking') {
      // Flipper raised back to throw
      ctx.ellipse(-s * 0.22, -s * 0.14, s * 0.24, s * 0.12, -0.8, 0, Math.PI * 2);
    } else if (state === 'reloading') {
      // Patting snowball in front
      ctx.ellipse(s * 0.22, s * 0.08, s * 0.2, s * 0.12, 0.4, 0, Math.PI * 2);
    } else if (id === 'Speed') {
      // Swept back airplane wings
      ctx.ellipse(-s * 0.2, -s * 0.04, s * 0.26, s * 0.11, -0.3, 0, Math.PI * 2);
    } else if (id === 'King') {
      // Hands proudly on hips
      ctx.ellipse(-s * 0.12, 0, s * 0.22, s * 0.12, Math.PI * 0.5, 0, Math.PI * 2);
    } else {
      // Waddling flapping flippers
      ctx.ellipse(-s * 0.1, 0, s * 0.22, s * 0.12, Math.PI * 0.35 + waddle, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // 9. Snowball in hand while reloading or attacking
    if (state === 'reloading' || state === 'attacking') {
      const ballR = Math.max(4, config.ballRadius * (state === 'reloading' ? reloadProgress : 1));
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (state === 'attacking') {
        // Snowball held in raised back wing
        ctx.arc(-s * 0.32, -s * 0.26, ballR, 0, Math.PI * 2);
      } else {
        // Snowball being rolled in front
        ctx.arc(s * 0.32, s * 0.12, ballR, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();
    }
  }

  // --- SNOWBALLS RENDERING ---
  private drawSnowball(ctx: CanvasRenderingContext2D, ball: Snowball, screenHeight: number) {
    // Parabolic arc height
    const arc = 4 * ball.arcHeight * ball.progress * (1 - ball.progress);
    const groundY = screenHeight * 0.5 + ball.currentY;
    const airY = groundY - arc;

    ctx.save();

    // 1. Soft ground shadow right under the snowball
    ctx.fillStyle = '#D8D1BD';
    ctx.beginPath();
    const shadowScale = Math.max(0.4, 1 - arc / 140);
    ctx.ellipse(
      ball.currentX,
      groundY + 4,
      ball.radius * shadowScale * 1.2,
      ball.radius * shadowScale * 0.45,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 2. White Snowball with bold hand-drawn black outline
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(ball.currentX, airY, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // --- PARTICLES & DAMAGE NUMBERS ---
  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    ctx.save();
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'flag') {
        // Small white surrender flag
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = 2;
        ctx.fillRect(p.x, p.y, 14, 9);
        ctx.strokeRect(p.x, p.y, 14, 9);
      } else {
        // Snow puff or impact doodle star
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.radius), 0, Math.PI * 2);
        ctx.fill();
        if (p.radius > 3) {
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  private drawDamageNumbers(ctx: CanvasRenderingContext2D, damageNumbers: DamageNumber[]) {
    ctx.save();
    ctx.font = '900 16px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';

    for (const d of damageNumbers) {
      ctx.globalAlpha = Math.max(0, d.opacity);
      ctx.fillStyle = '#1A1A1A';
      ctx.fillText(`-${d.damage}`, d.x, d.y);
    }
    ctx.restore();
  }

  private drawUnitHpBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    hp: number,
    maxHp: number,
    isPlayer: boolean
  ) {
    const w = 30;
    const h = 5;
    const ratio = Math.max(0, Math.min(1, hp / maxHp));

    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 1.8;
    ctx.fillRect(x - w / 2, y, w, h);
    ctx.strokeRect(x - w / 2, y, w, h);

    ctx.fillStyle = isPlayer ? '#00AEEF' : '#EF4444';
    ctx.fillRect(x - w / 2, y, w * ratio, h);
    ctx.restore();
  }

  // Deploy Zone preview when selecting a unit
  private drawDeployZone(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    selectedUnit: UnitConfig,
    hoverX: number | null,
    hoverY: number | null
  ) {
    const playerAreaWidth = width * 0.44;
    const minY = height * 0.25;
    const maxY = height * 0.8;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 174, 239, 0.08)';
    ctx.fillRect(100, minY, playerAreaWidth - 100, maxY - minY);

    ctx.strokeStyle = 'rgba(0, 174, 239, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(100, minY, playerAreaWidth - 100, maxY - minY);
    ctx.setLineDash([]);

    if (hoverX !== null && hoverY !== null) {
      const inBounds = hoverX >= 100 && hoverX <= playerAreaWidth && hoverY >= minY && hoverY <= maxY;
      ctx.beginPath();
      ctx.arc(hoverX, hoverY, selectedUnit.size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = inBounds ? 'rgba(0, 174, 239, 0.25)' : 'rgba(239, 68, 68, 0.25)';
      ctx.fill();
      ctx.strokeStyle = inBounds ? '#00AEEF' : '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.restore();
  }
}
