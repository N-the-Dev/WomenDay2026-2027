/**
 * Fireworks Effect Library
 * Tách từ heart-beat.html để sử dụng độc lập
 * 
 * Cách sử dụng:
 * 1. Include file này vào HTML
 * 2. Tạo canvas element với id="fireworks-canvas"
 * 3. Gọi FireworksEffect.init() để khởi tạo
 * 4. Sử dụng các method để điều khiển hiệu ứng
 */

class FireworksEffect {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.fireworks = [];
        this.maxFireworks = 5;
        this.isInitialized = false;
        this.animationId = null;
        this.autoCreateInterval = null;
        this.width = 0;
        this.height = 0;
        this.pixelRatio = 1;
        this.lastFrame = 0;
        this.resizeHandler = null;
        this.visibilityHandler = null;
        this.maxParticles = 160;
        this.reducedMotion = false;
    }

    /**
     * Khởi tạo hiệu ứng pháo hoa
     * @param {string} canvasId - ID của canvas element
     * @param {Object} options - Các tùy chọn cấu hình
     */
    init(canvasId = 'fireworks-canvas', options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas element not found with id:', canvasId);
            return false;
        }

        this.ctx = this.canvas.getContext('2d', { alpha: true });
        if (!this.ctx) return false;

        // Cấu hình mặc định
        this.maxFireworks = options.maxFireworks ?? 4;
        this.autoCreate = options.autoCreate !== false; // Mặc định bật
        this.autoCreateDelay = options.autoCreateInterval ?? 2000;
        this.particleCount = options.particleCount || { min: 18, max: 34 };
        this.particleSpeed = options.particleSpeed || { min: 1.5, max: 4 };
        this.particleSize = options.particleSize || { min: 2, max: 5 };
        this.colors = options.colors || ['hsl(330, 88%, 76%)', 'hsl(350, 88%, 82%)', 'hsl(42, 92%, 76%)', 'hsl(280, 62%, 78%)'];
        this.maxParticles = options.maxParticles ?? 160;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.handleResize();

        this.isInitialized = true;

        // Bắt đầu animation loop
        this.startAnimation();

        // Bắt đầu tự động tạo pháo hoa
        if (this.autoCreate) {
            this.startAutoCreate();
        }

        // Xử lý resize window
        this.resizeHandler = () => this.handleResize();
        this.visibilityHandler = () => {
            if (document.hidden) this.stopAnimation();
            else if (this.isInitialized) this.startAnimation();
        };
        window.addEventListener('resize', this.resizeHandler, { passive: true });
        document.addEventListener('visibilitychange', this.visibilityHandler);

        console.log('🎆 Fireworks effect initialized successfully');
        return true;
    }

    /**
     * Bắt đầu animation loop
     */
    startAnimation() {
        if (!this.isInitialized || this.animationId !== null || this.reducedMotion) return;

        const animate = () => {
            const now = performance.now();
            const delta = Math.min((now - (this.lastFrame || now)) / 16.67, 2);
            this.lastFrame = now;
            this.update(delta);
            this.draw();
            this.animationId = requestAnimationFrame(animate);
        };

        this.animationId = requestAnimationFrame(animate);
    }

    /**
     * Dừng animation
     */
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Bắt đầu tự động tạo pháo hoa
     */
    startAutoCreate() {
        if (this.autoCreateInterval) return;
        this.autoCreateInterval = setInterval(() => {
            if (!document.hidden && this.fireworks.length < this.maxFireworks) {
                this.createFirework(
                    this.width * (0.2 + Math.random() * 0.6),
                    this.height * (0.14 + Math.random() * 0.42)
                );
            }
        }, this.autoCreateDelay);
    }

    /**
     * Dừng tự động tạo pháo hoa
     */
    stopAutoCreate() {
        if (this.autoCreateInterval) {
            clearInterval(this.autoCreateInterval);
            this.autoCreateInterval = null;
        }
    }

    /**
     * Tạo pháo hoa tại vị trí cụ thể
     * @param {number} x - Tọa độ X
     * @param {number} y - Tọa độ Y
     * @param {Object} options - Tùy chọn cho pháo hoa cụ thể
     */
    createFirework(x, y, options = {}) {
        if (!this.isInitialized || this.fireworks.length >= this.maxFireworks) return false;
        const liveParticles = this.fireworks.reduce((total, item) => total + item.particles.length, 0);
        const capacity = Math.max(0, this.maxParticles - liveParticles);
        if (!capacity) return false;
        const particleCount = options.particleCount || 
            (this.particleCount.min + Math.floor(Math.random() * (this.particleCount.max - this.particleCount.min + 1)));
        const count = Math.min(particleCount, capacity, this.reducedMotion ? 8 : this.maxParticles);
        const paletteHues = this.colors.map((color) => {
            const match = color.match(/hsl\(\s*(-?\d+(?:\.\d+)?)/i);
            return match ? Number(match[1]) : null;
        }).filter((hue) => hue !== null);
        if (paletteHues.length === 0) paletteHues.push(330, 350, 42, 280);
        
        const particles = [];

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.12;
            const speed = options.speed || 
                (this.particleSpeed.min + Math.random() * (this.particleSpeed.max - this.particleSpeed.min));
            const size = options.size || 
                (this.particleSize.min + Math.random() * (this.particleSize.max - this.particleSize.min));

            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                alpha: 1,
                life: 1,
                decay: Math.random() * 0.02 + 0.015,
                hue: options.hue ?? paletteHues[Math.floor(Math.random() * paletteHues.length)],
                gravity: options.gravity ?? 0.045,
                trail: []
            });
        }

        this.fireworks.push({
            x: x,
            y: y,
            particles: particles,
            life: 1,
            decay: 0.01
        });
        if (this.reducedMotion) this.update(1);
        return true;
    }

    /**
     * Tạo pháo hoa tại vị trí chuột
     * @param {MouseEvent} event - Sự kiện chuột
     */
    createFireworkAtMouse(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.createFirework(x, y);
    }

    /**
     * Cập nhật trạng thái các pháo hoa
     */
    update(delta = 1) {
        // Cập nhật từng pháo hoa
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const firework = this.fireworks[i];

            // Cập nhật từng particle
            for (let j = firework.particles.length - 1; j >= 0; j--) {
                const particle = firework.particles[j];

                // Cập nhật vị trí
                particle.x += particle.vx * delta;
                particle.y += particle.vy * delta;
                particle.vy += particle.gravity * delta;

                // Thêm vào trail
                particle.trail.push({ x: particle.x, y: particle.y });
                if (particle.trail.length > 7) {
                    particle.trail.shift();
                }

                // Cập nhật life
                particle.life -= particle.decay * delta;
                particle.alpha = particle.life;

                // Xóa particle nếu hết life
                if (particle.life <= 0) {
                    firework.particles.splice(j, 1);
                }
            }

            // Xóa pháo hoa nếu hết particles
            if (firework.particles.length === 0) {
                this.fireworks.splice(i, 1);
            }
        }
    }

    /**
     * Vẽ các pháo hoa lên canvas
     */
    draw() {
        // Xóa canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Vẽ từng pháo hoa
        for (let i = 0; i < this.fireworks.length; i++) {
            const firework = this.fireworks[i];

            // Vẽ từng particle
            for (let j = 0; j < firework.particles.length; j++) {
                const particle = firework.particles[j];

                // Vẽ trail
                this.ctx.save();
                this.ctx.globalAlpha = particle.alpha * 0.3;
                this.ctx.strokeStyle = `hsl(${particle.hue}, 80%, 70%)`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                for (let k = 0; k < particle.trail.length - 1; k++) {
                    this.ctx.moveTo(particle.trail[k].x, particle.trail[k].y);
                    this.ctx.lineTo(particle.trail[k + 1].x, particle.trail[k + 1].y);
                }
                this.ctx.stroke();
                this.ctx.restore();

                // Vẽ particle (hình trái tim)
                if (particle.life > 0) {
                    this.drawHeartParticle(particle.x, particle.y, particle.size, particle.alpha, particle.hue);
                }
            }
        }
    }

    /**
     * Vẽ particle hình trái tim
     * @param {number} x - Tọa độ X
     * @param {number} y - Tọa độ Y
     * @param {number} size - Kích thước
     * @param {number} alpha - Độ trong suốt
     * @param {number} hue - Màu sắc (HSL)
     */
    drawHeartParticle(x, y, size, alpha, hue) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = `hsl(${hue}, 80%, 70%)`;
        this.ctx.shadowColor = `hsl(${hue}, 80%, 50%)`;
        this.ctx.shadowBlur = 4;

        // Vẽ hình trái tim đơn giản
        this.ctx.beginPath();
        const heartSize = size * 0.5;
        this.ctx.moveTo(x, y + heartSize * 0.3);

        // Đường cong trái
        this.ctx.bezierCurveTo(x, y, x - heartSize * 0.5, y, x - heartSize * 0.5, y + heartSize * 0.3);
        this.ctx.bezierCurveTo(x - heartSize * 0.5, y + heartSize * 0.5, x, y + heartSize * 0.7, x, y + heartSize * 0.9);

        // Đường cong phải
        this.ctx.bezierCurveTo(x, y + heartSize * 0.7, x + heartSize * 0.5, y + heartSize * 0.5, x + heartSize * 0.5, y + heartSize * 0.3);
        this.ctx.bezierCurveTo(x + heartSize * 0.5, y, x, y, x, y + heartSize * 0.3);

        this.ctx.fill();
        this.ctx.restore();
    }

    /**
     * Xử lý resize window
     */
    handleResize() {
        if (!this.canvas || !this.ctx) return;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = Math.round(this.width * this.pixelRatio);
        this.canvas.height = Math.round(this.height * this.pixelRatio);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    }

    /**
     * Xóa tất cả pháo hoa
     */
    clear() {
        this.fireworks = [];
    }

    /**
     * Dừng hoàn toàn hiệu ứng
     */
    destroy() {
        this.stopAnimation();
        this.stopAutoCreate();
        this.clear();
        if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
        if (this.visibilityHandler) document.removeEventListener('visibilitychange', this.visibilityHandler);
        this.resizeHandler = null;
        this.visibilityHandler = null;
        this.isInitialized = false;
        console.log('🎆 Fireworks effect destroyed');
    }

    /**
     * Tạm dừng hiệu ứng
     */
    pause() {
        this.stopAnimation();
        this.stopAutoCreate();
        this.clear();
        if (this.ctx) this.draw();
    }

    /**
     * Tiếp tục hiệu ứng
     */
    resume() {
        if (this.isInitialized) {
            this.startAnimation();
            if (this.autoCreate && !this.reducedMotion) {
                this.startAutoCreate();
            }
        }
    }

    /**
     * Lấy thông tin trạng thái
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            fireworksCount: this.fireworks.length,
            totalParticles: this.fireworks.reduce((sum, fw) => sum + fw.particles.length, 0),
            isAnimating: this.animationId !== null,
            isAutoCreating: this.autoCreateInterval !== null
        };
    }
}

// Tạo instance global để sử dụng dễ dàng
window.FireworksEffect = FireworksEffect;

// Export cho module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FireworksEffect;
}
