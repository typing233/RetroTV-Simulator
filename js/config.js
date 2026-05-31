// RetroTV Simulator - Global Configuration
const RetroTVConfig = {
    video: {
        baseUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/',
        preloadMax: 4,
        preloadAdjacentChannels: true,
        transitionDuration: 150
    },

    ads: {
        enabled: true,
        defaultSlotDuration: 5,
        maxHistoryPerChannel: 10,
        transitionBetweenAds: true,
        transitionDuration: 300,
        showAdName: true,
        showAdCounter: true,
        timePeriods: {
            morning:   { start: 6, end: 12, categories: ['health', 'breakfast', 'medicine'] },
            afternoon: { start: 12, end: 18, categories: ['snacks', 'beverages', 'children', 'education'] },
            evening:   { start: 18, end: 22, categories: ['appliances', 'electronics', 'automobiles', 'realestate'] },
            latenight: { start: 22, end: 2, categories: ['insurance', 'mattress', 'medicine', 'telecom'] }
        }
    },

    channelLogo: {
        enabled: true,
        opacity: 0.7,
        showDuration: 8000,
        fadeSpeed: 500,
        position: 'top-right',
        backgroundBlur: true,
        alwaysVisible: false,
        periodicReshow: true,
        reshowInterval: 300000
    },

    effects: {
        noise: { enabled: true, intensity: 0.03, spikeChance: 0.002 },
        signalGlitch: { enabled: true, frequency: 45000, duration: 300, intensity: 'medium' },
        vhsTracking: { enabled: true, frequency: 60000, duration: 1500 },
        colorBleed: { enabled: true },
        previewBanner: { enabled: true, showBeforeEnd: 120, displayDuration: 8000 },
        scanlines: { enabled: true },
        flicker: { enabled: true },
        channelSwitchStatic: { duration: 250, style: 'classic' }
    },

    schedule: {
        startHour: 6,
        endHour: 26,
        showCurrentTimeIndicator: true,
        genreColors: {
            news: '#c62828',
            weather: '#0277bd',
            nature: '#2e7d32',
            movie: '#4a148c',
            sports: '#1b5e20',
            variety: '#e65100',
            music: '#6a1b9a',
            drama: '#3e2723',
            game: '#0d47a1',
            comedy: '#bf360c',
            documentary: '#33691e',
            talk: '#1a237e',
            lifestyle: '#ff6f00',
            food: '#4e342e',
            fitness: '#00695c',
            law: '#283593',
            ad: '#f9a825',
            test: '#424242'
        }
    },

    extensions: {
        autoLoad: true,
        maxChannels: 20
    }
};
