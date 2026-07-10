# 📖 JSON Novel Reader

[English](./README.md) | [简体中文](./README.zh-CN.md)

一款基于纯前端、通过 `data.json` 驱动的小说阅读器。  
无需后端，无需数据库，只需一个 JSON 文件即可构建包含简介、目录和章节导航的完整小说站点。

---

## ✨ 功能特点

- 📚 **数据驱动** – 所有小说内容（书名、作者、简介、章节目录、正文）均来源于 `data.json`，方便维护和更新。
- 🏠 **首页与目录** – 展示小说标题、作者、简介和完整章节列表，点击任意章节即可进入阅读。
- 📖 **沉浸式阅读** – 阅读页面聚焦内容，支持自定义字体大小、背景颜色和主题（白天/黑夜）。
- 🔀 **章节导航** – 阅读页底部提供“上一章/下一章”按钮和下拉选择框，方便快速跳转，当前章节位置同步显示在顶部控制栏。
- 💾 **偏好持久化** – 所有阅读偏好（主题、字号、背景色、当前章节）自动保存在浏览器 Cookie 中，下次访问自动恢复。
- 📱 **响应式设计** – 在手机、平板和桌面端均能获得舒适的阅读体验。

---

## 📁 项目结构

```markdown
json-novel-reader/
├── Modular/                     # 模块化版本（HTML / CSS / JS 分离）
│   ├── en/                      # 英文语言目录
│   │   ├── data.json            # 英文小说数据
│   │   ├── index.html           # 主页面
│   │   ├── script.js            # 逻辑脚本
│   │   └── style.css            # 样式表
│   └── zh-CN/                   # 简体中文语言目录
│       ├── data.json
│       ├── index.html
│       ├── script.js
│       └── style.css
│
├── Monolithic/                  # 单文件版本（所有代码整合在 index.html）
│   ├── en/                      # 英文语言目录
│   │   ├── data.json
│   │   └── index.html           # 包含所有样式和逻辑
│   └── zh-CN/                   # 简体中文语言目录
│       ├── data.json
│       └── index.html
│
├── README.md                    # 英文说明文档
└── README.zh-CN.md              # 中文说明文档（本文件）
```

- **Monolithic（单文件版）** – 所有 HTML、CSS 和 JavaScript 都集成在 `index.html` 中，适合快速部署或离线使用。
- **Modular（模块化版）** – 将样式和脚本分离为独立的 `style.css` 和 `script.js`，便于维护和二次开发。

两个版本使用完全相同的 `data.json` 数据格式，功能体验也完全一致。您可以根据自己的需求选择任一版本。

---

## 📄 data.json 格式说明

请按照以下格式创建 `data.json` 文件，并将其放在您所选语言目录（如 `Modular/zh-CN/` 或 `Monolithic/en/`）下：

```json
{
    "novel": {
        "title": "小说的标题",
        "author": "作者的名字",
        "description": "小说的描述，可包含多行文字。"
    },
    "Chapter1": {
        "chapter": 1,
        "title": "第一章的标题",
        "subtitle": "—第一章的副标题—",
        "paragraphs": [
            "<p>第一章的段落1</p>",
            "<p>第一章的段落2</p>"
        ]
    },
    "Chapter2": {
        "chapter": 2,
        "title": "第二章的标题",
        "subtitle": "—第二章的副标题—",
        "paragraphs": [
            "<p>第二章的段落1</p>"
        ]
    }
    // 可继续添加 Chapter3、Chapter4 ...
}
```

### 字段说明

| 字段  | 说明  |
| --- | --- |
| `novel` | 对象，包含小说整体信息。 |
| `novel.title` | 小说标题，会显示在首页和浏览器标题栏。 |
| `novel.author` | 作者名。 |
| `novel.description` | 小说简介，可包含 HTML 标签。 |
| `ChapterX` | 章节键名，必须以 `Chapter` 开头并紧跟数字（如 `Chapter1`），按数字升序排列。 |
| `chapter` | 章节序号（整数），用于显示“第X章”。 |
| `title` | 章节标题。 |
| `subtitle` | 章节副标题（可选）。 |
| `paragraphs` | 字符串数组，每个元素为一段 HTML 内容（支持 `<p>` 等标签）。 |

> **注意**：章节键名（如 `Chapter1`）的数字顺序决定了目录和导航顺序，建议与 `chapter` 字段保持一致。

---

## 🚀 如何使用

1. **选择版本和语言**  
  决定使用 `Monolithic/`（单文件）还是 `Modular/`（模块化），然后进入对应的语言目录（`en/` 或 `zh-CN/`）。
  
2. **准备数据**  
  根据上述格式编写您的 `data.json` 文件，并放入您选择的目录中（与 `index.html` 同级）。
  
3. **启动本地服务器**  
  由于浏览器安全策略（CORS），不能直接双击 `index.html` 打开，需要使用本地 HTTP 服务器。推荐使用：
  
  - **VS Code Live Server** 插件（右键 `index.html` → “Open with Live Server”）
  - 或使用 Python 3：`python -m http.server 8000`（在项目根目录或具体语言目录均可）
  - 或使用 Node.js：`npx serve`
4. **访问页面**  
  打开浏览器访问服务器地址（如 `http://localhost:5500` 或 `http://localhost:8000`），根据您的服务器根目录，导航到对应的 `index.html` 位置即可看到小说首页。
  
5. **阅读与导航**
  
  - 点击目录中的章节进入阅读。
  - 在阅读页底部使用导航栏切换章节。
  - 点击“返回目录”回到首页。
  - 通过顶部控制栏切换主题、调整字号和背景色。

---

## 🎨 自定义与扩展

- **调整预设背景色**：
  - 如果使用 **Monolithic（单文件版）**，在 `index.html` 的 `<script>` 中修改 `PRESET_COLORS` 数组。
  - 如果使用 **Modular（模块化版）**，在 `script.js` 中修改 `PRESET_COLORS` 数组。
- **修改字体大小范围**：调整 `applyFontSize` 函数中的 `14` 和 `28` 数值（位置同上）。
- **添加更多章节**：只需在 `data.json` 中按规则增加 `ChapterX` 对象，页面会自动识别并加入目录。

---

## 🌐 浏览器兼容性

支持所有现代浏览器（Chrome、Firefox、Safari、Edge），不支持 Internet Explorer。

---

## 📝 技术实现

- 纯原生 HTML + CSS + JavaScript（ES6）
- 使用 `fetch` API 异步加载 `data.json`
- 使用 `document.cookie` 进行偏好持久化
- CSS 变量实现动态主题切换
- 完全响应式，适配各种屏幕尺寸

---

## 📄 许可证

本项目采用 [MIT License](https://opensource.org/licenses/MIT) 开源，可自由使用、修改和分发。

---

## 🤝 贡献

欢迎提交 Issue 或 Pull Request 来改进本项目。

---

## 📧 联系方式

如有问题，请通过 GitHub Issues 联系。

---

**Happy Reading! 📚**