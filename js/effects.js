// RetroTV Simulator - Retro Visual Effects Engine
const EffectsEngine = (function() {
    let noiseCanvas, noiseCtx, noiseAnimFrame;
    let glitchTimer = null;
    let vhsTimer = null;
    let bannerTimer = null;
    let bannerHideTimer = null;

    function init() {
        createNoiseOverlay();
        createGlitchOverlay();
        createVhsOverlay();
        createPreviewBanner();
        createAdInfoOverlay();

        if (RetroTVConfig.effects.noise.enabled) startNoise();
        if (RetroTVConfig.effects.signalGlitch.enabled) startGlitchCycle();
        if (RetroTVConfig.effects.vhsTracking.enabled) startVhsCycle();
    }

    function createNoiseOverlay() {
        noiseCanvas = document.createElement('canvas');
        noiseCanvas.id = 'noiseOverlay';
        noiseCanvas.className = 'noise-overlay';
        noiseCanvas.width = 320;
        noiseCanvas.height = 240;
        document.querySelector('.screen').appendChild(noiseCanvas);
        noiseCtx = noiseCanvas.getContext('2d');
    }

    function createGlitchOverlay() {
        const el = document.createElement('div');
        el.id = 'glitchOverlay';
        el.className = 'glitch-overlay';
        document.querySelector('.screen').appendChild(el);
    }

    function createVhsOverlay() {
        const el = document.createElement('div');
        el.id = 'vhsOverlay';
        el.className = 'vhs-overlay';
        document.querySelector('.screen').appendChild(el);
    }

    function createPreviewBanner() {
        const el = document.createElement('div');
        el.id = 'previewBanner';
        el.className = 'preview-banner';
        el.innerHTML = '<span class="preview-label">即将播出</span><span class="preview-name" id="previewName"></span>';
        document.querySelector('.screen').appendChild(el);
    }

    function createAdInfoOverlay() {
        const el = document.createElement('div');
        el.id = 'adInfoOverlay';
        el.className = 'ad-info-overlay';
        el.innerHTML = '<span class="ad-info-name" id="adInfoName"></span><span class="ad-info-counter" id="adInfoCounter"></span>';
        document.querySelector('.screen').appendChild(el);
    }

    function startNoise() {
        const config = RetroTVConfig.effects.noise;
        function drawNoise() {
            const imageData = noiseCtx.createImageData(320, 240);
            const data = imageData.data;
            const intensity = config.intensity * 255;
            const spike = Math.random() < config.spikeChance;
            const mult = spike ? 4 : 1;

            for (let i = 0; i < data.length; i += 16) {
                const v = (Math.random() - 0.5) * intensity * mult;
                data[i] = v;
                data[i + 1] = v;
                data[i + 2] = v;
                data[i + 3] = Math.abs(v) * 2;
            }
            noiseCtx.putImageData(imageData, 0, 0);
            noiseAnimFrame = requestAnimationFrame(drawNoise);
        }
        drawNoise();
    }

    function stopNoise() {
        if (noiseAnimFrame) {
            cancelAnimationFrame(noiseAnimFrame);
            noiseAnimFrame = null;
        }
    }

    function startGlitchCycle() {
        const config = RetroTVConfig.effects.signalGlitch;
        scheduleGlitch();

        function scheduleGlitch() {
            const delay = config.frequency * (0.5 + Math.random());
            glitchTimer = setTimeout(() => {
                triggerGlitch();
                scheduleGlitch();
            }, delay);
        }
    }

    function triggerGlitch() {
        const overlay = document.getElementById('glitchOverlay');
        const screen = document.querySelector('.screen');
        if (!overlay || !screen) return;

        const effects = ['glitch-horizontal', 'glitch-color', 'glitch-tear'];
        const effect = effects[Math.floor(Math.random() * effects.length)];

        overlay.classList.add('active', effect);
        screen.classList.add('signal-bad');

        if (RetroTVConfig.effects.colorBleed.enabled) {
            screen.classList.add('color-bleed');
        }

        const duration = RetroTVConfig.effects.signalGlitch.duration * (0.5 + Math.random());
        setTimeout(() => {
            overlay.classList.remove('active', ...effects);
            screen.classList.remove('signal-bad', 'color-bleed');
        }, duration);
    }

    function startVhsCycle() {
        const config = RetroTVConfig.effects.vhsTracking;
        scheduleVhs();

        function scheduleVhs() {
            const delay = config.frequency * (0.5 + Math.random());
            vhsTimer = setTimeout(() => {
                triggerVhsTracking();
                scheduleVhs();
            }, delay);
        }
    }

    function triggerVhsTracking() {
        const overlay = document.getElementById('vhsOverlay');
        if (!overlay) return;

        overlay.classList.add('active');
        const duration = RetroTVConfig.effects.vhsTracking.duration * (0.7 + Math.random() * 0.6);
        setTimeout(() => {
            overlay.classList.remove('active');
        }, duration);
    }

    function showPreviewBanner(nextProgramName) {
        if (!RetroTVConfig.effects.previewBanner.enabled) return;

        const banner = document.getElementById('previewBanner');
        const nameEl = document.getElementById('previewName');
        if (!banner || !nameEl) return;

        nameEl.textContent = nextProgramName;
        banner.classList.add('visible');

        if (bannerHideTimer) clearTimeout(bannerHideTimer);
        bannerHideTimer = setTimeout(() => {
            banner.classList.remove('visible');
        }, RetroTVConfig.effects.previewBanner.displayDuration);
    }

    function hidePreviewBanner() {
        const banner = document.getElementById('previewBanner');
        if (banner) banner.classList.remove('visible');
    }

    function showAdInfo(adName, currentIndex, totalCount) {
        if (!RetroTVConfig.ads.showAdName && !RetroTVConfig.ads.showAdCounter) return;

        const overlay = document.getElementById('adInfoOverlay');
        const nameEl = document.getElementById('adInfoName');
        const counterEl = document.getElementById('adInfoCounter');
        if (!overlay) return;

        if (nameEl && RetroTVConfig.ads.showAdName) {
            nameEl.textContent = adName;
            nameEl.style.display = '';
        } else if (nameEl) {
            nameEl.style.display = 'none';
        }

        if (counterEl && RetroTVConfig.ads.showAdCounter) {
            counterEl.textContent = `${currentIndex + 1}/${totalCount}`;
            counterEl.style.display = '';
        } else if (counterEl) {
            counterEl.style.display = 'none';
        }

        overlay.classList.add('visible');
    }

    function hideAdInfo() {
        const overlay = document.getElementById('adInfoOverlay');
        if (overlay) overlay.classList.remove('visible');
    }

    function triggerChannelSwitchEffect() {
        const screen = document.querySelector('.screen');
        if (!screen) return;
        screen.classList.add('channel-switch-flash');
        setTimeout(() => {
            screen.classList.remove('channel-switch-flash');
        }, 100);
    }

    function setNoiseEnabled(enabled) {
        RetroTVConfig.effects.noise.enabled = enabled;
        if (enabled) startNoise(); else stopNoise();
    }

    function setGlitchEnabled(enabled) {
        RetroTVConfig.effects.signalGlitch.enabled = enabled;
        if (enabled) {
            startGlitchCycle();
        } else {
            if (glitchTimer) clearTimeout(glitchTimer);
        }
    }

    function setVhsEnabled(enabled) {
        RetroTVConfig.effects.vhsTracking.enabled = enabled;
        if (enabled) {
            startVhsCycle();
        } else {
            if (vhsTimer) clearTimeout(vhsTimer);
        }
    }

    function destroy() {
        stopNoise();
        if (glitchTimer) clearTimeout(glitchTimer);
        if (vhsTimer) clearTimeout(vhsTimer);
        if (bannerTimer) clearTimeout(bannerTimer);
        if (bannerHideTimer) clearTimeout(bannerHideTimer);
    }

    return {
        init, showPreviewBanner, hidePreviewBanner,
        showAdInfo, hideAdInfo,
        triggerGlitch, triggerVhsTracking, triggerChannelSwitchEffect,
        setNoiseEnabled, setGlitchEnabled, setVhsEnabled,
        destroy
    };
})();
