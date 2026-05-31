# RetroTV Simulator - 扩展接口规范

## 概述

RetroTV Simulator 提供开放的扩展接口，允许第三方贡献者添加新频道、节目表、广告内容和视觉效果。

## 版本

当前接口版本：`2.0`

---

## 频道扩展

### 格式

创建一个 JSON 文件，包含以下结构：

```json
{
    "version": "1.0",
    "channel": {
        "id": 100,
        "name": "频道名称",
        "logo": "显示文字(4字以内)",
        "color": "#hex颜色",
        "programs": [
            {
                "name": "节目名称",
                "duration": 30,
                "type": "program",
                "genre": "music",
                "videoUrl": "https://example.com/video.mp4"
            }
        ]
    }
}
```

### 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | number | ✓ | 频道ID，必须唯一，建议 ≥100 |
| `name` | string | ✓ | 频道全名 |
| `logo` | string | | 台标文字，默认取 name 前4字 |
| `color` | string | | 主题色(hex)，默认 #888888 |
| `programs` | array | ✓ | 节目模板数组 |

### 节目模板字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `name` | string | ✓ | 节目名称 |
| `duration` | number | ✓ | 时长(分钟) |
| `type` | string | | `program` 或 `ad`，默认 program |
| `genre` | string | | 类型标签(影响背景动画) |
| `videoUrl` | string | | 视频URL，为空时显示动画背景 |

### 广告槽配置

在节目模板中，`type: "ad"` 的条目定义广告可替换槽位。其 `duration` 字段决定该广告槽的总时长（分钟），引擎会自动填充对应时长的广告内容：

```json
{ "name": "广告时段", "duration": 3, "type": "ad", "genre": "ad" }
```

不同广告槽可以有不同时长，引擎将独立为每个槽位选择广告。

### 支持的 genre 值

`news`, `weather`, `nature`, `movie`, `sports`, `variety`, `music`, `drama`, `game`, `comedy`, `documentary`, `talk`, `lifestyle`, `food`, `fitness`, `law`, `ad`, `test`

自定义 genre 需要同时注册对应的背景动画效果。

### 注册方式

**JavaScript API：**
```javascript
RetroTV.registerChannel({
    version: "1.0",
    channel: { /* ... */ }
});
```

**从URL加载：**
```javascript
RetroTV.loadFromUrl('path/to/channel.json');
```

---

## 节目表扩展

### 格式

自定义完整的7天节目表，覆盖频道的默认生成逻辑：

```json
{
    "version": "1.0",
    "channelId": 100,
    "schedule": [
        [
            { "startTime": "06:00", "startMinute": 360, "duration": 30, "name": "晨间新闻", "type": "program", "genre": "news", "videoUrl": "..." },
            { "startTime": "06:30", "startMinute": 390, "duration": 5, "name": "广告", "type": "ad", "genre": "ad" }
        ]
    ]
}
```

### 字段说明

`schedule` 是一个长度为 7 的数组，索引 0=周日, 1=周一, ..., 6=周六。每天为节目数组。

每个节目条目：

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `startTime` | string | ✓ | 显示时间 "HH:MM" |
| `startMinute` | number | ✓ | 当天第几分钟(6:00=360) |
| `duration` | number | ✓ | 时长(分钟) |
| `name` | string | ✓ | 节目名称 |
| `type` | string | ✓ | program / ad / off-air |
| `genre` | string | | 类型标签 |
| `videoUrl` | string | | 视频URL |

### 注册方式

```javascript
RetroTV.registerSchedule({
    channelId: 100,
    schedule: [ /* 7-day array */ ]
});
```

---

## 广告扩展

### 格式

```json
{
    "version": "1.0",
    "ads": [
        {
            "id": "unique_id",
            "name": "广告名称",
            "category": "electronics",
            "duration": 30,
            "timeSlots": ["evening"],
            "videoUrl": "https://example.com/ad.mp4",
            "weight": 7
        }
    ]
}
```

### 广告字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | | 唯一ID，自动生成若不提供 |
| `name` | string | ✓ | 广告名称 |
| `category` | string | | 分类标签 |
| `duration` | number | ✓ | 时长(秒) |
| `timeSlots` | array | ✓ | 投放时段 |
| `videoUrl` | string | | 广告视频URL |
| `weight` | number | | 权重(1-10)，越高越容易被选中 |

### 时段值

| 时段 | 时间范围 | 推荐品类 |
|------|----------|----------|
| `morning` | 06:00-12:00 | 健康、早餐、药品 |
| `afternoon` | 12:00-18:00 | 零食、饮料、儿童、教育 |
| `evening` | 18:00-22:00 | 家电、电子、汽车、地产 |
| `latenight` | 22:00-02:00 | 保险、床垫、通讯 |

### 广告选择算法

1. 筛选当前时段可用的广告
2. 排除最近播放历史中的广告
3. 按品类匹配度、全局播放次数、权重综合排序
4. 从前5名候选中加权随机选择
5. 重复填充直到广告槽时长用完

### 注册方式

```javascript
RetroTV.registerAds({
    version: "1.0",
    ads: [ /* ... */ ]
});
```

---

## 视觉效果扩展

### 注册自定义背景动画

```javascript
RetroTV.registerEffect('customGenre', function(ctx, frame, color) {
    // ctx: CanvasRenderingContext2D (640x480)
    // frame: 递增帧计数器
    // color: 频道主题色

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 640, 480);
    // 自定义绘制逻辑...
});
```

注册后，在节目模板中使用 `"genre": "customGenre"` 即可启用自定义动画。

### 注册节目类型颜色

```javascript
RetroTV.registerGenreColor('customGenre', '#ff5500');
```

---

## API 参考

```javascript
// === 注册扩展 ===
RetroTV.registerChannel(config)        // → boolean
RetroTV.registerSchedule(config)       // → boolean
RetroTV.registerAds(config)            // → boolean
RetroTV.registerEffect(name, fn)       // → boolean
RetroTV.registerGenreColor(genre, color) // → boolean

// === 加载扩展 ===
RetroTV.loadFromUrl(url)               // → Promise<boolean>
RetroTV.loadMultiple(urls)             // → Promise<Array<{url, success}>>

// === 查询信息 ===
RetroTV.getRegistered()                // → Array - 已注册的扩展列表
RetroTV.getChannels()                  // → Array - 当前频道列表
RetroTV.getConfig()                    // → Object - 完整配置副本
RetroTV.getVersion()                   // → string - "2.0.0"

// === 运行时配置 ===
RetroTV.updateConfig(path, value)      // → boolean
// 示例: RetroTV.updateConfig('effects.noise.intensity', 0.05)
```

---

## 限制

- 最大频道数：20（含内置频道）
- 频道ID不可重复
- 视频建议使用 CORS 允许的 URL
- 广告 weight 范围 1-10
- 每个频道最近播放记录保留 10 条（防重复）
- 自定义节目表必须为完整7天数组

---

## 贡献指南

### 贡献新频道

1. 创建 `your-channel.json`，参照 `example-channel.json` 格式
2. 确保频道 ID ≥ 100 且不与已有扩展冲突
3. 提供至少 5 个节目模板，包含至少 1 个广告槽位
4. 节目时长合计建议覆盖 6-8 小时的循环周期

### 贡献新广告

1. 创建 `your-ads.json`，参照 `example-ads.json` 格式
2. 明确标注 `timeSlots`，避免使用全时段投放
3. 建议 weight 设置在 3-8 之间
4. category 应匹配目标时段的推荐品类

### 贡献视觉效果

1. 实现 `function(ctx, frame, color)` 签名的渲染函数
2. 画布尺寸固定为 640x480
3. 注意性能：避免每帧大量内存分配
4. 同时注册对应的 genreColor

---

## 示例文件

- `example-channel.json` - 频道扩展示例
- `example-ads.json` - 广告库扩展示例
