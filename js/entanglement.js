function initEntanglement() {
    const sealA = document.getElementById('hankoA');
    const sealB = document.getElementById('hankoB');
    const canvas = document.getElementById('entanglementCanvas');
    if (!sealA || !sealB || !canvas) return;

    const ctx = canvas.getContext('2d');
    
    let angleA = 0;
    let angleB = 0;

    let isDraggingA = false;
    let isDraggingB = false;

    // Stats
    let totalPairs = 0;
    let matches = 0;

    const statPairs = document.getElementById('statPairs');
    const statMatches = document.getElementById('statMatches');
    const statProb = document.getElementById('statProb');

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    window.addEventListener('resize', resize);
    resize();

    // Interaction for rotation
    function setupDrag(el, isA) {
        let startY = 0;
        let startAngle = 0;

        el.addEventListener('mousedown', (e) => {
            if (isA) { isDraggingA = true; startAngle = angleA; }
            else { isDraggingB = true; startAngle = angleB; }
            startY = e.clientY;
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (isA && isDraggingA) {
                const dy = e.clientY - startY;
                angleA = startAngle + dy;
                el.style.transform = `translate(-50%, -50%) rotate(${angleA}deg)`;
            }
            if (!isA && isDraggingB) {
                const dy = e.clientY - startY;
                angleB = startAngle + dy;
                el.style.transform = `translate(-50%, -50%) rotate(${angleB}deg)`;
            }
        });

        window.addEventListener('mouseup', () => {
            isDraggingA = false;
            isDraggingB = false;
        });
    }

    setupDrag(sealA, true);
    setupDrag(sealB, false);

    // Simulation Loop
    setInterval(() => {
        if(!window.QUANTUM_STATE || !window.QUANTUM_STATE.isStarted) return;

        // Generate a pair
        totalPairs++;
        
        // Quantum probability of matching spins = cos^2( (angleA - angleB) / 2 )
        const diffRad = (angleA - angleB) * Math.PI / 180;
        const prob = Math.pow(Math.cos(diffRad / 2), 2);
        
        if (Math.random() < prob) {
            matches++;
        }

        if (statPairs) statPairs.innerText = totalPairs;
        if (statMatches) statMatches.innerText = matches;
        if (statProb) statProb.innerText = (prob * 100).toFixed(1) + '%';
        
    }, 100);

    // Visuals: Ink string connecting them
    let time = 0;
    function render() {
        time += 0.05;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cxA = canvas.width * 0.2;
        const cyA = canvas.height * 0.5;
        const cxB = canvas.width * 0.8;
        const cyB = canvas.height * 0.5;

        // Draw distorted line
        ctx.beginPath();
        ctx.moveTo(cxA, cyA);
        
        // The difference in angle distorts the line
        const diff = Math.abs((angleA - angleB) % 360);
        const distortion = diff / 360 * 100;

        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const x = cxA + (cxB - cxA) * t;
            
            // Noise 
            const yOffset = Math.sin(t * 10 + time) * distortion + Math.cos(t * 20 - time) * (distortion * 0.5);
            const y = cyA + (cyB - cyA) * t + yOffset;
            
            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = '#c25e5e'; // faded red string of fate
        ctx.lineWidth = 3;
        ctx.stroke();

        // Particles flowing
        for(let j=0; j<5; j++) {
            const pt = (time * 0.2 + j * 0.2) % 1.0;
            const px = cxA + (cxB - cxA) * pt;
            const pyOffset = Math.sin(pt * 10 + time) * distortion + Math.cos(pt * 20 - time) * (distortion * 0.5);
            const py = cyA + (cyB - cyA) * pt + pyOffset;

            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI*2);
            ctx.fillStyle = '#102a45'; // prussian blue
            ctx.fill();
        }

        requestAnimationFrame(render);
    }
    render();
}
