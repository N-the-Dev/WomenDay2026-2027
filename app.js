import { IntroParticleRenderer } from './src/intro-particles.ts';

(() => {
    const scenes = [...document.querySelectorAll('.scene')];
    const sceneNames = scenes.map((scene) => scene.id);
    const matrixCanvas = document.getElementById('matrixCanvas');
    const ambientCanvas = document.getElementById('ambientCanvas');
    const envelope = document.getElementById('envelope');
    const introSequence = document.getElementById('introSequence');
    const introParticleCanvas = document.getElementById('introParticleCanvas');
    const letterScene = document.getElementById('letter');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wash = document.querySelector('.transition-wash');
    const letterFlapDuration = 900;
    const letterPaperDuration = 1250;
    const letterPaperSettleDuration = 560;
    const letterPaperReturnDuration = 560;
    const letterFlapCloseDelay = 120;
    const letterPaperLeadIn = letterFlapDuration + 120;
    const letterPaperTransitionDelay = 120;
    let activeScene = 0;
    let matrixFrame = null;
    let matrixColumns = [];
    let matrixStartedAt = 0;
    let matrixLastFrame = 0;
    let matrixContext = null;
    let matrixRatio = 1;
    let ambientContext = ambientCanvas?.getContext('2d', { alpha: true }) || null;
    let ambientRatio = 1;
    let ambientParticles = [];
    let ambientFrame = null;
    let ambientLastFrame = 0;
    let introParticles = null;
    let introShapeTimers = [];
    let introStarted = false;
    let fireworks = null;
    let burstTimers = [];
    let introTimer = null;
    let introRevealTimer = null;
    let sceneRevealTimer = null;
    let letterLoopTimer = null;
    let letterTransitionTimer = null;
    let pageIndex = 0;

    function resizeIntroParticles() {
        if (!introParticleCanvas || !introParticleContext) return;
        const previousWidth = introParticleCanvas.width / introParticleRatio || window.innerWidth;
        const previousHeight = introParticleCanvas.height / introParticleRatio || window.innerHeight;
        const width = window.innerWidth;
        const height = window.innerHeight;
        introParticleRatio = Math.min(window.devicePixelRatio || 1, 1.6);
        introParticleCanvas.width = Math.round(width * introParticleRatio);
        introParticleCanvas.height = Math.round(height * introParticleRatio);
        introParticleContext.setTransform(introParticleRatio, 0, 0, introParticleRatio, 0, 0);

        if (introStarted) {
            introParticles.forEach((particle) => {
                particle.x = (particle.x / previousWidth) * width;
                particle.y = (particle.y / previousHeight) * height;
                particle.homeX = (particle.homeX / previousWidth) * width;
                particle.homeY = (particle.homeY / previousHeight) * height;
                particle.targetX = (particle.targetX / previousWidth) * width;
                particle.targetY = (particle.targetY / previousHeight) * height;
                particle.formFromX = (particle.formFromX / previousWidth) * width;
                particle.formFromY = (particle.formFromY / previousHeight) * height;
            });
            heartWordParticles.forEach((particle) => {
                particle.x = (particle.x / previousWidth) * width;
                particle.y = (particle.y / previousHeight) * height;
            });
            return;
        }

        const centerX = width / 2;
        const heartCenterY = height * 0.44;
        const heartScale = Math.min(width * 0.76 / 32, 860 / 32, height * 0.7 / 30);
        const particleCount = Math.min(16000, Math.max(2400, Math.round((width * height) / 125)));
        const colors = ['255,16,43', '255,32,61', '255,51,82', '255,76,105'];
        introParticles = Array.from({ length: particleCount }, () => {
            const angle = Math.random() * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
            const isShell = Math.random() < 0.3;
            const radial = isShell
                ? 0.88 + Math.random() * 0.12
                : Math.pow(Math.random(), 0.62) * 0.96;
            const sin = Math.sin(angle);
            const outlineX = 16 * sin * sin * sin;
            const outlineY = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
            const shapeX = (outlineX * radial) / 16;
            const shapeY = (-outlineY * radial) / 17;
            const baseDepth = 0.82 + Math.max(0, shapeY) * 1.15;
            const shapeZ = (Math.random() * 2 - 1)
                * (isShell ? 0.42 : Math.sqrt(Math.max(0.08, 1 - radial * radial)) * 1.08)
                * baseDepth;
            const isHighlight = Math.random() < 0.035;
            const x = centerX + shapeX * 16 * heartScale;
            const y = heartCenterY + shapeY * 17 * heartScale;
            return {
                x,
                y,
                shapeX,
                shapeY,
                shapeZ,
                homeX: x,
                homeY: y,
                targetX: x,
                targetY: y,
                targetAlpha: 1,
                alpha: 1,
                vx: 0,
                vy: 0,
                formFromX: x,
                formFromY: y,
                formStart: 0,
                formDuration: 980,
                radius: isHighlight ? 0.12 + Math.random() * 0.22 : 0.4 + Math.random() * 0.82,
                phase: Math.random() * Math.PI * 2,
                color: isHighlight ? '255,209,222' : colors[Math.floor(Math.random() * colors.length)],
                isShell
            };
        });
        const heartTextSize = Math.min(width * 0.12, 100, height * 0.1);
        introShapeContext.font = `800 ${heartTextSize}px "Be Vietnam Pro", Arial, sans-serif`;
        const heartTextWidth = Math.ceil(introShapeContext.measureText('11A1').width);
        introShapeCanvas.width = heartTextWidth + 12;
        introShapeCanvas.height = Math.ceil(heartTextSize * 1.35);
        introShapeContext.clearRect(0, 0, introShapeCanvas.width, introShapeCanvas.height);
        introShapeContext.font = `800 ${heartTextSize}px "Be Vietnam Pro", Arial, sans-serif`;
        introShapeContext.textAlign = 'center';
        introShapeContext.textBaseline = 'middle';
        introShapeContext.fillStyle = '#fff';
        introShapeContext.fillText('11A1', introShapeCanvas.width / 2, introShapeCanvas.height / 2);
        const heartTextPixels = introShapeContext.getImageData(0, 0, introShapeCanvas.width, introShapeCanvas.height).data;
        const heartTextGap = width < 600 ? 2.5 : 4;
        heartWordParticles = [];
        for (let y = 0; y < introShapeCanvas.height; y += heartTextGap) {
            for (let x = 0; x < introShapeCanvas.width; x += heartTextGap) {
                if (heartTextPixels[(y * introShapeCanvas.width + x) * 4 + 3] > 96) {
                    heartWordParticles.push({
                        offsetX: x - introShapeCanvas.width / 2,
                        offsetY: y - introShapeCanvas.height / 2,
                        x: centerX + x - introShapeCanvas.width / 2,
                        y: heartCenterY + y - introShapeCanvas.height / 2,
                        vx: 0,
                        vy: 0,
                        alpha: 1,
                        radius: 0.2 + Math.random() * 0.34,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            }
        }
    }

    function drawIntroParticles(now) {
        if (!introParticleContext || !introParticleCanvas || document.hidden || introSequence.classList.contains('is-done')) {
            introParticleFrame = null;
            return;
        }
        const context = introParticleContext;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const centerX = width / 2;
        const heartCenterY = height * 0.44;
        introParticleLastFrame = now;
        const pulse = reducedMotion.matches
            ? 1
            : 1 + Math.pow(Math.max(0, Math.sin(now * 0.0052)), 9) * 0.15;
        const heartScale = Math.min(width * 0.76 / 32, 860 / 32, height * 0.7 / 30) * pulse;
        const angleY = reducedMotion.matches ? 0.12 : Math.sin(now * 0.00032) * 0.36;
        const angleX = reducedMotion.matches ? 0.06 : Math.sin(now * 0.00023 + 1) * 0.14;
        context.clearRect(0, 0, width, height);
        context.globalCompositeOperation = 'lighter';

        ambientParticles.forEach((particle) => {
            if (index % 18 !== 0) return;
            const shimmer = reducedMotion.matches ? 0.2 : 0.12 + (Math.sin(now * 0.0012 + particle.phase) + 1) * 0.09;
            context.fillStyle = `rgba(${particle.color}, ${particle.alpha * shimmer})`;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius * 0.72, 0, Math.PI * 2);
            context.fill();
        });

        introParticles.forEach((particle) => {
            if (introMode === 'burst') {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vx *= 0.986;
                particle.vy *= 0.986;
            } else if (introMode === 'forming') {
                const progress = Math.max(0, Math.min(1, (now - particle.formStart) / particle.formDuration));
                const eased = progress * progress * (3 - 2 * progress);
                particle.x = particle.formFromX + (particle.targetX - particle.formFromX) * eased;
                particle.y = particle.formFromY + (particle.targetY - particle.formFromY) * eased;
                particle.alpha = 0.025 + (particle.targetAlpha - 0.025) * eased;
            } else {
                const drift = reducedMotion.matches ? 0 : Math.sin(now * 0.0011 + particle.phase) * 0.035;
                const localX = (particle.shapeX + drift) * 16 * heartScale;
                const localY = (particle.shapeY + Math.cos(now * 0.0009 + particle.phase) * (reducedMotion.matches ? 0 : 0.025)) * 17 * heartScale;
                const localZ = (particle.shapeZ + Math.sin(now * 0.0008 + particle.phase) * (reducedMotion.matches ? 0 : 0.035)) * heartScale * 10.5;
                const rotatedX = localX * Math.cos(angleY) + localZ * Math.sin(angleY);
                const depthY = -localX * Math.sin(angleY) + localZ * Math.cos(angleY);
                const rotatedY = localY * Math.cos(angleX) - depthY * Math.sin(angleX);
                const depth = localY * Math.sin(angleX) + depthY * Math.cos(angleX);
                const perspective = 820 / (820 - depth);
                particle.x = centerX + rotatedX * perspective;
                particle.y = heartCenterY + rotatedY * perspective;
                particle.depth = Math.max(-1, Math.min(1, depth / Math.max(heartScale * 20, 1)));
            }
            const depthLight = introMode === 'heart'
                ? (0.54 + (particle.depth + 1) * 0.23) * (particle.isShell ? 1.18 : 0.72)
                : 1;
            const twinkle = reducedMotion.matches ? 0.88 : 0.66 + (Math.sin(now * 0.002 + particle.phase) + 1) * 0.16;
            const driftX = introMode === 'forming' && !reducedMotion.matches
                ? Math.sin(now * 0.0014 + particle.phase) * 0.65
                : 0;
            const driftY = introMode === 'forming' && !reducedMotion.matches
                ? Math.cos(now * 0.0011 + particle.phase) * 0.45
                : 0;
            const drawX = particle.x + driftX;
            const drawY = particle.y + driftY;
            const size = introMode === 'forming'
                ? Math.min(width >= 1400 ? 1.45 : 1.25, Math.max(0.65, particle.radius * 0.9))
                : particle.radius * (introMode === 'heart'
                    ? (0.76 + (particle.depth + 1) * 0.2) * (particle.isShell ? 1 : 0.8)
                    : 1);
            if (introMode === 'heart' && particle.isShell) {
                const glowAlpha = twinkle * particle.alpha * depthLight * 0.13;
                context.fillStyle = `rgba(255,25,68,${glowAlpha})`;
                context.beginPath();
                context.arc(drawX, drawY, size * 2.5, 0, Math.PI * 2);
                context.fill();
            }
            if (introMode === 'forming') {
                context.fillStyle = `rgba(255,35,112,${twinkle * particle.alpha * 0.16})`;
                context.beginPath();
                context.arc(drawX, drawY, size * 1.8, 0, Math.PI * 2);
                context.fill();
            }
            context.fillStyle = introMode === 'forming'
                ? `rgba(255,226,241,${twinkle * particle.alpha * 0.96})`
                : `rgba(${particle.color}, ${twinkle * particle.alpha * depthLight})`;
            context.beginPath();
            context.arc(drawX, drawY, size, 0, Math.PI * 2);
            context.fill();
            if (introMode === 'heart' && particle.depth > 0.45 && particle.radius > 0.7) {
                context.fillStyle = `rgba(255,229,237,${0.12 * depthLight})`;
                context.beginPath();
                context.arc(particle.x, particle.y, size * 0.42, 0, Math.PI * 2);
                context.fill();
            }
        });
        heartWordParticles.forEach((particle) => {
            if (introMode === 'burst') {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vx *= 0.986;
                particle.vy *= 0.986;
                particle.alpha *= 0.982;
            } else if (introMode === 'forming') {
                particle.alpha *= 0.94;
            }
            if (particle.alpha < 0.025) return;
            const shimmer = reducedMotion.matches ? 0.92 : 0.72 + (Math.sin(now * 0.003 + particle.phase) + 1) * 0.14;
            const wordScale = introMode === 'heart' ? pulse : 1;
            const localZ = Math.sin(now * 0.0008 + particle.phase) * heartScale * 0.12;
            const projectedX = particle.offsetX * Math.cos(angleY) + localZ * Math.sin(angleY);
            const projectedZ = -particle.offsetX * Math.sin(angleY) + localZ * Math.cos(angleY);
            const wordPerspective = 820 / (820 - projectedZ);
            const x = introMode === 'heart'
                ? centerX + projectedX * wordScale * wordPerspective
                : particle.x;
            const y = introMode === 'heart'
                ? heartCenterY + particle.offsetY * wordScale * wordPerspective
                : particle.y;
            const size = particle.radius * (introMode === 'heart' ? (0.78 + (projectedZ / (heartScale * 18) + 1) * 0.12) * pulse : 1);
            context.fillStyle = `rgba(255,48,112,${particle.alpha * shimmer * 0.2})`;
            context.beginPath();
            context.arc(x, y, size * 2.1, 0, Math.PI * 2);
            context.fill();
            context.fillStyle = `rgba(255,229,241,${particle.alpha * shimmer})`;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        });
        context.globalCompositeOperation = 'source-over';
        introParticleFrame = requestAnimationFrame(drawIntroParticles);
    }

    let introParticleLastFrame = 0;
    let introMode = 'heart';

    function resizeAmbientParticles() {
        if (!ambientCanvas || !ambientContext) return;
        const previousWidth = ambientCanvas.width / ambientRatio || window.innerWidth;
        const previousHeight = ambientCanvas.height / ambientRatio || window.innerHeight;
        const width = window.innerWidth;
        const height = window.innerHeight;
        ambientRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        ambientCanvas.width = Math.round(width * ambientRatio);
        ambientCanvas.height = Math.round(height * ambientRatio);
        ambientContext.setTransform(ambientRatio, 0, 0, ambientRatio, 0, 0);
        if (ambientParticles.length) {
            ambientParticles.forEach((particle) => {
                particle.x = (particle.x / previousWidth) * width;
                particle.y = (particle.y / previousHeight) * height;
            });
            return;
        }
        const colors = ['255,45,65', '255,87,96', '255,145,153', '255,225,219', '255,174,102'];
        const count = Math.min(4500, Math.max(1500, Math.round((width * height) / 150)));
        ambientParticles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.32,
            vy: (Math.random() - 0.5) * 0.32,
            radius: 0.28 + Math.random() * 0.72,
            alpha: 0.32 + Math.random() * 0.68,
            phase: Math.random() * Math.PI * 2,
            color: colors[Math.floor(Math.random() * colors.length)]
        }));
    }

    function drawAmbientParticles(now) {
        if (!ambientContext || !ambientCanvas || document.hidden) {
            ambientFrame = null;
            return;
        }
        const width = window.innerWidth;
        const height = window.innerHeight;
        const delta = Math.min((now - (ambientLastFrame || now)) / 16.67, 2);
        ambientLastFrame = now;
        ambientContext.clearRect(0, 0, width, height);
        ambientContext.globalCompositeOperation = 'lighter';
        ambientParticles.forEach((particle) => {
            if (!reducedMotion.matches) {
                particle.x += particle.vx * delta + Math.sin(now * 0.00035 + particle.phase) * 0.12;
                particle.y += particle.vy * delta + Math.cos(now * 0.00031 + particle.phase) * 0.12;
            }
            if (particle.x < -8) particle.x = width + 8;
            if (particle.x > width + 8) particle.x = -8;
            if (particle.y < -8) particle.y = height + 8;
            if (particle.y > height + 8) particle.y = -8;
            const shimmer = reducedMotion.matches ? 0.82 : 0.58 + (Math.sin(now * 0.0018 + particle.phase) + 1) * 0.24;
            ambientContext.fillStyle = `rgba(${particle.color}, ${particle.alpha * shimmer})`;
            ambientContext.beginPath();
            ambientContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ambientContext.fill();
        });
        ambientContext.globalCompositeOperation = 'source-over';
        ambientFrame = requestAnimationFrame(drawAmbientParticles);
    }

    function createTextTargets(lines) {
        if (!introShapeCanvas || !introShapeContext) return [];
        const width = window.innerWidth;
        const height = window.innerHeight;
        const maxTextWidth = Math.max(120, width * 0.92);
        let fontSize = width < 600
            ? Math.min(46, height * 0.082)
            : width >= 1400
                ? Math.min(172, height * 0.16)
                : Math.min(92, height * 0.11);
        if (lines.length === 2) fontSize *= 0.9;
        if (lines.length > 2) fontSize *= 0.82;
        introShapeContext.font = `400 ${fontSize}px "Bangers", Impact, sans-serif`;
        const widestLine = Math.max(...lines.map((line) => introShapeContext.measureText(line).width));
        if (widestLine > maxTextWidth) {
            fontSize *= maxTextWidth / widestLine;
            introShapeContext.font = `400 ${fontSize}px "Bangers", Impact, sans-serif`;
        }

        const lineHeight = fontSize * (width >= 1400 ? 1.28 : 1.22);
        introShapeCanvas.width = Math.ceil(maxTextWidth);
        introShapeCanvas.height = Math.ceil(lineHeight * lines.length + fontSize * 0.4);
        introShapeContext.clearRect(0, 0, introShapeCanvas.width, introShapeCanvas.height);
        introShapeContext.font = `400 ${fontSize}px "Bangers", Impact, sans-serif`;
        introShapeContext.textAlign = 'center';
        introShapeContext.textBaseline = 'middle';
        introShapeContext.fillStyle = '#fff';
        lines.forEach((line, index) => {
            introShapeContext.fillText(line, introShapeCanvas.width / 2, fontSize * 0.35 + lineHeight * (index + 0.5));
        });

        const pixels = introShapeContext.getImageData(0, 0, introShapeCanvas.width, introShapeCanvas.height).data;
        const gap = width < 600 ? 2 : width >= 1400 ? 4 : 3;
        const offsetX = (width - introShapeCanvas.width) / 2;
        const offsetY = (height - introShapeCanvas.height) / 2;
        const targets = [];
        for (let y = 0; y < introShapeCanvas.height; y += gap) {
            for (let x = 0; x < introShapeCanvas.width; x += gap) {
                if (pixels[(y * introShapeCanvas.width + x) * 4 + 3] > 90) {
                    targets.push({ x: offsetX + x, y: offsetY + y, alpha: 1 });
                }
            }
        }
        if (targets.length > introParticles.length) {
            const stride = targets.length / introParticles.length;
            return introParticles.map((_, index) => targets[Math.floor(index * stride)]);
        }
        return targets;
    }

    function switchIntroText(lines) {
        const targets = createTextTargets(lines);
        for (let index = targets.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [targets[index], targets[randomIndex]] = [targets[randomIndex], targets[index]];
        }

        introParticles.forEach((particle, index) => {
            const target = targets[index] || {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                alpha: 0.025
            };
            particle.formFromX = particle.x;
            particle.formFromY = particle.y;
            particle.formStart = performance.now() + Math.random() * 220;
            particle.formDuration = reducedMotion.matches ? 320 : 1250;
            particle.targetX = target.x;
            particle.targetY = target.y;
            particle.targetAlpha = target.alpha;
        });
    }

    function showIntroText(lines) {
        introSequence.classList.add('is-revealed');
        void introParticles?.formText(lines);
    }

    function showFinalIntroText() {
        const lines = window.innerWidth < 600
            ? ['NHỮNG BÔNG HOA', 'TUYỆT VỜI NHẤT', 'CỦA LỚP 11A1 K48']
            : ['NHỮNG BÔNG HOA TUYỆT VỜI NHẤT', 'CỦA LỚP 11A1 K48'];
        showIntroText(lines);
    }

    function startIntro() {
        if (introStarted) return;
        if (!introParticles) {
            finishIntro();
            return;
        }
        introStarted = true;
        introSequence.classList.add('is-burst');
        introParticles?.burst();
        document.querySelector('[data-start-intro]').disabled = true;
        introShapeTimers = [
            setTimeout(() => showIntroText(['CHÚC MỪNG']), reducedMotion.matches ? 100 : 1400),
            setTimeout(() => showIntroText(['NGÀY 20/10']), reducedMotion.matches ? 2000 : 6000),
            setTimeout(showFinalIntroText, reducedMotion.matches ? 4100 : 11600)
        ];
        introTimer = setTimeout(finishIntro, reducedMotion.matches ? 7000 : 17200);
    }

    function resizeMatrix() {
        if (!matrixCanvas || !matrixContext) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        matrixRatio = Math.min(window.devicePixelRatio || 1, 1.6);
        matrixCanvas.width = Math.round(width * matrixRatio);
        matrixCanvas.height = Math.round(height * matrixRatio);
        matrixCanvas.style.width = `${width}px`;
        matrixCanvas.style.height = `${height}px`;
        matrixContext.setTransform(matrixRatio, 0, 0, matrixRatio, 0, 0);
        const fontSize = width < 600 ? 15 : 18;
        const count = Math.min(120, Math.ceil(width / fontSize));
        matrixColumns = Array.from({ length: count }, (_, index) => ({
            x: (index * width) / count,
            y: Math.random() * height,
            speed: 0.55 + Math.random() * 1.5,
            length: 3 + Math.floor(Math.random() * 9),
            depth: 0.18 + Math.random() * 0.42,
            glyph: Math.random() > 0.72 ? '11A1' : '01'
        }));
    }

    function drawMatrix(now) {
        if (!matrixContext || activeScene !== sceneNames.indexOf('matrix')) {
            matrixFrame = null;
            return;
        }
        const width = window.innerWidth;
        const height = window.innerHeight;
        const elapsed = now - matrixStartedAt;
        const delta = Math.min((now - (matrixLastFrame || now)) / 16.67, 2);
        matrixLastFrame = now;
        const intensity = reducedMotion.matches ? 0.25 : (elapsed < 1800 ? 0.95 : elapsed < 3600 ? 0.5 : 0.2);
        matrixContext.fillStyle = 'rgba(18, 13, 22, 0.14)';
        matrixContext.fillRect(0, 0, width, height);
        matrixContext.font = `${width < 600 ? 13 : 15}px monospace`;
        matrixContext.textAlign = 'center';
        matrixColumns.forEach((column, index) => {
            column.y += column.speed * delta;
            if (column.y > height + column.length * 20) column.y = -Math.random() * height * 0.35;
            for (let trail = 0; trail < column.length; trail += 1) {
                const alpha = intensity * column.depth * (1 - trail / column.length);
                matrixContext.fillStyle = trail === 0
                    ? `rgba(255, 240, 246, ${alpha})`
                    : `rgba(255, ${105 + (index % 3) * 25}, ${165 + (index % 3) * 20}, ${alpha})`;
                const chars = column.glyph;
                matrixContext.fillText(chars[Math.floor(Math.random() * chars.length)], column.x, column.y - trail * 18);
            }
        });
        matrixFrame = requestAnimationFrame(drawMatrix);
    }

    function stopMatrix() {
        if (matrixFrame !== null) cancelAnimationFrame(matrixFrame);
        matrixFrame = null;
        if (matrixContext) matrixContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    function startMatrix() {
        stopMatrix();
        if (!matrixCanvas || !matrixContext) return;
        matrixStartedAt = performance.now();
        matrixLastFrame = 0;
        matrixFrame = requestAnimationFrame(drawMatrix);
    }

    function clearBurstTimers() {
        burstTimers.forEach(clearTimeout);
        burstTimers = [];
    }

    function createBurst(x, y, scale = 1) {
        if (!fireworks || reducedMotion.matches) return;
        fireworks.createFirework(x, y, {
            particleCount: Math.round((24 + Math.random() * 14) * scale),
            speed: 1.8 + Math.random() * 1.5,
            size: 2.4 + Math.random() * 1.4,
            gravity: 0.04
        });
    }

    function ensureFireworks() {
        if (fireworks) return;
        fireworks = new window.FireworksEffect();
        fireworks.init('fireworks-canvas', {
            autoCreate: false,
            maxFireworks: 4,
            maxParticles: 140,
            particleCount: { min: 22, max: 34 },
            particleSpeed: { min: 1.5, max: 3.5 },
            particleSize: { min: 2, max: 4 },
            colors: ['hsl(330, 88%, 76%)', 'hsl(350, 88%, 82%)', 'hsl(42, 92%, 76%)', 'hsl(280, 62%, 78%)']
        });
    }

    function launchFinale() {
        ensureFireworks();
        fireworks.resume();
        clearBurstTimers();
        if (reducedMotion.matches) {
            fireworks.createFirework(window.innerWidth / 2, window.innerHeight / 3, { particleCount: 8, speed: 1.2 });
            fireworks.draw();
            return;
        }
        const points = [
            [0.29, 0.32, 0.9],
            [0.7, 0.26, 1],
            [0.5, 0.42, 1.15]
        ];
        points.forEach(([x, y, scale], index) => {
            burstTimers.push(setTimeout(() => createBurst(window.innerWidth * x, window.innerHeight * y, scale), index * 560));
        });
    }

    function stopLetterLoop() {
        if (letterLoopTimer !== null) clearInterval(letterLoopTimer);
        letterLoopTimer = null;
    }

    function startLetterLoop() {
        stopLetterLoop();
        letterScene.classList.add('letter-open');
        if (reducedMotion.matches) return;
        ensureFireworks();
        fireworks.resume();
        const driftBurst = () => {
            if (activeScene !== sceneNames.indexOf('letter') || !envelope.classList.contains('is-open') || document.hidden) return;
            fireworks.createFirework(window.innerWidth * 0.12, window.innerHeight * 0.28, {
                particleCount: 11, speed: 1.1, size: 2.2, gravity: 0.025, hue: 330
            });
            fireworks.createFirework(window.innerWidth * 0.88, window.innerHeight * 0.24, {
                particleCount: 11, speed: 1.1, size: 2.2, gravity: 0.025, hue: 42
            });
        };
        driftBurst();
        letterLoopTimer = setInterval(driftBurst, 2600);
    }

    function prepareCharacterReveal(targets) {
        if (reducedMotion.matches) return 0;
        let lineIndex = 0;
        let revealDuration = 0;

        targets.forEach((element) => {
            if (element.dataset.characterReveal === 'true') {
                const count = Number(element.dataset.characterCount || 0);
                element.querySelectorAll('.reveal-char').forEach((glyph, index) => {
                    glyph.style.setProperty('--char-delay', `${lineIndex * 140 + index * 17}ms`);
                });
                revealDuration = Math.max(revealDuration, lineIndex * 140 + Math.max(0, count - 1) * 17 + 360);
                lineIndex += 1;
                return;
            }

            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
            const textNodes = [];
            const labelParts = [];
            while (walker.nextNode()) {
                const node = walker.currentNode;
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.nodeName === 'BR') labelParts.push(' ');
                    continue;
                }
                const textNode = node;
                if (!textNode.parentElement?.closest('[aria-hidden="true"]')) {
                    textNodes.push(textNode);
                    labelParts.push(textNode.textContent || '');
                }
            }
            const label = labelParts.join('');
            if (!label.trim()) return;

            let count = 0;
            let characterIndex = 0;
            textNodes.forEach((textNode) => {
                const run = document.createElement('span');
                run.className = 'reveal-run';
                run.setAttribute('aria-hidden', 'true');
                let word = document.createElement('span');
                word.className = 'reveal-word';
                Array.from(textNode.textContent || '').forEach((character) => {
                    if (!character.trim()) {
                        if (word.childNodes.length) {
                            run.append(word);
                            word = document.createElement('span');
                            word.className = 'reveal-word';
                        }
                    }
                    const glyph = document.createElement('span');
                    glyph.className = 'reveal-char';
                    if (!character.trim()) glyph.classList.add('reveal-char--space');
                    glyph.setAttribute('aria-hidden', 'true');
                    glyph.style.setProperty('--char-delay', `${lineIndex * 140 + characterIndex * 17}ms`);
                    glyph.textContent = character;
                    if (character.trim()) word.append(glyph);
                    else run.append(glyph);
                    characterIndex += 1;
                    count += 1;
                });
                if (word.childNodes.length) run.append(word);
                textNode.replaceWith(run);
            });
            const readerText = document.createElement('span');
            readerText.className = 'reveal-reader';
            readerText.textContent = label.trim();
            element.append(readerText);
            element.dataset.characterReveal = 'true';
            element.dataset.characterCount = String(count);
            revealDuration = Math.max(revealDuration, lineIndex * 140 + Math.max(0, count - 1) * 17 + 360);
            lineIndex += 1;
        });

        return revealDuration;
    }

    function prepareSceneText(scene) {
        const targets = scene.querySelectorAll(
            '.scene-content .eyebrow, .scene-content p, .scene-content h1, .scene-content h2, .scene-content h3, .scene-content .button, .letter-heading .eyebrow, .letter-heading h2, .letter-controls .button'
        );
        return prepareCharacterReveal(targets);
    }

    function populateGardens() {
        document.querySelectorAll('.scene-garden').forEach((garden) => {
            if (garden.dataset.expanded === 'true') return;
            const template = garden.querySelector('.flower--3');
            if (!template) return;
            const flowerCount = garden.closest('.scene--closing') ? 15 : 9;
            for (let index = 1; index <= flowerCount; index += 1) {
                const flower = template.cloneNode(true);
                flower.classList.remove('flower--3');
                flower.classList.add('garden-extra', `garden-extra--${index}`);
                garden.append(flower);
            }
            garden.dataset.expanded = 'true';
        });
    }

    function enterScene(scene) {
        scenes.forEach((item) => {
            item.classList.remove('is-entering');
            item.querySelector('.scene-garden')?.classList.remove('garden-blooming');
        });
        if (sceneRevealTimer !== null) clearTimeout(sceneRevealTimer);
        const textRevealDuration = prepareSceneText(scene);
        scene.classList.add('is-entering');
        const garden = scene.querySelector('.scene-garden');
        if (garden) {
            garden.classList.remove('garden-blooming');
            garden.classList.add('garden-reset');
            void garden.offsetWidth;
            garden.classList.remove('garden-reset');
            garden.classList.add('garden-blooming');
        }
        sceneRevealTimer = setTimeout(() => {
            scene.classList.remove('is-entering');
            sceneRevealTimer = null;
        }, reducedMotion.matches ? 50 : Math.max(900, textRevealDuration));
    }

    function finishIntro() {
        if (introTimer !== null) clearTimeout(introTimer);
        introShapeTimers.forEach(clearTimeout);
        introShapeTimers = [];
        introTimer = null;
        introParticles?.explodeOut();
        introSequence.classList.add('is-transitioning', 'is-done');
        document.body.classList.remove('intro-playing');
        document.body.classList.add('intro-transitioning');
        const revealPoster = () => {
            if (introRevealTimer !== null) clearTimeout(introRevealTimer);
            if (sceneRevealTimer !== null) clearTimeout(sceneRevealTimer);
            introRevealTimer = null;
            introParticles?.dispose();
            introParticles = null;
            document.body.classList.remove('intro-transitioning');
            document.body.classList.add('intro-revealed');
        };
        introSequence.addEventListener('animationend', (event) => {
            if (event.target === introSequence && event.animationName === 'intro-explosion-out') revealPoster();
        }, { once: true });
        introRevealTimer = setTimeout(revealPoster, reducedMotion.matches ? 50 : 1550);
    }

    function showScene(target, options = {}) {
        const nextIndex = typeof target === 'number' ? target : sceneNames.indexOf(target);
        if (nextIndex < 0 || nextIndex >= scenes.length || nextIndex === activeScene) return;
        if (scenes[activeScene].id === 'letter' && !envelope.classList.contains('is-closed')) openLetter(false, true);
        stopMatrix();
        clearBurstTimers();
        stopLetterLoop();
        if (fireworks) fireworks.pause();
        if (!options.initial) {
            wash.classList.remove('is-flashing');
            void wash.offsetWidth;
            wash.classList.add('is-flashing');
        }
        scenes[activeScene].classList.remove('is-active');
        scenes[activeScene].setAttribute('aria-hidden', 'true');
        scenes[activeScene].inert = true;
        activeScene = nextIndex;
        const scene = scenes[activeScene];
        scene.inert = false;
        scene.setAttribute('aria-hidden', 'false');
        scene.classList.add('is-active');
        enterScene(scene);
        document.querySelector('.scene-progress').textContent = `${String(activeScene + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
        document.querySelector('[data-back]').disabled = activeScene === 0;
        document.querySelector('[data-forward]').disabled = activeScene === scenes.length - 1;
        if (scene.id === 'matrix') startMatrix();
        if (scene.id === 'fireworks') launchFinale();
        if (options.focus !== false) scene.querySelector('h1, h2')?.focus({ preventScroll: true });
    }

    function setLetterPage(index) {
        const pages = [...document.querySelectorAll('.letter-page')];
        const previousPageIndex = pageIndex;
        pageIndex = Math.max(0, Math.min(index, pages.length - 1));
        pages.forEach((page, position) => {
            const current = position === pageIndex;
            page.hidden = !current;
            page.classList.toggle('is-current', current);
            page.classList.remove('is-revealing');
        });
        if (pageIndex !== previousPageIndex && !reducedMotion.matches) {
            const currentPage = pages[pageIndex];
            const revealDuration = prepareCharacterReveal(currentPage.querySelectorAll('h3, p'));
            currentPage.classList.remove('is-revealing');
            void currentPage.offsetWidth;
            currentPage.classList.add('is-revealing');
            if (revealDuration) setTimeout(() => currentPage.classList.remove('is-revealing'), revealDuration);
        }
        document.querySelector('.page-count').textContent = `${String(pageIndex + 1).padStart(2, '0')} / ${String(pages.length).padStart(2, '0')}`;
        document.querySelector('[data-page-prev]').disabled = pageIndex === 0;
        document.querySelector('[data-page-next]').disabled = pageIndex === pages.length - 1;
        document.querySelector('.letter-scroll').scrollTop = 0;
    }

    function openLetter(open, instant = false) {
        if (letterTransitionTimer !== null) clearTimeout(letterTransitionTimer);
        letterTransitionTimer = null;

        const sealButton = document.querySelector('[data-open-letter]');
        const closeButton = document.querySelector('[data-close-letter]');
        const pageButtons = document.querySelectorAll('[data-page-prev], [data-page-next]');
        const transitionClasses = ['is-opening', 'is-paper-rising', 'is-paper-settling', 'is-paper-returning', 'is-paper-entering', 'is-closing'];
        const clearTransitionClasses = () => transitionClasses.forEach((className) => envelope.classList.remove(className));

        pageButtons.forEach((button) => { button.disabled = true; });
        sealButton.disabled = true;
        sealButton.setAttribute('aria-hidden', 'true');
        sealButton.tabIndex = -1;
        closeButton.hidden = true;

        if (instant || reducedMotion.matches) {
            clearTransitionClasses();
            envelope.classList.toggle('is-open', open);
            envelope.classList.toggle('is-closed', !open);
            envelope.setAttribute('aria-label', open ? 'Lá thư đã mở' : 'Phong thư đang đóng');
            if (open) {
                closeButton.hidden = false;
                startLetterLoop();
                setLetterPage(pageIndex);
                document.querySelector('.letter-scroll').focus({ preventScroll: true });
            } else {
                letterScene.classList.remove('letter-open');
                stopLetterLoop();
                if (fireworks) fireworks.pause();
                setLetterPage(pageIndex);
                sealButton.disabled = false;
                sealButton.setAttribute('aria-hidden', 'false');
                sealButton.tabIndex = 0;
            }
            return;
        }

        envelope.classList.remove('is-open', 'is-closed');
        clearTransitionClasses();
        if (open) {
            envelope.setAttribute('aria-label', 'Đang mở thư');
            envelope.classList.add('is-opening');
            letterTransitionTimer = setTimeout(() => {
                envelope.classList.replace('is-opening', 'is-paper-rising');
                letterTransitionTimer = setTimeout(() => {
                    envelope.classList.replace('is-paper-rising', 'is-paper-settling');
                    letterTransitionTimer = setTimeout(() => {
                        envelope.classList.remove('is-paper-settling');
                        envelope.classList.add('is-open');
                        envelope.setAttribute('aria-label', 'Lá thư đã mở');
                        closeButton.hidden = false;
                        startLetterLoop();
                        setLetterPage(pageIndex);
                        document.querySelector('.letter-scroll').focus({ preventScroll: true });
                        letterTransitionTimer = null;
                    }, letterPaperSettleDuration);
                }, letterPaperDuration + letterPaperTransitionDelay);
            }, letterPaperLeadIn);
            return;
        }

        envelope.setAttribute('aria-label', 'Đang đóng thư');
        letterScene.classList.remove('letter-open');
        stopLetterLoop();
        if (fireworks) fireworks.pause();
        envelope.classList.add('is-paper-returning');
        letterTransitionTimer = setTimeout(() => {
            envelope.classList.replace('is-paper-returning', 'is-paper-entering');
            letterTransitionTimer = setTimeout(() => {
                envelope.classList.replace('is-paper-entering', 'is-closing');
                letterTransitionTimer = setTimeout(() => {
                    envelope.classList.remove('is-closing');
                    envelope.classList.add('is-closed');
                    envelope.setAttribute('aria-label', 'Phong thư đang đóng');
                    sealButton.disabled = false;
                    sealButton.setAttribute('aria-hidden', 'false');
                    sealButton.tabIndex = 0;
                    sealButton.focus({ preventScroll: true });
                    setLetterPage(pageIndex);
                    letterTransitionTimer = null;
                }, letterFlapCloseDelay + letterFlapDuration + 60);
            }, letterPaperDuration + 100);
        }, letterPaperReturnDuration);
    }

    document.addEventListener('click', (event) => {
        const go = event.target.closest('[data-go]');
        if (go) showScene(go.dataset.go);
        if (event.target.closest('[data-back]')) showScene(activeScene - 1);
        if (event.target.closest('[data-forward]')) showScene(activeScene + 1);
        if (event.target.closest('[data-open-letter]')) openLetter(true);
        else if (event.target.closest('#envelope.is-closed') && !event.target.closest('button')) openLetter(true);
        if (event.target.closest('[data-close-letter]')) openLetter(false);
        if (event.target.closest('[data-page-prev]')) setLetterPage(pageIndex - 1);
        if (event.target.closest('[data-page-next]')) setLetterPage(pageIndex + 1);
        if (event.target.closest('[data-start-intro]')) startIntro();
    });

    document.addEventListener('keydown', (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'Escape' && envelope.classList.contains('is-open')) {
            openLetter(false);
            return;
        }
        const target = event.target;
        if (target instanceof HTMLElement && (target.isContentEditable || target.closest('button, a, input, textarea, select, [tabindex="0"]'))) return;
        if (event.key === 'ArrowRight') showScene(activeScene + 1);
        if (event.key === 'ArrowLeft') showScene(activeScene - 1);
    });

    scenes.forEach((scene) => {
        const heading = scene.querySelector('h1, h2');
        if (heading) heading.tabIndex = -1;
    });
    matrixContext = matrixCanvas?.getContext('2d', { alpha: true }) || null;
    resizeMatrix();
    resizeAmbientParticles();
    ambientFrame = requestAnimationFrame(drawAmbientParticles);
    window.addEventListener('resize', () => {
        resizeMatrix();
        resizeAmbientParticles();
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopMatrix();
        else if (scenes[activeScene]?.id === 'matrix') startMatrix();
        if (!document.hidden && ambientFrame === null) ambientFrame = requestAnimationFrame(drawAmbientParticles);
    });
    window.addEventListener('pagehide', () => {
        stopMatrix();
        clearBurstTimers();
        stopLetterLoop();
        if (introTimer !== null) clearTimeout(introTimer);
        if (introRevealTimer !== null) clearTimeout(introRevealTimer);
        introShapeTimers.forEach(clearTimeout);
        introParticles?.dispose();
        if (ambientFrame !== null) cancelAnimationFrame(ambientFrame);
        fireworks?.destroy();
    }, { once: true });

    const requestedScene = window.location.hash.slice(1);
    const initialScene = sceneNames.includes(requestedScene) ? sceneNames.indexOf(requestedScene) : 0;
    activeScene = initialScene;
    if (activeScene === 0) {
        document.body.classList.add('intro-playing');
        try {
            if (!introParticleCanvas) throw new Error('Intro particle container is missing.');
            introParticles = new IntroParticleRenderer(introParticleCanvas, reducedMotion.matches);
        } catch (error) {
            console.error('Unable to initialize the WebGL 2 particle intro.', error);
            document.querySelector('[data-intro-error]').hidden = false;
        }
    } else {
        document.body.classList.remove('intro-playing');
        document.body.classList.remove('intro-transitioning');
        document.body.classList.add('intro-revealed');
        introSequence.classList.add('is-done');
    }
    scenes.forEach((scene, index) => {
        const active = index === activeScene;
        scene.classList.toggle('is-active', active);
        scene.inert = !active;
        scene.setAttribute('aria-hidden', String(!active));
    });
    populateGardens();
    if (activeScene > 0) enterScene(scenes[activeScene]);
    document.querySelector('.scene-progress').textContent = `${String(activeScene + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
    document.querySelector('[data-back]').disabled = activeScene === 0;
    document.querySelector('[data-forward]').disabled = activeScene === scenes.length - 1;
    setLetterPage(0);
    if (scenes[activeScene].id === 'matrix') startMatrix();
    if (scenes[activeScene].id === 'fireworks') launchFinale();
})();