(function() {
	'use strict';

	// ================================================================
	// 1. 配置与状态
	// ================================================================
	const COOKIE_NAME = 'novel_reader_settings';
	const COOKIE_EXPIRY_DAYS = 365;
	const THEME_DEFAULTS = { light: '#f5f0e8', dark: '#1a1a2e' };
	const PRESET_COLORS = [
		{ color: '#f5f0e8', label: '米白' },
		{ color: '#ffffff', label: '纯白' },
		{ color: '#f0ead6', label: '奶油' },
		{ color: '#e8f0e8', label: '淡绿' },
		{ color: '#f5e8d0', label: '暖米' },
		{ color: '#1a1a2e', label: '深蓝黑' },
		{ color: '#1a1a1a', label: '纯黑' },
		{ color: '#2d2d3a', label: '暗紫灰' },
		{ color: '#2d2d2d', label: '暗灰' },
		{ color: '#1a2a3a', label: '深蓝' },
	];

	// 数据
	let novelInfo = null;		// { title, author, description }
	let chapters = [];		   // 数组，每个元素 { chapter, title, subtitle, paragraphs }
	let currentView = 'home';	// 'home' 或 'reading'
	let currentChapterIndex = 0; // 阅读页当前章节索引

	let currentTheme = 'light';
	let currentFontSize = 18;
	let currentBgColor = THEME_DEFAULTS.light;
	let customBgSelected = false;

	// ===== DOM 引用 =====
	const homePage = document.getElementById('homePage');
	const readingPage = document.getElementById('readingPage');
	const chapterTitleDisplay = document.getElementById('chapterTitleDisplay');
	const themeBtns = document.querySelectorAll('#themeToggle button');
	const fontDisplay = document.getElementById('fontSizeDisplay');
	const fontDecrease = document.getElementById('fontDecrease');
	const fontIncrease = document.getElementById('fontIncrease');
	const colorDotsContainer = document.getElementById('colorDotsContainer');
	const resetBgBtn = document.getElementById('resetBgBtn');

	// ================================================================
	// 2. Cookie 工具
	// ================================================================
	function setCookie(name, value, days) {
		const expires = new Date(Date.now() + days * 86400000).toUTCString();
		document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
	}

	function getCookie(name) {
		const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		return match ? decodeURIComponent(match[2]) : null;
	}

	// ================================================================
	// 3. 设置持久化
	// ================================================================
	function saveSettings() {
		const settings = {
			theme: currentTheme,
			fontSize: currentFontSize,
			bgColor: currentBgColor,
			customBg: customBgSelected,
			view: currentView,
			readingIndex: currentChapterIndex
		};
		setCookie(COOKIE_NAME, JSON.stringify(settings), COOKIE_EXPIRY_DAYS);
	}

	function loadSettings() {
		const raw = getCookie(COOKIE_NAME);
		if (!raw) return null;
		try { return JSON.parse(raw); } catch (_) { return null; }
	}

	// ================================================================
	// 4. 主题 / 字体 / 背景
	// ================================================================
	function applyTheme(theme, bgColorOverride) {
		const root = document.documentElement;
		root.setAttribute('data-theme', theme);
		currentTheme = theme;
		themeBtns.forEach(btn => {
			const t = btn.getAttribute('data-theme');
			btn.classList.toggle('active', t === theme);
		});
		let bg = bgColorOverride !== undefined ? bgColorOverride : THEME_DEFAULTS[theme];
		if (bgColorOverride !== undefined) customBgSelected = true;
		else customBgSelected = false;
		currentBgColor = bg;
		root.style.setProperty('--bg-color', bg);
		updateColorDots(bg);
		saveSettings();
	}

	function applyFontSize(size) {
		const clamped = Math.min(28, Math.max(14, size));
		currentFontSize = clamped;
		document.documentElement.style.setProperty('--font-size-base', clamped + 'px');
		fontDisplay.textContent = clamped;
		saveSettings();
	}

	function renderColorDots() {
		colorDotsContainer.innerHTML = '';
		PRESET_COLORS.forEach(({ color, label }) => {
			const dot = document.createElement('span');
			dot.className = 'color-dot';
			dot.style.backgroundColor = color;
			dot.title = label;
			dot.dataset.color = color;
			dot.setAttribute('role', 'button');
			dot.setAttribute('aria-label', '背景色：' + label);
			dot.addEventListener('click', function(e) {
				e.stopPropagation();
				const c = this.dataset.color;
				currentBgColor = c;
				customBgSelected = true;
				document.documentElement.style.setProperty('--bg-color', c);
				updateColorDots(c);
				saveSettings();
			});
			colorDotsContainer.appendChild(dot);
		});
		updateColorDots(currentBgColor);
	}

	function updateColorDots(activeColor) {
		const dots = colorDotsContainer.querySelectorAll('.color-dot');
		dots.forEach(dot => {
			const c = dot.dataset.color;
			dot.classList.toggle('active', c === activeColor);
		});
	}

	// ================================================================
	// 5. 更新页面标题（<title>）和控制栏显示
	// ================================================================
	function updateTitleAndLabel(view, chapterIdx) {
		const novelTitle = novelInfo ? novelInfo.title : '小说';
		let labelText = '';
		let titleText = '';

		if (view === 'home') {
			labelText = novelTitle;
			titleText = novelTitle + (novelInfo && novelInfo.author ? ' · ' + novelInfo.author : '');
		} else {
			const ch = chapters[chapterIdx];
			if (ch) {
				labelText = `第${ch.chapter}章：${ch.title}`;
				titleText = `${novelTitle} · 第${ch.chapter}章 ${ch.title}`;
			} else {
				labelText = novelTitle;
				titleText = novelTitle;
			}
		}
		chapterTitleDisplay.textContent = labelText;
		document.title = titleText;
	}

	// ================================================================
	// 6. 渲染首页
	// ================================================================
	function renderHome() {
		if (!novelInfo || chapters.length === 0) {
			homePage.innerHTML = `<div class="error-msg">⚠️ 数据加载失败或无章节</div>`;
			return;
		}

		let html = `
			<h1 class="novel-title">${novelInfo.title}</h1>
			<div class="novel-author">${novelInfo.author || '未知作者'}</div>
			<div class="novel-description">${novelInfo.description || '（暂无简介）'}</div>
			<h2 style="font-weight:400; font-size:1.4rem; margin:0.8em 0 0.4em 0; letter-spacing:2px; border-bottom:1px solid var(--border-color); padding-bottom:0.3em;">📑 目录</h2>
			<div class="chapter-list">
		`;
		chapters.forEach((ch, idx) => {
			html += `
				<div class="chapter-item" data-index="${idx}">
					<span class="chapter-num">第${ch.chapter}章</span>
					<span class="chapter-title">${ch.title}</span>
					${ch.subtitle ? `<span class="chapter-sub">${ch.subtitle}</span>` : ''}
				</div>
			`;
		});
		html += `</div>`;
		homePage.innerHTML = html;

		// 绑定点击事件
		homePage.querySelectorAll('.chapter-item').forEach(el => {
			el.addEventListener('click', function() {
				const idx = parseInt(this.dataset.index);
				if (!isNaN(idx) && idx >= 0 && idx < chapters.length) {
					switchToReading(idx);
				}
			});
		});

		// 显示首页，隐藏阅读页
		homePage.classList.remove('hidden');
		readingPage.classList.remove('active');
		readingPage.style.display = 'none';
		currentView = 'home';
		updateTitleAndLabel('home', 0);
		saveSettings();
	}

	// ================================================================
	// 7. 渲染阅读页（含章节导航栏）
	// ================================================================
	function renderReading(index) {
		if (!chapters.length || index < 0 || index >= chapters.length) {
			readingPage.innerHTML = `<div class="error-msg">章节不存在</div>`;
			return;
		}
		const ch = chapters[index];
		const total = chapters.length;

		// 构建正文
		let html = `
			<div class="chapter-title">
				${ch.title}
				<span class="sub">${ch.subtitle || ''}</span>
			</div>
		`;
		ch.paragraphs.forEach(p => {
			html += p;
		});

		// ---- 章节导航栏（当章节 > 1 时显示） ----
		if (total > 1) {
			html += `
				<div class="chapter-nav">
					<button id="prevChapter" ${index === 0 ? 'disabled' : ''}>◀ 上一章</button>
					<span class="chapter-indicator">
						<span>第 ${index+1} / ${total} 章</span>
						<select id="chapterSelect" aria-label="跳转章节">
							${chapters.map((chItem, i) => `<option value="${i}" ${i === index ? 'selected' : ''}>第${chItem.chapter}章 ${chItem.title}</option>`).join('')}
						</select>
					</span>
					<button id="nextChapter" ${index === total-1 ? 'disabled' : ''}>下一章 ▶</button>
				</div>
			`;
		}

		// ---- 返回首页按钮 ----
		html += `
			<div class="back-home-wrapper">
				<button class="back-home-btn" id="backHomeBtn">🏠 返回目录</button>
			</div>
		`;

		readingPage.innerHTML = html;

		// ---- 绑定导航事件 ----
		if (total > 1) {
			const prevBtn = document.getElementById('prevChapter');
			const nextBtn = document.getElementById('nextChapter');
			const select = document.getElementById('chapterSelect');

			if (prevBtn) {
				prevBtn.addEventListener('click', function() {
					if (currentChapterIndex > 0) {
						switchToReading(currentChapterIndex - 1);
					}
				});
			}
			if (nextBtn) {
				nextBtn.addEventListener('click', function() {
					if (currentChapterIndex < chapters.length - 1) {
						switchToReading(currentChapterIndex + 1);
					}
				});
			}
			if (select) {
				select.addEventListener('change', function() {
					const idx = parseInt(this.value);
					if (!isNaN(idx) && idx !== currentChapterIndex) {
						switchToReading(idx);
					}
				});
			}
		}

		// 返回首页
		const backBtn = document.getElementById('backHomeBtn');
		if (backBtn) {
			backBtn.addEventListener('click', function() {
				switchToHome();
			});
		}

		// 显示阅读页，隐藏首页
		homePage.classList.add('hidden');
		readingPage.style.display = 'block';
		readingPage.classList.add('active');
		currentView = 'reading';
		currentChapterIndex = index;
		updateTitleAndLabel('reading', index);
		saveSettings();

		// 滚动到顶部
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// ================================================================
	// 8. 切换视图
	// ================================================================
	function switchToReading(index) {
		if (index < 0 || index >= chapters.length) return;
		renderReading(index);
	}

	function switchToHome() {
		renderHome();
	}

	// ================================================================
	// 9. 加载 data.json
	// ================================================================
	async function loadData() {
		try {
			const response = await fetch('data.json');
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			const json = await response.json();

			// 解析 novel 信息
			if (json.novel) {
				novelInfo = {
					title: json.novel.title || '未命名小说',
					author: json.novel.author || '未知作者',
					description: json.novel.description || ''
				};
			} else {
				novelInfo = { title: '未命名小说', author: '未知作者', description: '' };
			}

			// 提取章节：键名以 "Chapter" 开头
			const keys = Object.keys(json).filter(k => /^Chapter\d+$/i.test(k));
			const sortedKeys = keys.sort((a, b) => {
				const numA = parseInt(a.match(/\d+/)[0]);
				const numB = parseInt(b.match(/\d+/)[0]);
				return numA - numB;
			});

			chapters = sortedKeys.map(key => {
				const item = json[key];
				return {
					chapter: item.chapter || parseInt(key.match(/\d+/)[0]),
					title: item.title || '未命名章节',
					subtitle: item.subtitle || '',
					paragraphs: Array.isArray(item.paragraphs) ? item.paragraphs : []
				};
			});

			if (chapters.length === 0) throw new Error('没有找到任何章节');

			// 读取保存的设置
			const saved = loadSettings();
			let theme = 'light',
				fontSize = 18,
				bgColor = THEME_DEFAULTS.light,
				customBg = false,
				view = 'home',
				readingIdx = 0;

			if (saved) {
				theme = saved.theme || 'light';
				fontSize = saved.fontSize || 18;
				bgColor = saved.bgColor || THEME_DEFAULTS[theme];
				customBg = saved.customBg || false;
				view = saved.view || 'home';
				readingIdx = saved.readingIndex || 0;
				if (readingIdx >= chapters.length) readingIdx = 0;
			}

			// 应用设置
			currentTheme = theme;
			currentFontSize = fontSize;
			currentBgColor = bgColor;
			customBgSelected = customBg;
			currentView = view;
			currentChapterIndex = readingIdx;

			document.documentElement.setAttribute('data-theme', theme);
			document.documentElement.style.setProperty('--bg-color', bgColor);
			document.documentElement.style.setProperty('--font-size-base', fontSize + 'px');
			fontDisplay.textContent = fontSize;

			themeBtns.forEach(btn => {
				const t = btn.getAttribute('data-theme');
				btn.classList.toggle('active', t === theme);
			});
			updateColorDots(bgColor);

			// 根据视图渲染
			if (view === 'home') {
				renderHome();
			} else {
				if (readingIdx >= chapters.length) readingIdx = 0;
				currentChapterIndex = readingIdx;
				renderReading(readingIdx);
			}

			saveSettings();

		} catch (error) {
			console.error('加载 data.json 失败:', error);
			homePage.innerHTML = `
				<div class="error-msg">
					⚠️ 无法加载 data.json<br>
					<span style="font-size:0.8rem;opacity:0.6;">${error.message}</span><br>
					<span style="font-size:0.7rem;opacity:0.5;">请确保 data.json 与页面在同一目录，并使用本地服务器（如 VS Code Live Server）访问。</span>
				</div>
			`;
			homePage.classList.remove('hidden');
			readingPage.style.display = 'none';
			chapterTitleDisplay.textContent = '加载失败';
			document.title = '加载失败';
		}
	}

	// ================================================================
	// 10. 初始化控制栏事件
	// ================================================================
	function initControls() {
		renderColorDots();

		resetBgBtn.addEventListener('click', function(e) {
			e.stopPropagation();
			const defaultBg = THEME_DEFAULTS[currentTheme];
			currentBgColor = defaultBg;
			customBgSelected = false;
			document.documentElement.style.setProperty('--bg-color', defaultBg);
			updateColorDots(defaultBg);
			saveSettings();
			this.style.opacity = '0.3';
			setTimeout(() => { this.style.opacity = ''; }, 200);
		});

		themeBtns.forEach(btn => {
			btn.addEventListener('click', function(e) {
				const theme = this.getAttribute('data-theme');
				if (theme === currentTheme) return;
				const defaultBg = THEME_DEFAULTS[theme];
				currentTheme = theme;
				currentBgColor = defaultBg;
				customBgSelected = false;
				document.documentElement.setAttribute('data-theme', theme);
				document.documentElement.style.setProperty('--bg-color', defaultBg);
				updateColorDots(defaultBg);
				themeBtns.forEach(b => b.classList.toggle('active', b === this));
				saveSettings();
			});
		});

		fontDecrease.addEventListener('click', function() {
			applyFontSize(currentFontSize - 2);
		});
		fontIncrease.addEventListener('click', function() {
			applyFontSize(currentFontSize + 2);
		});

		document.addEventListener('keydown', function(e) {
			if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
				if (e.key === '=' || e.key === '+') {
					e.preventDefault();
					applyFontSize(currentFontSize + 2);
				} else if (e.key === '-' || e.key === '_') {
					e.preventDefault();
					applyFontSize(currentFontSize - 2);
				}
			}
		});
	}

	// ================================================================
	// 11. 启动
	// ================================================================
	function init() {
		initControls();
		loadData();
	}

	if (document.readyState === 'complete' || document.readyState === 'interactive') {
		init();
	} else {
		document.addEventListener('DOMContentLoaded', init);
	}

})();