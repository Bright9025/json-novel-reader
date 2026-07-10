# 📖 JSON Novel Reader

[English](./README.md) | [简体中文](./README.zh-CN.md)

A pure front‑end novel reader driven by a `data.json` file.  
No backend, no database – just a JSON file to build a complete novel site with synopsis, table of contents, and chapter navigation.

---

## ✨ Features

- 📚 **Data‑driven** – All content (title, author, description, chapters, paragraphs) comes from `data.json`, easy to maintain and update.
- 🏠 **Homepage & Contents** – Displays novel title, author, description and a full chapter list. Click any chapter to start reading.
- 📖 **Immersive Reading** – Focus on the content with customizable font size, background color and theme (light/dark).
- 🔀 **Chapter Navigation** – “Previous” / “Next” buttons and a dropdown selector at the bottom of the reading page for quick jumps. Current chapter is synced to the top control bar.
- 💾 **Preferences Persistence** – All reading preferences (theme, font size, background color, current chapter) are saved in browser cookies and restored on next visit.
- 📱 **Responsive Design** – Comfortable on mobile, tablet and desktop.

---

## 📁 Project Structure

```markdown
json-novel-reader/
├── Modular/                     # Modular version (separate HTML / CSS / JS)
│   ├── en/                      # English language directory
│   │   ├── data.json            # Novel data (English)
│   │   ├── index.html           # Main page
│   │   ├── script.js            # Logic script
│   │   └── style.css            # Stylesheet
│   └── zh-CN/                   # Chinese (Simplified) language directory
│       ├── data.json
│       ├── index.html
│       ├── script.js
│       └── style.css
│
├── Monolithic/                  # Monolithic version (all in one HTML file)
│   ├── en/                      # English language directory
│   │   ├── data.json
│   │   └── index.html           # Contains all styles and logic
│   └── zh-CN/                   # Chinese (Simplified) language directory
│       ├── data.json
│       └── index.html
│
├── README.md                    # English documentation
└── README.zh-CN.md              # Chinese documentation
```

- **Monolithic** – Everything (HTML, CSS, JS) is contained in a single `index.html`. Good for quick deployment or offline reading.
- **Modular** – Separated into `index.html`, `style.css` and `script.js` for better maintainability and easier customization.

Both versions share the same `data.json` format and user experience. Choose the one that fits your needs.

---

## 📄 data.json Format

Place your `data.json` file in the same directory as the `index.html` you are using (inside the chosen language folder, e.g., `Modular/en/` or `Monolithic/zh-CN/`). The format is:

```json
{
    "novel": {
        "title": "Novel Title",
        "author": "Author Name",
        "description": "A brief description of the novel."
    },
    "Chapter1": {
        "chapter": 1,
        "title": "Chapter 1 Title",
        "subtitle": "— Chapter 1 Subtitle —",
        "paragraphs": [
            "<p>First paragraph of chapter 1.</p>",
            "<p>Second paragraph.</p>"
        ]
    },
    "Chapter2": {
        "chapter": 2,
        "title": "Chapter 2 Title",
        "subtitle": "— Chapter 2 Subtitle —",
        "paragraphs": [
            "<p>First paragraph of chapter 2.</p>"
        ]
    }
    // Add more chapters as Chapter3, Chapter4, ...
}
```

### Field Descriptions

| Field | Description |
| --- | --- |
| `novel` | Object containing novel metadata. |
| `novel.title` | Novel title – displayed on the homepage and in the browser tab. |
| `novel.author` | Author’s name. |
| `novel.description` | Synopsis (can contain HTML tags). |
| `ChapterX` | Chapter key, must start with `Chapter` followed by a number (e.g., `Chapter1`). Order is determined by this number. |
| `chapter` | Chapter number (integer), displayed as “Chapter X”. |
| `title` | Chapter title. |
| `subtitle` | Optional subtitle. |
| `paragraphs` | Array of strings, each as a HTML fragment (supports `<p>` and other tags). |

> **Note**: The numeric order in the keys (`Chapter1`, `Chapter2`, …) determines the order in the table of contents and navigation.

---

## 🚀 How to Use

1. **Choose a version and language** – Pick either `Monolithic/` or `Modular/`, then go to the desired language directory (`en/` or `zh-CN/`).
  
2. **Prepare your data** – Create a `data.json` file following the format above and place it in the same directory as your `index.html`.
  
3. **Serve with a local HTTP server** – Due to CORS restrictions, you cannot open `index.html` directly from the file system. Use one of these:
  
  - **VS Code Live Server** – right‑click `index.html` → “Open with Live Server”.
  - **Python 3** – run `python -m http.server 8000` (from the project root or the language directory).
  - **Node.js** – run `npx serve`.
4. **Open in browser** – Navigate to the server address (e.g., `http://localhost:5500` or `http://localhost:8000`), then browse to the corresponding `index.html` to see the novel homepage.
  
5. **Read & navigate** – Click a chapter in the table of contents to start reading. Use the navigation bar at the bottom to switch chapters, or click “Back to Contents” to return to the homepage. Customize theme, font size and background color via the top control bar.
  

---

## 🎨 Customization

- **Background colours** –
  - For **Monolithic** (single file), modify the `PRESET_COLORS` array inside the `<script>` in `index.html`.
  - For **Modular**, edit the `PRESET_COLORS` array in `script.js`.
- **Font size range** – Adjust the `14` and `28` values inside the `applyFontSize` function (in the same location).
- **Add more chapters** – Just add new `ChapterX` objects to your `data.json` – they will be automatically recognised.

---

## 🌐 Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Not compatible with Internet Explorer.

---

## 🛠️ Technical Stack

- Pure vanilla HTML + CSS + JavaScript (ES6)
- `fetch` API for loading `data.json`
- `document.cookie` for preference persistence
- CSS custom properties (variables) for dynamic theming
- Fully responsive with flexbox and media queries

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) – feel free to use, modify and distribute.

---

## 🤝 Contributing

Issues and pull requests are welcome!

---

## 📧 Contact

For questions, please open a GitHub issue.

---

**Happy Reading! 📚**