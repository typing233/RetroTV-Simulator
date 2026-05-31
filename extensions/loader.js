// RetroTV Simulator - Extension Loader v2.0
const RetroTV = (function() {
    const registeredExtensions = [];

    function registerChannel(config) {
        if (!config || !config.channel) {
            console.warn('[RetroTV Extension] Invalid channel config');
            return false;
        }

        const ch = config.channel;
        if (!ch.id || !ch.name || !ch.programs || !Array.isArray(ch.programs)) {
            console.warn('[RetroTV Extension] Channel must have id, name, and programs array');
            return false;
        }

        if (CHANNELS.length >= RetroTVConfig.extensions.maxChannels) {
            console.warn('[RetroTV Extension] Maximum channel limit reached');
            return false;
        }

        if (CHANNELS.find(c => c.id === ch.id)) {
            console.warn(`[RetroTV Extension] Channel ID ${ch.id} already exists`);
            return false;
        }

        const templateKey = `ext_${ch.id}`;
        PROGRAM_TEMPLATES[templateKey] = ch.programs.map(p => ({
            name: p.name || '未命名',
            duration: p.duration || 30,
            type: p.type || 'program',
            genre: p.genre || 'variety',
            videoUrl: p.videoUrl || null
        }));

        CHANNELS.push({
            id: ch.id,
            name: ch.name,
            logo: ch.logo || ch.name.substring(0, 4),
            color: ch.color || '#888888',
            schedule: generateSchedule(templateKey)
        });

        registeredExtensions.push({ type: 'channel', id: ch.id, name: ch.name });
        console.log(`[RetroTV Extension] Channel "${ch.name}" registered successfully`);

        if (typeof TVApp !== 'undefined') TVApp.refreshUI();
        return true;
    }

    function registerSchedule(config) {
        if (!config || !config.channelId || !config.schedule) {
            console.warn('[RetroTV Extension] Invalid schedule config');
            return false;
        }

        const channel = CHANNELS.find(c => c.id === config.channelId);
        if (!channel) {
            console.warn(`[RetroTV Extension] Channel ID ${config.channelId} not found`);
            return false;
        }

        if (Array.isArray(config.schedule) && config.schedule.length === 7) {
            channel.schedule = config.schedule;
            registeredExtensions.push({ type: 'schedule', channelId: config.channelId });
            console.log(`[RetroTV Extension] Custom schedule applied to channel ${config.channelId}`);
            if (typeof TVApp !== 'undefined') TVApp.refreshUI();
            return true;
        }

        console.warn('[RetroTV Extension] Schedule must be a 7-day array');
        return false;
    }

    function registerAds(config) {
        if (!config || !config.ads || !Array.isArray(config.ads)) {
            console.warn('[RetroTV Extension] Invalid ads config');
            return false;
        }

        const ads = config.ads.map((ad, i) => ({
            id: ad.id || `ext_ad_${Date.now()}_${i}`,
            name: ad.name || '外部广告',
            category: ad.category || 'general',
            duration: ad.duration || 15,
            timeSlots: ad.timeSlots || ['morning', 'afternoon', 'evening', 'latenight'],
            videoUrl: ad.videoUrl || null,
            weight: ad.weight || 5
        }));

        AdEngine.registerAds(ads);
        registeredExtensions.push({ type: 'ads', count: ads.length });
        console.log(`[RetroTV Extension] ${ads.length} ads registered successfully`);
        return true;
    }

    function registerEffect(name, renderFn) {
        if (typeof renderFn !== 'function') {
            console.warn('[RetroTV Extension] Effect must be a function(ctx, frame, color)');
            return false;
        }

        BG_ANIMATIONS[name] = renderFn;
        registeredExtensions.push({ type: 'effect', name });
        console.log(`[RetroTV Extension] Effect "${name}" registered successfully`);
        return true;
    }

    function registerGenreColor(genre, color) {
        if (!genre || !color) return false;
        RetroTVConfig.schedule.genreColors[genre] = color;
        return true;
    }

    async function loadFromUrl(url) {
        try {
            const response = await fetch(url);
            const config = await response.json();

            if (config.channel) return registerChannel(config);
            if (config.ads) return registerAds(config);
            if (config.schedule) return registerSchedule(config);

            console.warn('[RetroTV Extension] Unknown extension format');
            return false;
        } catch (e) {
            console.error(`[RetroTV Extension] Failed to load from ${url}:`, e);
            return false;
        }
    }

    async function loadMultiple(urls) {
        const results = await Promise.allSettled(urls.map(url => loadFromUrl(url)));
        return results.map((r, i) => ({
            url: urls[i],
            success: r.status === 'fulfilled' && r.value === true
        }));
    }

    function getRegistered() {
        return [...registeredExtensions];
    }

    function getConfig() {
        return JSON.parse(JSON.stringify(RetroTVConfig));
    }

    function updateConfig(path, value) {
        const keys = path.split('.');
        let obj = RetroTVConfig;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) return false;
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        return true;
    }

    function getVersion() {
        return '2.0.0';
    }

    function getChannels() {
        return CHANNELS.map(ch => ({ id: ch.id, name: ch.name, logo: ch.logo, color: ch.color }));
    }

    return {
        registerChannel,
        registerSchedule,
        registerAds,
        registerEffect,
        registerGenreColor,
        loadFromUrl,
        loadMultiple,
        getRegistered,
        getConfig,
        updateConfig,
        getChannels,
        getVersion
    };
})();
