window.QUANTUM_STATE = {
    entropy: 0.0, // 0.0 to 1.0
    isStarted: false,
};

function initSimulation() {
    if (window.QUANTUM_STATE.isStarted) return;
    window.QUANTUM_STATE.isStarted = true;
    
    // Hide overlay
    const overlay = document.getElementById('startOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 1000);
    }

    // Init Audio
    if (window.quantumAudio) {
        window.quantumAudio.init();
    }
    
    // Init Visuals
    if (window.initWave) window.initWave();
    if (window.initCat) window.initCat();
    if (window.initEntanglement) window.initEntanglement();
}

function triggerCollapse() {
    if (window.quantumAudio) {
        window.quantumAudio.playCollapseSnap();
    }
    // Randomize entropy a bit
    window.QUANTUM_STATE.entropy = Math.random();
    if (window.quantumAudio) {
        window.quantumAudio.updateEntropy(window.QUANTUM_STATE.entropy);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Expose init to a button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', initSimulation);
    }
});
