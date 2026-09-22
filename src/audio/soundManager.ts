/**
 * Web Audio API Sound Synthesizer
 * Provides zero-latency, realistic arcade winter sound effects and charming retro BGM
 * matching the unityroom game audioIDs:
 * BGM_TITLE, BGM_BATTLE, SE_DECIDE, SE_CANCEL, SE_DISABLED, SE_SELECT,
 * SE_SNOWBALL_HIT, SE_BATTLE_START, SE_UNIT_PLACE, SE_CHEER,
 * SE_CASTLE_DESTROY, SE_TIME_UP, SE_PLAYER_WIN, SE_PLAYER_LOSE
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmGainNode: GainNode | null = null;
  private seGainNode: GainNode | null = null;
  private bgmVolume = 0.6;
  private seVolume = 0.8;
  private currentBgm: 'title' | 'battle' | null = null;
  private bgmTimer: number | null = null;
  private isBgmPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.bgmGainNode = this.ctx.createGain();
      this.bgmGainNode.gain.value = this.bgmVolume;
      this.bgmGainNode.connect(this.ctx.destination);

      this.seGainNode = this.ctx.createGain();
      this.seGainNode.gain.value = this.seVolume;
      this.seGainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setBgmVolume(val: number) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.setValueAtTime(this.bgmVolume, this.ctx?.currentTime || 0);
    }
  }

  public setSeVolume(val: number) {
    this.seVolume = Math.max(0, Math.min(1, val));
    if (this.seGainNode) {
      this.seGainNode.gain.setValueAtTime(this.seVolume, this.ctx?.currentTime || 0);
    }
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public getSeVolume(): number {
    return this.seVolume;
  }

  // --- SOUND EFFECTS (SE) ---

  public playSe(type:
    | 'decide'
    | 'cancel'
    | 'select'
    | 'disabled'
    | 'snowball_hit'
    | 'unit_place'
    | 'battle_start'
    | 'cheer'
    | 'castle_destroy'
    | 'time_up'
    | 'player_win'
    | 'player_lose'
  ) {
    try {
      this.initContext();
      if (!this.ctx || !this.seGainNode || this.seVolume <= 0.01) return;

      const t = this.ctx.currentTime;

      switch (type) {
        case 'decide': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, t); // C5
          osc.frequency.exponentialRampToValueAtTime(880, t + 0.12); // A5
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          osc.connect(gain);
          gain.connect(this.seGainNode);
          osc.start(t);
          osc.stop(t + 0.18);
          break;
        }

        case 'cancel': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, t);
          osc.frequency.exponentialRampToValueAtTime(220, t + 0.12);
          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
          osc.connect(gain);
          gain.connect(this.seGainNode);
          osc.start(t);
          osc.stop(t + 0.14);
          break;
        }

        case 'select': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, t); // E5
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          osc.connect(gain);
          gain.connect(this.seGainNode);
          osc.start(t);
          osc.stop(t + 0.08);
          break;
        }

        case 'disabled': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160, t);
          osc.frequency.setValueAtTime(140, t + 0.06);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          osc.connect(gain);
          gain.connect(this.seGainNode);
          osc.start(t);
          osc.stop(t + 0.12);
          break;
        }

        case 'snowball_hit': {
          // Soft packed snow impact: noise burst + low thud
          const bufferSize = this.ctx.sampleRate * 0.12;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, t);
          filter.frequency.exponentialRampToValueAtTime(180, t + 0.12);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.4, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.seGainNode);
          noise.start(t);
          break;
        }

        case 'unit_place': {
          // Cute penguin "plop" & joyful chirp
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, t);
          osc.frequency.exponentialRampToValueAtTime(640, t + 0.08);
          osc.frequency.exponentialRampToValueAtTime(960, t + 0.14);
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
          osc.connect(gain);
          gain.connect(this.seGainNode);
          osc.start(t);
          osc.stop(t + 0.16);
          break;
        }

        case 'battle_start': {
          // Energetic trumpet / whistle sequence
          const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
          freqs.forEach((f, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(f, t + idx * 0.09);
            gain.gain.setValueAtTime(0, t);
            gain.gain.setValueAtTime(0.25, t + idx * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.18);
            osc.connect(gain);
            gain.connect(this.seGainNode!);
            osc.start(t + idx * 0.09);
            osc.stop(t + idx * 0.09 + 0.18);
          });
          break;
        }

        case 'cheer': {
          // Cheer fanfares and twinkle bells
          const notes = [783.99, 987.77, 1174.66, 1567.98]; // G5, B5, D6, G6
          notes.forEach((f, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t + idx * 0.08);
            gain.gain.setValueAtTime(0.25, t + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.25);
            osc.connect(gain);
            gain.connect(this.seGainNode!);
            osc.start(t + idx * 0.08);
            osc.stop(t + idx * 0.08 + 0.25);
          });
          break;
        }

        case 'castle_destroy': {
          // Massive crumbling collapse sound
          const bufferSize = this.ctx.sampleRate * 0.7;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(500, t);
          filter.frequency.exponentialRampToValueAtTime(60, t + 0.7);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.6, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.seGainNode);
          noise.start(t);
          break;
        }

        case 'time_up': {
          const notes = [659.25, 587.33, 523.25]; // E5, D5, C5
          notes.forEach((f, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, t + idx * 0.16);
            gain.gain.setValueAtTime(0.3, t + idx * 0.16);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.16 + 0.22);
            osc.connect(gain);
            gain.connect(this.seGainNode!);
            osc.start(t + idx * 0.16);
            osc.stop(t + idx * 0.16 + 0.22);
          });
          break;
        }

        case 'player_win': {
          // Triumphant victory fanfare (C-E-G-C arpeggio + fanfare sustain)
          const melody = [
            { f: 523.25, d: 0.12, offset: 0 },
            { f: 659.25, d: 0.12, offset: 0.12 },
            { f: 783.99, d: 0.14, offset: 0.24 },
            { f: 1046.5, d: 0.45, offset: 0.38 },
            { f: 880.0, d: 0.15, offset: 0.85 },
            { f: 1046.5, d: 0.65, offset: 1.02 },
          ];
          melody.forEach((n) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, t + n.offset);
            gain.gain.setValueAtTime(0.35, t + n.offset);
            gain.gain.exponentialRampToValueAtTime(0.001, t + n.offset + n.d);
            osc.connect(gain);
            gain.connect(this.seGainNode!);
            osc.start(t + n.offset);
            osc.stop(t + n.offset + n.d);
          });
          break;
        }

        case 'player_lose': {
          // Comical sad wobble
          const notes = [440, 415.3, 392, 349.23];
          notes.forEach((f, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, t + idx * 0.22);
            gain.gain.setValueAtTime(0.28, t + idx * 0.22);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.22 + 0.26);
            osc.connect(gain);
            gain.connect(this.seGainNode!);
            osc.start(t + idx * 0.22);
            osc.stop(t + idx * 0.22 + 0.26);
          });
          break;
        }
      }
    } catch {
      // Audio context might be waiting for user gesture
    }
  }

  // --- BACKGROUND MUSIC (BGM) ---

  public playBgm(type: 'title' | 'battle') {
    if (this.currentBgm === type && this.isBgmPlaying) return;
    this.stopBgm();

    this.currentBgm = type;
    this.isBgmPlaying = true;
    this.initContext();

    if (type === 'title') {
      this.runTitleBgmLoop();
    } else {
      this.runBattleBgmLoop();
    }
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    this.currentBgm = null;
    if (this.bgmTimer) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private playTone(freq: number, startTime: number, duration: number, type: OscillatorType = 'triangle', vol = 0.15) {
    if (!this.ctx || !this.bgmGainNode || this.bgmVolume <= 0.01) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.bgmGainNode);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private runTitleBgmLoop() {
    if (!this.isBgmPlaying || this.currentBgm !== 'title' || !this.ctx) return;

    // Cozy winter penguin title melody in C major / A minor (peaceful, playful)
    const tempo = 0.24; // beat length in seconds
    const melody = [
      523.25, 587.33, 659.25, 783.99,
      659.25, 523.25, 587.33, 440.0,
      523.25, 659.25, 783.99, 880.0,
      783.99, 659.25, 587.33, 523.25,
      659.25, 783.99, 880.0, 1046.5,
      880.0, 783.99, 659.25, 587.33,
      523.25, 440.0, 523.25, 587.33,
      523.25, 0, 523.25, 0
    ];

    const bass = [
      261.63, 0, 261.63, 0,
      220.0, 0, 220.0, 0,
      174.61, 0, 174.61, 0,
      196.0, 0, 196.0, 0,
      220.0, 0, 220.0, 0,
      174.61, 0, 174.61, 0,
      196.0, 0, 196.0, 0,
      261.63, 0, 261.63, 0
    ];

    const now = this.ctx.currentTime + 0.05;
    melody.forEach((f, i) => {
      if (f > 0) {
        this.playTone(f, now + i * tempo, tempo * 0.85, 'sine', 0.16);
        // Soft chime sparkle
        if (i % 2 === 0) {
          this.playTone(f * 2, now + i * tempo, tempo * 0.4, 'triangle', 0.05);
        }
      }
    });

    bass.forEach((f, i) => {
      if (f > 0) {
        this.playTone(f, now + i * tempo, tempo * 1.5, 'triangle', 0.12);
      }
    });

    const totalDuration = melody.length * tempo * 1000;
    this.bgmTimer = window.setTimeout(() => {
      if (this.isBgmPlaying && this.currentBgm === 'title') {
        this.runTitleBgmLoop();
      }
    }, totalDuration - 50);
  }

  private runBattleBgmLoop() {
    if (!this.isBgmPlaying || this.currentBgm !== 'battle' || !this.ctx) return;

    // Upbeat energetic snowball battle march (lively and cheerful!)
    const tempo = 0.16; // faster upbeat tempo
    const melody = [
      523.25, 523.25, 659.25, 783.99,
      880.0, 783.99, 659.25, 587.33,
      523.25, 659.25, 783.99, 659.25,
      587.33, 523.25, 587.33, 659.25,
      783.99, 783.99, 880.0, 1046.5,
      987.77, 880.0, 783.99, 659.25,
      587.33, 659.25, 783.99, 880.0,
      1046.5, 0, 1046.5, 0
    ];

    const bass = [
      261.63, 261.63, 329.63, 329.63,
      349.23, 349.23, 392.0, 392.0,
      261.63, 261.63, 329.63, 329.63,
      293.66, 293.66, 329.63, 329.63,
      349.23, 349.23, 392.0, 392.0,
      440.0, 440.0, 392.0, 392.0,
      293.66, 293.66, 392.0, 392.0,
      261.63, 261.63, 261.63, 0
    ];

    const now = this.ctx.currentTime + 0.05;
    melody.forEach((f, i) => {
      if (f > 0) {
        this.playTone(f, now + i * tempo, tempo * 0.75, 'square', 0.12);
        this.playTone(f * 0.5, now + i * tempo, tempo * 0.65, 'triangle', 0.08);
      }
    });

    bass.forEach((f, i) => {
      if (f > 0) {
        this.playTone(f * 0.5, now + i * tempo, tempo * 0.9, 'triangle', 0.16);
      }
    });

    const totalDuration = melody.length * tempo * 1000;
    this.bgmTimer = window.setTimeout(() => {
      if (this.isBgmPlaying && this.currentBgm === 'battle') {
        this.runBattleBgmLoop();
      }
    }, totalDuration - 40);
  }
}

export const soundManager = new SoundManager();
