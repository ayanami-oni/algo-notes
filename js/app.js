// ========== 构建导航树 ==========
function buildNavTree() {
    const navTree = document.getElementById('navTree');
    navTree.innerHTML = '';

    navData.forEach((category, catIndex) => {
        const categoryEl = document.createElement('div');
        categoryEl.className = 'nav-category';
        categoryEl.dataset.index = catIndex;

        const header = document.createElement('div');
        header.className = 'nav-category-header';
        header.innerHTML = `
            <span class="nav-title">
                <span class="nav-icon">${category.icon}</span>
                ${category.title}
            </span>
            <span class="nav-toggle-icon">▶</span>
        `;

        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'nav-children';

        category.children.forEach((child, childIndex) => {
            const item = document.createElement('a');
            item.className = 'nav-item';
            item.textContent = child.title;
            item.dataset.file = child.file;
            item.dataset.catIndex = catIndex;
            item.dataset.childIndex = childIndex;
            item.addEventListener('click', (e) => {
                e.preventDefault();
                loadMarkdown(child.file, child.title);
                setActiveNav(item);
                // 移动端关闭侧边栏
                if (window.innerWidth <= 768) {
                    document.getElementById('sidebar').classList.remove('open');
                    document.querySelector('.overlay')?.classList.remove('active');
                }
            });
            childrenContainer.appendChild(item);
        });

        header.addEventListener('click', () => {
            categoryEl.classList.toggle('expanded');
        });

        categoryEl.appendChild(header);
        categoryEl.appendChild(childrenContainer);
        navTree.appendChild(categoryEl);
    });
}

// ========== 设置当前激活项 ==========
function setActiveNav(activeItem) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
}

// ========== 加载 Markdown ==========
async function loadMarkdown(filePath, title) {
    const contentEl = document.getElementById('content');
    contentEl.innerHTML = '<div class="welcome"><p>加载中...</p></div>';

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('加载失败');
        const markdown = await response.text();

        const html = marked.parse(markdown);
        contentEl.innerHTML = `<div class="markdown-body">${html}</div>`;

        // 代码高亮
        document.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });

        // 更新页面标题
        document.title = `${title} - 算法学习笔记`;

        // 滚动到顶部
        window.scrollTo(0, 0);
    } catch (err) {
        contentEl.innerHTML = `
            <div class="welcome">
                <h2>加载失败</h2>
                <p>无法加载文件: ${filePath}</p>
                <p style="color: #ef4444;">${err.message}</p>
            </div>
        `;
    }
}

// ========== 模糊搜索 ==========
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    // 构建搜索索引
    const searchIndex = [];
    navData.forEach((cat, ci) => {
        cat.children.forEach((child, chi) => {
            searchIndex.push({
                title: child.title,
                category: cat.title,
                file: child.file,
                catIndex: ci,
                childIndex: chi,
                // 用于模糊匹配的字符串
                searchStr: (child.title + ' ' + cat.title).toLowerCase()
            });
        });
    });

    function fuzzyMatch(query, text) {
        query = query.toLowerCase().trim();
        if (!query) return { match: false, score: 0, highlights: [] };

        let qi = 0;
        let ti = 0;
        const highlights = [];
        const matched = [];

        while (qi < query.length && ti < text.length) {
            if (query[qi] === text[ti]) {
                matched.push(ti);
                qi++;
            }
            ti++;
        }

        if (qi < query.length) return { match: false, score: 0, highlights: [] };

        // 计算分数：连续匹配加分，开头匹配加分
        let score = matched.length * 10;
        for (let i = 1; i < matched.length; i++) {
            if (matched[i] === matched[i - 1] + 1) score += 5;
        }
        if (matched[0] === 0) score += 10;

        return { match: true, score, highlights: matched };
    }

    function highlightText(text, indices) {
        let result = '';
        let last = 0;
        indices.forEach(idx => {
            result += text.slice(last, idx);
            result += `<span class="result-highlight">${text[idx]}</span>`;
            last = idx + 1;
        });
        result += text.slice(last);
        return result;
    }

    function performSearch(query) {
        if (!query.trim()) {
            searchResults.classList.remove('active');
            return;
        }

        const results = searchIndex.map(item => {
            const match = fuzzyMatch(query, item.searchStr);
            return { ...item, ...match };
        }).filter(r => r.match).sort((a, b) => b.score - a.score);

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">未找到匹配结果</div>';
        } else {
            searchResults.innerHTML = results.slice(0, 10).map(r => {
                const highlightedTitle = highlightText(r.title, r.highlights.filter(i => i < r.title.length));
                return `
                    <div class="search-result-item" data-file="${r.file}" data-cat="${r.catIndex}" data-child="${r.childIndex}">
                        <div class="result-title">${highlightedTitle}</div>
                        <div class="result-category">${r.category}</div>
                    </div>
                `;
            }).join('');

            // 绑定点击事件
            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const file = item.dataset.file;
                    const title = item.querySelector('.result-title').textContent;
                    const catIndex = item.dataset.cat;
                    const childIndex = item.dataset.child;

                    loadMarkdown(file, title);

                    // 展开对应分类并高亮
                    const catEl = document.querySelector(`.nav-category[data-index="${catIndex}"]`);
                    if (catEl) catEl.classList.add('expanded');

                    const navItem = document.querySelector(`.nav-item[data-cat-index="${catIndex}"][data-child-index="${childIndex}"]`);
                    if (navItem) setActiveNav(navItem);

                    searchResults.classList.remove('active');
                    searchInput.value = '';
                });
            });
        }

        searchResults.classList.add('active');
    }

    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    // 点击外部关闭搜索结果
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            searchResults.classList.remove('active');
        }
    });

    // ESC 关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchResults.classList.remove('active');
            searchInput.blur();
        }
    });
}

// ========== 移动端菜单切换 ==========
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    buildNavTree();
    initSearch();
    initMobileMenu();
});
