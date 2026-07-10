(function() {
	'use strict';

	// ================================================================
	// 1. Configuration and State
	// ================================================================
	const COOKIE_NAME = 'novel_reader_settings';
	const COOKIE_EXPIRY_DAYS = 365;
	const THEME_DEFAULTS = { light: '#f5f0e8', dark: '#1a1a2e' };
	const PRESET_COLORS = [
		{ color: '#f5f0e8', label: 'Warm White' },
		{ color: '#ffffff', label: 'Pure White' },
		{ color: '#f0ead6', label: 'Cream' },
		{ color: '#e8f0e8', label: 'Light Green' },
		{ color: '#f5e8d0', label: 'Warm Beige' },
		{ color: '#1a1a2e', label: 'Deep Blue' },
		{ color: '#1a1a1a', label: 'Pure Black' },
		{ color: '#2d2d3a', label: 'Dark Purple' },
		{ color: '#2d2d2d', label: 'Dark Gray' },
		{ color: '#1a2a3a', label: 'Navy Blue' },
	];

	// Data
	let novelInfo = null;		// { title, author, description }
	let chapters = [];		   // Array of { chapter, title, subtitle, paragraphs }
	let currentView = 'home';	// 'home' or 'reading'
	let currentChapterIndex = 0; // Current chapter index on reading page

	let currentTheme = 'light';
	let currentFontSize = 18;
	let currentBgColor = THEME_DEFAULTS.light;
	let customBgSelected = false;

	// ===== DOM References =====
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
	// 2. Cookie Utilities
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
	// 3. Settings Persistence
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
	// 4. Theme / Font / Background
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
			dot.setAttribute('aria-label', 'Background: ' + label);
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
	// 5. Update Page Title (<title>) and Control Bar Display
	// ================================================================
	function updateTitleAndLabel(view, chapterIdx) {
		const novelTitle = novelInfo ? novelInfo.title : 'Novel';
		let labelText = '';
		let titleText = '';

		if (view === 'home') {
			labelText = novelTitle;
			titleText = novelTitle + (novelInfo && novelInfo.author ? ' · ' + novelInfo.author : '');
		} else {
			const ch = chapters[chapterIdx];
			if (ch) {
				labelText = `Chapter ${ch.chapter}: ${ch.title}`;
				titleText = `${novelTitle} · Chapter ${ch.chapter} ${ch.title}`;
			} else {
				labelText = novelTitle;
				titleText = novelTitle;
			}
		}
		chapterTitleDisplay.textContent = labelText;
		document.title = titleText;
	}

	// ================================================================
	// 6. Render Home Page
	// ================================================================
	function renderHome() {
		if (!novelInfo || chapters.length === 0) {
			homePage.innerHTML = `<div class="error-msg">⚠️ Failed to load data or no chapters</div>`;
			return;
		}

		let html = `
			<h1 class="novel-title">${novelInfo.title}</h1>
			<div class="novel-author">${novelInfo.author || 'Unknown Author'}</div>
			<div class="novel-description">${novelInfo.description || '(No description)'}</div>
			<h2 style="font-weight:400; font-size:1.4rem; margin:0.8em 0 0.4em 0; letter-spacing:2px; border-bottom:1px solid var(--border-color); padding-bottom:0.3em;">📑 Table of Contents</h2>
			<div class="chapter-list">
		`;
		chapters.forEach((ch, idx) => {
			html += `
				<div class="chapter-item" data-index="${idx}">
					<span class="chapter-num">Chapter ${ch.chapter}</span>
					<span class="chapter-title">${ch.title}</span>
					${ch.subtitle ? `<span class="chapter-sub">${ch.subtitle}</span>` : ''}
				</div>
			`;
		});
		html += `</div>`;
		homePage.innerHTML = html;

		// Bind click events
		homePage.querySelectorAll('.chapter-item').forEach(el => {
			el.addEventListener('click', function() {
				const idx = parseInt(this.dataset.index);
				if (!isNaN(idx) && idx >= 0 && idx < chapters.length) {
					switchToReading(idx);
				}
			});
		});

		// Show home page, hide reading page
		homePage.classList.remove('hidden');
		readingPage.classList.remove('active');
		readingPage.style.display = 'none';
		currentView = 'home';
		updateTitleAndLabel('home', 0);
		saveSettings();
	}

	// ================================================================
	// 7. Render Reading Page (with Chapter Navigation Bar)
	// ================================================================
	function renderReading(index) {
		if (!chapters.length || index < 0 || index >= chapters.length) {
			readingPage.innerHTML = `<div class="error-msg">Chapter not found</div>`;
			return;
		}
		const ch = chapters[index];
		const total = chapters.length;

		// Build content
		let html = `
			<div class="chapter-title">
				${ch.title}
				<span class="sub">${ch.subtitle || ''}</span>
			</div>
		`;
		ch.paragraphs.forEach(p => {
			html += p;
		});

		// ---- Chapter Navigation Bar (shown when more than 1 chapter) ----
		if (total > 1) {
			html += `
				<div class="chapter-nav">
					<button id="prevChapter" ${index === 0 ? 'disabled' : ''}>◀ Previous</button>
					<span class="chapter-indicator">
						<span>Chapter ${index+1} / ${total}</span>
						<select id="chapterSelect" aria-label="Jump to Chapter">
							${chapters.map((chItem, i) => `<option value="${i}" ${i === index ? 'selected' : ''}>Chapter ${chItem.chapter} ${chItem.title}</option>`).join('')}
						</select>
					</span>
					<button id="nextChapter" ${index === total-1 ? 'disabled' : ''}>Next ▶</button>
				</div>
			`;
		}

		// ---- Back to Home Button ----
		html += `
			<div class="back-home-wrapper">
				<button class="back-home-btn" id="backHomeBtn">🏠 Back to Table of Contents</button>
			</div>
		`;

		readingPage.innerHTML = html;

		// ---- Bind Navigation Events ----
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

		// Back to home
		const backBtn = document.getElementById('backHomeBtn');
		if (backBtn) {
			backBtn.addEventListener('click', function() {
				switchToHome();
			});
		}

		// Show reading page, hide home page
		homePage.classList.add('hidden');
		readingPage.style.display = 'block';
		readingPage.classList.add('active');
		currentView = 'reading';
		currentChapterIndex = index;
		updateTitleAndLabel('reading', index);
		saveSettings();

		// Scroll to top
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// ================================================================
	// 8. Switch Views
	// ================================================================
	function switchToReading(index) {
		if (index < 0 || index >= chapters.length) return;
		renderReading(index);
	}

	function switchToHome() {
		renderHome();
	}

	// ================================================================
	// 9. Load data.json
	// ================================================================
	async function loadData() {
		try {
			const response = await fetch('data.json');
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			const json = await response.json();

			// Parse novel info
			if (json.novel) {
				novelInfo = {
					title: json.novel.title || 'Untitled Novel',
					author: json.novel.author || 'Unknown Author',
					description: json.novel.description || ''
				};
			} else {
				novelInfo = { title: 'Untitled Novel', author: 'Unknown Author', description: '' };
			}

			// Extract chapters: keys starting with "Chapter"
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
					title: item.title || 'Untitled Chapter',
					subtitle: item.subtitle || '',
					paragraphs: Array.isArray(item.paragraphs) ? item.paragraphs : []
				};
			});

			if (chapters.length === 0) throw new Error('No chapters found');

			// Load saved settings
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

			// Apply settings
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

			// Render based on view
			if (view === 'home') {
				renderHome();
			} else {
				if (readingIdx >= chapters.length) readingIdx = 0;
				currentChapterIndex = readingIdx;
				renderReading(readingIdx);
			}

			saveSettings();

		} catch (error) {
			console.error('Failed to load data.json:', error);
			homePage.innerHTML = `
				<div class="error-msg">
					⚠️ Failed to load data.json<br>
					<span style="font-size:0.8rem;opacity:0.6;">${error.message}</span><br>
					<span style="font-size:0.7rem;opacity:0.5;">Please ensure data.json is in the same directory and access via a local server (e.g., VS Code Live Server).</span>
				</div>
			`;
			homePage.classList.remove('hidden');
			readingPage.style.display = 'none';
			chapterTitleDisplay.textContent = 'Failed to load';
			document.title = 'Failed to load';
		}
	}

	// ================================================================
	// 10. Initialize Control Bar Events
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
	// 11. Startup
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