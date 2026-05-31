// RetroTV Simulator - UI Module (Channel List, Schedule, Logo Overlay, OSD)
const UI = (function() {
    let channelList, scheduleList, clockDisplay, channelLogo, channelOsd, adBadge;
    let programTitle, programTime, programDesc;
    let progressFill;
    let logoTimeout = null;
    let osdTimeout = null;
    let reshowInterval = null;

    function init() {
        channelList = document.getElementById('channelList');
        scheduleList = document.getElementById('scheduleList');
        clockDisplay = document.getElementById('clockDisplay');
        channelLogo = document.getElementById('channelLogo');
        channelOsd = document.getElementById('channelOsd');
        adBadge = document.getElementById('adBadge');
        programTitle = document.getElementById('programTitle');
        programTime = document.getElementById('programTime');
        programDesc = document.getElementById('programDesc');
        progressFill = document.getElementById('progressFill');

        applyLogoConfig();
        applyEffectsConfig();
        startLogoReshow();
    }

    function applyLogoConfig() {
        const config = RetroTVConfig.channelLogo;
        if (!channelLogo) return;

        // Apply fadeSpeed as CSS transition duration
        channelLogo.style.transitionDuration = (config.fadeSpeed / 1000) + 's';

        // Apply opacity
        channelLogo.style.setProperty('--logo-opacity', config.opacity);

        // Apply position
        const positions = {
            'top-right': { top: '15px', right: '15px', bottom: '', left: '' },
            'top-left': { top: '15px', right: '', bottom: '', left: '15px' },
            'bottom-right': { top: '', right: '15px', bottom: '15px', left: '' },
            'bottom-left': { top: '', right: '', bottom: '15px', left: '15px' }
        };
        const pos = positions[config.position] || positions['top-right'];
        Object.assign(channelLogo.style, pos);

        if (config.backgroundBlur) {
            channelLogo.style.backdropFilter = 'blur(4px)';
            channelLogo.style.webkitBackdropFilter = 'blur(4px)';
        } else {
            channelLogo.style.backdropFilter = 'none';
            channelLogo.style.webkitBackdropFilter = 'none';
        }
    }

    function applyEffectsConfig() {
        const screen = document.querySelector('.screen');
        if (!screen) return;

        // scanlines.enabled
        const scanlines = screen.querySelector('.scanlines');
        if (scanlines) {
            scanlines.style.display = RetroTVConfig.effects.scanlines.enabled ? '' : 'none';
        }

        // flicker.enabled
        if (RetroTVConfig.effects.flicker.enabled) {
            screen.classList.add('flicker');
        } else {
            screen.classList.remove('flicker');
        }
    }

    function startLogoReshow() {
        const config = RetroTVConfig.channelLogo;
        if (!config.periodicReshow || config.alwaysVisible) return;

        if (reshowInterval) clearInterval(reshowInterval);
        reshowInterval = setInterval(() => {
            flashLogo();
        }, config.reshowInterval);
    }

    function showLogo(text) {
        if (!RetroTVConfig.channelLogo.enabled) {
            channelLogo.style.opacity = '0';
            return;
        }
        channelLogo.textContent = text;
        channelLogo.style.opacity = String(RetroTVConfig.channelLogo.opacity);

        if (RetroTVConfig.channelLogo.alwaysVisible) return;

        if (logoTimeout) clearTimeout(logoTimeout);
        logoTimeout = setTimeout(() => {
            channelLogo.style.opacity = '0';
        }, RetroTVConfig.channelLogo.showDuration);
    }

    function flashLogo() {
        if (!RetroTVConfig.channelLogo.enabled) return;
        channelLogo.style.opacity = String(RetroTVConfig.channelLogo.opacity);

        if (RetroTVConfig.channelLogo.alwaysVisible) return;

        if (logoTimeout) clearTimeout(logoTimeout);
        logoTimeout = setTimeout(() => {
            channelLogo.style.opacity = '0';
        }, 3000);
    }

    function showChannelOsd(channelId) {
        channelOsd.textContent = String(channelId).padStart(2, '0');
        channelOsd.classList.add('visible');
        if (osdTimeout) clearTimeout(osdTimeout);
        osdTimeout = setTimeout(() => channelOsd.classList.remove('visible'), 3000);
    }

    function renderChannelList(channels, currentIndex) {
        channelList.innerHTML = '';
        channels.forEach((ch, idx) => {
            const { program } = TVUtils.getCurrentProgram(ch);
            const li = document.createElement('li');
            li.className = `channel-item${idx === currentIndex ? ' active' : ''}`;
            li.innerHTML = `
                <div class="channel-num">${String(ch.id).padStart(2, '0')}</div>
                <div class="channel-info">
                    <div class="channel-name">${ch.name}</div>
                    <div class="channel-now-playing">正在播放: ${program.name}</div>
                </div>
            `;
            li.onclick = () => TVApp.switchChannel(idx);
            channelList.appendChild(li);
        });
    }

    function renderSchedule(channel) {
        const programs = TVUtils.getUpcomingPrograms(channel, 6);
        const { program: currentProg } = TVUtils.getCurrentProgram(channel);

        scheduleList.innerHTML = '';
        programs.forEach(prog => {
            const isCurrent = prog.startMinute === currentProg.startMinute;
            const div = document.createElement('div');
            div.className = `schedule-item${isCurrent ? ' current' : ''}${prog.type === 'ad' ? ' ad-slot' : ''}`;
            div.innerHTML = `
                <span class="schedule-time">${prog.startTime}</span>
                <span class="schedule-name">${prog.name}${prog.type === 'ad' ? ' [广告]' : ''}</span>
            `;
            scheduleList.appendChild(div);
        });
    }

    function updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        clockDisplay.textContent = `${days[now.getDay()]} ${timeStr}`;
    }

    function updateProgramInfo(program) {
        programTitle.textContent = program.name;
        programTime.textContent = `${program.startTime} - ${TVUtils.addMinutes(program.startTime, program.duration)}`;
        if (program.episode) {
            programDesc.textContent = program.episode;
        } else if (program.type === 'ad') {
            programDesc.textContent = `${AdEngine.getCurrentPeriodName()}时段广告`;
        } else if (program.type === 'off-air') {
            programDesc.textContent = '频道暂停播出';
        } else {
            programDesc.textContent = '';
        }
        adBadge.style.display = program.type === 'ad' ? 'block' : 'none';
    }

    function updateProgress(progress) {
        progressFill.style.width = `${progress * 100}%`;
    }

    return {
        init, showLogo, flashLogo, showChannelOsd,
        renderChannelList, renderSchedule, updateClock,
        updateProgramInfo, updateProgress
    };
})();
