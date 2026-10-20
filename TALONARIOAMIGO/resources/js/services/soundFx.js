/**
 * Servicio: Paisaje Sonoro Orgánico (Web Audio API)
 * Principio 5 del Producto: "Ruido de papel, lapicero, sello SRI y desprendimiento (rrrrrip)"
 * 100% Sintético y Autónomo — Sin archivos de audio externos, funciona offline y en móvil.
 */

class SoundFxService {
    constructor() {
        this.ctx = null;
        this.enabled = localStorage.getItem('ta_audio_enabled') !== 'false';
    }

    initCtx() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    toggleSound() {
        this.enabled = !this.enabled;
        localStorage.setItem('ta_audio_enabled', String(this.enabled));
        return this.enabled;
    }

    isSoundEnabled() {
        return this.enabled;
    }

    // 1. Lapicero sobre papel (micro fricción suave)
    playPencil() {
        if (!this.enabled) return;
        try {
            this.initCtx();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const bufferSize = this.ctx.sampleRate * 0.06; // 60ms
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(2800, now);
            filter.Q.setValueAtTime(3.0, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);
        } catch (e) {
            console.debug('SoundFX pencil note ignored', e);
        }
    }

    // 2. Sello de Hule SRI (Golpe seco hueco THUD + rebote mecánico CLACK)
    playStamp() {
        if (!this.enabled) return;
        try {
            this.initCtx();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;

            // Oscilador de impacto grave (THUD)
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

            oscGain.gain.setValueAtTime(0.35, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            osc.connect(oscGain);
            oscGain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.14);

            // Ruido de impacto del caucho contra el papel (CLACK)
            const bufSize = this.ctx.sampleRate * 0.08;
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const out = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) {
                out[i] = (Math.random() * 2 - 1) * Math.pow(1 - (i / bufSize), 2);
            }
            const noiseSource = this.ctx.createBufferSource();
            noiseSource.buffer = buf;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(900, now);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.25, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            noiseSource.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            noiseSource.start(now);
        } catch (e) {
            console.debug('SoundFX stamp error', e);
        }
    }

    // 3. Desprendimiento de Hoja (rrrrrip físico con fricción de fibras)
    playPaperTear() {
        if (!this.enabled) return;
        try {
            this.initCtx();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const duration = 0.38; // 380ms
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                const t = i / bufferSize;
                // Modulación irregular para emular desgarro de fibras dentadas
                const burstMod = Math.sin(t * 80) > 0.3 ? 1.0 : 0.35;
                data[i] = (Math.random() * 2 - 1) * burstMod * Math.sin(t * Math.PI);
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, now);
            filter.frequency.linearRampToValueAtTime(2200, now + duration);
            filter.Q.setValueAtTime(1.8, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);
        } catch (e) {
            console.debug('SoundFX paper tear error', e);
        }
    }

    // 4. Deslizamiento de Hoja Nueva (swoosh suave de papel marfil)
    playPaperSlide() {
        if (!this.enabled) return;
        try {
            this.initCtx();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const duration = 0.28;
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                const t = i / bufferSize;
                data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI);
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, now);
            filter.frequency.linearRampToValueAtTime(1100, now + duration * 0.6);
            filter.frequency.linearRampToValueAtTime(400, now + duration);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);
        } catch (e) {
            console.debug('SoundFX paper slide error', e);
        }
    }
}

export const soundFx = new SoundFxService();
