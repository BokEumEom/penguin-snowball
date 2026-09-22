import { soundManager } from '../audio/soundManager';
import {
  BattleUnit,
  DamageNumber,
  Difficulty,
  MatchResult,
  MatchSettings,
  MatchStats,
  Particle,
  Snowball,
  Team,
  UnitConfig,
  UnitId,
} from '../types';
import { UNIT_CONFIGS, UNIT_ORDER } from './unitData';

export interface GameStateListener {
  onCostChange?: (cost: number, maxCost: number) => void;
  onCheerChange?: (gauge: number, maxGauge: number, isActive: boolean) => void;
  onCastleHpChange?: (playerHp: number, enemyHp: number, maxHp: number) => void;
  onTimeChange?: (remainingSeconds: number) => void;
  onMatchFinish?: (result: MatchResult, stats: MatchStats) => void;
  onUnitCountChange?: (playerCount: number, enemyCount: number) => void;
}

export class GameEngine {
  public settings: MatchSettings;
  public listener: GameStateListener = {};

  // Castles (Exact match to screenshot: initial HP ~30)
  public maxCastleHp = 30;
  public playerCastleHp = 30;
  public enemyCastleHp = 30;

  // Cost / Snowballs (Max 10, segments 1..10)
  public maxCost = 10;
  public currentCost = 4;
  public costAccumulator = 0;
  public baseCostPerSecond = 0.85; // 1 snowball per 1.18s

  // CPU AI State
  public cpuCost = 3;
  public cpuCostAccumulator = 0;
  public cpuSpawnTimer = 2.0;

  // Cheer / Ouen Fever (8 vertical blocks in screenshot)
  public cheerGauge = 0;
  public maxCheerGauge = 8;
  public cheerActive = false;
  public cheerTimer = 0;

  // Match Time
  public timeLimit: number;
  public remainingSeconds: number;
  public isTimeUp = false;

  // Entities
  public units: BattleUnit[] = [];
  public snowballs: Snowball[] = [];
  public particles: Particle[] = [];
  public damageNumbers: DamageNumber[] = [];

  // Match Stats
  public stats: MatchStats = {
    unitsSpawnedPlayer: 0,
    unitsSpawnedEnemy: 0,
    snowballsThrownPlayer: 0,
    damageDealtPlayer: 0,
    damageDealtEnemy: 0,
    elapsedSeconds: 0,
  };

  public isRunning = false;
  public isPaused = false;
  public isFinished = false;
  public winnerTeam: Team | null = null;
  public resultType: MatchResult | null = null;

  // Dimensions
  public fieldWidth = 1000;
  public fieldHeight = 500;

  private lastTime = 0;
  private animFrameId: number | null = null;

  constructor(settings: MatchSettings) {
    this.settings = settings;
    this.timeLimit = settings.timeLimit;
    this.remainingSeconds = settings.timeLimit;
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.isFinished = false;
    this.lastTime = performance.now();
    soundManager.playSe('battle_start');
    soundManager.playBgm('battle');

    this.notifyState();
    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    soundManager.stopBgm();
  }

  public setDimensions(width: number, height: number) {
    this.fieldWidth = width;
    this.fieldHeight = height;
  }

  // --- PLAYER ACTIONS ---

  public canPlayerAfford(unitId: UnitId): boolean {
    const config = UNIT_CONFIGS[unitId];
    return this.currentCost >= config.cost && !this.isFinished;
  }

  public trySpawnPlayerUnit(unitId: UnitId, spawnX?: number, spawnY?: number): boolean {
    if (this.isFinished) return false;
    const config = UNIT_CONFIGS[unitId];

    if (this.currentCost < config.cost) {
      soundManager.playSe('disabled');
      return false;
    }

    const playerAreaMaxX = this.fieldWidth * 0.46;
    let x = spawnX ?? 135;
    let y = spawnY ? (spawnY - this.fieldHeight * 0.5) : (Math.random() * 60 - 30);

    // Clamp Y lane
    y = Math.max(-45, Math.min(45, y));

    // Check bounds if custom X provided
    if (spawnX !== undefined && (spawnX < 90 || spawnX > playerAreaMaxX)) {
      soundManager.playSe('disabled');
      return false;
    }

    this.currentCost -= config.cost;
    this.stats.unitsSpawnedPlayer++;

    const newUnit: BattleUnit = {
      uid: `player_${Date.now()}_${Math.random()}`,
      id: unitId,
      team: 'player',
      x,
      y,
      hp: config.maxHp,
      maxHp: config.maxHp,
      state: 'spawning',
      stateTimer: 0.25, // Quick spawn pop
      isFacingRight: true,
      walkFrame: 0,
      walkTimer: 0,
      reloadProgress: 0.6,
      attackProgress: 0,
      targetUid: null,
      targetCastle: false,
      defeatedKnockback: null,
    };

    this.units.push(newUnit);
    this.addSpawnParticles(x, y);
    soundManager.playSe('unit_place');

    // Add slight cheer gauge
    this.addCheer(config.cost * 3);
    this.notifyState();
    return true;
  }

  public tapCheerButton() {
    if (this.isFinished || this.isPaused) return;
    soundManager.playSe('cheer');
    if (!this.cheerActive) {
      this.cheerGauge = Math.min(this.maxCheerGauge, this.cheerGauge + 1);
      if (this.cheerGauge >= this.maxCheerGauge) {
        this.triggerCheerFever();
      } else {
        this.notifyState();
      }
    }
  }

  public triggerCheerFever() {
    if (this.cheerGauge >= this.maxCheerGauge && !this.cheerActive && !this.isFinished) {
      this.cheerActive = true;
      this.cheerTimer = 8.0; // 8 seconds fever
      this.cheerGauge = 0;
      soundManager.playSe('cheer');

      // Sparkle burst across field
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          x: Math.random() * this.fieldWidth,
          y: this.fieldHeight * 0.5 + Math.random() * 100,
          vx: (Math.random() * 2 - 1) * 60,
          vy: -Math.random() * 80 - 40,
          radius: Math.random() * 4 + 2,
          color: ['#fef08a', '#38bdf8', '#ffffff', '#fbbf24'][Math.floor(Math.random() * 4)],
          alpha: 1,
          decay: 0.8,
        });
      }
      this.notifyState();
    }
  }

  // --- MAIN SIMULATION LOOP ---

  private loop(time: number) {
    if (!this.isRunning) return;

    const dt = Math.min(0.1, (time - this.lastTime) / 1000);
    this.lastTime = time;

    if (!this.isPaused && !this.isFinished) {
      this.update(dt);
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public update(dt: number) {
    this.stats.elapsedSeconds += dt;

    // 1. Update Match Timer
    if (this.timeLimit > 0) {
      this.remainingSeconds -= dt;
      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = 0;
        this.handleTimeUp();
        return;
      }
    }

    // 2. Update Cheer / Fever Mode
    if (this.cheerActive) {
      this.cheerTimer -= dt;
      if (this.cheerTimer <= 0) {
        this.cheerActive = false;
        this.cheerTimer = 0;
      }
    }

    // 3. Update Player Snowball Cost Regeneration
    const costMultiplier = this.cheerActive ? 2.2 : 1.0;
    this.costAccumulator += this.baseCostPerSecond * costMultiplier * dt;
    if (this.costAccumulator >= 1 && this.currentCost < this.maxCost) {
      const add = Math.floor(this.costAccumulator);
      this.currentCost = Math.min(this.maxCost, this.currentCost + add);
      this.costAccumulator -= add;
      this.listener.onCostChange?.(this.currentCost, this.maxCost);
    }

    // 4. Update CPU AI Behavior
    this.updateCpuAi(dt);

    // 5. Update Units
    this.updateUnits(dt);

    // 6. Update Snowball Projectiles
    this.updateSnowballs(dt);

    // 7. Update Particles & Floating Text
    this.updateParticles(dt);
    this.updateDamageNumbers(dt);

    this.notifyState();
  }

  // --- CPU AI CONTROLLER ---

  private updateCpuAi(dt: number) {
    const diff = this.settings.difficulty;
    let cpuRate = 0.7; // easy
    let spawnInterval = 3.8;

    if (diff === 'normal') {
      cpuRate = 0.95;
      spawnInterval = 2.8;
    } else if (diff === 'hard') {
      cpuRate = 1.25;
      spawnInterval = 2.0;
    }

    this.cpuCostAccumulator += cpuRate * dt;
    if (this.cpuCostAccumulator >= 1 && this.cpuCost < this.maxCost) {
      this.cpuCost = Math.min(this.maxCost, this.cpuCost + 1);
      this.cpuCostAccumulator -= 1;
    }

    this.cpuSpawnTimer -= dt;
    if (this.cpuSpawnTimer <= 0) {
      this.tryCpuSpawn(diff);
      this.cpuSpawnTimer = spawnInterval * (0.8 + Math.random() * 0.4);
    }
  }

  private tryCpuSpawn(diff: Difficulty) {
    // Select unit based on difficulty & current cost
    const candidates: UnitId[] = [];

    if (this.cpuCost >= 10 && (diff === 'hard' || (diff === 'normal' && Math.random() < 0.35))) {
      candidates.push('King');
    }
    if (this.cpuCost >= 7) candidates.push('Tank');
    if (this.cpuCost >= 5) candidates.push('Shooter');
    if (this.cpuCost >= 3) candidates.push('Speed');
    if (this.cpuCost >= 1) candidates.push('Small');

    if (candidates.length === 0) return;

    // Pick tactically
    const chosenId = candidates[Math.floor(Math.random() * candidates.length)];
    const config = UNIT_CONFIGS[chosenId];

    if (this.cpuCost >= config.cost) {
      this.cpuCost -= config.cost;
      this.stats.unitsSpawnedEnemy++;

      const spawnX = this.fieldWidth - 135;
      const spawnY = Math.random() * 50 - 25;

      const newUnit: BattleUnit = {
        uid: `enemy_${Date.now()}_${Math.random()}`,
        id: chosenId,
        team: 'enemy',
        x: spawnX,
        y: spawnY,
        hp: config.maxHp,
        maxHp: config.maxHp,
        state: 'spawning',
        stateTimer: 0.25,
        isFacingRight: false,
        walkFrame: 0,
        walkTimer: 0,
        reloadProgress: 0.6,
        attackProgress: 0,
        targetUid: null,
        targetCastle: false,
        defeatedKnockback: null,
      };

      this.units.push(newUnit);
      this.addSpawnParticles(spawnX, spawnY);
    }
  }

  // --- UNIT LOGIC ---

  private updateUnits(dt: number) {
    const playerUnits = this.units.filter((u) => u.team === 'player' && u.state !== 'defeated');
    const enemyUnits = this.units.filter((u) => u.team === 'enemy' && u.state !== 'defeated');

    const enemyCastleX = this.fieldWidth - 135;
    const playerCastleX = 135;

    for (const unit of this.units) {
      if (unit.state === 'defeated') {
        if (unit.defeatedKnockback) {
          unit.x += unit.defeatedKnockback.vx * dt;
          unit.defeatedKnockback.vy += 380 * dt; // gravity
          unit.defeatedKnockback.rotation += unit.defeatedKnockback.vRot * dt;
          unit.defeatedKnockback.opacity -= dt * 0.9;
        }
        continue;
      }

      const config = UNIT_CONFIGS[unit.id];
      const isPlayer = unit.team === 'player';

      // 1. Spawning state
      if (unit.state === 'spawning') {
        unit.stateTimer -= dt;
        if (unit.stateTimer <= 0) {
          unit.state = 'moving';
        }
        continue;
      }

      // 2. Search for Targets (Targeting System)
      const opposingUnits = isPlayer ? enemyUnits : playerUnits;
      const targetCastleX = isPlayer ? enemyCastleX : playerCastleX;

      let nearestTarget: BattleUnit | null = null;
      let minDistance = 999999;

      for (const op of opposingUnits) {
        const dx = isPlayer ? op.x - unit.x : unit.x - op.x;
        const dy = Math.abs(op.y - unit.y);
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Can only target in front
        if (dx >= -15 && dist < minDistance) {
          minDistance = dist;
          nearestTarget = op;
        }
      }

      const distToCastle = isPlayer ? targetCastleX - unit.x : unit.x - targetCastleX;

      // Check if enemy unit is in attack range
      if (nearestTarget && minDistance <= config.attackRange) {
        unit.targetUid = nearestTarget.uid;
        unit.targetCastle = false;
        this.processUnitCombat(unit, config, dt, nearestTarget.x, nearestTarget.y);
      } else if (distToCastle <= config.attackRange && distToCastle >= 0) {
        // Attack Castle!
        unit.targetUid = null;
        unit.targetCastle = true;
        this.processUnitCombat(unit, config, dt, targetCastleX, 0);
      } else {
        // No target in range -> Move forward
        unit.targetUid = null;
        unit.targetCastle = false;
        unit.state = 'moving';

        const moveDir = isPlayer ? 1 : -1;
        unit.x += moveDir * config.moveSpeed * dt;
        unit.isFacingRight = isPlayer;

        // Animate walk waddle
        unit.walkTimer += dt * (config.moveSpeed / 40);
        unit.walkFrame = unit.walkTimer;

        // Stop before overlapping castle gate
        if (isPlayer && unit.x > enemyCastleX - 45) {
          unit.x = enemyCastleX - 45;
        } else if (!isPlayer && unit.x < playerCastleX + 45) {
          unit.x = playerCastleX + 45;
        }
      }
    }

    // Clean up completely faded defeated units
    this.units = this.units.filter(
      (u) => u.state !== 'defeated' || (u.defeatedKnockback && u.defeatedKnockback.opacity > 0)
    );
  }

  private processUnitCombat(unit: BattleUnit, config: UnitConfig, dt: number, targetX: number, targetY: number) {
    if (unit.state === 'reloading') {
      unit.reloadProgress += dt / config.reloadSeconds;
      if (unit.reloadProgress >= 1) {
        unit.reloadProgress = 1;
        unit.state = 'attacking';
        unit.attackProgress = 0;
      }
    } else if (unit.state === 'attacking') {
      unit.attackProgress += dt * 3.2; // windup speed
      if (unit.attackProgress >= 1) {
        // THROW SNOWBALL!
        this.throwSnowball(unit, config, targetX, targetY);
        unit.state = 'reloading';
        unit.reloadProgress = 0;
        unit.attackProgress = 0;
      }
    } else {
      // Start reloading snowball
      unit.state = 'reloading';
      unit.reloadProgress = 0.3; // patting snow together
    }
  }

  // --- SNOWBALL PROJECTILE THROWING ---

  private throwSnowball(unit: BattleUnit, config: UnitConfig, targetX: number, targetY: number) {
    if (unit.team === 'player') {
      this.stats.snowballsThrownPlayer++;
    }

    // Offset slightly so it looks thrown from hands
    const handX = unit.x + (unit.isFacingRight ? config.size * 0.35 : -config.size * 0.35);
    const handY = unit.y - config.size * 0.3;

    const ball: Snowball = {
      id: `ball_${Date.now()}_${Math.random()}`,
      team: unit.team,
      startX: handX,
      startY: handY,
      targetX,
      targetY,
      currentX: handX,
      currentY: handY,
      progress: 0,
      arcHeight: config.ballArcHeight,
      speed: config.ballMoveSpeed,
      damage: config.attackPower,
      radius: config.ballRadius,
      splashRadius: config.splashRadius,
    };

    this.snowballs.push(ball);
  }

  private updateSnowballs(dt: number) {
    const survivingBalls: Snowball[] = [];

    for (const ball of this.snowballs) {
      ball.progress += ball.speed * dt * 1.6;

      if (ball.progress >= 1) {
        // Snowball hits ground/target!
        this.handleSnowballImpact(ball);
      } else {
        ball.currentX = ball.startX + (ball.targetX - ball.startX) * ball.progress;
        ball.currentY = ball.startY + (ball.targetY - ball.startY) * ball.progress;
        survivingBalls.push(ball);
      }
    }

    this.snowballs = survivingBalls;
  }

  private handleSnowballImpact(ball: Snowball) {
    soundManager.playSe('snowball_hit');
    const isPlayer = ball.team === 'player';

    // Particle burst at impact
    const groundScreenY = this.fieldHeight - 130 + ball.targetY;
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: ball.targetX,
        y: groundScreenY,
        vx: (Math.random() * 2 - 1) * 70,
        vy: -Math.random() * 80 - 20,
        radius: Math.random() * 3.5 + 1.5,
        color: ['#ffffff', '#e0f2fe', '#bae6fd'][Math.floor(Math.random() * 3)],
        alpha: 1,
        decay: 1.4,
      });
    }

    const enemyCastleX = this.fieldWidth - 85;
    const playerCastleX = 85;

    // 1. Check Castle Hit
    const castleHitDamage = ball.radius >= 18 ? 2 : 1;
    if (isPlayer && Math.abs(ball.targetX - enemyCastleX) < 55) {
      this.damageEnemyCastle(castleHitDamage);
      this.addDamageNumber(enemyCastleX, groundScreenY - 60, castleHitDamage, 'enemy');
      return;
    } else if (!isPlayer && Math.abs(ball.targetX - playerCastleX) < 55) {
      this.damagePlayerCastle(castleHitDamage);
      this.addDamageNumber(playerCastleX, groundScreenY - 60, castleHitDamage, 'player');
      return;
    }

    // 2. Check Unit Hits
    const targets = this.units.filter((u) => u.team !== ball.team && u.state !== 'defeated');
    const splash = ball.splashRadius ?? 25;

    for (const target of targets) {
      const dx = target.x - ball.targetX;
      const dy = target.y - ball.targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= splash) {
        const falloff = ball.splashRadius ? Math.max(0.6, 1 - dist / splash) : 1;
        const damage = Math.round(ball.damage * falloff);

        target.hp -= damage;
        const targetScreenY = this.fieldHeight - 130 + target.y;
        this.addDamageNumber(target.x, targetScreenY - 30, damage, target.team);

        if (isPlayer) {
          this.stats.damageDealtPlayer += damage;
          this.addCheer(damage * 0.2);
        } else {
          this.stats.damageDealtEnemy += damage;
        }

        // Knockback or Defeat
        if (target.hp <= 0) {
          target.hp = 0;
          target.state = 'defeated';
          const kbDir = ball.team === 'player' ? 1 : -1;
          target.defeatedKnockback = {
            vx: kbDir * 180,
            vy: -220,
            rotation: 0,
            vRot: kbDir * 12,
            opacity: 1,
          };
          this.addCheer(12);
        }
      }
    }
  }

  private damagePlayerCastle(amount: number) {
    if (this.isFinished) return;
    this.playerCastleHp = Math.max(0, this.playerCastleHp - amount);
    if (this.playerCastleHp <= 0) {
      this.finishMatch('defeat');
    }
  }

  private damageEnemyCastle(amount: number) {
    if (this.isFinished) return;
    this.enemyCastleHp = Math.max(0, this.enemyCastleHp - amount);
    if (this.enemyCastleHp <= 0) {
      this.finishMatch('victory');
    }
  }

  private addCheer(amount: number) {
    if (this.cheerActive) return;
    this.cheerGauge = Math.min(this.maxCheerGauge, this.cheerGauge + amount);
    this.listener.onCheerChange?.(this.cheerGauge, this.maxCheerGauge, this.cheerActive);
  }

  private handleTimeUp() {
    this.isTimeUp = true;
    soundManager.playSe('time_up');

    if (this.playerCastleHp > this.enemyCastleHp) {
      this.finishMatch('victory');
    } else if (this.enemyCastleHp > this.playerCastleHp) {
      this.finishMatch('defeat');
    } else {
      this.finishMatch('draw');
    }
  }

  private finishMatch(result: MatchResult) {
    if (this.isFinished) return;
    this.isFinished = true;
    this.resultType = result;
    this.winnerTeam = result === 'victory' ? 'player' : result === 'defeat' ? 'enemy' : null;

    soundManager.stopBgm();
    if (result === 'victory') {
      soundManager.playSe('castle_destroy');
      setTimeout(() => soundManager.playSe('player_win'), 400);
    } else if (result === 'defeat') {
      soundManager.playSe('castle_destroy');
      setTimeout(() => soundManager.playSe('player_lose'), 400);
    }

    // Little panic penguins running away from destroyed castle
    const destroyedCastleX = result === 'victory' ? this.fieldWidth - 85 : 85;
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: destroyedCastleX + (Math.random() * 30 - 15),
        y: this.fieldHeight - 120,
        vx: (result === 'victory' ? 1 : -1) * (Math.random() * 80 + 60),
        vy: -Math.random() * 50 - 20,
        radius: 6,
        color: '#ffffff',
        alpha: 1,
        decay: 0.5,
        type: 'flag',
      });
    }

    this.listener.onMatchFinish?.(result, this.stats);
  }

  // --- PARTICLES & DAMAGE TEXT ---

  private addSpawnParticles(x: number, y: number) {
    const screenY = this.fieldHeight - 130 + y;
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y: screenY,
        vx: (Math.random() * 2 - 1) * 45,
        vy: -Math.random() * 50 - 10,
        radius: Math.random() * 3 + 1,
        color: '#bae6fd',
        alpha: 1,
        decay: 2.0,
      });
    }
  }

  private addDamageNumber(x: number, y: number, damage: number, team: Team) {
    this.damageNumbers.push({
      id: `dmg_${Date.now()}_${Math.random()}`,
      x,
      y,
      damage,
      team,
      opacity: 1,
      vy: -55,
    });
  }

  private updateParticles(dt: number) {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;
    }
    this.particles = this.particles.filter((p) => p.alpha > 0);
  }

  private updateDamageNumbers(dt: number) {
    for (const d of this.damageNumbers) {
      d.y += d.vy * dt;
      d.opacity -= dt * 1.2;
    }
    this.damageNumbers = this.damageNumbers.filter((d) => d.opacity > 0);
  }

  private notifyState() {
    this.listener.onCostChange?.(this.currentCost, this.maxCost);
    this.listener.onCheerChange?.(this.cheerGauge, this.maxCheerGauge, this.cheerActive);
    this.listener.onCastleHpChange?.(this.playerCastleHp, this.enemyCastleHp, this.maxCastleHp);
    this.listener.onTimeChange?.(this.remainingSeconds);

    const pCount = this.units.filter((u) => u.team === 'player' && u.state !== 'defeated').length;
    const eCount = this.units.filter((u) => u.team === 'enemy' && u.state !== 'defeated').length;
    this.listener.onUnitCountChange?.(pCount, eCount);
  }
}
