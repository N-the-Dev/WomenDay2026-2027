import * as THREE from 'three';

const vertexShader = `
uniform vec2 uResolution;
uniform float uTime;
uniform float uMode;
uniform float uBurstStart;
uniform float uFormStart;
uniform float uHeartWidth;
uniform float uHeartHeight;
uniform float uHeartDepth;
uniform float uPixelRatio;
uniform float uReducedMotion;
uniform float uIsLabel;
uniform float uIsBackground;

attribute vec3 aHeart;
attribute vec3 aVelocity;
attribute vec3 aColor;
attribute vec2 aTarget;
attribute vec2 aFrom;
attribute float aSize;
attribute float aSeed;
attribute float aTargetAlpha;
attribute float aFromAlpha;

varying vec3 vColor;
varying float vAlpha;
varying float vSeed;
varying float vBeat;
varying float vIsText;
varying float vIsBackground;
varying vec2 vTrailDirection;
varying float vTrailPixels;
varying float vBasePointSize;
varying float vRenderedPointSize;

vec3 rotateHeart(vec3 point, float angleX, float angleY) {
    float cosY = cos(angleY);
    float sinY = sin(angleY);
    float cosX = cos(angleX);
    float sinX = sin(angleX);
    vec3 turnedY = vec3(
        point.x * cosY + point.z * sinY,
        point.y,
        -point.x * sinY + point.z * cosY
    );
    return vec3(
        turnedY.x,
        turnedY.y * cosX - turnedY.z * sinX,
        turnedY.y * sinX + turnedY.z * cosX
    );
}

vec4 screenPosition(vec2 point, float depth) {
    return vec4(
        point.x / uResolution.x * 2.0 - 1.0,
        1.0 - point.y / uResolution.y * 2.0,
        depth,
        1.0
    );
}

void main() {
    vec2 trailVelocity = vec2(0.0);
    if (uIsBackground > 0.5) {
        float driftTime = uTime * (0.12 + abs(aVelocity.x) * 0.06);
        vec2 drift = vec2(
            sin(driftTime + aSeed) * 0.035 + aVelocity.x * uTime * 0.004,
            cos(driftTime * 0.73 + aSeed) * 0.045 + aVelocity.y * uTime * 0.003
        );
        float driftRate = 0.12 + abs(aVelocity.x) * 0.06;
        trailVelocity = vec2(
            cos(driftTime + aSeed) * 0.035 * driftRate + aVelocity.x * 0.004,
            -sin(driftTime * 0.73 + aSeed) * 0.045 * 0.73 * driftRate + aVelocity.y * 0.003
        ) * uResolution;
        vec2 backgroundScreen = fract(aHeart.xy + drift) * uResolution;
        vColor = mix(aColor, vec3(1.0, 0.12, 0.38), 0.38);
        vAlpha = 0.72 + 0.22 * (0.5 + 0.5 * sin(uTime + aSeed));
        vSeed = aSeed;
        float sparkle = smoothstep(2.2, 3.2, aSize);
        vBeat = sparkle * (0.55 + 0.45 * sin(uTime * 2.1 + aSeed));
        vIsText = 0.0;
        vIsBackground = 1.0;
        float basePointSize = clamp(aSize * uPixelRatio * 1.5, 1.5, 7.0);
        float speed = length(trailVelocity);
        vTrailDirection = speed > 0.001 ? trailVelocity / speed : vec2(0.0);
        vTrailPixels = uReducedMotion > 0.5 ? 0.0
            : min(24.0, max(0.0, speed - 72.0) * 0.022) * uPixelRatio;
        vBasePointSize = basePointSize;
        gl_Position = screenPosition(backgroundScreen, 0.0);
        gl_PointSize = clamp(basePointSize + vTrailPixels, 1.5, 48.0);
        vRenderedPointSize = gl_PointSize;
        return;
    }

    float beatPhase = mod(uTime * 1.12, 1.0);
    float beat = exp(-pow((beatPhase - 0.16) / 0.055, 2.0))
        + 0.68 * exp(-pow((beatPhase - 0.35) / 0.075, 2.0));
    float pulse = 1.0 + beat * 0.105;
    float turnY = uReducedMotion > 0.5 ? 0.1 : sin(uTime * 0.28) * 0.3;
    float turnX = uReducedMotion > 0.5 ? 0.04 : sin(uTime * 0.2 + 1.0) * 0.1;

    vec3 heartPoint = uIsLabel > 0.5
        ? aHeart
        : vec3(aHeart.xy * vec2(uHeartWidth, uHeartHeight), aHeart.z * uHeartDepth);
    heartPoint.xy *= pulse;
    vec3 rotatedHeart = rotateHeart(heartPoint, turnX, turnY);
    float heartPerspective = 1120.0 / max(400.0, 1120.0 - rotatedHeart.z);
    vec2 heartScreen = vec2(uResolution.x * 0.5, uResolution.y * 0.44)
        + rotatedHeart.xy * heartPerspective;

    float burstAge = max(0.0, uTime - uBurstStart);
    float burstDistance = (1.0 - exp(-burstAge * 1.45)) * max(uResolution.x, uResolution.y) * 1.2;
    vec3 burstDirection = normalize(aVelocity + vec3(0.0001));
    vec2 burstScreen = heartScreen + burstDirection.xy * burstDistance;
    burstScreen.y += burstAge * burstAge * 20.0;

    float formDuration = uReducedMotion > 0.5 ? 0.55 : 1.6;
    float formProgress = clamp((uTime - uFormStart) / formDuration, 0.0, 1.0);
    float formEase = formProgress * formProgress * formProgress
        * (formProgress * (formProgress * 6.0 - 15.0) + 10.0);
    vec2 screen = heartScreen;
    float alpha = 1.0;

    if (uMode > 0.5 && uMode < 1.5) {
        screen = burstScreen;
        if (uIsLabel > 0.5) {
            alpha = exp(-burstAge * 1.5);
        }
    } else if (uMode > 4.5 && uMode < 5.5) {
        float blastProgress = clamp((uTime - uFormStart) / 1.4, 0.0, 1.0);
        float blastEase = blastProgress * blastProgress * (3.0 - 2.0 * blastProgress);
        vec2 center = uResolution * 0.5;
        vec2 textOffset = aTarget - center;
        vec2 burstDirection = normalize(textOffset + aVelocity.xy * max(uResolution.x, uResolution.y) * 0.08 + vec2(0.0001));
        float shockwave = smoothstep(0.12, 0.58, blastEase);
        screen = aTarget
            + burstDirection * max(uResolution.x, uResolution.y) * shockwave * 1.12
            + aVelocity.xy * blastEase * 42.0;
        alpha = aTargetAlpha * (1.0 - smoothstep(0.28, 0.78, blastProgress));
    } else if (uMode > 3.5) {
        float scatterDuration = uReducedMotion > 0.5 ? 0.4 : 0.9;
        float scatterProgress = clamp((uTime - uFormStart) / scatterDuration, 0.0, 1.0);
        float scatterEase = scatterProgress * scatterProgress * (3.0 - 2.0 * scatterProgress);
        vec2 scatterDirection = normalize(aVelocity.xy + vec2(0.0001));
        screen = aTarget + scatterDirection * max(uResolution.x, uResolution.y) * 0.34 * scatterEase;
        alpha = aTargetAlpha * (1.0 - smoothstep(0.32, 1.0, scatterProgress));
    } else if (uMode > 1.5) {
        vec2 formOrigin = uMode < 2.5 ? burstScreen : aFrom;
        vec2 formTarget = aTargetAlpha > 0.5
            ? aTarget
            : (uMode < 2.5 ? burstScreen : aFrom);
        screen = mix(formOrigin, formTarget, formEase);
        alpha = mix(uMode < 2.5 ? 1.0 : aFromAlpha, aTargetAlpha, formEase);
        if (uIsLabel > 0.5) {
            alpha *= 1.0 - formEase;
        }
        float idleMotion = 1.0 - formEase * 0.72;
        float drift = uReducedMotion > 0.5 ? 0.0 : sin(uTime * 1.4 + aSeed) * 1.4 * idleMotion;
        screen += vec2(drift, cos(uTime * 1.15 + aSeed) * 0.8 * idleMotion);
    }

    float textExtrusion = smoothstep(
        formDuration,
        formDuration + (uReducedMotion > 0.5 ? 0.2 : 0.55),
        uTime - uFormStart
    );
    float textDepth = aHeart.z * 26.0 * textExtrusion;
    if (uMode > 1.5) {
        screen += vec2(textDepth * 0.32, -textDepth * 0.2);
    }
    vec3 textColor = vec3(1.0);
    vec3 heartColor = mix(aColor, vec3(1.0, 0.08, 0.3), beat * 0.8);
    vColor = uIsLabel > 0.5 ? vec3(1.0, 0.91, 0.96)
        : uMode > 1.5 ? textColor : heartColor;
    vAlpha = alpha * (0.94 + 0.06 * sin(uTime * 2.2 + aSeed));
    vSeed = aSeed;
    float sweepStart = formDuration + (uReducedMotion > 0.5 ? 0.2 : 0.55);
    float sweepDuration = uReducedMotion > 0.5 ? 0.45 : 0.95;
    float sweepProgress = clamp((uTime - uFormStart - sweepStart) / sweepDuration, 0.0, 1.0);
    float textSweep = exp(-pow((aTarget.x / uResolution.x - (sweepProgress * 1.38 - 0.16)) * 15.0, 2.0));
    float textPulse = uTime - uFormStart < sweepStart
        ? 0.06
        : sweepProgress < 1.0
            ? textSweep * 0.72
            : 0.07 + 0.055 * (0.5 + 0.5 * sin(uTime * 1.8 + aSeed));
    vBeat = uMode < 0.5 ? beat : (uMode > 1.5 ? textPulse : 0.0);
    vIsText = uMode > 1.5 && uIsLabel < 0.5 ? 1.0 : 0.0;
    vIsBackground = 0.0;

    float depthScale = uMode < 0.5 ? heartPerspective : 1.0;
    gl_Position = screenPosition(screen, uMode < 0.5 ? clamp(rotatedHeart.z / 1800.0, -0.8, 0.8) : 0.0);
    float textScale = uIsLabel > 0.5 ? 1.5 : (uMode > 1.5 ? 1.65 : 1.0);
    float beatScale = uMode < 0.5 ? 1.0 + beat * 0.48 : 1.0 + textPulse * 0.22;
    float blastScale = uMode > 4.5 ? 1.0 + clamp((uTime - uFormStart) / 1.4, 0.0, 1.0) * 1.6 : 1.0;
    if (uReducedMotion < 0.5) {
        float maxDimension = max(uResolution.x, uResolution.y);
        if (uMode > 0.5 && uMode < 1.5) {
            float burstAge = max(0.0, uTime - uBurstStart);
            float burstSpeed = exp(-burstAge * 1.45) * 1.45 * maxDimension * 1.2;
            trailVelocity = normalize(aVelocity.xy + vec2(0.0001)) * burstSpeed
                + vec2(0.0, burstAge * 40.0);
        } else if (uMode > 4.5) {
            float blastProgress = clamp((uTime - uFormStart) / 1.4, 0.0, 1.0);
            float blastEase = blastProgress * blastProgress * (3.0 - 2.0 * blastProgress);
            float easeSpeed = 6.0 * blastProgress * (1.0 - blastProgress) / 1.4;
            vec2 center = uResolution * 0.5;
            vec2 textOffset = aTarget - center;
            vec2 blastDirection = normalize(textOffset
                + aVelocity.xy * maxDimension * 0.08 + vec2(0.0001));
            float waveProgress = clamp((blastEase - 0.12) / 0.46, 0.0, 1.0);
            float waveSpeed = 6.0 * waveProgress * (1.0 - waveProgress) / 0.46 * easeSpeed;
            trailVelocity = blastDirection * maxDimension * 1.12 * waveSpeed
                + aVelocity.xy * 42.0 * easeSpeed;
        } else if (uMode > 3.5) {
            float scatterDuration = uReducedMotion > 0.5 ? 0.4 : 0.9;
            float scatterProgress = clamp((uTime - uFormStart) / scatterDuration, 0.0, 1.0);
            float scatterSpeed = 6.0 * scatterProgress * (1.0 - scatterProgress) / scatterDuration;
            vec2 scatterDirection = normalize(aVelocity.xy + vec2(0.0001));
            trailVelocity = scatterDirection * maxDimension * 0.34 * scatterSpeed;
        } else if (uMode > 1.5) {
            float formDuration = uReducedMotion > 0.5 ? 0.55 : 1.6;
            float formProgress = clamp((uTime - uFormStart) / formDuration, 0.0, 1.0);
            float formSpeed = 30.0 * formProgress * formProgress
                * (1.0 - formProgress) * (1.0 - formProgress) / formDuration;
            vec2 formOrigin = uMode < 2.5 ? burstScreen : aFrom;
            vec2 formTarget = aTargetAlpha > 0.5
                ? aTarget
                : (uMode < 2.5 ? burstScreen : aFrom);
            trailVelocity = (formTarget - formOrigin) * formSpeed;
        } else {
            float sampleDelta = 0.016;
            float previousBeatPhase = mod(max(0.0, uTime - sampleDelta) * 1.12, 1.0);
            float previousBeat = exp(-pow((previousBeatPhase - 0.16) / 0.055, 2.0))
                + 0.68 * exp(-pow((previousBeatPhase - 0.35) / 0.075, 2.0));
            float previousPulse = 1.0 + previousBeat * 0.105;
            float previousTurnY = sin((uTime - sampleDelta) * 0.28) * 0.3;
            float previousTurnX = sin((uTime - sampleDelta) * 0.2 + 1.0) * 0.1;
            vec3 previousHeart = heartPoint / pulse * previousPulse;
            vec3 previousRotatedHeart = rotateHeart(previousHeart, previousTurnX, previousTurnY);
            float previousPerspective = 1120.0 / max(400.0, 1120.0 - previousRotatedHeart.z);
            vec2 previousScreen = vec2(uResolution.x * 0.5, uResolution.y * 0.44)
                + previousRotatedHeart.xy * previousPerspective;
            trailVelocity = (heartScreen - previousScreen) / sampleDelta;
        }
    }
    float basePointSize = clamp(aSize * uPixelRatio * depthScale * textScale * beatScale * blastScale, 1.5, 18.0);
    float speed = length(trailVelocity);
    vTrailDirection = speed > 0.001 ? trailVelocity / speed : vec2(0.0);
    vTrailPixels = uReducedMotion > 0.5 ? 0.0
        : min(30.0, max(0.0, speed - 72.0) * 0.022) * uPixelRatio;
    vBasePointSize = basePointSize;
    gl_PointSize = clamp(basePointSize + vTrailPixels, 1.5, 48.0);
    vRenderedPointSize = gl_PointSize;
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uIsLabel;

varying vec3 vColor;
varying float vAlpha;
varying float vSeed;
varying float vBeat;
varying float vIsText;
varying float vIsBackground;
varying vec2 vTrailDirection;
varying float vTrailPixels;
varying float vBasePointSize;
varying float vRenderedPointSize;

void main() {
    vec2 point = gl_PointCoord - 0.5;
    float pointDistance = length(point);
    if (pointDistance > 0.72) discard;
    vec2 particlePoint = point * (vRenderedPointSize / max(vBasePointSize, 1.0));
    float radius = length(particlePoint) * 2.0;

    float core = 1.0 - smoothstep(0.12, 0.72, radius);
    float halo = exp(-radius * 4.8) * (1.0 - core * 0.45);
    float flicker = 0.9 + 0.1 * sin(uTime * 3.0 + vSeed);
    vec2 screenPoint = vec2(point.x, -point.y) * vRenderedPointSize;
    vec2 trailPerpendicular = vec2(-vTrailDirection.y, vTrailDirection.x);
    float coreRadius = max(vBasePointSize * 0.5, 0.75);
    float trailBehind = -dot(screenPoint, vTrailDirection) - coreRadius;
    float trailAcross = abs(dot(screenPoint, trailPerpendicular));
    float trailProgress = clamp(trailBehind / max(vTrailPixels, 1.0), 0.0, 1.0);
    float trailWidth = max(0.0, coreRadius * 0.72 * (1.0 - trailProgress));
    float trail = step(0.5, vTrailPixels) * step(0.0, trailBehind)
        * (1.0 - smoothstep(trailWidth * 0.4, trailWidth + 1.0, trailAcross))
        * exp(-trailProgress * 3.2);
    if (vIsBackground > 0.5) {
        float rayX = exp(-abs(point.x) * 30.0) * exp(-abs(point.y) * 3.2);
        float rayY = exp(-abs(point.y) * 30.0) * exp(-abs(point.x) * 3.2);
        float rays = max(rayX, rayY) * vBeat;
        vec3 sparkleColor = mix(vColor, vec3(1.0, 0.9, 0.92), max(vBeat * 0.72, trail * 0.82));
        float backgroundAlpha = vAlpha * flicker
            * clamp(core * 0.65 + halo * 0.42 + rays * 0.7 + trail * 0.95, 0.0, 1.0);
        gl_FragColor = vec4(sparkleColor, backgroundAlpha);
        return;
    }
    if (vIsText > 0.5) {
        float outline = exp(-pow((radius - 0.48) / 0.32, 2.0));
        vec3 red = vec3(1.0, 0.015, 0.055);
        vec3 neon = mix(red, vec3(1.0), core);
        float alpha = vAlpha * flicker
            * clamp(core * 1.08 + halo * 0.28 + outline * 0.62 + trail * 0.9, 0.0, 1.0);
        gl_FragColor = vec4(neon, alpha);
        return;
    }
    vec3 neon = mix(vColor, vec3(1.0, 0.76, 0.86), core * 0.76);
    neon = mix(neon, vec3(1.0, 0.08, 0.3), clamp(vBeat * 0.38, 0.0, 0.62));
    neon = mix(neon, vec3(1.0, 0.72, 0.82), trail * 0.78);
    float glow = halo * (0.55 + vBeat * 2.2);
    float alpha = vAlpha * flicker * clamp(core * 0.96 + glow + trail * 1.1, 0.0, 1.0);

    gl_FragColor = vec4(neon, alpha);
}
`;

interface TextTarget {
    x: number;
    y: number;
}

interface ParticleBuffers {
    geometry: THREE.BufferGeometry;
    count: number;
    target: Float32Array;
    targetAlpha: Float32Array;
    from: Float32Array;
    fromAlpha: Float32Array;
}

export class IntroParticleRenderer {
    private readonly renderer: THREE.WebGLRenderer;
    private readonly scene = new THREE.Scene();
    private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    private readonly heart: ParticleBuffers;
    private readonly label: ParticleBuffers;
    private readonly background: THREE.BufferGeometry;
    private readonly materials: THREE.ShaderMaterial[];
    private readonly resizeObserver: ResizeObserver;
    private readonly fontReady: Promise<FontFace[]>;
    private animationFrame: number | null = null;
    private elapsedTime = 0;
    private lastFrameTime: number | null = null;
    private mode = 0;
    private didFormText = false;
    private disposed = false;
    private textGeneration = 0;
    private currentText: string[] | null = null;

    constructor(
        private readonly container: HTMLElement,
        private readonly reducedMotion: boolean
    ) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('webgl2', {
            alpha: true,
            antialias: false,
            powerPreference: 'high-performance',
            premultipliedAlpha: false
        });
        if (!context) {
            throw new Error('WebGL 2 is unavailable; the particle intro cannot start.');
        }

        this.renderer = new THREE.WebGLRenderer({
            canvas,
            context,
            alpha: true,
            antialias: false,
            powerPreference: 'high-performance',
            premultipliedAlpha: false
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        this.renderer.setSize(window.innerWidth, window.innerHeight, false);
        this.renderer.setClearColor(0x000000, 0);
        this.camera.position.z = 1;
        this.container.replaceChildren(canvas);

        const uniforms = {
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uTime: { value: 0 },
            uMode: { value: 0 },
            uBurstStart: { value: 0 },
            uFormStart: { value: 0 },
            uHeartWidth: { value: Math.min(Math.min(window.innerWidth, window.innerHeight) * 0.33, 450) },
            uHeartHeight: { value: Math.min(Math.min(window.innerWidth, window.innerHeight) * 0.41, 510) },
            uHeartDepth: { value: Math.min(window.innerWidth, window.innerHeight) * 0.2 },
            uPixelRatio: { value: this.renderer.getPixelRatio() },
            uReducedMotion: { value: reducedMotion ? 1 : 0 },
            uIsLabel: { value: 0 },
            uIsBackground: { value: 0 }
        };

        this.heart = this.createHeartGeometry();
        this.label = this.createLabelGeometry();
        this.background = this.createBackgroundGeometry();
        this.materials = [false, true, false].map((isLabel, index) => {
            const material = new THREE.ShaderMaterial({
                uniforms: THREE.UniformsUtils.clone(uniforms),
                vertexShader,
                fragmentShader,
                transparent: true,
                depthTest: false,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            material.uniforms.uIsLabel.value = isLabel ? 1 : 0;
            material.uniforms.uIsBackground.value = index === 2 ? 1 : 0;
            return material;
        });

        const heartPoints = new THREE.Points(this.heart.geometry, this.materials[0]);
        const labelPoints = new THREE.Points(this.label.geometry, this.materials[1]);
        const backgroundPoints = new THREE.Points(this.background, this.materials[2]);
        heartPoints.frustumCulled = false;
        labelPoints.frustumCulled = false;
        backgroundPoints.frustumCulled = false;
        labelPoints.renderOrder = 1;
        backgroundPoints.renderOrder = -1;
        this.scene.add(backgroundPoints, heartPoints, labelPoints);

        this.fontReady = document.fonts.load('800 160px "Be Vietnam Pro"');
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.container);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        this.resize();
        this.startRendering();
    }

    burst(): void {
        if (this.disposed) return;
        this.mode = 1;
        this.setUniform('uMode', this.mode);
        this.setUniform('uBurstStart', this.elapsedTime);
    }

    explodeOut(): void {
        if (this.disposed) return;
        this.mode = 5;
        this.setUniform('uMode', this.mode);
        this.setUniform('uFormStart', this.elapsedTime);
    }

    async formText(lines: string[]): Promise<void> {
        if (this.disposed) return;
        const generation = ++this.textGeneration;
        this.currentText = [...lines];
        await this.fontReady;
        if (this.disposed || generation !== this.textGeneration) return;

        const isTextTransition = this.didFormText;
        const previousTargets = this.heart.target.slice();
        const previousAlpha = this.heart.targetAlpha.slice();
        if (isTextTransition) {
            this.heart.from.set(previousTargets);
            this.heart.fromAlpha.set(previousAlpha);
            this.updateAttribute(this.heart.geometry, 'aFrom', this.heart.from, 2);
            this.updateAttribute(this.heart.geometry, 'aFromAlpha', this.heart.fromAlpha, 1);
            this.mode = 4;
            this.setUniform('uMode', this.mode);
            this.setUniform('uFormStart', this.elapsedTime);
            await new Promise<void>((resolve) => window.setTimeout(
                resolve,
                this.reducedMotion ? 400 : 950
            ));
            if (this.disposed || generation !== this.textGeneration) return;
        }

        const targets = this.createTextTargets(lines);
        const newTargets = new Float32Array(this.heart.count * 2);
        const newAlpha = new Float32Array(this.heart.count);
        const nextFrom = new Float32Array(this.heart.count * 2);
        const nextFromAlpha = new Float32Array(this.heart.count);
        const particleOrder = Array.from({ length: this.heart.count }, (_, index) => index);
        this.shuffle(particleOrder);
        const usableCount = Math.min(targets.length, this.heart.count);

        const velocity = this.heart.geometry.getAttribute('aVelocity').array as Float32Array;
        const spreadDistance = Math.max(window.innerWidth, window.innerHeight) * 0.34;
        for (let index = 0; index < this.heart.count; index += 1) {
            const offset = index * 2;
            if (isTextTransition && previousAlpha[index] > 0.5) {
                const velocityOffset = index * 3;
                const angle = Math.atan2(velocity[velocityOffset + 1], velocity[velocityOffset]);
                nextFrom[offset] = THREE.MathUtils.clamp(
                    previousTargets[offset] + Math.cos(angle) * spreadDistance,
                    -window.innerWidth * 0.15,
                    window.innerWidth * 1.15
                );
                nextFrom[offset + 1] = THREE.MathUtils.clamp(
                    previousTargets[offset + 1] + Math.sin(angle) * spreadDistance,
                    -window.innerHeight * 0.15,
                    window.innerHeight * 1.15
                );
            } else {
                nextFrom[offset] = Math.random() * window.innerWidth;
                nextFrom[offset + 1] = Math.random() * window.innerHeight;
            }
            nextFromAlpha[index] = 0;
        }

        for (let index = 0; index < usableCount; index += 1) {
            const particleIndex = particleOrder[index];
            const target = targets[Math.floor(index * targets.length / usableCount)];
            newTargets[particleIndex * 2] = target.x;
            newTargets[particleIndex * 2 + 1] = target.y;
            newAlpha[particleIndex] = 1;
        }

        this.heart.from.set(isTextTransition ? nextFrom : previousTargets);
        this.heart.fromAlpha.set(nextFromAlpha);
        this.heart.target.set(newTargets);
        this.heart.targetAlpha.set(newAlpha);
        this.updateAttribute(this.heart.geometry, 'aFrom', this.heart.from, 2);
        this.updateAttribute(this.heart.geometry, 'aFromAlpha', this.heart.fromAlpha, 1);
        this.updateAttribute(this.heart.geometry, 'aTarget', this.heart.target, 2);
        this.updateAttribute(this.heart.geometry, 'aTargetAlpha', this.heart.targetAlpha, 1);

        this.mode = this.didFormText ? 3 : 2;
        this.didFormText = true;
        this.setUniform('uMode', this.mode);
        this.setUniform('uFormStart', this.elapsedTime);
    }

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.textGeneration += 1;
        this.resizeObserver.disconnect();
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
        this.heart.geometry.dispose();
        this.label.geometry.dispose();
        this.background.dispose();
        this.materials.forEach((material) => material.dispose());
        this.renderer.dispose();
        this.renderer.domElement.remove();
    }

    private readonly handleVisibilityChange = (): void => {
        if (document.hidden) {
            if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
            this.lastFrameTime = null;
            return;
        }
        this.startRendering();
    };

    private readonly renderFrame = (): void => {
        if (this.disposed || document.hidden) {
            this.animationFrame = null;
            return;
        }
        const frameTime = performance.now();
        if (this.lastFrameTime !== null) {
            this.elapsedTime += Math.min((frameTime - this.lastFrameTime) / 1000, 0.1);
        }
        this.lastFrameTime = frameTime;
        this.setUniform('uTime', this.elapsedTime);
        this.renderer.render(this.scene, this.camera);
        this.animationFrame = requestAnimationFrame(this.renderFrame);
    };

    private startRendering(): void {
        if (this.animationFrame === null && !this.disposed && !document.hidden) {
            this.animationFrame = requestAnimationFrame(this.renderFrame);
        }
    }

    private resize(): void {
        if (this.disposed) return;
        const width = Math.max(1, this.container.clientWidth || window.innerWidth);
        const height = Math.max(1, this.container.clientHeight || window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        this.renderer.setSize(width, height, false);
        this.materials?.forEach((material) => {
            material.uniforms.uResolution.value.set(width, height);
            material.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
            const shortSide = Math.min(width, height);
            material.uniforms.uHeartWidth.value = Math.min(shortSide * 0.33, 450);
            material.uniforms.uHeartHeight.value = Math.min(shortSide * 0.41, 510);
            material.uniforms.uHeartDepth.value = Math.min(width, height) * 0.2;
        });
        if (this.currentText) void this.formText(this.currentText);
    }

    private createHeartGeometry(): ParticleBuffers {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const boundary = Array.from({ length: 512 }, (_, index) => {
            const angle = (index / 512) * Math.PI * 2;
            const sin = Math.sin(angle);
            const outlineX = 16 * sin * sin * sin;
            const outlineY = 13 * Math.cos(angle)
                - 5 * Math.cos(2 * angle)
                - 2 * Math.cos(3 * angle)
                - Math.cos(4 * angle);
            return { x: outlineX / 16, y: -outlineY / 17 };
        });
        const minY = Math.min(...boundary.map((point) => point.y));
        const maxY = Math.max(...boundary.map((point) => point.y));
        const rowCount = 1024;
        const rowIntervals = new Float32Array(rowCount * 4);
        const rowIntervalCounts = new Uint8Array(rowCount);
        for (let row = 0; row < rowCount; row += 1) {
            const scanY = minY + ((row + 0.5) / rowCount) * (maxY - minY);
            const intersections: number[] = [];
            for (let index = 0; index < boundary.length; index += 1) {
                const start = boundary[index];
                const end = boundary[(index + 1) % boundary.length];
                if ((start.y > scanY) === (end.y > scanY)) continue;
                const crossingX = start.x + ((scanY - start.y) / (end.y - start.y)) * (end.x - start.x);
                intersections.push(crossingX);
            }
            intersections.sort((left, right) => left - right);
            const intervalCount = Math.min(2, Math.floor(intersections.length / 2));
            rowIntervalCounts[row] = intervalCount;
            for (let interval = 0; interval < intervalCount; interval += 1) {
                const offset = row * 4 + interval * 2;
                rowIntervals[offset] = intersections[interval * 2];
                rowIntervals[offset + 1] = intersections[interval * 2 + 1];
            }
        }
        const count = Math.min(90000, Math.max(24000, Math.round((width * height) / 24)));
        const heart = new Float32Array(count * 3);
        const velocity = new Float32Array(count * 3);
        const color = new Float32Array(count * 3);
        const size = new Float32Array(count);
        const seed = new Float32Array(count);
        const target = new Float32Array(count * 2);
        const targetAlpha = new Float32Array(count);
        const from = new Float32Array(count * 2);
        const fromAlpha = new Float32Array(count);
        const palette = [
            new THREE.Color('#ff183d'),
            new THREE.Color('#ff315c'),
            new THREE.Color('#ff5277'),
            new THREE.Color('#ff7895')
        ];

        for (let index = 0; index < count; index += 1) {
            let row = 0;
            let x = 0;
            let y = 0;
            do {
                row = Math.floor(Math.random() * rowCount);
                y = minY + ((row + Math.random()) / rowCount) * (maxY - minY);
                x = Math.random() * 2 - 1;
                let insideRow = false;
                for (let interval = 0; interval < rowIntervalCounts[row]; interval += 1) {
                    const offset = row * 4 + interval * 2;
                    if (x >= rowIntervals[offset] && x <= rowIntervals[offset + 1]) {
                        insideRow = true;
                        break;
                    }
                }
                if (insideRow) break;
            } while (true);
            const radial = Math.min(1, Math.hypot(x, y));
            const lowerBulge = 0.42 + THREE.MathUtils.smoothstep(y, -0.2, 0.95) * 0.9;
            const z = (Math.random() * 2 - 1)
                * Math.sqrt(Math.max(0, 1 - radial * radial))
                * lowerBulge;
            const coreRadius = Math.sqrt(x * x + y * y + z * z * 0.55);
            const coreDensity = 0.28 + 0.72 * THREE.MathUtils.smoothstep(coreRadius, 0.12, 0.9);
            if (Math.random() > coreDensity) {
                index -= 1;
                continue;
            }
            const velocityAngle = Math.random() * Math.PI * 2;
            const velocityZ = Math.random() * 2 - 1;
            const velocityRadius = Math.sqrt(1 - velocityZ * velocityZ);
            const particleColor = palette[Math.floor(Math.random() * palette.length)];
            const offset = index * 3;

            heart[offset] = x;
            heart[offset + 1] = y;
            heart[offset + 2] = z;
            velocity[offset] = Math.cos(velocityAngle) * velocityRadius * (0.55 + Math.random() * 0.75);
            velocity[offset + 1] = Math.sin(velocityAngle) * velocityRadius * (0.55 + Math.random() * 0.75);
            velocity[offset + 2] = velocityZ;
            color[offset] = particleColor.r;
            color[offset + 1] = particleColor.g;
            color[offset + 2] = particleColor.b;
            size[index] = 1.45 + Math.random() * 1.35;
            seed[index] = Math.random() * Math.PI * 2;
            targetAlpha[index] = 0;
        }

        const geometry = this.createGeometry({ heart, velocity, color, size, seed, target, targetAlpha, from, fromAlpha });
        return { geometry, count, target, targetAlpha, from, fromAlpha };
    }

    private createBackgroundGeometry(): THREE.BufferGeometry {
        const count = Math.min(
            2600,
            Math.max(900, Math.round((window.innerWidth * window.innerHeight) / 450))
        );
        const heart = new Float32Array(count * 3);
        const velocity = new Float32Array(count * 3);
        const color = new Float32Array(count * 3);
        const size = new Float32Array(count);
        const seed = new Float32Array(count);
        const target = new Float32Array(count * 2);
        const targetAlpha = new Float32Array(count);
        const from = new Float32Array(count * 2);
        const fromAlpha = new Float32Array(count);
        const palette = [
            new THREE.Color('#ff264f'),
            new THREE.Color('#ff5278'),
            new THREE.Color('#ff9bb2'),
            new THREE.Color('#ffd1dc'),
            new THREE.Color('#fff0f2')
        ];

        for (let index = 0; index < count; index += 1) {
            const offset = index * 3;
            const particleColor = palette[Math.floor(Math.random() * palette.length)];
            const isSparkle = Math.random() < 0.09;
            heart[offset] = Math.random();
            heart[offset + 1] = Math.random();
            heart[offset + 2] = 0;
            velocity[offset] = (Math.random() - 0.5) * 2;
            velocity[offset + 1] = (Math.random() - 0.5) * 2;
            velocity[offset + 2] = 0;
            color[offset] = particleColor.r;
            color[offset + 1] = particleColor.g;
            color[offset + 2] = particleColor.b;
            size[index] = isSparkle
                ? 2.3 + Math.random() * 1.7
                : 0.85 + Math.random() * 1.25;
            seed[index] = Math.random() * Math.PI * 2;
        }

        return this.createGeometry({ heart, velocity, color, size, seed, target, targetAlpha, from, fromAlpha });
    }

    private createLabelGeometry(): ParticleBuffers {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) throw new Error('Unable to create a canvas for the particle label.');
        const fontSize = Math.min(window.innerWidth * 0.12, 100, window.innerHeight * 0.1);
        context.font = `800 ${fontSize}px "Be Vietnam Pro", Arial, sans-serif`;
        const textWidth = Math.ceil(context.measureText('11A1').width);
        canvas.width = textWidth + 16;
        canvas.height = Math.ceil(fontSize * 1.4);
        context.font = `800 ${fontSize}px "Be Vietnam Pro", Arial, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#fff';
        context.fillText('11A1', canvas.width / 2, canvas.height / 2);

        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const points: number[] = [];
        const gap = 2;
        for (let y = 0; y < canvas.height; y += gap) {
            for (let x = 0; x < canvas.width; x += gap) {
                if (pixels[(y * canvas.width + x) * 4 + 3] > 96) {
                    points.push(x - canvas.width / 2, y - canvas.height / 2);
                }
            }
        }

        const count = points.length / 2;
        const heart = new Float32Array(count * 3);
        const velocity = new Float32Array(count * 3);
        const color = new Float32Array(count * 3);
        const size = new Float32Array(count);
        const seed = new Float32Array(count);
        const target = new Float32Array(count * 2);
        const targetAlpha = new Float32Array(count);
        const from = new Float32Array(count * 2);
        const fromAlpha = new Float32Array(count);
        for (let index = 0; index < count; index += 1) {
            const offset = index * 3;
            heart[offset] = points[index * 2];
            heart[offset + 1] = points[index * 2 + 1];
            heart[offset + 2] = (Math.random() - 0.5) * 4;
            velocity[offset] = (Math.random() - 0.5) * 1.5;
            velocity[offset + 1] = (Math.random() - 0.5) * 1.5;
            velocity[offset + 2] = (Math.random() - 0.5) * 0.7;
            color[offset] = 1;
            color[offset + 1] = 0.92;
            color[offset + 2] = 0.96;
            size[index] = 1.8 + Math.random() * 1.2;
            seed[index] = Math.random() * Math.PI * 2;
            targetAlpha[index] = 0;
        }

        const geometry = this.createGeometry({ heart, velocity, color, size, seed, target, targetAlpha, from, fromAlpha });
        return { geometry, count, target, targetAlpha, from, fromAlpha };
    }

    private createGeometry(attributes: {
        heart: Float32Array;
        velocity: Float32Array;
        color: Float32Array;
        size: Float32Array;
        seed: Float32Array;
        target: Float32Array;
        targetAlpha: Float32Array;
        from: Float32Array;
        fromAlpha: Float32Array;
    }): THREE.BufferGeometry {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(attributes.heart, 3));
        geometry.setAttribute('aHeart', new THREE.BufferAttribute(attributes.heart, 3));
        geometry.setAttribute('aVelocity', new THREE.BufferAttribute(attributes.velocity, 3));
        geometry.setAttribute('aColor', new THREE.BufferAttribute(attributes.color, 3));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(attributes.size, 1));
        geometry.setAttribute('aSeed', new THREE.BufferAttribute(attributes.seed, 1));
        geometry.setAttribute('aTarget', new THREE.BufferAttribute(attributes.target, 2));
        geometry.setAttribute('aTargetAlpha', new THREE.BufferAttribute(attributes.targetAlpha, 1));
        geometry.setAttribute('aFrom', new THREE.BufferAttribute(attributes.from, 2));
        geometry.setAttribute('aFromAlpha', new THREE.BufferAttribute(attributes.fromAlpha, 1));
        return geometry;
    }

    private createTextTargets(lines: string[]): TextTarget[] {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) throw new Error('Unable to create a canvas for particle text.');
        const width = window.innerWidth;
        const height = window.innerHeight;
        const maxTextWidth = width * 0.96;
        let fontSize = width < 600
            ? Math.min(56, height * 0.095)
            : width >= 1400
                ? Math.min(220, height * 0.2)
                : Math.min(112, height * 0.135);
        if (lines.length === 2) fontSize *= 0.9;
        if (lines.length > 2) fontSize *= 0.82;
        context.font = `800 ${fontSize}px "Be Vietnam Pro", sans-serif`;
        const widestLine = Math.max(...lines.map((line) => context.measureText(line).width));
        if (widestLine > maxTextWidth) {
            fontSize *= maxTextWidth / widestLine;
            context.font = `800 ${fontSize}px "Be Vietnam Pro", sans-serif`;
        }

        const lineHeight = fontSize * 1.16;
        canvas.width = Math.ceil(maxTextWidth);
        canvas.height = Math.ceil(lineHeight * lines.length + fontSize * 0.35);
        context.font = `800 ${fontSize}px "Be Vietnam Pro", sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#fff';
        lines.forEach((line, index) => {
            context.fillText(line, canvas.width / 2, fontSize * 0.2 + lineHeight * (index + 0.5));
        });

        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const gap = 2;
        const offsetX = (width - canvas.width) / 2;
        const offsetY = (height - canvas.height) / 2;
        const targets: TextTarget[] = [];
        for (let y = 0; y < canvas.height; y += gap) {
            for (let x = 0; x < canvas.width; x += gap) {
                if (pixels[(y * canvas.width + x) * 4 + 3] > 96) {
                    targets.push({ x: offsetX + x, y: offsetY + y });
                }
            }
        }
        return targets;
    }

    private updateAttribute(
        geometry: THREE.BufferGeometry,
        name: string,
        values: Float32Array,
        itemSize: number
    ): void {
        const attribute = geometry.getAttribute(name) as THREE.BufferAttribute;
        attribute.array = values;
        attribute.itemSize = itemSize;
        attribute.needsUpdate = true;
    }

    private setUniform(name: string, value: number): void {
        this.materials.forEach((material) => {
            material.uniforms[name].value = value;
        });
    }

    private shuffle<T>(items: T[]): void {
        for (let index = items.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
        }
    }
}
