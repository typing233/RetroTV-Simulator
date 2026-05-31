// RetroTV Simulator - Main Application
const TVApp = (function() {
    let currentChannelIndex = 0;
    let isTransitioning = false;
    let currentProgramStartMinute = -1;
    let staticAnimFrame = null;
    let previewBannerShown = false;

    function init() {
        Player.init();
        UI.init();
        EffectsEngine.init();
        ScheduleView.init();

        UI.renderChannelList(CHANNELS, currentChannelIndex);
        UI.renderSchedule(CHANNELS[currentChannelIndex]);
        UI.updateClock();
        tuneToCurrentProgram();

        startStatic();

        setInterval(() => {
            UI.updateClock();
            updateDisplay();
        }, 1000);

        setInterval(() => {
            UI.renderSchedule(CHANNELS[currentChannelIndex]);
            UI.renderChannelList(CHANNELS, currentChannelIndex);
        }, 30000);

        setInterval(() => {
            checkPreload();
        }, 3000);

        document.addEventListener('keydown', handleKeydown);

        preloadAllAdjacentChannels();
    }

    function tuneToCurrentProgram() {
        const channel = CHANNELS[currentChannelIndex];
        const { program } = TVUtils.getCurrentProgram(channel);
        UI.showLogo(channel.logo);
        currentProgramStartMinute = program.startMinute;
        UI.updateProgramInfo(program);
        Player.playProgram(program, channel);
        previewBannerShown = false;
    }

    function updateDisplay() {
        const channel = CHANNELS[currentChannelIndex];
        const { program, index, day } = TVUtils.getCurrentProgram(channel);

        if (program.startMinute !== currentProgramStartMinute && !isTransitioning) {
            currentProgramStartMinute = program.startMinute;
            previewBannerShown = false;
            const blackScreen = document.getElementById('blackScreen');
            blackScreen.classList.add('active');
            setTimeout(() => {
                UI.updateProgramInfo(program);
                Player.playProgram(program, channel);
                UI.flashLogo();
                blackScreen.classList.remove('active');
                UI.renderSchedule(channel);
            }, RetroTVConfig.video.transitionDuration);
            return;
        }

        const progress = TVUtils.getProgramProgress(program);
        UI.updateProgress(progress);

        if (!previewBannerShown && progress > 0) {
            const remainingSeconds = (1 - progress) * program.duration * 60;
            if (remainingSeconds <= RetroTVConfig.effects.previewBanner.showBeforeEnd && remainingSeconds > 0) {
                const next = TVUtils.getNextProgram(channel, day, index);
                if (next.program.type !== 'off-air') {
                    EffectsEngine.showPreviewBanner(next.program.name);
                    previewBannerShown = true;
                }
            }
        }
    }

    function advanceToNextProgram() {
        const channel = CHANNELS[currentChannelIndex];
        const { index, day } = TVUtils.getCurrentProgram(channel);
        const next = TVUtils.getNextProgram(channel, day, index);

        const blackScreen = document.getElementById('blackScreen');
        blackScreen.classList.add('active');
        setTimeout(() => {
            currentProgramStartMinute = next.program.startMinute;
            previewBannerShown = false;
            UI.updateProgramInfo(next.program);
            Player.playProgram(next.program, channel);
            blackScreen.classList.remove('active');
            UI.renderSchedule(channel);
        }, RetroTVConfig.video.transitionDuration);
    }

    function switchChannel(index) {
        if (index === currentChannelIndex || isTransitioning) return;
        isTransitioning = true;

        const blackScreen = document.getElementById('blackScreen');
        const staticOverlay = document.getElementById('staticOverlay');

        // Use channelSwitchStatic.duration from config
        const configStaticDuration = RetroTVConfig.effects.channelSwitchStatic.duration;
        const targetProgram = TVUtils.getCurrentProgram(CHANNELS[index]).program;
        const isPreloaded = targetProgram && targetProgram.videoUrl && Player.isPreloaded(targetProgram.videoUrl);
        const staticDuration = isPreloaded ? Math.max(60, configStaticDuration * 0.4) : configStaticDuration;

        Player.stop();
        EffectsEngine.hidePreviewBanner();
        EffectsEngine.triggerChannelSwitchEffect();
        blackScreen.classList.add('active');

        setTimeout(() => {
            blackScreen.classList.remove('active');
            staticOverlay.classList.add('active');
            startStatic();
            UI.showChannelOsd(CHANNELS[index].id);

            setTimeout(() => {
                staticOverlay.classList.remove('active');
                stopStatic();
                currentChannelIndex = index;
                currentProgramStartMinute = -1;
                previewBannerShown = false;
                tuneToCurrentProgram();
                UI.renderChannelList(CHANNELS, currentChannelIndex);
                UI.renderSchedule(CHANNELS[currentChannelIndex]);
                isTransitioning = false;

                preloadAllAdjacentChannels();
            }, staticDuration);
        }, 50);
    }

    function nextChannel() {
        switchChannel((currentChannelIndex + 1) % CHANNELS.length);
    }

    function prevChannel() {
        switchChannel((currentChannelIndex - 1 + CHANNELS.length) % CHANNELS.length);
    }

    function checkPreload() {
        const channel = CHANNELS[currentChannelIndex];
        const { program, index, day } = TVUtils.getCurrentProgram(channel);
        const progress = TVUtils.getProgramProgress(program);

        if (progress > 0.7) {
            const next = TVUtils.getNextProgram(channel, day, index);
            Player.preloadNext(next.program);
        }

        Player.preloadAdjacentChannels(CHANNELS, currentChannelIndex);
    }

    function preloadAllAdjacentChannels() {
        const prev = (currentChannelIndex - 1 + CHANNELS.length) % CHANNELS.length;
        const next = (currentChannelIndex + 1) % CHANNELS.length;
        [prev, next].forEach(idx => {
            Player.preloadChannel(CHANNELS[idx]);
        });
    }

    function handleKeydown(e) {
        if (ScheduleView.isOpen()) {
            if (e.key === 'Escape') ScheduleView.close();
            return;
        }

        switch (e.key) {
            case 'ArrowUp': e.preventDefault(); prevChannel(); break;
            case 'ArrowDown': e.preventDefault(); nextChannel(); break;
            case 'g': case 'G': ScheduleView.open(); break;
            case '1': case '2': case '3': case '4': case '5':
            case '6': case '7': case '8': case '9':
                const idx = parseInt(e.key) - 1;
                if (idx < CHANNELS.length) switchChannel(idx);
                break;
        }
    }

    function getCurrentChannelIndex() {
        return currentChannelIndex;
    }

    function refreshUI() {
        UI.renderChannelList(CHANNELS, currentChannelIndex);
        UI.renderSchedule(CHANNELS[currentChannelIndex]);
    }

    // Static noise for channel switching
    let staticCanvas, staticCtx;

    function startStatic() {
        staticCanvas = document.getElementById('staticCanvas');
        staticCtx = staticCanvas.getContext('2d');
        staticCanvas.width = 320;
        staticCanvas.height = 240;
        function drawStatic() {
            const imageData = staticCtx.createImageData(320, 240);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const v = Math.random() * 255;
                data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255;
            }
            staticCtx.putImageData(imageData, 0, 0);
            staticAnimFrame = requestAnimationFrame(drawStatic);
        }
        drawStatic();
    }

    function stopStatic() {
        if (staticAnimFrame) { cancelAnimationFrame(staticAnimFrame); staticAnimFrame = null; }
    }

    return {
        init, switchChannel, nextChannel, prevChannel,
        advanceToNextProgram, getCurrentChannelIndex, refreshUI
    };
})();

// Boot
document.addEventListener('DOMContentLoaded', TVApp.init);
