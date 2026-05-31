// RetroTV Simulator - Weekly Schedule View
const ScheduleView = (function() {
    let modal = null;
    let selectedChannelIndex = 0;

    function init() {
        createModal();
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('visible')) close();
        });
    }

    function createModal() {
        modal = document.createElement('div');
        modal.id = 'scheduleModal';
        modal.className = 'schedule-modal';
        modal.innerHTML = `
            <div class="schedule-modal-content">
                <div class="schedule-modal-header">
                    <h2>每周节目单</h2>
                    <div class="schedule-header-info">
                        <span class="schedule-period-badge" id="schedulePeriodBadge"></span>
                        <span class="schedule-ad-count" id="scheduleAdCount"></span>
                    </div>
                    <button class="schedule-close-btn" onclick="ScheduleView.close()">&times;</button>
                </div>
                <div class="schedule-tabs" id="scheduleTabs"></div>
                <div class="schedule-legend" id="scheduleLegend"></div>
                <div class="schedule-grid-container">
                    <div class="schedule-grid" id="scheduleGrid"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function open() {
        selectedChannelIndex = typeof TVApp !== 'undefined' ? TVApp.getCurrentChannelIndex() : 0;
        renderTabs();
        renderLegend();
        renderGrid();
        updateHeaderInfo();
        modal.classList.add('visible');
    }

    function close() {
        modal.classList.remove('visible');
    }

    function updateHeaderInfo() {
        const badge = document.getElementById('schedulePeriodBadge');
        const adCount = document.getElementById('scheduleAdCount');
        if (badge) badge.textContent = `当前时段: ${AdEngine.getCurrentPeriodName()}`;
        if (adCount) adCount.textContent = `广告库: ${AdEngine.getLibrarySize()}条`;
    }

    function renderLegend() {
        const legend = document.getElementById('scheduleLegend');
        if (!legend) return;

        const colors = RetroTVConfig.schedule.genreColors;
        const genreNames = {
            news: '新闻', weather: '天气', nature: '自然', movie: '电影',
            sports: '体育', variety: '综艺', music: '音乐', drama: '电视剧',
            game: '游戏', comedy: '喜剧', documentary: '纪录片', talk: '访谈',
            lifestyle: '生活', food: '美食', fitness: '健身', law: '法制', ad: '广告'
        };

        const channel = CHANNELS[selectedChannelIndex];
        const genresInChannel = new Set();
        channel.schedule.forEach(day => {
            day.forEach(prog => { if (prog.genre && prog.type !== 'off-air') genresInChannel.add(prog.genre); });
        });

        legend.innerHTML = '';
        genresInChannel.forEach(genre => {
            const color = colors[genre] || '#555';
            const name = genreNames[genre] || genre;
            legend.innerHTML += `<span class="legend-item"><span class="legend-dot" style="background:${color}"></span>${name}</span>`;
        });
    }

    function renderTabs() {
        const tabs = document.getElementById('scheduleTabs');
        tabs.innerHTML = '';
        CHANNELS.forEach((ch, idx) => {
            const btn = document.createElement('button');
            btn.className = `schedule-tab${idx === selectedChannelIndex ? ' active' : ''}`;
            btn.textContent = ch.name;
            btn.style.borderBottomColor = idx === selectedChannelIndex ? ch.color : 'transparent';
            btn.onclick = () => { selectedChannelIndex = idx; renderTabs(); renderLegend(); renderGrid(); };
            tabs.appendChild(btn);
        });
    }

    function renderGrid() {
        const grid = document.getElementById('scheduleGrid');
        const channel = CHANNELS[selectedChannelIndex];
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const today = new Date().getDay();
        const currentMinute = TVUtils.getCurrentMinuteOfDay();
        const colors = RetroTVConfig.schedule.genreColors;

        let html = '<div class="schedule-grid-header"><div class="schedule-time-col">时间</div>';
        for (let d = 0; d < 7; d++) {
            const dayIdx = (today + d) % 7;
            const dateStr = getDateString(d);
            html += `<div class="schedule-day-col${d === 0 ? ' today' : ''}">${days[dayIdx]}${d === 0 ? '(今天)' : ''}<br><small>${dateStr}</small></div>`;
        }
        html += '</div><div class="schedule-grid-body">';

        for (let d = 0; d < 7; d++) {
            const dayIdx = (today + d) % 7;
            const schedule = channel.schedule[dayIdx];

            html += `<div class="schedule-day-column" data-day="${d}">`;
            schedule.forEach(prog => {
                if (prog.type === 'off-air') return;
                const isCurrent = d === 0 && currentMinute >= prog.startMinute && currentMinute < prog.startMinute + prog.duration;
                const color = colors[prog.genre] || '#555';
                const height = Math.max(24, prog.duration * 0.7);
                const endTime = TVUtils.addMinutes(prog.startTime, prog.duration);

                html += `<div class="schedule-cell${isCurrent ? ' current' : ''}${prog.type === 'ad' ? ' ad-cell' : ''}"
                    style="background: ${color}15; border-left: 3px solid ${color}; min-height: ${height}px;"
                    title="${prog.startTime}-${endTime} ${prog.name} (${prog.duration}分钟)${prog.type === 'ad' ? ' [广告]' : ''}">
                    <span class="cell-time">${prog.startTime}</span>
                    <span class="cell-name">${prog.name}</span>
                    <span class="cell-duration">${prog.duration}分</span>
                    ${isCurrent ? '<span class="cell-live">播出中</span>' : ''}
                </div>`;
            });
            html += '</div>';
        }

        html += '</div>';

        if (RetroTVConfig.schedule.showCurrentTimeIndicator) {
            const nowMinutes = currentMinute - 360;
            if (nowMinutes >= 0) {
                const indicatorPos = Math.max(0, nowMinutes * 0.7);
                html += `<div class="time-indicator" style="top: ${indicatorPos + 60}px;"><span class="time-indicator-label">${formatTime(currentMinute)}</span></div>`;
            }
        }

        grid.innerHTML = html;
    }

    function getDateString(daysFromToday) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromToday);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    function formatTime(minuteOfDay) {
        const h = Math.floor(minuteOfDay / 60) % 24;
        const m = minuteOfDay % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    function isOpen() {
        return modal && modal.classList.contains('visible');
    }

    return { init, open, close, isOpen };
})();
