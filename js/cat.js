function initCat() {
    const canvas = document.getElementById('catCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const numParticles = 800;
    let isClosed = true;
    let targetShape = 0; // 0 = neon cat, 1 = skeleton

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    window.addEventListener('resize', resize);
    resize();

    // Helper to get random targets for a cat face (simplified procedural shape)
    function generateCatTargets() {
        let targets = [];
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        
        for (let i = 0; i < numParticles; i++) {
            // Draw a rough cat face
            const rand = Math.random();
            let x, y;
            if (rand < 0.4) {
                // Head circle
                const angle = Math.random() * Math.PI * 2;
                const r = 60 * Math.sqrt(Math.random());
                x = cx + Math.cos(angle) * r;
                y = cy + Math.sin(angle) * r;
            } else if (rand < 0.6) {
                // Left ear
                x = cx - 40 + Math.random() * 20;
                y = cy - 60 - Math.random() * 40;
            } else if (rand < 0.8) {
                // Right ear
                x = cx + 40 - Math.random() * 20;
                y = cy - 60 - Math.random() * 40;
            } else {
                // Whiskers
                const side = Math.random() > 0.5 ? 1 : -1;
                x = cx + side * (60 + Math.random() * 40);
                y = cy + (Math.random() - 0.5) * 20;
            }
            targets.push({x, y});
        }
        return targets;
    }

    function generateSkeletonTargets() {
        let targets = [];
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        
        for (let i = 0; i < numParticles; i++) {
            // Skull shape (hollow eyes)
            const angle = Math.random() * Math.PI * 2;
            const r = 50 + Math.random() * 10;
            let x = cx + Math.cos(angle) * r;
            let y = cy + Math.sin(angle) * r;
            
            // Add some crossbones
            if(Math.random() > 0.8) {
                const t = Math.random() * 100 - 50;
                x = cx + t;
                y = cy + (Math.random() > 0.5 ? t : -t) + 60;
            }
            
            targets.push({x, y});
        }
        return targets;
    }

    let catTargets = [];
    let skeletonTargets = [];

    // Init particles
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            targetX: 0,
            targetY: 0
        });
    }

    // Interaction
    const box = document.getElementById('catBox');
    const closedOverlay = document.getElementById('catClosedOverlay');
    const openOverlay = document.getElementById('catOpenOverlay');
    const openText = document.getElementById('catOpenText');

    if(box) {
        box.addEventListener('click', () => {
            if(window.triggerCollapse) triggerCollapse();
            isClosed = !isClosed;
            
            if (!isClosed) {
                // Quantum decision
                targetShape = Math.random() > 0.5 ? 0 : 1;
                catTargets = generateCatTargets();
                skeletonTargets = generateSkeletonTargets();
                
                // Assign targets
                const targets = targetShape === 0 ? catTargets : skeletonTargets;
                for(let i=0; i<numParticles; i++) {
                    particles[i].targetX = targets[i].x;
                    particles[i].targetY = targets[i].y;
                }
                
                if (closedOverlay) closedOverlay.style.opacity = '0';
                if (openOverlay) openOverlay.style.opacity = '1';
                if (openText) openText.innerText = targetShape === 0 ? "Жив (Jade 猫)" : "Мертв (Cinnabar 骨)";
                
            } else {
                if (closedOverlay) closedOverlay.style.opacity = '1';
                if (openOverlay) openOverlay.style.opacity = '0';
            }
        });
    }

    function render() {
        ctx.fillStyle = 'rgba(230, 224, 197, 0.2)'; // trail effect with paper dark color
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Particle colors
        const color = isClosed ? '#1a1a1a' : (targetShape === 0 ? '#4deeea' : '#d93a3a');
        ctx.fillStyle = color;

        for (let i = 0; i < numParticles; i++) {
            let p = particles[i];
            
            if (isClosed) {
                // Random fluid motion
                p.vx += (Math.random() - 0.5) * 0.5;
                p.vy += (Math.random() - 0.5) * 0.5;
                
                // Friction
                p.vx *= 0.95;
                p.vy *= 0.95;
                
                p.x += p.vx;
                p.y += p.vy;
                
                // Wrap
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
            } else {
                // Interpolate to target
                p.vx = (p.targetX - p.x) * 0.05;
                p.vy = (p.targetY - p.y) * 0.05;
                
                // Add tiny jitter
                p.vx += (Math.random() - 0.5) * 0.5;
                p.vy += (Math.random() - 0.5) * 0.5;

                p.x += p.vx;
                p.y += p.vy;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, isClosed ? 1.5 : 2, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(render);
    }
    render();
}
