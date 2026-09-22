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

      ctx.strokeStyle = '#20262E';
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

    const walkPhase = unit.walkFrame * 2.5;
    let waddleAngle = 0;
    let bounceY = 0;
    let shiftX = 0;
    let scaleX = 1;
    let scaleY = 1;

    // Each species has its own locomotion personality.
    if (unit.state === 'moving') {
      const step = Math.sin(walkPhase);
      const lift = Math.abs(Math.sin(walkPhase));

      switch (unit.id) {
        case 'Small':
          // Short, eager waddles: the cute "tottering" motion is deliberately exaggerated.
          waddleAngle = step * 0.2;
          bounceY = -lift * 5.5;
          shiftX = step * 1.8;
          scaleX = 1 + lift * 0.025;
          scaleY = 1 - lift * 0.02;
          break;
        case 'Speed':
          // Forward-leaning run with smaller side-to-side wobble.
          waddleAngle = -0.1 + step * 0.055;
          bounceY = -Math.abs(Math.sin(walkPhase * 1.35)) * 3.3;
          shiftX = Math.sin(walkPhase * 1.35) * 1.4;
          scaleX = 1.035;
          scaleY = 0.97;
          break;
        case 'Shooter':
          // Calm long steps; keeps the upper body steady.
          waddleAngle = step * 0.055;
          bounceY = -lift * 2.2;
          shiftX = step * 0.8;
          break;
        case 'Tank':
          // Heavy stomp: subtle rotation, visible squash on contact.
          waddleAngle = step * 0.075;
          bounceY = -lift * 2;
          scaleX = 1 + (1 - lift) * 0.035;
          scaleY = 1 - (1 - lift) * 0.03;
          break;
        case 'King':
          // Slow, proud stride.
          waddleAngle = step * 0.06;
          bounceY = -lift * 2.5;
          shiftX = step * 0.5;
          break;
      }
    }

    // Spawn pop gives placement a toy-like, illustrated feel.
    if (unit.state === 'spawning') {
      const spawnProgress = Math.max(0, Math.min(1, 1 - unit.stateTimer / 0.25));
      const eased = 1 - Math.pow(1 - spawnProgress, 3);
      const pop = 0.58 + eased * 0.48;
      scaleX *= pop + Math.sin(spawnProgress * Math.PI) * 0.08;
      scaleY *= pop - Math.sin(spawnProgress * Math.PI) * 0.04;
      bounceY -= Math.sin(spawnProgress * Math.PI) * config.size * 0.26;
    }

    // Packing snow: crouch and pulse as the snowball grows in the flippers.
    if (unit.state === 'reloading') {
      const pack = Math.max(0, Math.min(1, unit.reloadProgress));
      const knead = Math.sin(pack * Math.PI * 6);
      bounceY += config.size * (0.05 + pack * 0.035) + knead * 0.7;
      waddleAngle = knead * 0.025;
      scaleX *= 1.035 + Math.abs(knead) * 0.015;
      scaleY *= 0.965;
    }

    // Throw animation has a clear anticipation -> release arc.
    if (unit.state === 'attacking') {
      const t = Math.max(0, Math.min(1, unit.attackProgress));
      if (t < 0.58) {
        const windup = t / 0.58;
        const power = unit.id === 'King' ? 1.35 : unit.id === 'Tank' ? 1.15 : 1;
        waddleAngle = -0.12 - windup * 0.23 * power;
        shiftX = -config.size * 0.06 * windup * power;
        bounceY += config.size * 0.04 * windup;
        scaleX *= 1 + 0.035 * windup;
        scaleY *= 1 - 0.04 * windup;
      } else {
        const release = (t - 0.58) / 0.42;
        const power = unit.id === 'King' ? 1.4 : unit.id === 'Tank' ? 1.18 : 1;
        waddleAngle = 0.18 * release * power;
        shiftX = config.size * 0.11 * release * power;
        bounceY -= Math.sin(release * Math.PI) * config.size * 0.08 * power;
        scaleX *= 1 - 0.03 * release;
        scaleY *= 1 + 0.025 * release;
      }
    }

    ctx.translate(unit.x + shiftX, groundY + bounceY);
    if (!unit.isFacingRight) {
      ctx.scale(-1, 1);
    }
    ctx.rotate(waddleAngle);
    ctx.scale(scaleX, scaleY);

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

    if (unit.hp < unit.maxHp && unit.hp > 0 && unit.state !== 'defeated') {
      this.drawUnitHpBar(ctx, unit.x, groundY - config.size * 1.15, unit.hp, unit.maxHp, isPlayer);
    }
  }

  // Flat hand-drawn penguin language inspired by the reference:
  // one saturated team color, white belly, yellow beak/feet, thick imperfect black contour.
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
    const bodyColor = isPlayer ? '#18B7D6' : '#EF5A59';
    const outline = '#1A1A1A';
    const white = '#FFFFFF';
    const yellow = '#FFB800';

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = outline;
    ctx.lineWidth = Math.max(2.8, s * 0.11);

    // Feet are intentionally oversized and flat, which reads better at small game scale.
    const footPhase = state === 'moving' ? Math.sin(waddle * 18) * s * 0.055 : 0;
    ctx.fillStyle = yellow;
    ctx.beginPath();
    ctx.ellipse(-s * 0.2, s * 0.42 + footPhase, s * 0.19, s * 0.1, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(s * 0.2, s * 0.42 - footPhase, s * 0.19, s * 0.1, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Unit-specific silhouette cues stay graphic rather than realistic.
    if (id === 'Speed') {
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.moveTo(-s * 0.14, -s * 0.32);
      ctx.lineTo(-s * 0.58, -s * 0.56);
      ctx.lineTo(-s * 0.25, -s * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    if (id === 'King') {
      ctx.fillStyle = '#FFD600';
      ctx.beginPath();
      ctx.moveTo(-s * 0.34, -s * 0.28);
      ctx.lineTo(-s * 0.24, -s * 0.75);
      ctx.lineTo(-s * 0.06, -s * 0.45);
      ctx.lineTo(s * 0.12, -s * 0.84);
      ctx.lineTo(s * 0.27, -s * 0.44);
      ctx.lineTo(s * 0.45, -s * 0.7);
      ctx.lineTo(s * 0.38, -s * 0.24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Back flipper: irregular bean/leaf silhouette instead of a geometric ellipse.
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    if (id === 'Tank') {
      ctx.moveTo(-s * 0.31, -s * 0.12);
      ctx.bezierCurveTo(-s * 0.58, -s * 0.08, -s * 0.59, s * 0.22, -s * 0.38, s * 0.34);
      ctx.bezierCurveTo(-s * 0.26, s * 0.28, -s * 0.24, s * 0.06, -s * 0.31, -s * 0.12);
    } else if (id === 'Speed') {
      ctx.moveTo(-s * 0.25, -s * 0.08);
      ctx.bezierCurveTo(-s * 0.55, -s * 0.13, -s * 0.61, s * 0.02, -s * 0.48, s * 0.13);
      ctx.bezierCurveTo(-s * 0.36, s * 0.16, -s * 0.28, s * 0.08, -s * 0.25, -s * 0.08);
    } else {
      ctx.moveTo(-s * 0.28, -s * 0.12);
      ctx.bezierCurveTo(-s * 0.5, -s * 0.07, -s * 0.52, s * 0.17, -s * 0.36, s * 0.29);
      ctx.bezierCurveTo(-s * 0.25, s * 0.24, -s * 0.22, s * 0.05, -s * 0.28, -s * 0.12);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Main body: intentionally asymmetric Bézier blob. This is the biggest
    // visual change from the previous polished SVG/ellipse look.
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    if (id === 'Shooter') {
      ctx.moveTo(-s * 0.08, -s * 0.61);
      ctx.bezierCurveTo(-s * 0.38, -s * 0.59, -s * 0.48, -s * 0.24, -s * 0.45, s * 0.18);
      ctx.bezierCurveTo(-s * 0.41, s * 0.48, -s * 0.14, s * 0.6, s * 0.1, s * 0.56);
      ctx.bezierCurveTo(s * 0.38, s * 0.51, s * 0.48, s * 0.22, s * 0.43, -s * 0.22);
      ctx.bezierCurveTo(s * 0.39, -s * 0.49, s * 0.18, -s * 0.62, -s * 0.08, -s * 0.61);
    } else if (id === 'Tank') {
      ctx.moveTo(-s * 0.08, -s * 0.52);
      ctx.bezierCurveTo(-s * 0.48, -s * 0.55, -s * 0.63, -s * 0.24, -s * 0.59, s * 0.18);
      ctx.bezierCurveTo(-s * 0.55, s * 0.48, -s * 0.24, s * 0.58, s * 0.1, s * 0.55);
      ctx.bezierCurveTo(s * 0.48, s * 0.51, s * 0.61, s * 0.25, s * 0.56, -s * 0.16);
      ctx.bezierCurveTo(s * 0.52, -s * 0.43, s * 0.26, -s * 0.51, -s * 0.08, -s * 0.52);
    } else if (id === 'Speed') {
      ctx.moveTo(-s * 0.02, -s * 0.48);
      ctx.bezierCurveTo(-s * 0.31, -s * 0.5, -s * 0.5, -s * 0.22, -s * 0.48, s * 0.17);
      ctx.bezierCurveTo(-s * 0.45, s * 0.42, -s * 0.19, s * 0.5, s * 0.08, s * 0.47);
      ctx.bezierCurveTo(s * 0.42, s * 0.43, s * 0.58, s * 0.12, s * 0.49, -s * 0.25);
      ctx.bezierCurveTo(s * 0.43, -s * 0.46, s * 0.22, -s * 0.5, -s * 0.02, -s * 0.48);
    } else {
      const wide = id === 'King' ? 0.54 : 0.5;
      ctx.moveTo(-s * 0.08, -s * 0.5);
      ctx.bezierCurveTo(-s * 0.4, -s * 0.52, -s * wide, -s * 0.22, -s * wide, s * 0.15);
      ctx.bezierCurveTo(-s * 0.49, s * 0.43, -s * 0.2, s * 0.54, s * 0.09, s * 0.51);
      ctx.bezierCurveTo(s * 0.42, s * 0.48, s * 0.55, s * 0.21, s * 0.51, -s * 0.17);
      ctx.bezierCurveTo(s * 0.48, -s * 0.42, s * 0.2, -s * 0.5, -s * 0.08, -s * 0.5);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Large white belly patch, also slightly off-center/asymmetric.
    ctx.fillStyle = white;
    ctx.beginPath();
    if (id === 'Shooter') {
      ctx.moveTo(s * 0.01, -s * 0.31);
      ctx.bezierCurveTo(-s * 0.22, -s * 0.25, -s * 0.24, s * 0.2, -s * 0.12, s * 0.38);
      ctx.bezierCurveTo(s * 0.03, s * 0.52, s * 0.31, s * 0.44, s * 0.34, s * 0.12);
      ctx.bezierCurveTo(s * 0.36, -s * 0.16, s * 0.22, -s * 0.33, s * 0.01, -s * 0.31);
    } else if (id === 'Tank') {
      ctx.moveTo(-s * 0.08, -s * 0.27);
      ctx.bezierCurveTo(-s * 0.34, -s * 0.18, -s * 0.37, s * 0.19, -s * 0.22, s * 0.36);
      ctx.bezierCurveTo(-s * 0.03, s * 0.5, s * 0.35, s * 0.43, s * 0.38, s * 0.12);
      ctx.bezierCurveTo(s * 0.4, -s * 0.15, s * 0.18, -s * 0.31, -s * 0.08, -s * 0.27);
    } else {
      ctx.moveTo(-s * 0.06, -s * 0.28);
      ctx.bezierCurveTo(-s * 0.29, -s * 0.2, -s * 0.31, s * 0.18, -s * 0.18, s * 0.35);
      ctx.bezierCurveTo(-s * 0.01, s * 0.48, s * 0.29, s * 0.39, s * 0.31, s * 0.12);
      ctx.bezierCurveTo(s * 0.32, -s * 0.14, s * 0.17, -s * 0.31, -s * 0.06, -s * 0.28);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Primitive face: dots and short marker lines.
    ctx.strokeStyle = outline;
    ctx.fillStyle = outline;
    ctx.lineWidth = Math.max(2.5, s * 0.09);

    if (id === 'Shooter') {
      ctx.beginPath();
      ctx.arc(s * 0.1, -s * 0.24, s * 0.09, 0.22, Math.PI - 0.22);
      ctx.stroke();
    } else {
      if (id === 'Speed') {
        ctx.beginPath();
        ctx.moveTo(s * 0.03, -s * 0.31);
        ctx.lineTo(s * 0.24, -s * 0.26);
        ctx.stroke();
      }

      if (id === 'King') {
        ctx.beginPath();
        ctx.moveTo(-s * 0.02, -s * 0.32);
        ctx.lineTo(s * 0.17, -s * 0.24);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(s * 0.14, -s * 0.19, s * 0.075, 0, Math.PI * 2);
      ctx.fill();
    }

    // Beak.
    ctx.fillStyle = yellow;
    ctx.strokeStyle = outline;
    ctx.lineWidth = Math.max(2.3, s * 0.075);
    ctx.beginPath();
    if (id === 'Tank') {
      ctx.moveTo(s * 0.27, -s * 0.2);
      ctx.lineTo(s * 0.65, -s * 0.14);
      ctx.lineTo(s * 0.3, s * 0.02);
    } else if (id === 'Speed') {
      ctx.moveTo(s * 0.25, -s * 0.2);
      ctx.lineTo(s * 0.72, -s * 0.14);
      ctx.lineTo(s * 0.27, -s * 0.05);
    } else if (id === 'Shooter') {
      ctx.moveTo(s * 0.24, -s * 0.21);
      ctx.lineTo(s * 0.68, -s * 0.17);
      ctx.lineTo(s * 0.25, -s * 0.08);
    } else {
      ctx.moveTo(s * 0.25, -s * 0.2);
      ctx.lineTo(s * 0.55, -s * 0.14);
      ctx.lineTo(s * 0.26, -s * 0.06);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Action flipper retains the motion improvements, but uses the same one-color doodle body.
    const attackT = state === 'attacking' ? Math.max(0, Math.min(1, attackProgress)) : 0;
    const packPulse = state === 'reloading' ? Math.sin(reloadProgress * Math.PI * 6) : 0;

    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = outline;
    ctx.lineWidth = Math.max(2.7, s * 0.1);
    ctx.beginPath();
    if (state === 'attacking') {
      if (attackT < 0.58) {
        const windup = attackT / 0.58;
        ctx.ellipse(
          -s * (0.23 + windup * 0.1),
          -s * (0.08 + windup * 0.24),
          s * 0.25,
          s * 0.11,
          -0.58 - windup * 0.5,
          0,
          Math.PI * 2
        );
      } else {
        const release = (attackT - 0.58) / 0.42;
        ctx.ellipse(
          -s * 0.04 + s * 0.36 * release,
          -s * 0.33 + s * 0.27 * release,
          s * 0.26,
          s * 0.105,
          -1.04 + release * 1.36,
          0,
          Math.PI * 2
        );
      }
    } else if (state === 'reloading') {
      ctx.ellipse(
        s * 0.22,
        s * (0.17 + packPulse * 0.012),
        s * 0.21,
        s * 0.105,
        0.46 - packPulse * 0.11,
        0,
        Math.PI * 2
      );
    } else if (id === 'Speed') {
      ctx.ellipse(s * 0.34, s * 0.02, s * 0.27, s * 0.1, -0.18, 0, Math.PI * 2);
    } else if (id === 'King') {
      ctx.ellipse(s * 0.35, s * 0.04, s * 0.2, s * 0.11, 0.72, 0, Math.PI * 2);
    } else {
      ctx.ellipse(s * 0.34, s * 0.03, s * 0.2, s * 0.11, 0.24 + waddle * 0.35, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // Flat white snowball; no glossy radial gradient.
    if (state === 'reloading' || state === 'attacking') {
      let ballR = Math.max(4, config.ballRadius);
      let bx = s * 0.34;
      let by = s * 0.17;

      if (state === 'reloading') {
        ballR *= Math.max(0.42, reloadProgress);
        bx += packPulse * s * 0.018;
        by += Math.abs(packPulse) * s * 0.012;
      } else if (attackT < 0.58) {
        const windup = attackT / 0.58;
        bx = -s * (0.31 + windup * 0.08);
        by = -s * (0.25 + windup * 0.16);
      } else {
        const release = (attackT - 0.58) / 0.42;
        const releasePower = id === 'King' ? 1.18 : id === 'Tank' ? 1.08 : 1;
        bx = -s * 0.39 + s * 0.77 * release * releasePower;
        by = -s * 0.41 - Math.sin(release * Math.PI) * s * 0.14;
      }

      if (id === 'King' && state === 'attacking') ballR *= 1.08;

      ctx.fillStyle = white;
      ctx.strokeStyle = outline;
      ctx.lineWidth = Math.max(2.2, s * 0.07);
      ctx.beginPath();
      ctx.arc(bx, by, ballR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (state === 'reloading') {
        ctx.fillStyle = white;
        ctx.strokeStyle = '#A9DCE8';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 3; i++) {
          const crumbPhase = reloadProgress * Math.PI * 5 + i * 2.1;
          const cx = bx + Math.cos(crumbPhase) * (ballR + 4 + i);
          const cy = by + Math.sin(crumbPhase) * (ballR * 0.7 + 3);
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(1.2, s * 0.032), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    // A second faint contour creates a marker wobble instead of a clean SVG/vector finish.
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1, s * 0.035);
    ctx.beginPath();
    if (id === 'Tank') {
      ctx.arc(-s * 0.04, 0, s * 0.52, 2.55, 4.12);
      ctx.arc(s * 0.03, s * 0.02, s * 0.51, -0.6, 0.8);
    } else {
      ctx.arc(-s * 0.02, 0, s * 0.45, 2.5, 4.05);
      ctx.arc(s * 0.04, s * 0.01, s * 0.44, -0.58, 0.76);
    }
    ctx.stroke();
    ctx.restore();
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
