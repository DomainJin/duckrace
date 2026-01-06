// Hệ thống âm thanh
class SoundManager {
    constructor() {
        this.enabled = true;
        this.context = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    playStartSound() {
        if (!this.enabled || !this.initialized) return;
        this.playBeep(800, 0.1, 0.2);
        setTimeout(() => this.playBeep(1000, 0.1, 0.2), 200);
        setTimeout(() => this.playBeep(1200, 0.2, 0.3), 400);
    }

    playCrowdCheer() {
        if (!this.enabled || !this.initialized) return;
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playBeep(300 + Math.random() * 400, 0.05, 0.1);
            }, i * 100);
        }
    }

    playFinishSound() {
        if (!this.enabled || !this.initialized) return;
        this.playBeep(1500, 0.1, 0.3);
        setTimeout(() => this.playBeep(1800, 0.2, 0.4), 150);
    }

    playBeep(frequency, volume, duration) {
        if (!this.context) return;
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// Class Duck với màu sắc và animation nâng cao
class Duck {
    constructor(id, trackLength, name = null) {
        this.id = id;
        this.name = name || `Vịt #${id}`;
        this.position = 0;
        this.speed = 0;
        // Vịt phải chạy nhanh hơn camera (3 pixels/frame) để tiến về phía trước
        // Base: 3.2 - 4.0 pixels/frame (nhanh hơn camera 6-33%)
        this.baseSpeed = Math.random() * 0.8 + 3.2;
        this.acceleration = 0;
        this.maxSpeed = this.baseSpeed * 1.5;
        this.minSpeed = this.baseSpeed * 0.5;
        this.trackLength = trackLength;
        this.finished = false;
        this.finishTime = null;
        this.color = this.generateColor();
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.previousPosition = 0;
        this.previousRank = 0;
        this.speedChangeTimer = 0;
        this.targetSpeed = this.baseSpeed;
        this.particles = [];
        this.turboActive = false;
        this.turboTimer = 0;
        this.wingFlapSpeed = 1;
    }

    generateColor() {
        const colors = [
            '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739',
            '#52B788', '#E63946', '#457B9D', '#E76F51', '#2A9D8F',
            '#FF1493', '#00CED1', '#FF4500', '#32CD32', '#BA55D3'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    randomizeSpeed() {
        this.speed = this.baseSpeed;
        this.targetSpeed = this.baseSpeed;
    }

    update(time) {
        this.previousPosition = this.position;
        if (!this.finished) {
            // Random speed changes (tăng tốc / giảm tốc)
            this.speedChangeTimer--;
            if (this.speedChangeTimer <= 0) {
                this.speedChangeTimer = Math.random() * 60 + 30;
                const rand = Math.random();
                
                if (rand > 0.85) {
                    // Turbo boost!
                    this.targetSpeed = this.maxSpeed;
                    this.turboActive = true;
                    this.turboTimer = 30;
                    this.wingFlapSpeed = 3;
                } else if (rand > 0.7) {
                    // Tăng tốc
                    this.targetSpeed = this.baseSpeed * (1.5 + Math.random() * 0.5);
                    this.wingFlapSpeed = 2;
                } else if (rand < 0.15) {
                    // Giảm tốc (mệt)
                    this.targetSpeed = this.minSpeed;
                    this.wingFlapSpeed = 0.5;
                } else {
                    // Tốc độ bình thường
                    this.targetSpeed = this.baseSpeed * (0.8 + Math.random() * 0.4);
                    this.wingFlapSpeed = 1;
                }
            }
            
            // Turbo effect
            if (this.turboActive) {
                this.turboTimer--;
                if (this.turboTimer <= 0) {
                    this.turboActive = false;
                }
                // Create particles
                if (Math.random() > 0.7) {
                    this.particles.push({
                        x: this.position,
                        y: 0,
                        vx: -2 - Math.random() * 2,
                        vy: (Math.random() - 0.5) * 2,
                        life: 20,
                        maxLife: 20
                    });
                }
            }
            
            // Smooth acceleration/deceleration
            this.acceleration = (this.targetSpeed - this.speed) * 0.08;
            this.speed += this.acceleration;
            this.speed = Math.max(this.minSpeed, Math.min(this.maxSpeed, this.speed));
            
            // Update position
            this.position += this.speed + (Math.random() - 0.5) * 0.3;
            
            // Update particles
            this.particles = this.particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                return p.life > 0;
            });
            
            if (this.position >= this.trackLength) {
                this.position = this.trackLength;
                this.finished = true;
                this.finishTime = Date.now();
            }
        }
    }

    getWobble(time) {
        return Math.sin(time * 0.015 + this.wobbleOffset) * 4;
    }
    
    getSpeedIndicator() {
        const speedPercent = (this.speed / this.maxSpeed);
        if (this.turboActive) return '🔥';
        if (speedPercent > 0.8) return '⚡';
        if (speedPercent < 0.4) return '💤';
        return '';
    }
}

// Class Game với tất cả features mới
class Game {
    constructor() {
        this.ducks = [];
        this.duckCount = 300;
        this.raceDuration = 30;
        this.canvas = null;
        this.ctx = null;
        this.minimapCanvas = null;
        this.minimapCtx = null;
        this.trackLength = 0;
        this.raceStarted = false;
        this.raceFinished = false;
        this.racePaused = false;
        this.animationId = null;
        this.startTime = null;
        this.pausedTime = 0;
        this.rankings = [];
        this.waveOffset = 0;
        this.soundManager = new SoundManager();
        
        // Camera/Viewport system
        this.cameraOffset = 0;
        this.viewportWidth = 0;
        this.isFullscreen = false;
        
        // Statistics
        this.stats = this.loadStats();
        this.currentRaceNumber = this.stats.totalRaces + 1;
        this.highlights = [];
        this.raceHistory = [];
        
        // Duck names from file
        this.duckNames = [];
        
        // Replay
        this.replayMode = false;
        this.replayData = [];
        this.replayFrame = 0;
        
        this.updateStatsDisplay();
    }

    loadStats() {
        const saved = localStorage.getItem('duckRaceStats');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            totalRaces: 0,
            top3Finishes: 0,
            wins: 0
        };
    }

    saveStats() {
        localStorage.setItem('duckRaceStats', JSON.stringify(this.stats));
    }

    updateStatsDisplay() {
        document.getElementById('totalRaces').textContent = this.stats.totalRaces;
        document.getElementById('top3Count').textContent = this.stats.top3Finishes;
        const winRate = this.stats.totalRaces > 0 
            ? ((this.stats.top3Finishes / this.stats.totalRaces) * 100).toFixed(1)
            : 0;
        document.getElementById('winRate').textContent = winRate + '%';
    }

    loadDuckNames(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            
            this.duckNames = [];
            
            // Bỏ qua header row (dòng đầu)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const columns = line.split(',');
                if (columns.length >= 2) {
                    const stt = columns[0].trim();
                    const name = columns[1].trim();
                    if (stt && name) {
                        this.duckNames.push(name);
                    }
                }
            }
            
            if (this.duckNames.length > 0) {
                // Tự động set số lượng vịt = số dòng trong file
                document.getElementById('duckCount').value = this.duckNames.length;
                alert(`Đã tải ${this.duckNames.length} tên từ file!`);
            } else {
                alert('Không đọc được tên từ file. Kiểm tra format: STT,Họ và Tên');
            }
        };
        
        reader.readAsText(file);
    }

    startRace() {
        this.duckCount = parseInt(document.getElementById('duckCount').value);
        this.raceDuration = 30; // Cố định 30 giây
        this.soundManager.setEnabled(document.getElementById('soundToggle').checked);

        if (this.duckCount < 10 || this.duckCount > 1000) {
            alert('Số lượng vịt phải từ 10 đến 1000!');
            return;
        }

        // Khởi tạo canvas
        this.canvas = document.getElementById('raceCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = Math.min(window.innerWidth - 40, 1200);
        this.canvas.height = 600;
        
        // Tính toán track để sync với thời gian
        // Track phải đồng bộ với tốc độ vịt nhanh nhất (4.0 pixels/frame)
        // Để vịt nhanh nhất về đích đúng khi countdown = 0
        this.viewportWidth = this.canvas.width;
        const fps = 60;
        const maxDuckSpeed = 4.0; // pixels/frame - tốc độ vịt nhanh nhất
        // Track = maxDuckSpeed * fps * raceDuration
        // Ví dụ: 30s => 4.0 * 60 * 30 = 7200 pixels
        this.trackLength = maxDuckSpeed * fps * this.raceDuration;
        this.cameraOffset = 0;

        // Khởi tạo minimap
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        this.minimapCanvas.width = 300;
        this.minimapCanvas.height = 150;

        // Tạo các con vịt
        this.ducks = [];
        this.highlights = [];
        this.replayData = [];
        for (let i = 1; i <= this.duckCount; i++) {
            const duckName = this.duckNames.length >= i ? this.duckNames[i - 1] : null;
            const duck = new Duck(i, this.trackLength, duckName);
            duck.randomizeSpeed();
            this.ducks.push(duck);
        }

        // UI updates
        document.getElementById('settingsPanel').classList.add('hidden');
        document.getElementById('raceInfo').classList.remove('hidden');
        document.getElementById('controlPanel').classList.remove('hidden');
        document.getElementById('raceCanvas').classList.remove('hidden');
        document.getElementById('minimap').classList.remove('hidden');
        document.getElementById('leaderboard').classList.remove('hidden');
        document.getElementById('highlightsPanel').classList.remove('hidden');
        document.getElementById('bigTimer').classList.remove('hidden');

        this.raceStarted = true;
        this.raceFinished = false;
        this.racePaused = false;
        this.replayMode = false;
        this.startTime = Date.now();
        this.currentRaceNumber = this.stats.totalRaces + 1;
        
        document.getElementById('raceNumber').textContent = `#${this.currentRaceNumber}`;
        document.getElementById('raceStatus').textContent = 'Đang đua!';
        document.getElementById('timeLeft').textContent = `${this.raceDuration}s`;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('replayBtn').disabled = true;

        this.soundManager.init();
        this.drawAllDucksAtStart();
        
        setTimeout(() => {
            this.soundManager.playStartSound();
            setTimeout(() => this.animate(), 500);
        }, 2000);
    }

    drawAllDucksAtStart() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#1e3c72');
        bgGradient.addColorStop(1, '#2a5298');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawTrack();

        // Calculate grid for all ducks
        const startX = 70;
        const startY = 100;
        const duckSpacing = 16;
        const cols = Math.min(50, Math.floor((this.canvas.width - 150) / duckSpacing));
        const rows = Math.ceil(this.duckCount / cols);
        
        // Draw all ducks in a compact formation
        for (let i = 0; i < this.duckCount; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = startX + (col * duckSpacing);
            const y = startY + (row * duckSpacing);
            
            // Small wobble animation
            const wobble = Math.sin(i * 0.5 + Date.now() * 0.002) * 2;
            
            this.drawDuck(x, y + wobble, this.ducks[i].color, Date.now(), this.ducks[i]);
        }

        // Title with animation
        this.ctx.save();
        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 4;
        
        const text = `${this.duckCount} VỊT SẴN SÀNG! CHUẨN BỊ XUẤT PHÁT...`;
        this.ctx.strokeText(text, this.canvas.width / 2, 50);
        this.ctx.fillText(text, this.canvas.width / 2, 50);
        this.ctx.restore();
        
        // Countdown effect
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.shadowColor = 'yellow';
            this.ctx.shadowBlur = 30;
            this.ctx.fillStyle = countdown > 0 ? '#FFD700' : '#00FF00';
            this.ctx.font = 'bold 120px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(countdown > 0 ? countdown : 'GO!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.restore();
            
            countdown--;
            if (countdown < 0) {
                clearInterval(countdownInterval);
            }
        }, 600);
    }

    pauseRace() {
        if (!this.racePaused && this.raceStarted && !this.raceFinished) {
            this.racePaused = true;
            this.pausedTime = Date.now();
            document.getElementById('pauseBtn').disabled = true;
            document.getElementById('resumeBtn').disabled = false;
            document.getElementById('raceStatus').textContent = 'Tạm dừng';
        }
    }

    resumeRace() {
        if (this.racePaused) {
            this.racePaused = false;
            const pauseDuration = Date.now() - this.pausedTime;
            this.startTime += pauseDuration;
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('resumeBtn').disabled = true;
            document.getElementById('raceStatus').textContent = 'Đang đua!';
            this.animate();
        }
    }

    animate(timestamp) {
        if (!this.raceStarted || this.raceFinished || this.racePaused) return;

        const elapsed = (Date.now() - this.startTime) / 1000;
        const timeLeft = Math.max(0, this.raceDuration - elapsed);
        document.getElementById('timeLeft').textContent = `${timeLeft.toFixed(1)}s`;
        
        // Update big timer
        const minutes = Math.floor(timeLeft / 60);
        const seconds = Math.floor(timeLeft % 60);
        const milliseconds = Math.floor((timeLeft % 1) * 100);
        document.getElementById('bigTimer').querySelector('.timer-display').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;

        // Kiểm tra xem có vịt nào CHẠM vạch đích chưa (position >= trackLength)
        const hasFinisher = this.ducks.some(duck => duck.position >= this.trackLength);
        
        // CHỈ kết thúc khi có vịt chạm đích - KHÔNG kết thúc theo thời gian
        // Điều này cho phép vịt tiếp tục bơi animation mượt mà đến đích
        if (hasFinisher) {
            this.endRace();
            return;
        }

        this.waveOffset += 0.1;
        this.ducks.forEach(duck => duck.update(timestamp || Date.now()));

        const oldRankings = [...this.rankings];
        this.rankings = [...this.ducks].sort((a, b) => b.position - a.position);
        this.checkHighlights(oldRankings, this.rankings);
        
        // Camera theo sát vịt dẫn đầu - giữ vịt ở khoảng 60% từ trái màn hình
        
        // Debug: Kiểm tra progress
        if (Math.random() < 0.01) {
            const leaderProgress = this.rankings.length > 0 ? this.rankings[0].position / this.trackLength : 0;
            const cameraProgress = this.cameraOffset / (this.trackLength - this.viewportWidth);
            console.log('Time:', timeLeft.toFixed(1) + 's', 'Camera:', (cameraProgress * 100).toFixed(1) + '%', 'Leader:', (leaderProgress * 100).toFixed(1) + '%');
        }
        
        // Camera logic - CHỈ theo vịt, KHÔNG theo thời gian
        if (this.rankings.length > 0) {
            const leader = this.rankings[0];
            const leaderProgress = leader.position / this.trackLength;
            
            // Khi vịt đạt 95%+, bắt đầu chuyển sang chế độ hiển thị vạch đích
            if (leaderProgress >= 0.95 || this.raceFinished) {
                // Chuyển mượt đến vị trí cuối track để hiển vạch đích
                const targetOffset = this.trackLength - this.viewportWidth;
                this.cameraOffset += (targetOffset - this.cameraOffset) * 0.15; // Smooth hơn
            } else {
                // Camera theo vịt dẫn đầu bình thường - LUÔN ở 60%
                const targetCameraOffset = leader.position - (this.viewportWidth * 0.6);
                // Smooth follow
                this.cameraOffset += (targetCameraOffset - this.cameraOffset) * 0.2;
            }
            
            // Giới hạn camera
            this.cameraOffset = Math.max(0, Math.min(this.trackLength - this.viewportWidth, this.cameraOffset));
        }

        if (this.replayData.length < 10000) {
            this.replayData.push({
                time: elapsed,
                positions: this.ducks.map(d => ({ id: d.id, pos: d.position, finished: d.finished }))
            });
        }

        this.draw(timestamp || Date.now());
        this.drawMinimap();
        this.updateLeaderboard();

        this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    }

    checkHighlights(oldRankings, newRankings) {
        if (oldRankings.length === 0) return;

        for (let i = 0; i < Math.min(10, newRankings.length); i++) {
            const duck = newRankings[i];
            const oldRank = oldRankings.findIndex(d => d.id === duck.id);
            
            if (oldRank > i && oldRank - i >= 3) {
                this.addHighlight(`${duck.name} vượt lên ${oldRank - i} bậc! Hiện tại: Hạng ${i + 1}`);
            }
        }
    }

    addHighlight(message) {
        const time = ((Date.now() - this.startTime) / 1000).toFixed(1);
        this.highlights.unshift({ time, message });
        if (this.highlights.length > 10) this.highlights.pop();
        
        const list = document.getElementById('highlightsList');
        list.innerHTML = this.highlights.map(h => 
            `<div class="highlight-item">[${h.time}s] ${h.message}</div>`
        ).join('');
    }

    draw(time) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for camera transform
        this.ctx.save();
        
        this.drawTrack();
        this.drawWater(time);

        // Hiển thị TẤT CẢ vịt theo thứ tự ID (không sort), mỗi vịt có lane cố định
        // Tự động điều chỉnh laneHeight dựa trên số vịt
        const laneHeight = Math.max(1.5, Math.min(18, (this.canvas.height - 150) / this.duckCount));

        this.ducks.forEach((duck, index) => {
            const y = 80 + index * laneHeight;
            
            // Lane line
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y + 10);
            this.ctx.lineTo(this.canvas.width, y + 10);
            this.ctx.stroke();

            // Duck name - hiển thị bên trái
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 9px Arial';
            const displayName = duck.name.length > 15 ? duck.name.substring(0, 13) + '..' : duck.name;
            this.ctx.fillText(displayName, 8, y + 12);

            // Tính toán vị trí trên màn hình dựa trên camera offset
            const relativePos = duck.position - this.cameraOffset;
            
            // Vịt tự do chạy trên màn hình, không bị giới hạn
            // Chỉ vẽ vịt nếu nó nằm trong viewport
            if (relativePos > -100 && relativePos < this.viewportWidth + 100) {
                const wobble = duck.getWobble(time);
                
                this.drawDuck(relativePos, y + 5 + wobble, duck.color, time, duck);
                
                // Hiển thị tên vịt ở phía sau vịt
                this.ctx.save();
                this.ctx.font = 'bold 14px Arial';
                this.ctx.textAlign = 'right';
                const text = duck.name.length > 20 ? duck.name.substring(0, 18) + '..' : duck.name;
                // Text with shadow for visibility
                this.ctx.shadowColor = 'black';
                this.ctx.shadowBlur = 3;
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(text, relativePos - 18, y + 10);
                this.ctx.restore();
            }
        });
        
        // Restore context
        this.ctx.restore();
        
        // Vẽ cây xanh ở biên dưới (bottom border)
        const bottomY = this.canvas.height - 50;
        this.ctx.fillStyle = '#2d5016';
        this.ctx.fillRect(0, bottomY, this.canvas.width, 50);
        
        // Vẽ cây với parallax scrolling
        const treeOffset = Math.floor(this.cameraOffset * 0.4) % 60;
        for (let i = -treeOffset; i < this.canvas.width + 60; i += 60) {
            const treeX = i + 30;
            const treeY = bottomY + 15;
            
            // Thân cây
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(treeX - 3, treeY, 6, 20);
            
            // Tán cây (3 lớp)
            this.ctx.fillStyle = '#228B22';
            this.ctx.beginPath();
            this.ctx.arc(treeX, treeY - 5, 12, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#32CD32';
            this.ctx.beginPath();
            this.ctx.arc(treeX - 7, treeY + 2, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(treeX + 7, treeY + 2, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Hoa/quả ngẫu nhiên
            if (Math.floor((i + this.cameraOffset * 0.4) / 60) % 3 === 0) {
                this.ctx.fillStyle = '#FF6347';
                this.ctx.beginPath();
                this.ctx.arc(treeX - 5, treeY - 8, 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(treeX + 4, treeY - 5, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    drawDuck(x, y, color, time, duck = null) {
        const ctx = this.ctx;
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y + 10, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body with gradient
        const gradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, 8);
        gradient.addColorStop(0, this.lightenColor(color, 40));
        gradient.addColorStop(1, color);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(x, y, 9, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body outline
        ctx.strokeStyle = this.darkenColor(color, 20);
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Head
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x + 7, y - 4, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = this.darkenColor(color, 20);
        ctx.stroke();
        
        // Beak
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.moveTo(x + 10, y - 4);
        ctx.lineTo(x + 14, y - 3.5);
        ctx.lineTo(x + 10, y - 3);
        ctx.fill();
        
        // Eye with white
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x + 8, y - 5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x + 8.5, y - 5, 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Wing animation - more realistic
        if (time && duck) {
            const wingSpeed = duck.wingFlapSpeed || 1;
            const wingFlap = Math.sin(time * 0.03 * wingSpeed) * 3;
            const wingAngle = wingFlap * 0.1;
            
            ctx.save();
            ctx.translate(x - 2, y);
            ctx.rotate(wingAngle);
            
            // Wing
            ctx.fillStyle = this.darkenColor(color, 15);
            ctx.beginPath();
            ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
            
            // Tail
            ctx.fillStyle = this.darkenColor(color, 10);
            ctx.beginPath();
            ctx.moveTo(x - 8, y);
            ctx.lineTo(x - 11, y - 2);
            ctx.lineTo(x - 11, y + 2);
            ctx.fill();
        }
        
        // Water splash effect when moving fast
        if (duck && duck.speed > duck.baseSpeed * 1.5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            for (let i = 0; i < 3; i++) {
                const offset = i * 2;
                ctx.beginPath();
                ctx.arc(x - 10 - offset, y + 3 + Math.random() * 2, 1 + Math.random(), 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    drawWater(time) {
        // Water background with animated gradient
        const gradient = this.ctx.createLinearGradient(0, 80, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(30, 144, 255, 0.15)');
        gradient.addColorStop(0.5, 'rgba(0, 119, 182, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 105, 148, 0.25)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 80, this.canvas.width, this.canvas.height - 130);

        // Multiple wave layers for depth
        const waveLayers = [
            { speed: 5, amplitude: 5, opacity: 0.2, offset: 0 },
            { speed: 3, amplitude: 3, opacity: 0.3, offset: 100 },
            { speed: 7, amplitude: 4, opacity: 0.15, offset: 50 }
        ];
        
        waveLayers.forEach(layer => {
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${layer.opacity})`;
            this.ctx.lineWidth = 1.5;
            
            for (let i = 0; i < 12; i++) {
                this.ctx.beginPath();
                for (let x = 0; x < this.canvas.width; x += 8) {
                    const worldX = x + this.cameraOffset;
                    const y = 100 + i * 45 + 
                             Math.sin((worldX + this.waveOffset * layer.speed + layer.offset) * 0.05) * layer.amplitude +
                             Math.sin((worldX + this.waveOffset * layer.speed * 1.5) * 0.03) * (layer.amplitude * 0.5);
                    if (x === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.stroke();
            }
        });
        
        // Foam/bubbles effect
        if (Math.random() > 0.8) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            const bubbleX = Math.random() * this.canvas.width;
            const bubbleY = 80 + Math.random() * (this.canvas.height - 130);
            this.ctx.beginPath();
            this.ctx.arc(bubbleX, bubbleY, 1 + Math.random() * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawTrack() {
        // Draw khán giả ở biên trên (spectators)
        this.ctx.fillStyle = '#3a5a40';
        this.ctx.fillRect(0, 0, this.canvas.width, 35);
        
        // Vẽ khán giả với parallax scrolling
        const spectatorOffset = Math.floor(this.cameraOffset * 0.3) % 30;
        this.ctx.fillStyle = '#000';
        for (let i = -spectatorOffset; i < this.canvas.width; i += 30) {
            // Đầu người
            const headY = 15 + Math.sin((i + this.cameraOffset * 0.3) * 0.2) * 3;
            this.ctx.beginPath();
            this.ctx.arc(i + 15, headY, 6, 0, Math.PI * 2);
            // Màu da ngẫu nhiên
            const skinTones = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524'];
            this.ctx.fillStyle = skinTones[Math.floor((i / 30) % skinTones.length)];
            this.ctx.fill();
            
            // Áo
            this.ctx.fillStyle = `hsl(${(i * 13) % 360}, 70%, 50%)`;
            this.ctx.fillRect(i + 10, headY + 5, 10, 8);
            
            // Tay vẫy (wave)
            if (Math.floor(i / 30) % 3 === 0) {
                this.ctx.strokeStyle = this.ctx.fillStyle;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(i + 10, headY + 7);
                const waveOffset = Math.sin(Date.now() * 0.005 + i * 0.1) * 3;
                this.ctx.lineTo(i + 5, headY + 3 + waveOffset);
                this.ctx.stroke();
            }
        }
        
        // Draw grass background at top
        const grassGradient = this.ctx.createLinearGradient(0, 35, 0, 70);
        grassGradient.addColorStop(0, '#6b8e23');
        grassGradient.addColorStop(0.5, '#556b2f');
        grassGradient.addColorStop(1, '#4a5f23');
        this.ctx.fillStyle = grassGradient;
        this.ctx.fillRect(0, 35, this.canvas.width, 35);
        
        // Draw grass texture (tiled based on camera position)
        this.ctx.strokeStyle = 'rgba(85, 107, 47, 0.5)';
        this.ctx.lineWidth = 2;
        const grassOffset = Math.floor(this.cameraOffset) % 10;
        for (let i = -grassOffset; i < this.canvas.width; i += 5) {
            const height = 5 + Math.sin((i + this.cameraOffset) * 0.5) * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(i, 70);
            this.ctx.lineTo(i, 70 - height);
            this.ctx.stroke();
        }
        
        // Draw brown edge (dirt/sand)
        const sandGradient = this.ctx.createLinearGradient(0, 70, 0, 80);
        sandGradient.addColorStop(0, '#8B4513');
        sandGradient.addColorStop(1, '#A0522D');
        this.ctx.fillStyle = sandGradient;
        this.ctx.fillRect(0, 70, this.canvas.width, 10);

        // Start line - chỉ vẽ nếu camera gần start (cameraOffset nhỏ)
        if (this.cameraOffset < this.viewportWidth * 0.5) {
            const startX = -this.cameraOffset;
            if (startX > -100 && startX < this.viewportWidth) {
                const startGradient = this.ctx.createLinearGradient(startX - 5, 80, startX + 5, 80);
                startGradient.addColorStop(0, 'rgba(0, 255, 0, 0)');
                startGradient.addColorStop(0.5, 'rgba(0, 255, 0, 1)');
                startGradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
                this.ctx.strokeStyle = startGradient;
                this.ctx.lineWidth = 5;
                this.ctx.beginPath();
                this.ctx.moveTo(startX, 80);
                this.ctx.lineTo(startX, this.canvas.height - 50);
                this.ctx.stroke();
                
                this.ctx.shadowColor = 'lime';
                this.ctx.shadowBlur = 15;
                this.ctx.strokeStyle = 'lime';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
                
                // START label
                this.ctx.save();
                this.ctx.fillStyle = 'white';
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 3;
                this.ctx.font = 'bold 14px Arial';
                this.ctx.strokeText('START', startX + 10, 25);
                this.ctx.fillText('START', startX + 10, 25);
                this.ctx.restore();
            }
        }

        // Finish line - XUẤT HIỆN khi vịt dẫn đầu đạt 95%
        const leaderProgress = this.rankings.length > 0 ? this.rankings[0].position / this.trackLength : 0;
        
        // Hiển thị finish line khi vịt dẫn đầu đạt 95%+ hoặc race kết thúc
        if (leaderProgress >= 0.95 || this.raceFinished) {
            // Vẽ vạch đích ở cuối màn hình bên phải
            const finishScreenX = this.viewportWidth - 50;
            
            // Checkered finish line
            const squareSize = 10;
            for (let y = 80; y < this.canvas.height - 50; y += squareSize) {
                for (let x = 0; x < 2; x++) {
                    const isBlack = (Math.floor(y / squareSize) + x) % 2 === 0;
                    this.ctx.fillStyle = isBlack ? 'black' : 'white';
                    this.ctx.fillRect(finishScreenX - squareSize + x * squareSize, y, squareSize, squareSize);
                }
            }
            
            // Finish line border with glow
            this.ctx.shadowColor = 'red';
            this.ctx.shadowBlur = 15;
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(finishScreenX - squareSize, 80, squareSize * 2, this.canvas.height - 130);
            this.ctx.shadowBlur = 0;
            
            // FINISH label
            this.ctx.save();
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 3;
            this.ctx.font = 'bold 14px Arial';
            this.ctx.strokeText('FINISH', finishScreenX - 70, 25);
            this.ctx.fillText('FINISH', finishScreenX - 70, 25);
            this.ctx.restore();
        }
    }

    drawMinimap() {
        const ctx = this.minimapCtx;
        ctx.clearRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);
        
        ctx.fillStyle = '#1e3c72';
        ctx.fillRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);
        
        ctx.fillStyle = '#2a5298';
        ctx.fillRect(10, 10, this.minimapCanvas.width - 20, this.minimapCanvas.height - 20);
        
        // Start line
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, 10);
        ctx.lineTo(15, this.minimapCanvas.height - 10);
        ctx.stroke();
        
        // Finish line
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(this.minimapCanvas.width - 15, 10);
        ctx.lineTo(this.minimapCanvas.width - 15, this.minimapCanvas.height - 10);
        ctx.stroke();
        
        // Vẽ viewport hiện tại (camera position)
        const trackWidth = this.minimapCanvas.width - 30;
        const cameraStartX = 15 + (this.cameraOffset / this.trackLength) * trackWidth;
        const cameraEndX = 15 + ((this.cameraOffset + this.viewportWidth) / this.trackLength) * trackWidth;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(cameraStartX, 10, cameraEndX - cameraStartX, this.minimapCanvas.height - 20);
        
        // Vẽ vịt
        this.ducks.forEach(duck => {
            const x = 15 + (duck.position / this.trackLength) * trackWidth;
            const y = 10 + Math.random() * (this.minimapCanvas.height - 20);
            
            ctx.fillStyle = duck.color;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    updateLeaderboard() {
        const list = document.getElementById('leaderboardList');
        const top30 = this.rankings.slice(0, 30);
        
        let html = '<ol>';
        top30.forEach((duck, index) => {
            const progress = ((duck.position / this.trackLength) * 100).toFixed(1);
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            const colorDot = `<span style="display:inline-block;width:12px;height:12px;background:${duck.color};border-radius:50%;margin-right:5px;"></span>`;
            html += `<li>${medal}${colorDot}${duck.name} - ${progress}%</li>`;
        });
        html += '</ol>';
        
        list.innerHTML = html;
    }

    endRace() {
        this.raceFinished = true;
        this.raceStarted = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.rankings = [...this.ducks].sort((a, b) => b.position - a.position);
        const winner = this.rankings[0];
        
        this.soundManager.playFinishSound();
        setTimeout(() => this.soundManager.playCrowdCheer(), 300);

        this.stats.totalRaces++;
        if (this.rankings.indexOf(this.rankings[0]) < 3) {
            this.stats.top3Finishes++;
        }
        this.saveStats();
        this.updateStatsDisplay();

        this.raceHistory.push({
            raceNumber: this.currentRaceNumber,
            winner: winner.id,
            duckCount: this.duckCount,
            duration: this.raceDuration,
            timestamp: new Date().toLocaleString('vi-VN')
        });

        document.getElementById('raceStatus').textContent = 'Kết thúc!';
        document.getElementById('timeLeft').textContent = '0s';
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('replayBtn').disabled = false;
        
        const resultPanel = document.getElementById('resultPanel');
        resultPanel.classList.remove('hidden');

        document.getElementById('resultTitle').innerHTML = '🏆 Cuộc Đua Kết Thúc!';
        
        let resultHTML = `
            <div class="result-winner">
                <h3>🏆 Nhà Vô Địch: ${winner.name} 🏆</h3>
                <div style="width:30px;height:30px;background:${winner.color};border-radius:50%;margin:10px auto;"></div>
            </div>
            <div class="result-stats">
                <p><strong>Top 3:</strong></p>
                <p>🥇 ${this.rankings[0].name} - ${((this.rankings[0].position/this.trackLength)*100).toFixed(1)}%</p>
                <p>🥈 ${this.rankings[1].name} - ${((this.rankings[1].position/this.trackLength)*100).toFixed(1)}%</p>
                <p>🥉 ${this.rankings[2].name} - ${((this.rankings[2].position/this.trackLength)*100).toFixed(1)}%</p>
            </div>
        `;

        document.getElementById('resultMessage').innerHTML = resultHTML;
    }

    toggleReplay() {
        if (this.replayData.length === 0) return;
        
        this.replayMode = !this.replayMode;
        
        if (this.replayMode) {
            this.replayFrame = 0;
            document.getElementById('replayBtn').textContent = '⏹ Dừng Replay';
            this.playReplay();
        } else {
            document.getElementById('replayBtn').textContent = '🔄 Replay';
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }

    playReplay() {
        if (!this.replayMode || this.replayFrame >= this.replayData.length) {
            this.replayMode = false;
            document.getElementById('replayBtn').textContent = '🔄 Replay';
            return;
        }

        const frame = this.replayData[this.replayFrame];
        
        frame.positions.forEach(p => {
            const duck = this.ducks.find(d => d.id === p.id);
            if (duck) {
                duck.position = p.pos;
                duck.finished = p.finished;
            }
        });

        this.rankings = [...this.ducks].sort((a, b) => b.position - a.position);

        this.draw(Date.now());
        this.drawMinimap();
        this.updateLeaderboard();
        
        document.getElementById('timeLeft').textContent = `Replay: ${frame.time.toFixed(1)}s`;

        this.replayFrame++;
        this.animationId = requestAnimationFrame(() => this.playReplay());
    }

    viewHistory() {
        if (this.raceHistory.length === 0) {
            alert('Chưa có lịch sử đua!');
            return;
        }

        const historyPanel = document.getElementById('historyPanel');
        const historyList = document.getElementById('historyList');
        
        let html = '<table class="history-table"><thead><tr><th>Trận</th><th>Vô địch</th><th>Số vịt</th><th>Thời gian</th><th>Ngày giờ</th></tr></thead><tbody>';
        
        this.raceHistory.slice().reverse().forEach(race => {
            html += `<tr>
                <td>#${race.raceNumber}</td>
                <td>Vịt #${race.winner}</td>
                <td>${race.duckCount}</td>
                <td>${race.duration}s</td>
                <td>${race.timestamp}</td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        historyList.innerHTML = html;
        
        historyPanel.classList.remove('hidden');
        document.getElementById('resultPanel').classList.add('hidden');
    }

    closeHistory() {
        document.getElementById('historyPanel').classList.add('hidden');
        document.getElementById('resultPanel').classList.remove('hidden');
    }
    
    toggleFullscreen() {
        const canvas = document.getElementById('raceCanvas');
        if (!document.fullscreenElement) {
            // Fullscreen chỉ canvas đua
            canvas.requestFullscreen().catch(err => {
                console.log('Fullscreen error:', err);
            });
            this.isFullscreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                this.isFullscreen = false;
            }
        }
    }

    reset() {
        this.ducks = [];
        this.raceStarted = false;
        this.raceFinished = false;
        this.racePaused = false;
        this.rankings = [];
        this.highlights = [];
        this.replayMode = false;
        this.replayData = [];

        document.getElementById('resultPanel').classList.add('hidden');
        document.getElementById('historyPanel').classList.add('hidden');
        document.getElementById('raceInfo').classList.add('hidden');
        document.getElementById('controlPanel').classList.add('hidden');
        document.getElementById('raceCanvas').classList.add('hidden');
        document.getElementById('minimap').classList.add('hidden');
        document.getElementById('leaderboard').classList.add('hidden');
        document.getElementById('highlightsPanel').classList.add('hidden');
        document.getElementById('bigTimer').classList.add('hidden');

        document.getElementById('settingsPanel').classList.remove('hidden');
    }
}

const game = new Game();
