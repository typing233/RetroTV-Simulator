# 配置参考 - RetroTV Simulator

所有可配置参数位于 `js/config.js` 中的 `RetroTVConfig` 对象。

---

## video - 视频播放

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `baseUrl` | Google Storage URL | 视频基础路径 |
| `preloadMax` | `4` | 最大预加载视频数 |
| `preloadAdjacentChannels` | `true` | 是否预加载相邻频道 |
| `transitionDuration` | `150` | 节目切换黑屏时间(ms) |
| `channelSwitchDelay` | `120` | 频道切换雪花持续时间(ms) |

---

## ads - 广告引擎

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `enabled` | `true` | 启用智能广告 |
| `defaultSlotDuration` | `5` | 广告槽默认时长(分钟) |
| `maxHistoryPerChannel` | `10` | 每频道防重复记录数 |
| `transitionBetweenAds` | `true` | 广告间淡入淡出过渡 |
| `transitionDuration` | `300` | 广告过渡时间(ms) |
| `showAdName` | `true` | 显示正在播放的广告名称 |
| `showAdCounter` | `true` | 显示广告序号(如 2/5) |
| `timePeriods` | (object) | 时段定义 |

### timePeriods 结构

```javascript
timePeriods: {
    morning:   { start: 6, end: 12, categories: ['health', 'breakfast', 'medicine'] },
    afternoon: { start: 12, end: 18, categories: ['snacks', 'beverages', 'children', 'education'] },
    evening:   { start: 18, end: 22, categories: ['appliances', 'electronics', 'automobiles', 'realestate'] },
    latenight: { start: 22, end: 2, categories: ['insurance', 'mattress', 'medicine', 'telecom'] }
}
```

修改 `start`/`end` 可调整时段边界（小时，24小时制）。`categories` 定义该时段推荐的广告品类。

### 广告槽时长配置

每个广告槽可在节目表模板中单独设置 `duration`（分钟）：

```javascript
{ name: '广告时段', duration: 3, type: 'ad', genre: 'ad' }  // 3分钟广告槽
{ name: '广告时段', duration: 5, type: 'ad', genre: 'ad' }  // 5分钟广告槽
```

若未指定则使用 `defaultSlotDuration`。

---

## channelLogo - 频道标识

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `enabled` | `true` | 启用台标显示 |
| `opacity` | `0.7` | 不透明度(0.3-1.0) |
| `showDuration` | `8000` | 切台后显示时间(ms) |
| `fadeSpeed` | `500` | 淡出动画时间(ms) |
| `position` | `'top-right'` | 位置(top-right/top-left/bottom-right/bottom-left) |
| `backgroundBlur` | `true` | 背景模糊效果 |
| `alwaysVisible` | `false` | 台标常驻不淡出 |
| `periodicReshow` | `true` | 定期重新显示台标 |
| `reshowInterval` | `300000` | 重新显示间隔(ms, 默认5分钟) |

---

## effects - 视觉效果

### noise - 模拟噪点

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `enabled` | `true` | 启用噪点 |
| `intensity` | `0.03` | 噪点强度(0-0.2) |
| `spikeChance` | `0.002` | 噪点突然增强的概率 |

### signalGlitch - 信号干扰

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `enabled` | `true` | 启用信号干扰 |
| `frequency` | `45000` | 平均间隔(ms) |
| `duration` | `300` | 干扰持续时间(ms) |
| `intensity` | `'medium'` | 强度(low/medium/high) |

### vhsTracking - VHS追踪效果

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `enabled` | `true` | 启用VHS追踪条纹 |
| `frequency` | `60000` | 平均间隔(ms) |
| `duration` | `1500` | 效果持续时间(ms) |

### colorBleed - 色彩溢出

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `enabled` | `true` | 信号干扰时色彩过饱和 |

### previewBanner - 节目预告横幅

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `enabled` | `true` | 启用预告横幅 |
| `showBeforeEnd` | `120` | 节目结束前几秒显示 |
| `displayDuration` | `8000` | 显示持续时间(ms) |

### scanlines / flicker

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `scanlines.enabled` | `true` | CRT扫描线 |
| `flicker.enabled` | `true` | 屏幕闪烁 |

### channelSwitchStatic - 频道切换雪花

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `duration` | `250` | 雪花显示时长(ms) |
| `style` | `'classic'` | 样式(classic) |

---

## schedule - 节目单

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `startHour` | `6` | 每日开播时间 |
| `endHour` | `26` | 每日收播时间(26=次日2点) |
| `showCurrentTimeIndicator` | `true` | 节目单中显示当前时间红线 |
| `genreColors` | (object) | 节目类型对应颜色 |

---

## extensions - 扩展系统

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `autoLoad` | `true` | 自动加载扩展 |
| `maxChannels` | `20` | 最大频道数(含内置) |

---

## 运行时修改

可通过扩展API在运行时修改配置：

```javascript
// 通过API修改
RetroTV.updateConfig('effects.noise.intensity', 0.08);
RetroTV.updateConfig('channelLogo.alwaysVisible', true);

// 直接修改全局对象(部分需调用更新函数)
RetroTVConfig.effects.noise.enabled = false;
RetroTVConfig.channelLogo.opacity = 0.5;
RetroTVConfig.effects.signalGlitch.frequency = 20000;
RetroTVConfig.channelLogo.position = 'top-left';
```

注意：部分运行时修改需调用对应模块的启用/禁用函数才能生效：

```javascript
EffectsEngine.setNoiseEnabled(false);
EffectsEngine.setGlitchEnabled(false);
EffectsEngine.setVhsEnabled(false);
```
