// RetroTV Simulator - Smart Ad Insertion Engine
const AdEngine = (function() {
    const AD_LIBRARY = [
        // Morning ads (health, breakfast)
        { id: 'ad001', name: '养生堂维生素', category: 'health', duration: 30, timeSlots: ['morning'], videoUrl: VIDEO_BASE + 'ForBiggerBlazes.mp4', weight: 5 },
        { id: 'ad002', name: '蒙牛早餐奶', category: 'breakfast', duration: 15, timeSlots: ['morning'], videoUrl: VIDEO_BASE + 'ForBiggerFun.mp4', weight: 8 },
        { id: 'ad003', name: '999感冒灵', category: 'medicine', duration: 30, timeSlots: ['morning', 'latenight'], videoUrl: VIDEO_BASE + 'ForBiggerEscapes.mp4', weight: 4 },
        { id: 'ad004', name: '高钙豆奶粉', category: 'breakfast', duration: 15, timeSlots: ['morning'], videoUrl: VIDEO_BASE + 'ForBiggerJoyrides.mp4', weight: 6 },
        { id: 'ad005', name: '舒肤佳香皂', category: 'health', duration: 15, timeSlots: ['morning'], videoUrl: VIDEO_BASE + 'ForBiggerMeltdowns.mp4', weight: 5 },

        // Afternoon ads (snacks, beverages, children)
        { id: 'ad006', name: '旺旺大礼包', category: 'snacks', duration: 15, timeSlots: ['afternoon'], videoUrl: VIDEO_BASE + 'ForBiggerBlazes.mp4', weight: 9 },
        { id: 'ad007', name: '可口可乐', category: 'beverages', duration: 30, timeSlots: ['afternoon'], videoUrl: VIDEO_BASE + 'ForBiggerMeltdowns.mp4', weight: 10 },
        { id: 'ad008', name: '奥利奥饼干', category: 'snacks', duration: 15, timeSlots: ['afternoon'], videoUrl: VIDEO_BASE + 'ForBiggerFun.mp4', weight: 7 },
        { id: 'ad009', name: '娃哈哈AD钙奶', category: 'children', duration: 15, timeSlots: ['afternoon'], videoUrl: VIDEO_BASE + 'ForBiggerJoyrides.mp4', weight: 8 },
        { id: 'ad010', name: '好丽友派', category: 'snacks', duration: 15, timeSlots: ['afternoon'], videoUrl: VIDEO_BASE + 'ForBiggerEscapes.mp4', weight: 6 },
        { id: 'ad011', name: '新东方英语', category: 'education', duration: 30, timeSlots: ['afternoon'], videoUrl: VIDEO_BASE + 'ForBiggerBlazes.mp4', weight: 5 },
        { id: 'ad012', name: '统一冰红茶', category: 'beverages', duration: 15, timeSlots: ['afternoon'], videoUrl: VIDEO_BASE + 'ForBiggerMeltdowns.mp4', weight: 7 },
        { id: 'ad013', name: '喜之郎果冻', category: 'snacks', duration: 15, timeSlots: ['afternoon'], videoUrl: VIDEO_BASE + 'ForBiggerFun.mp4', weight: 6 },

        // Evening ads (appliances, electronics, automobiles)
        { id: 'ad014', name: '海尔冰箱', category: 'appliances', duration: 30, timeSlots: ['evening'], videoUrl: VIDEO_BASE + 'ForBiggerMeltdowns.mp4', weight: 8 },
        { id: 'ad015', name: '格力空调', category: 'appliances', duration: 30, timeSlots: ['evening'], videoUrl: VIDEO_BASE + 'ForBiggerEscapes.mp4', weight: 9 },
        { id: 'ad016', name: '大众汽车', category: 'automobiles', duration: 30, timeSlots: ['evening'], videoUrl: VIDEO_BASE + 'ForBiggerJoyrides.mp4', weight: 7 },
        { id: 'ad017', name: '美的电饭煲', category: 'appliances', duration: 15, timeSlots: ['evening'], videoUrl: VIDEO_BASE + 'ForBiggerFun.mp4', weight: 6 },
        { id: 'ad018', name: '华为手机', category: 'electronics', duration: 30, timeSlots: ['evening'], videoUrl: VIDEO_BASE + 'ForBiggerBlazes.mp4', weight: 10 },
        { id: 'ad019', name: '丰田汽车', category: 'automobiles', duration: 30, timeSlots: ['evening'], videoUrl: VIDEO_BASE + 'BigBuckBunny.mp4', weight: 7 },
        { id: 'ad020', name: 'TCL电视', category: 'electronics', duration: 15, timeSlots: ['evening'], videoUrl: VIDEO_BASE + 'ForBiggerMeltdowns.mp4', weight: 5 },
        { id: 'ad021', name: '万和热水器', category: 'appliances', duration: 15, timeSlots: ['evening'], videoUrl: VIDEO_BASE + 'ForBiggerEscapes.mp4', weight: 4 },
        { id: 'ad022', name: '长虹彩电', category: 'electronics', duration: 15, timeSlots: ['evening'], videoUrl: VIDEO_BASE + 'ForBiggerJoyrides.mp4', weight: 5 },
        { id: 'ad023', name: '奥迪汽车', category: 'automobiles', duration: 30, timeSlots: ['evening'], videoUrl: VIDEO_BASE + 'Sintel.mp4', weight: 8 },

        // Late night ads (insurance, mattress, telecom)
        { id: 'ad024', name: '中国人寿', category: 'insurance', duration: 30, timeSlots: ['latenight'], videoUrl: VIDEO_BASE + 'ForBiggerBlazes.mp4', weight: 6 },
        { id: 'ad025', name: '慕思床垫', category: 'mattress', duration: 30, timeSlots: ['latenight'], videoUrl: VIDEO_BASE + 'ForBiggerFun.mp4', weight: 5 },
        { id: 'ad026', name: '中国移动', category: 'telecom', duration: 15, timeSlots: ['latenight', 'afternoon'], videoUrl: VIDEO_BASE + 'ForBiggerJoyrides.mp4', weight: 7 },
        { id: 'ad027', name: '平安保险', category: 'insurance', duration: 30, timeSlots: ['latenight'], videoUrl: VIDEO_BASE + 'ForBiggerEscapes.mp4', weight: 5 },
        { id: 'ad028', name: '脑白金', category: 'health', duration: 15, timeSlots: ['latenight', 'evening'], videoUrl: VIDEO_BASE + 'ForBiggerMeltdowns.mp4', weight: 8 },
        { id: 'ad029', name: '汇仁肾宝', category: 'medicine', duration: 30, timeSlots: ['latenight'], videoUrl: VIDEO_BASE + 'ForBiggerBlazes.mp4', weight: 4 },
        { id: 'ad030', name: '中国联通', category: 'telecom', duration: 15, timeSlots: ['latenight'], videoUrl: VIDEO_BASE + 'ForBiggerFun.mp4', weight: 6 },
    ];

    const playHistory = {};
    const sessionPlayCount = {};
    let externalAds = [];

    function getCurrentTimePeriod() {
        const hour = new Date().getHours();
        const periods = RetroTVConfig.ads.timePeriods;
        for (const [name, period] of Object.entries(periods)) {
            if (name === 'latenight') {
                if (hour >= period.start || hour < period.end) return name;
            } else {
                if (hour >= period.start && hour < period.end) return name;
            }
        }
        return 'morning';
    }

    function getChannelHistory(channelId) {
        if (!playHistory[channelId]) {
            playHistory[channelId] = [];
        }
        return playHistory[channelId];
    }

    function recordPlay(channelId, adId) {
        const history = getChannelHistory(channelId);
        history.push(adId);
        if (history.length > RetroTVConfig.ads.maxHistoryPerChannel) {
            history.shift();
        }
        sessionPlayCount[adId] = (sessionPlayCount[adId] || 0) + 1;
    }

    function selectAds(channelId, slotDurationMinutes) {
        if (!RetroTVConfig.ads.enabled) return [];

        const duration = slotDurationMinutes || RetroTVConfig.ads.defaultSlotDuration;
        const timePeriod = getCurrentTimePeriod();
        const history = getChannelHistory(channelId);
        const allAds = [...AD_LIBRARY, ...externalAds];
        const slotSeconds = duration * 60;

        const periodCategories = RetroTVConfig.ads.timePeriods[timePeriod].categories;

        const eligible = allAds.filter(ad =>
            ad.timeSlots.includes(timePeriod) && !history.includes(ad.id)
        );

        if (eligible.length === 0) {
            playHistory[channelId] = [];
            return selectAds(channelId, slotDurationMinutes);
        }

        const prioritized = eligible.sort((a, b) => {
            const aMatch = periodCategories.includes(a.category) ? 1 : 0;
            const bMatch = periodCategories.includes(b.category) ? 1 : 0;
            if (aMatch !== bMatch) return bMatch - aMatch;

            const aPlays = sessionPlayCount[a.id] || 0;
            const bPlays = sessionPlayCount[b.id] || 0;
            if (aPlays !== bPlays) return aPlays - bPlays;

            return b.weight - a.weight;
        });

        const selected = [];
        let remainingSeconds = slotSeconds;
        const used = new Set();

        while (remainingSeconds > 0 && used.size < prioritized.length) {
            const available = prioritized.filter(ad => !used.has(ad.id) && ad.duration <= remainingSeconds);
            if (available.length === 0) break;

            const topCandidates = available.slice(0, Math.min(5, available.length));
            const totalWeight = topCandidates.reduce((sum, ad) => sum + ad.weight, 0);
            let random = Math.random() * totalWeight;
            let chosen = topCandidates[0];
            for (const ad of topCandidates) {
                random -= ad.weight;
                if (random <= 0) { chosen = ad; break; }
            }

            selected.push(chosen);
            used.add(chosen.id);
            recordPlay(channelId, chosen.id);
            remainingSeconds -= chosen.duration;
        }

        return selected;
    }

    function getAdDisplayInfo(ad) {
        return {
            name: ad.name,
            category: ad.category,
            duration: ad.duration,
            videoUrl: ad.videoUrl
        };
    }

    function registerAds(ads) {
        const validated = ads.filter(ad => ad.id && ad.name && ad.duration && ad.timeSlots);
        externalAds.push(...validated);
    }

    function getLibrarySize() {
        return AD_LIBRARY.length + externalAds.length;
    }

    function getCurrentPeriodName() {
        const period = getCurrentTimePeriod();
        const names = { morning: '上午', afternoon: '下午', evening: '晚间', latenight: '深夜' };
        return names[period] || period;
    }

    function getAdQueueInfo(queue, currentIndex) {
        if (!queue || queue.length === 0) return null;
        return {
            current: currentIndex + 1,
            total: queue.length,
            currentAd: queue[currentIndex],
            remaining: queue.length - currentIndex - 1
        };
    }

    return {
        selectAds,
        getAdDisplayInfo,
        getAdQueueInfo,
        registerAds,
        getLibrarySize,
        getCurrentTimePeriod,
        getCurrentPeriodName
    };
})();
