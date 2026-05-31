// RetroTV Simulator - Utilities
const TVUtils = {
    getCurrentDayOfWeek() {
        return new Date().getDay();
    },

    getCurrentMinuteOfDay() {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    },

    getCurrentSecondOfDay() {
        const now = new Date();
        return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    },

    addMinutes(timeStr, minutes) {
        const [h, m] = timeStr.split(':').map(Number);
        const total = h * 60 + m + minutes;
        const newH = Math.floor(total / 60) % 24;
        const newM = total % 60;
        return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    },

    getCurrentProgram(channel) {
        const dayOfWeek = this.getCurrentDayOfWeek();
        const minuteOfDay = this.getCurrentMinuteOfDay();

        if (minuteOfDay < 360) {
            const yesterday = (dayOfWeek + 6) % 7;
            const yesterdaySchedule = channel.schedule[yesterday];
            const minuteOnYesterdayTimeline = minuteOfDay + 1440;

            for (let i = yesterdaySchedule.length - 1; i >= 0; i--) {
                const prog = yesterdaySchedule[i];
                if (prog.startMinute > 1440 && minuteOnYesterdayTimeline >= prog.startMinute &&
                    minuteOnYesterdayTimeline < prog.startMinute + prog.duration) {
                    return { program: prog, index: i, day: yesterday };
                }
            }
            for (let i = yesterdaySchedule.length - 1; i >= 0; i--) {
                const prog = yesterdaySchedule[i];
                if (prog.startMinute <= 1440 &&
                    prog.startMinute + prog.duration > 1440 &&
                    minuteOnYesterdayTimeline < prog.startMinute + prog.duration) {
                    return { program: prog, index: i, day: yesterday };
                }
            }
        }

        const daySchedule = channel.schedule[dayOfWeek];
        for (let i = daySchedule.length - 1; i >= 0; i--) {
            if (minuteOfDay >= daySchedule[i].startMinute) {
                return { program: daySchedule[i], index: i, day: dayOfWeek };
            }
        }
        return { program: daySchedule[0], index: 0, day: dayOfWeek };
    },

    getNextProgram(channel, currentDay, currentIndex) {
        const daySchedule = channel.schedule[currentDay];
        if (currentIndex + 1 < daySchedule.length) {
            return { program: daySchedule[currentIndex + 1], index: currentIndex + 1, day: currentDay };
        }
        const nextDay = (currentDay + 1) % 7;
        const nextIndex = channel.schedule[nextDay].length > 1 ? 1 : 0;
        return { program: channel.schedule[nextDay][nextIndex], index: nextIndex, day: nextDay };
    },

    getProgramProgress(program) {
        const currentSecond = this.getCurrentSecondOfDay();
        const programStartSecond = program.startMinute * 60;
        let elapsed;
        if (program.startMinute >= 1440) {
            elapsed = (currentSecond + 86400) - programStartSecond;
        } else if (program.startMinute + program.duration > 1440 && currentSecond < program.startMinute * 60) {
            elapsed = (currentSecond + 86400) - programStartSecond;
        } else {
            elapsed = currentSecond - programStartSecond;
        }
        return Math.max(0, Math.min(1, elapsed / (program.duration * 60)));
    },

    getElapsedSeconds(program) {
        const currentSecond = this.getCurrentSecondOfDay();
        const programStartSecond = program.startMinute * 60;
        if (program.startMinute >= 1440) {
            return (currentSecond + 86400) - programStartSecond;
        } else if (program.startMinute + program.duration > 1440 && currentSecond < program.startMinute * 60) {
            return (currentSecond + 86400) - programStartSecond;
        }
        return currentSecond - programStartSecond;
    },

    getUpcomingPrograms(channel, count) {
        const { index, day } = this.getCurrentProgram(channel);
        const daySchedule = channel.schedule[day];
        const results = [];

        for (let i = index; i < daySchedule.length && results.length < count; i++) {
            results.push(daySchedule[i]);
        }
        if (results.length < count) {
            const nextDay = (day + 1) % 7;
            const nextSchedule = channel.schedule[nextDay];
            for (let i = 1; i < nextSchedule.length && results.length < count; i++) {
                results.push(nextSchedule[i]);
            }
        }
        return results;
    }
};
