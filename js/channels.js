// RetroTV Simulator - Channel & Schedule Data
const VIDEO_BASE = RetroTVConfig.video.baseUrl;

const PROGRAM_TEMPLATES = {
    cctv1: [
        { name: '新闻联播', duration: 30, type: 'program', genre: 'news', videoUrl: VIDEO_BASE + 'ForBiggerBlazes.mp4' },
        { name: '焦点访谈', duration: 30, type: 'program', genre: 'news', videoUrl: VIDEO_BASE + 'ForBiggerEscapes.mp4' },
        { name: '天气预报', duration: 10, type: 'program', genre: 'weather', videoUrl: VIDEO_BASE + 'ForBiggerFun.mp4' },
        { name: '广告时段', duration: 5, type: 'ad', genre: 'ad' },
        { name: '今日说法', duration: 30, type: 'program', genre: 'law', videoUrl: VIDEO_BASE + 'ForBiggerJoyrides.mp4' },
        { name: '动物世界', duration: 45, type: 'program', genre: 'nature', videoUrl: VIDEO_BASE + 'BigBuckBunny.mp4' },
        { name: '广告时段', duration: 3, type: 'ad', genre: 'ad' },
        { name: '综合剧场', duration: 45, type: 'program', genre: 'drama', videoUrl: VIDEO_BASE + 'Sintel.mp4' },
        { name: '晚间新闻', duration: 30, type: 'program', genre: 'news', videoUrl: VIDEO_BASE + 'ForBiggerMeltdowns.mp4' },
        { name: '人与自然', duration: 30, type: 'program', genre: 'nature', videoUrl: VIDEO_BASE + 'ElephantsDream.mp4' },
        { name: '广告时段', duration: 5, type: 'ad', genre: 'ad' },
        { name: '纪录片时间', duration: 50, type: 'program', genre: 'documentary', videoUrl: VIDEO_BASE + 'TearsOfSteel.mp4' },
        { name: '经典老片', duration: 60, type: 'program', genre: 'movie', videoUrl: VIDEO_BASE + 'ElephantsDream.mp4' },
    ],
    cctv3: [
        { name: '星光大道', duration: 60, type: 'program', genre: 'variety', videoUrl: VIDEO_BASE + 'BigBuckBunny.mp4' },
        { name: '广告时段', duration: 4, type: 'ad', genre: 'ad' },
        { name: '非常6+1', duration: 45, type: 'program', genre: 'variety', videoUrl: VIDEO_BASE + 'ForBiggerFun.mp4' },
        { name: '开心辞典', duration: 40, type: 'program', genre: 'game', videoUrl: VIDEO_BASE + 'ForBiggerJoyrides.mp4' },
        { name: '曲苑杂坛', duration: 30, type: 'program', genre: 'comedy', videoUrl: VIDEO_BASE + 'ForBiggerBlazes.mp4' },
        { name: '广告时段', duration: 5, type: 'ad', genre: 'ad' },
        { name: '综艺大观', duration: 50, type: 'program', genre: 'variety', videoUrl: VIDEO_BASE + 'Sintel.mp4' },
        { name: '幸运52', duration: 45, type: 'program', genre: 'game', videoUrl: VIDEO_BASE + 'ForBiggerEscapes.mp4' },
        { name: '同一首歌', duration: 60, type: 'program', genre: 'music', videoUrl: VIDEO_BASE + 'TearsOfSteel.mp4' },
        { name: '广告时段', duration: 3, type: 'ad', genre: 'ad' },
        { name: '欢乐中国行', duration: 50, type: 'program', genre: 'variety', videoUrl: VIDEO_BASE + 'ElephantsDream.mp4' },
        { name: '音乐风云榜', duration: 30, type: 'program', genre: 'music', videoUrl: VIDEO_BASE + 'ForBiggerFun.mp4' },
    ],
    cctv6: [
        { name: '佳片有约', duration: 90, type: 'program', genre: 'movie', videoUrl: VIDEO_BASE + 'Sintel.mp4' },
        { name: '广告时段', duration: 5, type: 'ad', genre: 'ad' },
        { name: '中国电影报道', duration: 20, type: 'program', genre: 'news', videoUrl: VIDEO_BASE + 'ForBiggerBlazes.mp4' },
        { name: '经典回顾', duration: 90, type: 'program', genre: 'movie', videoUrl: VIDEO_BASE + 'ElephantsDream.mp4' },
        { name: '广告时段', duration: 4, type: 'ad', genre: 'ad' },
        { name: '动作片场', duration: 90, type: 'program', genre: 'movie', videoUrl: VIDEO_BASE + 'TearsOfSteel.mp4' },
        { name: '爱情故事', duration: 90, type: 'program', genre: 'movie', videoUrl: VIDEO_BASE + 'BigBuckBunny.mp4' },
        { name: '光影星播客', duration: 20, type: 'program', genre: 'talk', videoUrl: VIDEO_BASE + 'ForBiggerEscapes.mp4' },
        { name: '广告时段', duration: 3, type: 'ad', genre: 'ad' },
        { name: '午夜电影', duration: 90, type: 'program', genre: 'movie', videoUrl: VIDEO_BASE + 'Sintel.mp4' },
    ],
    cctv5: [
        { name: '体育新闻', duration: 30, type: 'program', genre: 'news', videoUrl: VIDEO_BASE + 'ForBiggerMeltdowns.mp4' },
        { name: '广告时段', duration: 3, type: 'ad', genre: 'ad' },
        { name: '天下足球', duration: 60, type: 'program', genre: 'sports', videoUrl: VIDEO_BASE + 'SubaruOutbackOnStreetAndDirt.mp4' },
        { name: 'NBA精彩赛事', duration: 90, type: 'program', genre: 'sports', videoUrl: VIDEO_BASE + 'BigBuckBunny.mp4' },
        { name: '广告时段', duration: 5, type: 'ad', genre: 'ad' },
        { name: '乒乓球赛', duration: 60, type: 'program', genre: 'sports', videoUrl: VIDEO_BASE + 'ForBiggerFun.mp4' },
        { name: '武林风', duration: 45, type: 'program', genre: 'sports', videoUrl: VIDEO_BASE + 'ForBiggerJoyrides.mp4' },
        { name: '广告时段', duration: 3, type: 'ad', genre: 'ad' },
        { name: '体育世界', duration: 30, type: 'program', genre: 'sports', videoUrl: VIDEO_BASE + 'ForBiggerEscapes.mp4' },
        { name: '赛事集锦', duration: 45, type: 'program', genre: 'sports', videoUrl: VIDEO_BASE + 'TearsOfSteel.mp4' },
        { name: '健身动起来', duration: 20, type: 'program', genre: 'fitness', videoUrl: VIDEO_BASE + 'ForBiggerMeltdowns.mp4' },
    ],
    local: [
        { name: '本地新闻', duration: 30, type: 'program', genre: 'news', videoUrl: VIDEO_BASE + 'ForBiggerBlazes.mp4' },
        { name: '广告时段', duration: 5, type: 'ad', genre: 'ad' },
        { name: '家有妙招', duration: 30, type: 'program', genre: 'lifestyle', videoUrl: VIDEO_BASE + 'ForBiggerFun.mp4' },
        { name: '电视剧连播', duration: 45, type: 'program', genre: 'drama', videoUrl: VIDEO_BASE + 'Sintel.mp4' },
        { name: '广告时段', duration: 4, type: 'ad', genre: 'ad' },
        { name: '生活帮', duration: 30, type: 'program', genre: 'lifestyle', videoUrl: VIDEO_BASE + 'ForBiggerEscapes.mp4' },
        { name: '方言剧场', duration: 40, type: 'program', genre: 'drama', videoUrl: VIDEO_BASE + 'ElephantsDream.mp4' },
        { name: '美食天下', duration: 25, type: 'program', genre: 'food', videoUrl: VIDEO_BASE + 'ForBiggerMeltdowns.mp4' },
        { name: '广告时段', duration: 3, type: 'ad', genre: 'ad' },
        { name: '晚间剧场', duration: 45, type: 'program', genre: 'drama', videoUrl: VIDEO_BASE + 'BigBuckBunny.mp4' },
        { name: '夜市人生', duration: 40, type: 'program', genre: 'drama', videoUrl: VIDEO_BASE + 'TearsOfSteel.mp4' },
    ]
};

function generateSchedule(channelType) {
    const templates = PROGRAM_TEMPLATES[channelType];
    const weekSchedule = [];

    for (let day = 0; day < 7; day++) {
        const daySchedule = [];
        let currentMinute = 360;

        while (currentMinute < 1560) {
            const templateIndex = (daySchedule.length + day * 3) % templates.length;
            const template = templates[templateIndex];

            const startHour = Math.floor(currentMinute / 60);
            const startMin = currentMinute % 60;

            daySchedule.push({
                startTime: `${String(startHour % 24).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
                startMinute: currentMinute,
                duration: template.duration,
                name: template.name,
                type: template.type,
                genre: template.genre,
                videoUrl: template.videoUrl || null,
                episode: template.type === 'program' ? `第${(day * 3 + daySchedule.length) % 20 + 1}期` : null
            });

            currentMinute += template.duration;
        }

        daySchedule.unshift({
            startTime: '00:00',
            startMinute: 0,
            duration: 360,
            name: '测试信号/停机维护',
            type: 'off-air',
            genre: 'test',
            videoUrl: null
        });

        weekSchedule.push(daySchedule);
    }

    return weekSchedule;
}

const CHANNELS = [
    { id: 1, name: 'CCTV-1 综合', logo: 'CCTV-1', color: '#cc0000', schedule: generateSchedule('cctv1') },
    { id: 2, name: 'CCTV-3 综艺', logo: 'CCTV-3', color: '#ff6600', schedule: generateSchedule('cctv3') },
    { id: 3, name: 'CCTV-6 电影', logo: 'CCTV-6', color: '#0066cc', schedule: generateSchedule('cctv6') },
    { id: 4, name: 'CCTV-5 体育', logo: 'CCTV-5', color: '#009933', schedule: generateSchedule('cctv5') },
    { id: 5, name: '地方卫视', logo: '卫视', color: '#9933cc', schedule: generateSchedule('local') }
];
