// ========== Build Navigation Tree ==========
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
            <span class="nav-toggle-icon">&#9654;</span>
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
                // Close mobile sidebar
                if (window.innerWidth <= 768) {
                    closeMobileSidebar();
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

// ========== Set Active Navigation Item ==========
function setActiveNav(activeItem) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
}

// ========== Load Markdown Content ==========
async function loadMarkdown(filePath, title) {
    const contentEl = document.getElementById('content');
    contentEl.innerHTML = '<div class="welcome"><p>加载中...</p></div>';

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('加载失败');
        const markdown = await response.text();

        const html = marked.parse(markdown);
        contentEl.innerHTML = `<div class="markdown-body">${html}</div>`;

        // Syntax highlighting
        document.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });

        // Update page title
        document.title = `${title} - 算法学习笔记`;

        // Scroll to top
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

// ========== Fuzzy Search ==========
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    // Build search index
    const searchIndex = [];
    navData.forEach((cat, ci) => {
        cat.children.forEach((child, chi) => {
            searchIndex.push({
                title: child.title,
                category: cat.title,
                file: child.file,
                catIndex: ci,
                childIndex: chi,
                searchStr: (child.title + ' ' + cat.title).toLowerCase()
            });
        });
    });

    function fuzzyMatch(query, text) {
        query = query.toLowerCase().trim();
        if (!query) return { match: false, score: 0, highlights: [] };

        let qi = 0;
        let ti = 0;
        const matched = [];

        while (qi < query.length && ti < text.length) {
            if (query[qi] === text[ti]) {
                matched.push(ti);
                qi++;
            }
            ti++;
        }

        if (qi < query.length) return { match: false, score: 0, highlights: [] };

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

            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const file = item.dataset.file;
                    const title = item.querySelector('.result-title').textContent;
                    const catIndex = item.dataset.cat;
                    const childIndex = item.dataset.child;

                    loadMarkdown(file, title);

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

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            searchResults.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchResults.classList.remove('active');
            searchInput.blur();
        }
    });
}

// ========== Mobile Sidebar ==========
function initMobileSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    // Create overlay
    let overlay = document.querySelector('.overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
    }

    function openSidebar() {
        menuToggle.classList.add('active');
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        menuToggle.classList.remove('active');
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    overlay.addEventListener('click', closeSidebar);

    // Expose close function globally
    window.closeMobileSidebar = closeSidebar;

    // Handle resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });
}

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', () => {
    buildNavTree();
    initSearch();
    initMobileSidebar();
});
