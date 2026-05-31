// RetroTV Simulator - Video Player with Preloading
const Player = (function() {
    let videoPlayer;
    let programCard;
    let bgCanvas, bgCtx;
    let bgAnimFrame = null;
    let currentProgram = null;
    let currentChannel = null;
    let videoFallbackActive = false;

    const preloadPool = new Map();
    const MAX_PRELOAD = RetroTVConfig.video.preloadMax;

    function init() {
        videoPlayer = document.getElementById('videoPlayer');
        programCard = document.getElementById('programCard');
        bgCanvas = document.getElementById('bgCanvas');
        bgCtx = bgCanvas.getContext('2d');
        bgCanvas.width = 640;
        bgCanvas.height = 480;

        videoPlayer.addEventListener('ended', onVideoEnded);
    }

    function playProgram(program, channel) {
        currentProgram = program;
        currentChannel = channel;
        videoFallbackActive = false;

        EffectsEngine.hideAdInfo();

        if (!program.videoUrl && program.type !== 'ad') {
            showFallback(program, channel);
            return;
        }

        let videoUrl = program.videoUrl;
        if (program.type === 'ad') {
            const slotDuration = program.duration || RetroTVConfig.ads.defaultSlotDuration;
            const ads = AdEngine.selectAds(channel.id, slotDuration);
            if (ads.length > 0) {
                videoUrl = ads[0].videoUrl;
                program._adQueue = ads;
                program._adIndex = 0;
                EffectsEngine.showAdInfo(ads[0].name, 0, ads.length);
            } else {
                showFallback(program, channel);
                return;
            }
        }

        const elapsed = TVUtils.getElapsedSeconds(program);

        videoPlayer.classList.remove('hidden');
        programCard.classList.add('hidden');
        if (bgAnimFrame) { cancelAnimationFrame(bgAnimFrame); bgAnimFrame = null; }

        const preloaded = preloadPool.get(videoUrl);
        if (preloaded && preloaded.readyState >= 2) {
            videoPlayer.src = preloaded.src;
            videoPlayer.currentTime = preloaded.currentTime;
            videoPlayer.play().catch(() => showFallback(program, channel));
            preloadPool.delete(videoUrl);
            return;
        }

        const currentSrc = videoPlayer.getAttribute('data-src');
        if (currentSrc !== videoUrl) {
            videoPlayer.setAttribute('data-src', videoUrl);
            videoPlayer.src = videoUrl;
            videoPlayer.load();
        }

        videoPlayer.onloadedmetadata = function() {
            const duration = videoPlayer.duration;
            if (duration > 0 && program.type !== 'ad') {
                videoPlayer.currentTime = elapsed % duration;
            }
            videoPlayer.play().catch(() => showFallback(program, channel));
        };

        videoPlayer.onerror = function() {
            showFallback(program, channel);
        };

        if (videoPlayer.readyState >= 1) {
            const duration = videoPlayer.duration;
            if (duration > 0 && program.type !== 'ad') {
                videoPlayer.currentTime = elapsed % duration;
            }
            videoPlayer.play().catch(() => showFallback(program, channel));
        }
    }

    function showFallback(program, channel) {
        videoFallbackActive = true;
        videoPlayer.classList.add('hidden');
        videoPlayer.pause();
        programCard.classList.remove('hidden');
        startBgAnimation(program.genre, channel.color);
    }

    function stop() {
        videoPlayer.pause();
        videoPlayer.removeAttribute('src');
        videoPlayer.removeAttribute('data-src');
        videoPlayer.classList.add('hidden');
        if (bgAnimFrame) { cancelAnimationFrame(bgAnimFrame); bgAnimFrame = null; }
    }

    function onVideoEnded() {
        if (currentProgram && currentProgram._adQueue) {
            currentProgram._adIndex++;
            if (currentProgram._adIndex < currentProgram._adQueue.length) {
                const nextAd = currentProgram._adQueue[currentProgram._adIndex];

                if (RetroTVConfig.ads.transitionBetweenAds) {
                    videoPlayer.style.opacity = '0';
                    setTimeout(() => {
                        videoPlayer.src = nextAd.videoUrl;
                        videoPlayer.currentTime = 0;
                        videoPlayer.play().catch(() => {});
                        EffectsEngine.showAdInfo(nextAd.name, currentProgram._adIndex, currentProgram._adQueue.length);
                        videoPlayer.style.opacity = '1';
                    }, RetroTVConfig.ads.transitionDuration);
                } else {
                    videoPlayer.src = nextAd.videoUrl;
                    videoPlayer.currentTime = 0;
                    videoPlayer.play().catch(() => {});
                    EffectsEngine.showAdInfo(nextAd.name, currentProgram._adIndex, currentProgram._adQueue.length);
                }
                return;
            }
            EffectsEngine.hideAdInfo();
        }

        const progress = TVUtils.getProgramProgress(currentProgram);
        if (progress < 0.98) {
            videoPlayer.currentTime = 0;
            videoPlayer.play().catch(() => {});
        } else {
            if (typeof TVApp !== 'undefined') TVApp.advanceToNextProgram();
        }
    }

    function preloadVideo(url) {
        if (!url || preloadPool.has(url) || preloadPool.size >= MAX_PRELOAD) return;

        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.src = url;
        video.load();
        preloadPool.set(url, video);
    }

    function preloadNext(nextProgram) {
        if (nextProgram && nextProgram.videoUrl) {
            preloadVideo(nextProgram.videoUrl);
        }
    }

    function preloadAdjacentChannels(channels, currentIndex) {
        if (!RetroTVConfig.video.preloadAdjacentChannels) return;

        const prev = (currentIndex - 1 + channels.length) % channels.length;
        const next = (currentIndex + 1) % channels.length;

        [prev, next].forEach(idx => {
            const { program } = TVUtils.getCurrentProgram(channels[idx]);
            if (program && program.videoUrl) {
                preloadVideo(program.videoUrl);
            }
        });
    }

    function preloadChannel(channel) {
        const { program } = TVUtils.getCurrentProgram(channel);
        if (program && program.videoUrl) {
            preloadVideo(program.videoUrl);
        }
    }

    function clearPreloadPool() {
        preloadPool.forEach(video => {
            video.pause();
            video.removeAttribute('src');
            video.load();
        });
        preloadPool.clear();
    }

    function isPreloaded(url) {
        const video = preloadPool.get(url);
        return video && video.readyState >= 2;
    }

    function isUsingFallback() {
        return videoFallbackActive;
    }

    // Background animations
    function startBgAnimation(genre, color) {
        if (bgAnimFrame) cancelAnimationFrame(bgAnimFrame);
        const drawFn = BG_ANIMATIONS[genre] || BG_ANIMATIONS.default;
        let frame = 0;
        function animate() {
            drawFn(bgCtx, frame, color);
            frame++;
            bgAnimFrame = requestAnimationFrame(animate);
        }
        animate();
    }

    return { init, playProgram, stop, preloadNext, preloadAdjacentChannels, preloadChannel, clearPreloadPool, isPreloaded, isUsingFallback };
})();

// Background animation definitions
const BG_ANIMATIONS = {
    news(ctx, frame) {
        ctx.fillStyle = '#1a237e'; ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#c62828'; ctx.fillRect(0, 420, 640, 60);
        ctx.fillStyle = '#fff'; ctx.font = '20px Courier New';
        const ticker = '最新消息 >>> 国内外要闻持续更新中... 经济数据发布... 科技动态... ';
        ctx.fillText(ticker + ticker, 640 - (frame * 2) % (ticker.length * 12), 455);
        ctx.strokeStyle = 'rgba(100, 180, 255, 0.3)'; ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
            ctx.beginPath(); ctx.arc(320 + Math.sin(frame * 0.01 + i) * 50, 200, 80 + i * 10, 0, Math.PI * 2); ctx.stroke();
        }
    },
    weather(ctx, frame) {
        const grad = ctx.createLinearGradient(0, 0, 0, 480);
        grad.addColorStop(0, '#0277bd'); grad.addColorStop(1, '#81d4fa');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        for (let i = 0; i < 5; i++) {
            const x = ((frame * 0.5 + i * 150) % 800) - 80;
            ctx.beginPath(); ctx.arc(x, 80 + i * 40, 30, 0, Math.PI * 2);
            ctx.arc(x + 25, 70 + i * 40, 25, 0, Math.PI * 2);
            ctx.arc(x + 50, 80 + i * 40, 30, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#fff'; ctx.font = 'bold 60px Courier New'; ctx.fillText('26°C', 250, 300);
    },
    nature(ctx, frame) {
        const grad = ctx.createLinearGradient(0, 0, 0, 480);
        grad.addColorStop(0, '#1b5e20'); grad.addColorStop(0.6, '#2e7d32'); grad.addColorStop(1, '#4e342e');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, 640, 480);
        for (let i = 0; i < 8; i++) {
            const x = i * 85 + 20, sway = Math.sin(frame * 0.02 + i) * 3;
            ctx.fillStyle = '#33691e'; ctx.beginPath();
            ctx.moveTo(x + sway, 200 - i * 10); ctx.lineTo(x - 30 + sway, 400); ctx.lineTo(x + 30 + sway, 400); ctx.fill();
        }
    },
    movie(ctx, frame) {
        ctx.fillStyle = '#0d0d0d'; ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 640, 60); ctx.fillRect(0, 420, 640, 60);
        const grd = ctx.createRadialGradient(320 + Math.sin(frame * 0.01) * 100, 240, 10, 320, 240, 250);
        grd.addColorStop(0, 'rgba(80, 60, 30, 0.4)'); grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, 640, 480);
    },
    sports(ctx, frame) {
        ctx.fillStyle = '#1b5e20'; ctx.fillRect(0, 0, 640, 480);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, 540, 380);
        ctx.beginPath(); ctx.moveTo(320, 50); ctx.lineTo(320, 430); ctx.stroke();
        ctx.beginPath(); ctx.arc(320, 240, 60, 0, Math.PI * 2); ctx.stroke();
        const bx = 320 + Math.cos(frame * 0.03) * 150, by = 240 + Math.sin(frame * 0.05) * 100;
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2); ctx.fill();
    },
    variety(ctx, frame) {
        ctx.fillStyle = '#1a0033'; ctx.fillRect(0, 0, 640, 480);
        for (let i = 0; i < 6; i++) {
            const angle = (frame * 0.02) + (i * Math.PI / 3);
            const x = 320 + Math.cos(angle) * 200, y = 240 + Math.sin(angle) * 100;
            const hue = (frame * 2 + i * 60) % 360;
            const grd = ctx.createRadialGradient(x, y, 0, x, y, 80);
            grd.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.4)`); grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd; ctx.fillRect(0, 0, 640, 480);
        }
    },
    music(ctx, frame) {
        ctx.fillStyle = '#1a0033'; ctx.fillRect(0, 0, 640, 480);
        for (let i = 0; i < 32; i++) {
            const height = (Math.sin(frame * 0.1 + i * 0.5) + 1) * 100 + 20;
            ctx.fillStyle = `hsl(${(i * 10 + frame) % 360}, 80%, 50%)`;
            ctx.fillRect(i * 20 + 5, 480 - height, 15, height);
        }
    },
    drama(ctx, frame) {
        const grad = ctx.createLinearGradient(0, 0, 0, 480);
        grad.addColorStop(0, '#2c1810'); grad.addColorStop(1, '#1a0f0a');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, 640, 480);
        const grd = ctx.createRadialGradient(320, 200, 20, 320, 250, 300);
        grd.addColorStop(0, 'rgba(255, 200, 100, 0.2)'); grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, 640, 480);
    },
    game(ctx, frame) {
        ctx.fillStyle = '#000066'; ctx.fillRect(0, 0, 640, 480);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + frame * 0.02;
            ctx.fillStyle = i % 2 === 0 ? '#ff0066' : '#ffcc00';
            ctx.beginPath(); ctx.moveTo(320, 240); ctx.arc(320, 240, 150, angle, angle + Math.PI / 4); ctx.fill();
        }
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(320, 240, 30, 0, Math.PI * 2); ctx.fill();
    },
    comedy(ctx, frame) {
        ctx.fillStyle = '#330000'; ctx.fillRect(0, 0, 640, 480);
        for (let i = 0; i < 10; i++) {
            const wave = Math.sin(frame * 0.03 + i * 0.5) * 10;
            ctx.fillStyle = i % 2 === 0 ? '#8b0000' : '#a00000';
            ctx.fillRect(i * 70 + wave, 0, 65, 480);
        }
    },
    documentary(ctx, frame) {
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = `rgba(139, 119, 80, ${0.1 + Math.random() * 0.05})`;
        ctx.fillRect(0, 0, 640, 480);
    },
    talk(ctx, frame) {
        ctx.fillStyle = '#1a1a3e'; ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#2a2a4e'; ctx.fillRect(150, 300, 100, 150); ctx.fillRect(390, 300, 100, 150);
    },
    lifestyle(ctx, frame) {
        const grad = ctx.createLinearGradient(0, 0, 0, 480);
        grad.addColorStop(0, '#fff8e1'); grad.addColorStop(1, '#ffe0b2');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, 640, 480);
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(255, 120, 0, ${0.2 - i * 0.03})`; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(320, 240, 50 + i * 40 + Math.sin(frame * 0.02) * 10, 0, Math.PI * 2); ctx.stroke();
        }
    },
    food(ctx, frame) {
        ctx.fillStyle = '#3e2723'; ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(320, 380, 100, 30, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            let y = 400 - (frame * 0.5 + i * 50) % 300;
            ctx.moveTo(280 + i * 40, 400);
            ctx.quadraticCurveTo(290 + i * 40 + Math.sin(frame * 0.05 + i) * 20, y + 50, 280 + i * 40 + Math.sin(frame * 0.03 + i) * 10, y);
            ctx.stroke();
        }
    },
    fitness(ctx, frame) {
        ctx.fillStyle = '#263238'; ctx.fillRect(0, 0, 640, 480);
        ctx.strokeStyle = '#00e676'; ctx.lineWidth = 3; ctx.beginPath();
        for (let x = 0; x < 640; x += 2) {
            const phase = (x + frame * 3) * 0.02;
            let y = 240;
            if (Math.floor(phase) % 4 === 0) y += Math.sin(phase * 10) * 80;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
    },
    law(ctx, frame) {
        ctx.fillStyle = '#1a237e'; ctx.fillRect(0, 0, 640, 480);
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3;
        const sway = Math.sin(frame * 0.02) * 10;
        ctx.beginPath(); ctx.moveTo(320, 150); ctx.lineTo(320, 400); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(220, 200 + sway); ctx.lineTo(420, 200 - sway); ctx.stroke();
        ctx.beginPath(); ctx.arc(220, 240 + sway, 30, 0, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(420, 240 - sway, 30, 0, Math.PI); ctx.stroke();
    },
    test(ctx, frame) {
        const colors = ['#fff', '#ff0', '#0ff', '#0f0', '#f0f', '#f00', '#00f', '#000'];
        const barWidth = 640 / colors.length;
        colors.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i * barWidth, 0, barWidth, 360); });
        ctx.fillStyle = '#111'; ctx.fillRect(0, 360, 640, 120);
        ctx.fillStyle = '#fff'; ctx.font = '16px Courier New'; ctx.fillText('测试信号 - 暂停播出', 230, 420);
    },
    ad(ctx, frame) {
        const hue = (frame * 2) % 360;
        ctx.fillStyle = `hsl(${hue}, 60%, 20%)`; ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 36px Courier New'; ctx.textAlign = 'center';
        ctx.fillText('广告时间', 320, 220);
        ctx.font = '18px Courier New'; ctx.fillText(`[ ${AdEngine.getCurrentPeriodName()}时段广告 ]`, 320, 270);
        ctx.textAlign = 'left';
        ctx.strokeStyle = `hsl(${(hue + 180) % 360}, 80%, 50%)`; ctx.lineWidth = 4;
        ctx.setLineDash([10, 10]); ctx.lineDashOffset = -frame * 0.5;
        ctx.strokeRect(30, 30, 580, 420); ctx.setLineDash([]);
    },
    default(ctx, frame, color) {
        ctx.fillStyle = color || '#333'; ctx.fillRect(0, 0, 640, 480);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            for (let x = 0; x < 640; x += 5) {
                const y = 240 + Math.sin(x * 0.01 + frame * 0.02 + i) * (30 + i * 20);
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
};
