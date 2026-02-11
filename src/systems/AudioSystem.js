/**
 * AudioSystem — Procedural audio synthesis for SFX and BGM.
 * Uses Web Audio API with lazy AudioContext initialization (first user click).
 */
export class AudioSystem {
  constructor() {
    this.ctx = null;         // AudioContext, created on first interaction
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.initialized = false;

    // BGM state
    this._bgmScheduler = null;
    this._bgmPlaying = false;
    this._currentTrackId = null;
  }

  /**
   * Lazy-initialize AudioContext on first user gesture.
   * Call this on first click/interaction.
   */
  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Master → destination
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);

      // SFX → master
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.6;
      this.sfxGain.connect(this.masterGain);

      // BGM → master
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.3;
      this.bgmGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn('AudioSystem: Web Audio API not available', e);
    }
  }

  /**
   * Resume AudioContext if suspended (browser autoplay policy).
   */
  _ensureRunning() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Play a sound effect by type name.
   * @param {string} type - One of: footstep, pickup, talk, door, ui_click
   */
  playSfx(type) {
    if (!this.initialized) return;
    this._ensureRunning();

    const now = this.ctx.currentTime;
    switch (type) {
      case 'footstep':  this._sfxFootstep(now); break;
      case 'pickup':    this._sfxPickup(now); break;
      case 'talk':      this._sfxTalk(now); break;
      case 'door':      this._sfxDoor(now); break;
      case 'ui_click':  this._sfxUIClick(now); break;
    }
  }

  // --- SFX generators ---

  /**
   * Footstep: short burst of filtered noise.
   */
  _sfxFootstep(t) {
    const duration = 0.06;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    source.start(t);
    source.stop(t + duration);
  }

  /**
   * Pickup: sine arpeggio C5 → E5 → G5.
   */
  _sfxPickup(t) {
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const noteLen = 0.08;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      const start = t + i * noteLen;
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteLen * 0.9);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(start);
      osc.stop(start + noteLen);
    });
  }

  /**
   * Talk blip: random-pitch short triangle wave.
   */
  _sfxTalk(t) {
    const freq = 180 + Math.random() * 120; // 180-300 Hz
    const duration = 0.05;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  /**
   * Door: descending square wave sweep.
   */
  _sfxDoor(t) {
    const duration = 0.2;

    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  /**
   * UI click: very short square pulse.
   */
  _sfxUIClick(t) {
    const duration = 0.03;

    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 600;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  // --- BGM ---

  /**
   * Play a music track using a simple tracker-style sequencer.
   * @param {object} track - Track definition with bpm, channels array
   */
  playTrack(track) {
    if (!this.initialized || !track) return;
    this._ensureRunning();
    this.stopTrack();

    this._bgmPlaying = true;
    this._currentTrackId = track.id;

    const bpm = track.bpm || 120;
    const stepDuration = 60 / bpm / 4; // 16th note duration
    const totalSteps = track.loopLength || 64;
    let currentStep = 0;
    const lookahead = 0.1; // schedule 100ms ahead

    const schedule = () => {
      if (!this._bgmPlaying) return;

      const now = this.ctx.currentTime;
      const scheduleUntil = now + lookahead;

      while (this._nextNoteTime < scheduleUntil) {
        // Schedule notes for this step
        for (const channel of track.channels) {
          const noteIndex = currentStep % channel.notes.length;
          const note = channel.notes[noteIndex];
          if (note && note !== '-' && note !== 0) {
            this._playBgmNote(channel.instrument, note, this._nextNoteTime, stepDuration * 0.8);
          }
        }

        this._nextNoteTime += stepDuration;
        currentStep = (currentStep + 1) % totalSteps;
      }

      this._bgmScheduler = setTimeout(schedule, 50);
    };

    this._nextNoteTime = this.ctx.currentTime;
    schedule();
  }

  /**
   * Stop current BGM track.
   */
  stopTrack() {
    this._bgmPlaying = false;
    this._currentTrackId = null;
    if (this._bgmScheduler) {
      clearTimeout(this._bgmScheduler);
      this._bgmScheduler = null;
    }
  }

  /**
   * Play a single BGM note.
   */
  _playBgmNote(instrument, note, time, duration) {
    const freq = this._noteToFreq(note);
    if (!freq) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch (instrument) {
      case 'square':
        osc.type = 'square';
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        break;
      case 'triangle':
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        break;
      case 'sine':
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        break;
      case 'sawtooth':
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        break;
      default:
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    }

    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  /**
   * Convert note name (e.g. 'C4', 'F#3') to frequency.
   * Also accepts raw frequency numbers.
   */
  _noteToFreq(note) {
    if (typeof note === 'number') return note;
    if (typeof note !== 'string') return null;

    const noteMap = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
    const match = note.match(/^([A-G])(#|b)?(\d)$/);
    if (!match) return null;

    let semitone = noteMap[match[1]];
    if (match[2] === '#') semitone++;
    if (match[2] === 'b') semitone--;
    const octave = parseInt(match[3]);

    // A4 = 440Hz, MIDI note 69
    const midi = semitone + (octave + 1) * 12;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
}
