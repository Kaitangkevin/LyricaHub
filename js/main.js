document.addEventListener('DOMContentLoaded', function() {
    const songsGrid = document.querySelector('.songs-grid');
    const songDetailModal = document.getElementById('songDetailModal');
    const modalCloseBtn = songDetailModal.querySelector('.modal-close');

    // 示例歌曲数据
    const songs = [
        {
            id: 1,
            title: '晴天',
            artist: '周杰伦',
            cover: 'path/to/cover1.jpg',
            rank: '#1',
            platforms: ['spotify', 'qqmusic', 'netease'],
            lyrics: '故事的小黄花\n从出生那年就飘着\n童年的荡秋千\n随记忆一直晃到现在',
            views: 1234567,
            likes: 45678
        },
        // 添加更多歌曲...
    ];

    // 分页配置
    const itemsPerPage = 15; // 每页显示15个
    let currentPage = 1;

    // 渲染歌曲卡片
    function renderSongs() {
        songsGrid.innerHTML = songs.map(song => `
            <div class="song-card glass-module" data-id="${song.id}">
                <div class="song-card-content">
                    <div class="song-card-header">
                        <img src="${song.cover}" alt="${song.title}" class="song-cover">
                        <h3 class="song-title">${song.title}</h3>
                        <p class="song-artist">${song.artist}</p>
                    </div>
                    <div class="song-card-footer">
                        <div class="song-platforms">
                            ${song.platforms.map(platform => `
                                <span class="platform-icon">
                                    <i class="fab fa-${platform}"></i>
                                </span>
                            `).join('')}
                        </div>
                        <span class="song-rank">${song.rank}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // 添加点击事件
        document.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener('click', () => showSongDetail(card.dataset.id));
        });
    }

    // 渲染歌词列表
    function renderLyrics() {
        const lyrics = lyricsService.getAllLyrics();
        const songsGrid = document.querySelector('.songs-grid');
        
        // 按排名排序
        const sortedLyrics = lyrics
            .filter(lyric => lyric.status === '已发布')
            .sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));

        // 分页处理
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = sortedLyrics.slice(startIndex, endIndex);

        // 渲染当前页的歌曲
        songsGrid.innerHTML = pageItems.map(lyric => `
            <div class="song-card glass-module" data-id="${lyric.id}">
                ${lyric.rank ? `<div class="song-rank">TOP${lyric.rank}</div>` : ''}
                <div class="song-card-content">
                    <div>
                        <h3 class="song-title">${lyric.title}</h3>
                        <p class="song-artist">${lyric.artist}</p>
                    </div>
                    <div class="song-card-footer">
                        <span class="category">${lyric.category}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // 添加点击事件
        document.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener('click', () => showSongDetail(card.dataset.id));
        });

        // 更新分页信息
        updatePagination(sortedLyrics.length);
    }

    // 更新分页控件
    function updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        document.querySelector('.page-number').textContent = `${currentPage} / ${totalPages}`;
        
        // 更新按钮状态
        document.querySelector('.prev-page').disabled = currentPage === 1;
        document.querySelector('.next-page').disabled = currentPage === totalPages;
    }

    // 分页按钮事件
    document.querySelector('.prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderLyrics();
            scrollToTop();
        }
    });

    document.querySelector('.next-page').addEventListener('click', () => {
        const totalItems = lyricsService.getAllLyrics().filter(lyric => lyric.status === '已发布').length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderLyrics();
            scrollToTop();
        }
    });

    // 平滑滚动到顶部
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // 显示歌曲详情
    function showSongDetail(songId) {
        const song = lyricsService.getAllLyrics().find(s => s.id === parseInt(songId));
        if (!song) return;

        const platformIcons = {
            spotify: { icon: 'fab fa-spotify', color: '#1DB954', name: 'Spotify' },
            netease: { icon: 'fas fa-music', color: '#C20C0C', name: '网易云音乐' },
            qqmusic: { icon: 'fas fa-music', color: '#31c27c', name: 'QQ音乐' },
            apple: { icon: 'fab fa-apple', color: '#000000', name: 'Apple Music' },
            kugou: { icon: 'fas fa-music', color: '#0C73C2', name: '酷狗音乐' },
            kuwo: { icon: 'fas fa-music', color: '#E21D21', name: '酷我音乐' }
        };

        const detailContent = `
            <div class="song-detail-header">
                <div class="song-detail-info">
                    <div class="song-detail-title-wrap">
                        <h2 class="song-detail-title">${song.title}</h2>
                        ${song.rank ? `<span class="detail-rank">TOP${song.rank}</span>` : ''}
                    </div>
                    <p class="song-detail-artist">
                        <i class="fas fa-user"></i>
                        ${song.artist}
                    </p>
                    <div class="song-detail-meta">
                        <span class="category-badge">
                            <i class="fas fa-tag"></i>
                            ${song.category}
                        </span>
                    </div>
                </div>
                ${song.platforms ? `
                    <div class="song-detail-platforms">
                        <h3 class="platforms-title">
                            <i class="fas fa-headphones"></i>
                            收听渠道
                        </h3>
                        <div class="platforms-grid">
                            ${song.platforms.map(platform => `
                                <a href="#" class="platform-link" style="color: ${platformIcons[platform].color}">
                                    <i class="${platformIcons[platform].icon}"></i>
                                    <span>${platformIcons[platform].name}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="song-lyrics-container">
                <h3 class="lyrics-title">
                    <i class="fas fa-microphone-alt"></i>
                    歌词
                </h3>
                <div class="song-lyrics">
                    ${song.lyrics.split('\n').map(line => `<p>${line}</p>`).join('')}
                </div>
            </div>
        `;

        const songDetailModal = document.getElementById('songDetailModal');
        songDetailModal.querySelector('.song-detail').innerHTML = detailContent;
        songDetailModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // 关闭模态框
    function closeModal() {
        songDetailModal.classList.remove('active');
        document.body.style.overflow = ''; // 恢复背景滚动
    }

    // 添加关闭按钮事件监听
    modalCloseBtn.addEventListener('click', closeModal);

    // 点击模态框外部关闭
    songDetailModal.addEventListener('click', (e) => {
        if (e.target === songDetailModal) {
            closeModal();
        }
    });

    // 添加 ESC 键关闭功能
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && songDetailModal.classList.contains('active')) {
            closeModal();
        }
    });

    // 初始渲染
    renderLyrics();

    // 监听数据更新事件
    window.addEventListener('lyricsUpdated', function() {
        renderLyrics();
    });

    // 获取登录/注册相关的DOM元素
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    const closeButtons = document.querySelectorAll('.modal-close');

    // 显示登录模态框
    window.showLoginModal = function() {
        loginModal.classList.add('active');
        registerModal.classList.remove('active');
        document.body.style.overflow = 'hidden';
    };

    // 显示注册模态框
    window.showRegisterModal = function() {
        registerModal.classList.add('active');
        loginModal.classList.remove('active');
        document.body.style.overflow = 'hidden';
    };

    // 关闭模态框
    function closeModals() {
        loginModal.classList.remove('active');
        registerModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // 绑定按钮点击事件
    loginBtn.addEventListener('click', showLoginModal);
    registerBtn.addEventListener('click', showRegisterModal);

    // 绑定关闭按钮事件
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });

    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === loginModal || e.target === registerModal) {
            closeModals();
        }
    });

    // 处理登录表单提交
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const user = userService.login(email, password);
            updateUserInterface(user);
            closeModals();
            alert('登录成功！');
        } catch (error) {
            alert(error.message);
        }
    });

    // 处理注册表单提交
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }

        try {
            const user = userService.register({ name, email, password });
            updateUserInterface(user);
            closeModals();
            alert('注册成功！');
        } catch (error) {
            alert(error.message);
        }
    });

    // 更新用户界面
    function updateUserInterface(user) {
        const userMenu = document.querySelector('.user-menu');
        if (user) {
            userMenu.innerHTML = `
                <div class="user-info">
                    <span>${user.name}</span>
                    <button class="logout-btn" onclick="logout()">退出</button>
                </div>
            `;
        } else {
            userMenu.innerHTML = `
                <button class="login-btn" onclick="showLoginModal()">登录</button>
                <button class="register-btn" onclick="showRegisterModal()">注册</button>
            `;
        }
    }

    // 退出登录
    window.logout = function() {
        userService.logout();
        updateUserInterface(null);
    };

    // 初始化用户状态
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
        userService.setupAutoLogout();
        updateUserInterface(currentUser);
    }

    // 搜索功能
    const searchInput = document.querySelector('.search-bar input');

    searchInput.addEventListener('input', debounce(function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const lyrics = lyricsService.getAllLyrics();
        
        const filteredLyrics = lyrics.filter(lyric => 
            lyric.status === '已发布' && (
                lyric.title.toLowerCase().includes(searchTerm) ||
                lyric.artist.toLowerCase().includes(searchTerm) ||
                lyric.lyrics.toLowerCase().includes(searchTerm)
            )
        );

        renderFilteredLyrics(filteredLyrics);
    }, 300));

    // 分类按钮点击事件
    const categories = document.querySelectorAll('.category');
    categories.forEach(button => {
        button.addEventListener('click', () => {
            // 移除其他按钮的active类
            categories.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的active类
            button.classList.add('active');
            
            const selectedCategory = button.textContent;
            filterLyricsByCategory(selectedCategory);
        });
    });

    // 按分类筛选歌词
    function filterLyricsByCategory(category) {
        const lyrics = lyricsService.getAllLyrics();
        const filteredLyrics = category === '全部' 
            ? lyrics.filter(lyric => lyric.status === '已发布')
            : lyrics.filter(lyric => 
                lyric.status === '已发布' && 
                lyric.category === category
            );

        // 重置分页
        currentPage = 1;
        renderFilteredLyrics(filteredLyrics);
    }

    // 渲染筛选后的歌词
    function renderFilteredLyrics(lyrics) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = lyrics.slice(startIndex, endIndex);

        songsGrid.innerHTML = pageItems.map(lyric => `
            <div class="song-card glass-module" data-id="${lyric.id}">
                ${lyric.rank ? `<div class="song-rank">TOP${lyric.rank}</div>` : ''}
                <div class="song-card-content">
                    <div>
                        <h3 class="song-title">${lyric.title}</h3>
                        <p class="song-artist">${lyric.artist}</p>
                    </div>
                    <div class="song-card-footer">
                        <span class="category">${lyric.category}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // 添加点击事件
        document.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener('click', () => showSongDetail(card.dataset.id));
        });

        // 更新分页信息
        updatePagination(lyrics.length);
    }

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}); 