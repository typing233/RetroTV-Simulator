# RetroTV Simulator 复古电视模拟器

一款基于浏览器的复古电视模拟器，模拟 90 年代中国电视的观看体验。支持多频道切换、智能广告插入、CRT 视觉效果和可扩展架构。

## 特性

- **多频道系统** - 5个内置频道（CCTV-1/3/5/6、地方卫视），支持扩展至20个
- **智能广告引擎** - 根据时段自动匹配广告内容（晚间家电/下午零食等），加权随机选择，不重复播放，广告时长可逐槽位配置
- **复古视觉效果** - CRT扫描线、模拟噪点、信号干扰、VHS追踪条纹、色彩溢出、屏幕闪烁
- **频道标识叠加** - 半透明台标，定时淡出/周期性重现，支持四角定位和常驻模式
- **节目预告横幅** - 节目结束前自动显示下一节目预告
- **广告信息显示** - 播放广告时显示广告名称和序号
- **每周节目单** - 7天完整节目表视图，当前时间指示器，节目类型图例
- **频道预加载** - 智能预加载相邻频道和即将播出节目视频，无缝切换
- **扩展接口 v2.0** - 开放API，支持第三方频道、节目表、广告库、视觉效果

## 快速开始

### 部署

本项目为纯静态文件，无需构建步骤：

```bash
# 方式1: 直接打开
open index.html

# 方式2: 本地服务器(推荐，避免CORS问题)
python3 -m http.server 8080
# 或
npx serve .

# 方式3: 部署到任意静态托管
# GitHub Pages / Netlify / Vercel / Nginx 均可
```

### 使用

| 操作 | 按键 |
|------|------|
| 切换频道 | ↑ / ↓ |
| 快速选台 | 1-9 |
| 打开节目单 | G |
| 关闭节目单 | ESC |

也可使用电视旁的旋钮按钮或右侧频道列表点击切换。

## 项目结构

```
├── index.html              # 主页面
├── css/style.css           # 样式表
├── js/
│   ├── config.js           # 全局配置（所有可调参数）
│   ├── channels.js         # 频道与节目表数据
│   ├── utils.js            # 工具函数
│   ├── ads.js              # 智能广告引擎（时段匹配/加权/去重）
│   ├── player.js           # 视频播放器与预加载池
│   ├── effects.js          # 复古视觉效果引擎
│   ├── ui.js               # UI渲染模块（台标/OSD/列表）
│   ├── schedule-view.js    # 每周节目单视图
│   └── main.js             # 主应用逻辑
├── extensions/
│   ├── loader.js           # 扩展加载器 v2.0
│   ├── README.md           # 扩展接口规范
│   ├── example-channel.json# 频道扩展示例
│   └── example-ads.json    # 广告扩展示例
└── docs/
    ├── README.md           # 本文件
    └── CONFIGURATION.md    # 配置参考
```

## 核心功能说明

### 智能广告引擎

广告引擎根据以下规则动态选择广告：

1. **时段匹配** - 上午(健康/早餐)、下午(零食/饮料)、晚间(家电/汽车)、深夜(保险/通讯)
2. **加权选择** - 优先选择匹配当前时段品类的高权重广告
3. **去重保护** - 每频道记录最近10条播放历史，避免重复
4. **均匀分配** - 全局播放次数少的广告优先
5. **时长适配** - 自动填充广告槽位（每个槽位时长独立配置）
6. **过渡动画** - 广告之间有淡入淡出过渡效果

### 频道预加载

- 始终预加载上下相邻频道当前节目的视频
- 当前节目播放进度 > 70% 时预加载下一节目
- 如果目标频道已预加载，切换延迟显著降低
- 最多维持4个预加载视频实例

### 视觉效果

| 效果 | 说明 | 默认 |
|------|------|------|
| 噪点 | 模拟接收不良时的随机噪点 | 开启 |
| 信号干扰 | 随机水平撕裂/色偏/色彩漂移 | 开启 |
| VHS追踪 | 模拟VHS磁带追踪不良 | 开启 |
| 色彩溢出 | 干扰时色彩过饱和 | 开启 |
| 扫描线 | CRT电视水平扫描线 | 开启 |
| 闪烁 | 微弱的亮度波动 | 开启 |

## 自定义配置

编辑 `js/config.js` 可调整所有参数，详见 [配置文档](CONFIGURATION.md)。

关键配置项：
```javascript
RetroTVConfig.ads.enabled = false;           // 关闭广告
RetroTVConfig.effects.noise.enabled = false;  // 关闭噪点
RetroTVConfig.channelLogo.alwaysVisible = true; // 台标常驻
RetroTVConfig.channelLogo.position = 'top-left'; // 台标左上角
```

## 扩展开发

支持五种扩展类型：

```javascript
// 注册自定义频道
RetroTV.registerChannel({ version: "1.0", channel: { ... } });

// 注册自定义节目表
RetroTV.registerSchedule({ channelId: 100, schedule: [...] });

// 注册广告内容
RetroTV.registerAds({ version: "1.0", ads: [ ... ] });

// 注册视觉效果
RetroTV.registerEffect('myEffect', function(ctx, frame, color) { ... });

// 注册节目类型颜色
RetroTV.registerGenreColor('custom', '#ff0000');

// 批量加载扩展
RetroTV.loadMultiple(['ext1.json', 'ext2.json']);

// 运行时修改配置
RetroTV.updateConfig('effects.noise.intensity', 0.05);

// 查询当前频道列表
RetroTV.getChannels();
```

详细规范见 [扩展文档](../extensions/README.md)。

## 浏览器兼容

- Chrome 80+
- Firefox 78+
- Safari 14+
- Edge 80+

## 开源协议

MIT License
