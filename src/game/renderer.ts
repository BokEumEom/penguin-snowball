import { BattleUnit, DamageNumber, Particle, Snowball, Team, UnitConfig } from '../types';
import { UNIT_CONFIGS, UNIT_VISUALS } from './unitData';

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

    // The canvas backing store is DPR-scaled. Render in CSS pixels so the
    // engine, pointer coordinates and visuals share one coordinate system.
    const width = canvas.clientWidth || canvas.width;
    const height = canvas.clientHeight || canvas.height;

    // 1. Warm cream paper background (#FAF6E9)
    ctx.fillStyle = '#FAF6E9';
    ctx.fillRect(0, 0, width, height);

    // 2. Playful Hand-Drawn Background Doodles (Drifting Clouds & Gentle Snow Horizon)
    this.drawBackgroundDoodles(ctx, width, height);

    // 3. Igloo Bases (Left: Player Base, Right: Enemy Base)
    const sceneScale = Math.max(0.55, Math.min(1, Math.min(width / 900, height / 420)));
    const baseInset = Math.max(60, Math.min(135, width * 0.18));
    const playerIglooX = baseInset;
    const playerIglooY = height * 0.65;
    const enemyIglooX = width - baseInset;
    const enemyIglooY = height * 0.35;

    const playerDead = playerCastleHp <= 0;
    const enemyDead = enemyCastleHp <= 0;

    // Left Player Igloo
    this.drawIgloo(ctx, 'player', playerIglooX, playerIglooY, playerDead, sceneScale);
    // Right Enemy Igloo
    this.drawIgloo(ctx, 'enemy', enemyIglooX, enemyIglooY, enemyDead, sceneScale);

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
    isDestroyed: boolean,
    scale: number = 1
  ) {
    const isPlayer = team === 'player';
    const flagColor = isPlayer ? '#00AEEF' : '#EF4444';
    const iglooRadius = 68;

    ctx.save();
    ctx.translate(x, baseY);
    ctx.scale(scale, scale);
    x = 0;
    baseY = 0;

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

  // Render a colored, species-based SD penguin.
  // Team identity is carried by the scarf/accents instead of tinting the whole body.
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
    const visual = UNIT_VISUALS[id];
    const s = config.size;
    const teamColor = isPlayer ? '#45BDE3' : '#E95B57';
    const teamShadow = isPlayer ? '#238CB5' : '#B93638';
    const outline = visual.outline;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = outline;
    ctx.lineWidth = Math.max(2.4, s * 0.095);

    // Feet: warm orange, exaggerated enough to keep the waddling silhouette readable.
    const footPhase = state === 'moving' ? Math.sin(waddle * 18) * s * 0.06 : 0;
    ctx.fillStyle = visual.feet;
    ctx.beginPath();
    ctx.ellipse(-s * 0.2, s * 0.43 + footPhase, s * 0.19, s * 0.105, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(s * 0.2, s * 0.43 - footPhase, s * 0.19, s * 0.105, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Species silhouette details behind the body.
    if (id === 'Speed') {
      ctx.fillStyle = visual.bodyTop;
      ctx.beginPath();
      ctx.moveTo(-s * 0.12, -s * 0.32);
      ctx.lineTo(-s * 0.62, -s * 0.56);
      ctx.lineTo(-s * 0.25, -s * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    if (id === 'King') {
      ctx.fillStyle = visual.speciesAccent;
      ctx.beginPath();
      ctx.moveTo(-s * 0.34, -s * 0.3);
      ctx.lineTo(-s * 0.24, -s * 0.78);
      ctx.lineTo(-s * 0.06, -s * 0.48);
      ctx.lineTo(s * 0.12, -s * 0.86);
      ctx.lineTo(s * 0.26, -s * 0.46);
      ctx.lineTo(s * 0.46, -s * 0.72);
      ctx.lineTo(s * 0.38, -s * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Rear flipper.
    ctx.fillStyle = visual.bodyBottom;
    ctx.beginPath();
    if (id === 'Tank') {
      ctx.ellipse(-s * 0.42, s * 0.02, s * 0.2, s * 0.32, -0.22, 0, Math.PI * 2);
    } else if (id === 'Speed') {
      ctx.ellipse(-s * 0.36, 0, s * 0.27, s * 0.12, -0.28, 0, Math.PI * 2);
    } else {
      ctx.ellipse(-s * 0.34, s * 0.02, s * 0.2, s * 0.28, -0.18, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // Main body with a soft two-tone cel-painted gradient.
    const bodyGradient = ctx.createLinearGradient(-s * 0.35, -s * 0.55, s * 0.36, s * 0.52);
    bodyGradient.addColorStop(0, visual.bodyTop);
    bodyGradient.addColorStop(1, visual.bodyBottom);
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    if (id === 'Shooter') {
      ctx.ellipse(0, -s * 0.06, s * visual.bodyWidth, s * visual.bodyHeight, 0, 0, Math.PI * 2);
    } else if (id === 'Speed') {
      ctx.ellipse(s * 0.035, -s * 0.01, s * visual.bodyWidth, s * visual.bodyHeight, 0.13, 0, Math.PI * 2);
    } else {
      ctx.ellipse(0, 0, s * visual.bodyWidth, s * visual.bodyHeight, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // Painted body highlight (not an outline-only look).
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.15, -s * 0.18, s * 0.18, s * 0.29, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Belly.
    ctx.fillStyle = visual.belly;
    ctx.beginPath();
    if (id === 'Shooter') {
      ctx.ellipse(s * 0.06, s * 0.04, s * 0.29, s * 0.43, 0, 0, Math.PI * 2);
    } else if (id === 'Tank') {
      ctx.ellipse(0, s * 0.08, s * 0.41, s * 0.39, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(s * 0.02, s * 0.08, s * 0.33, s * 0.37, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // White/cream face patch, split at the forehead like a real penguin mask.
    ctx.fillStyle = visual.face;
    ctx.beginPath();
    if (id === 'Speed') {
      ctx.ellipse(s * 0.08, -s * 0.24, s * 0.31, s * 0.24, 0.08, 0, Math.PI * 2);
    } else if (id === 'Shooter') {
      ctx.ellipse(s * 0.03, -s * 0.29, s * 0.28, s * 0.22, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(0, -s * 0.25, s * 0.31, s * 0.23, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // Emperor/King golden ear markings.
    if (id === 'Tank' || id === 'King') {
      ctx.fillStyle = visual.speciesAccent;
      ctx.beginPath();
      ctx.ellipse(-s * 0.28, -s * 0.27, s * 0.1, s * 0.18, -0.4, 0, Math.PI * 2);
      ctx.ellipse(s * 0.28, -s * 0.27, s * 0.1, s * 0.18, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Chinstrap penguin marking.
    if (id === 'Shooter') {
      ctx.strokeStyle = visual.speciesAccent;
      ctx.lineWidth = Math.max(2, s * 0.08);
      ctx.beginPath();
      ctx.arc(0, -s * 0.18, s * 0.27, 0.18, Math.PI - 0.18);
      ctx.stroke();
      ctx.strokeStyle = outline;
      ctx.lineWidth = Math.max(2.4, s * 0.095);
    }

    // Eyes and brows.
    if (id === 'Shooter') {
      ctx.beginPath();
      ctx.arc(-s * 0.09, -s * 0.3, s * 0.08, 0.25, Math.PI - 0.25);
      ctx.arc(s * 0.11, -s * 0.3, s * 0.08, 0.25, Math.PI - 0.25);
      ctx.stroke();
    } else {
      if (id === 'Speed') {
        ctx.beginPath();
        ctx.moveTo(-s * 0.17, -s * 0.37);
        ctx.lineTo(-s * 0.02, -s * 0.32);
        ctx.stroke();
      }
      if (id === 'King') {
        ctx.beginPath();
        ctx.moveTo(-s * 0.22, -s * 0.35);
        ctx.lineTo(-s * 0.05, -s * 0.29);
        ctx.moveTo(s * 0.22, -s * 0.35);
        ctx.lineTo(s * 0.05, -s * 0.29);
        ctx.stroke();
      }

      ctx.fillStyle = outline;
      ctx.beginPath();
      ctx.ellipse(-s * 0.1, -s * 0.27, s * 0.065, s * 0.078, 0, 0, Math.PI * 2);
      ctx.ellipse(s * 0.1, -s * 0.27, s * 0.065, s * 0.078, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-s * 0.12, -s * 0.3, s * 0.021, 0, Math.PI * 2);
      ctx.arc(s * 0.08, -s * 0.3, s * 0.021, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warm blush adds the soft illustrated look seen in the reference.
    ctx.fillStyle = visual.cheek;
    ctx.globalAlpha = 0.42;
    ctx.beginPath();
    ctx.ellipse(-s * 0.24, -s * 0.13, s * 0.09, s * 0.045, 0, 0, Math.PI * 2);
    ctx.ellipse(s * 0.24, -s * 0.13, s * 0.09, s * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Beak.
    ctx.fillStyle = visual.beak;
    ctx.strokeStyle = outline;
    ctx.lineWidth = Math.max(2, s * 0.07);
    ctx.beginPath();
    if (id === 'Speed' || id === 'Shooter') {
      ctx.moveTo(s * 0.01, -s * 0.21);
      ctx.lineTo(s * 0.48, -s * 0.14);
      ctx.lineTo(s * 0.02, -s * 0.04);
    } else if (id === 'Tank') {
      ctx.moveTo(-s * 0.18, -s * 0.17);
      ctx.quadraticCurveTo(0, -s * 0.23, s * 0.18, -s * 0.17);
      ctx.lineTo(0, s * 0.02);
    } else {
      ctx.moveTo(-s * 0.14, -s * 0.18);
      ctx.quadraticCurveTo(0, -s * 0.23, s * 0.14, -s * 0.18);
      ctx.lineTo(0, -s * 0.03);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Team scarf: clear blue/red faction cue while species colors stay natural.
    ctx.fillStyle = teamColor;
    ctx.strokeStyle = outline;
    ctx.lineWidth = Math.max(2, s * 0.065);
    ctx.beginPath();
    ctx.moveTo(-s * 0.31, -s * 0.02);
    ctx.quadraticCurveTo(0, s * 0.08, s * 0.31, -s * 0.02);
    ctx.lineTo(s * 0.27, s * 0.12);
    ctx.quadraticCurveTo(0, s * 0.2, -s * 0.27, s * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = teamShadow;
    ctx.beginPath();
    ctx.moveTo(s * 0.23, s * 0.08);
    ctx.quadraticCurveTo(s * 0.49, s * 0.12, s * 0.54, s * 0.35);
    ctx.lineTo(s * 0.32, s * 0.26);
    ctx.quadraticCurveTo(s * 0.31, s * 0.15, s * 0.2, s * 0.13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Front/action flipper.
    const throwLift = state === 'attacking' ? Math.min(1, Math.max(0.25, attackProgress)) : 0;
    ctx.fillStyle = visual.bodyBottom;
    ctx.strokeStyle = outline;
    ctx.lineWidth = Math.max(2.4, s * 0.09);
    ctx.beginPath();
    if (state === 'attacking') {
      ctx.ellipse(-s * 0.28, -s * (0.12 + 0.14 * throwLift), s * 0.25, s * 0.115, -0.85, 0, Math.PI * 2);
    } else if (state === 'reloading') {
      ctx.ellipse(s * 0.22, s * 0.18, s * 0.21, s * 0.11, 0.48, 0, Math.PI * 2);
    } else if (id === 'Speed') {
      ctx.ellipse(s * 0.34, s * 0.02, s * 0.28, s * 0.1, -0.18, 0, Math.PI * 2);
    } else if (id === 'King') {
      ctx.ellipse(s * 0.36, s * 0.04, s * 0.2, s * 0.11, 0.72, 0, Math.PI * 2);
    } else {
      ctx.ellipse(s * 0.35, s * 0.03, s * 0.2, s * 0.12, 0.24 + waddle * 0.35, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // Snowball while packing / throwing, with a pale-blue underside for volume.
    if (state === 'reloading' || state === 'attacking') {
      const ballR = Math.max(4, config.ballRadius * (state === 'reloading' ? Math.max(0.45, reloadProgress) : 1));
      const bx = state === 'attacking' ? -s * 0.35 : s * 0.34;
      const by = state === 'attacking' ? -s * 0.34 : s * 0.17;
      const snowGradient = ctx.createRadialGradient(bx - ballR * 0.3, by - ballR * 0.35, 1, bx, by, ballR);
      snowGradient.addColorStop(0, '#FFFFFF');
      snowGradient.addColorStop(0.72, '#F8FDFF');
      snowGradient.addColorStop(1, '#CFEAF4');
      ctx.fillStyle = snowGradient;
      ctx.strokeStyle = outline;
      ctx.lineWidth = Math.max(2, s * 0.065);
      ctx.beginPath();
      ctx.arc(bx, by, ballR, 0, Math.PI * 2);
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
    const playerAreaMinX = Math.max(56, Math.min(100, width * 0.18));
    const playerAreaWidth = width * 0.46;
    const minY = height * 0.25;
    const maxY = height * 0.8;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 174, 239, 0.08)';
    ctx.fillRect(playerAreaMinX, minY, playerAreaWidth - playerAreaMinX, maxY - minY);

    ctx.strokeStyle = 'rgba(0, 174, 239, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(playerAreaMinX, minY, playerAreaWidth - playerAreaMinX, maxY - minY);
    ctx.setLineDash([]);

    if (hoverX !== null && hoverY !== null) {
      const inBounds =
        hoverX >= playerAreaMinX &&
        hoverX <= playerAreaWidth &&
        hoverY >= minY &&
        hoverY <= maxY;
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
