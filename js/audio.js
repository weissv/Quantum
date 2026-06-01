class QuantumAudio {
    constructor() {
        this.ctx = null;
        this.humOsc = null;
        this.humGain = null;
        this.humFilter = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Background Hum
        this.humOsc = this.ctx.createOscillator();
        this.humOsc.type = 'sine';
        this.humOsc.frequency.value = 55; // Low A1

        this.humFilter = this.ctx.createBiquadFilter();
        this.humFilter.type = 'lowpass';
        this.humFilter.frequency.value = 200;

        this.humGain = this.ctx.createGain();
        this.humGain.gain.value = 0.2; // Ambient level

        this.humOsc.connect(this.humFilter);
        this.humFilter.connect(this.humGain);
        this.humGain.connect(this.ctx.destination);

        this.humOsc.start();
        this.isInitialized = true;
    }

    updateEntropy(level) {
        if (!this.isInitialized) return;
        // Map entropy [0, 1] to filter frequency [200, 1000] and pitch
        const targetFreq = 55 + (level * 20); // slightly detune
        const targetFilter = 200 + (level * 800);
        
        this.humOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.5);
        this.humFilter.frequency.setTargetAtTime(targetFilter, this.ctx.currentTime, 0.5);
    }

    playCollapseSnap() {
        if (!this.isInitialized) return;

        // Snap sound (like Shamisen string snapping)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);

        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 5;

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }
}

window.quantumAudio = new QuantumAudio();
