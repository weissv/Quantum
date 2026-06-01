function initWave() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    const vsSource = `
        attribute vec4 aVertexPosition;
        varying vec2 vUv;
        void main() {
            gl_Position = aVertexPosition;
            vUv = aVertexPosition.xy * 0.5 + 0.5;
        }
    `;

    const fsSource = `
        precision mediump float;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform float uCollapse;

        // Hash function for noise
        float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }
        
        // Value noise
        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                       mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
        }

        // FBM
        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            vec2 shift = vec2(100.0);
            mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
            for (int i = 0; i < 5; ++i) {
                v += a * noise(p);
                p = rot * p * 2.0 + shift;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution.xy;
            vec2 p = uv * 3.0 - vec2(uTime * 0.1);
            
            float q = fbm(p + fbm(p + vec2(1.0)));
            float r = fbm(p + q * 2.0 + uTime * 0.2);
            
            // paper to prussian blue
            vec3 color = mix(vec3(0.94, 0.92, 0.85), vec3(0.06, 0.16, 0.27), r);
            
            // Mouse collapse effect
            vec2 mouseUV = uMouse / uResolution;
            mouseUV.y = 1.0 - mouseUV.y; // Invert Y
            
            float dist = distance(uv * vec2(uResolution.x/uResolution.y, 1.0), mouseUV * vec2(uResolution.x/uResolution.y, 1.0));
            
            float collapseCircle = smoothstep(0.05, 0.0, dist) * uCollapse;
            float ripple = sin(dist * 50.0 - uTime * 10.0) * exp(-dist * 10.0) * uCollapse;
            
            color = mix(color, vec3(0.0), collapseCircle); // Black ink drop
            color += vec3(ripple * 0.2);

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    function loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    const positions = new Float32Array([
        -1.0,  1.0,
         1.0,  1.0,
        -1.0, -1.0,
         1.0, -1.0,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(shaderProgram, 'uTime');
    const resLoc = gl.getUniformLocation(shaderProgram, 'uResolution');
    const mouseLoc = gl.getUniformLocation(shaderProgram, 'uMouse');
    const collapseLoc = gl.getUniformLocation(shaderProgram, 'uCollapse');

    let mouseX = -1000, mouseY = -1000;
    let collapseStrength = 0;

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouseX = -1000; // hide outside
        mouseY = -1000;
    });

    canvas.addEventListener('click', () => {
        collapseStrength = 1.0;
        if(window.triggerCollapse) triggerCollapse();
    });

    let startTime = Date.now();

    function render() {
        collapseStrength = Math.max(0, collapseStrength - 0.015); // fade out
        const time = (Date.now() - startTime) * 0.001;
        
        gl.useProgram(shaderProgram);
        gl.uniform1f(timeLoc, time);
        gl.uniform2f(resLoc, canvas.width, canvas.height);
        gl.uniform2f(mouseLoc, mouseX, mouseY);
        gl.uniform1f(collapseLoc, collapseStrength);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }
    render();
}
