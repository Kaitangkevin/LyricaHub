// 在文件开头添加认证检查
if (localStorage.getItem('adminAuthenticated') !== 'true') {
    window.location.href = 'login.html';
}

// 在文件顶部引入服务
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const sidebarLinks = document.querySelectorAll('.sidebar nav ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    const addLyricBtn = document.getElementById('addLyricBtn');
    const lyricModal = document.getElementById('lyricModal');
    const modalCloseBtn = lyricModal.querySelector('.modal-close');
    const lyricForm = document.getElementById('lyricForm');
    const modalTitle = lyricModal.querySelector('.modal-header h2');

    // 歌词数据存储
    let lyrics = JSON.parse(localStorage.getItem('lyrics')) || [
        {
            id: 1,
            title: '晴天',
            artist: '周杰伦',
            category: '流行',
            status: '已发布',
            addTime: '2024-01-01',
            lyrics: '故事的小黄花\n从出生那年就飘着\n童年的荡秋千\n随记忆一直晃到现在',
            views: 1234,
            likes: 567
        }
    ];

    // 分页功能
    let currentPage = 1;
    const itemsPerPage = 10;

    function updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        document.querySelector('.page-number').textContent = `${currentPage} / ${totalPages}`;
        
        // 更新按钮状态
        document.querySelector('.prev-page').disabled = currentPage === 1;
        document.querySelector('.next-page').disabled = currentPage === totalPages;
    }

    // 渲染歌词表格
    function renderLyricsTable() {
        const lyrics = lyricsService.getAllLyrics();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = lyrics.slice(startIndex, endIndex);
        const tbody = document.querySelector('.data-table tbody');
        tbody.innerHTML = pageItems.map(lyric => `
            <tr>
                <td>${lyric.id}</td>
                <td>${lyric.title}</td>
                <td>${lyric.artist}</td>
                <td>${lyric.category}</td>
                <td>
                    <span class="status-badge ${lyric.status === '已发布' ? 'published' : 'draft'}">
                        ${lyric.status}
                    </span>
                </td>
                <td>${lyric.addTime}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon edit-btn" data-id="${lyric.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-btn" data-id="${lyric.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // 添加编辑和删除按钮的事件监听
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editLyric(btn.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteLyric(btn.dataset.id));
        });

        // 更新本地存储
        localStorage.setItem('lyrics', JSON.stringify(lyrics));

        updatePagination(lyrics.length);
    }

    // 侧边栏导航
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetSection = link.getAttribute('data-section');
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetSection}-section`) {
                    section.classList.add('active');
                    // 当切换到用户管理部分时，刷新用户表格
                    if (targetSection === 'users') {
                        renderUsersTable();
                    }
                }
            });
        });
    });

    // 添加歌词按钮点击事件
    addLyricBtn.addEventListener('click', function() {
        modalTitle.textContent = '添加歌词';
        lyricForm.reset();
        delete lyricForm.dataset.editId;
        lyricModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // 关闭模态框函数
    function closeModal() {
        lyricModal.classList.remove('active');
        document.body.style.overflow = '';
        lyricForm.reset();
        delete lyricForm.dataset.editId;
        modalTitle.textContent = '添加歌词';
    }

    // 表单提交处理
    lyricForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 获取选中的平台
        const selectedPlatforms = Array.from(document.querySelectorAll('input[name="platforms"]:checked'))
            .map(checkbox => checkbox.value);

        // 获取表单数据
        const formData = {
            title: document.getElementById('songTitle').value.trim(),
            artist: document.getElementById('artist').value.trim(),
            category: document.getElementById('category').value,
            status: document.getElementById('status').value,
            lyrics: document.getElementById('lyrics').value.trim(),
            platforms: selectedPlatforms,
            rank: document.getElementById('rank').value ? parseInt(document.getElementById('rank').value) : null
        };

        // 验证必填字段
        if (!formData.title || !formData.artist || !formData.lyrics) {
            alert('请填写所有必填字段');
            return;
        }

        const editId = this.dataset.editId;
        if (editId) {
            // 更新现有歌词
            lyricsService.updateLyric(parseInt(editId), {
                ...formData,
                id: parseInt(editId)
            });
            alert('歌词更新成功！');
        } else {
            // 添加新歌词
            lyricsService.addLyric(formData);
            alert('歌词添加成功！');
        }

        // 重置表单和状态
        this.reset();
        delete this.dataset.editId;
        modalTitle.textContent = '添加歌词';

        // 关闭模态框
        closeModal();
        
        // 刷新表格
        renderLyricsTable();
    });

    // 点击模态框外部关闭
    lyricModal.addEventListener('click', function(e) {
        if (e.target === lyricModal) {
            closeModal();
        }
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lyricModal.classList.contains('active')) {
            closeModal();
        }
    });

    // 编辑歌词
    function editLyric(id) {
        const lyric = lyricsService.getAllLyrics().find(l => l.id === parseInt(id));
        if (!lyric) return;

        // 更新模态框标题
        modalTitle.textContent = '编辑歌词';

        // 填充表单数据
        document.getElementById('songTitle').value = lyric.title;
        document.getElementById('artist').value = lyric.artist;
        document.getElementById('category').value = lyric.category;
        document.getElementById('status').value = lyric.status;
        document.getElementById('rank').value = lyric.rank || '';
        document.getElementById('lyrics').value = lyric.lyrics;

        // 设置平台选择
        document.querySelectorAll('input[name="platforms"]').forEach(checkbox => {
            checkbox.checked = lyric.platforms && lyric.platforms.includes(checkbox.value);
        });

        // 保存当前编辑的歌词ID
        lyricForm.dataset.editId = id;

        // 显示模态框
        lyricModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // 删除歌词
    function deleteLyric(id) {
        if (confirm('确定要删除这条歌词吗？此操作不可恢复。')) {
            lyricsService.deleteLyric(parseInt(id));
            renderLyricsTable();
            alert('歌词已删除');
        }
    }

    // 初始化表格
    renderLyricsTable();

    // 添加Chart.js库
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = function() {
        updateStatistics();
    };
    document.head.appendChild(script);

    // 时间范围选择器事件
    document.getElementById('timeRange').addEventListener('change', function() {
        updateStatistics();
    });

    // 渲染用户表格函数
    function renderUsersTable() {
        const users = userService.getAllUsers();
        const tbody = document.querySelector('#users-section .data-table tbody');
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.registerTime}</td>
                <td>${new Date(user.lastLoginTime).toLocaleString()}</td>
                <td>
                    <span class="status-badge ${user.status === '正常' ? 'published' : 'draft'}">
                        ${user.status}
                    </span>
                </td>
                <td>${user.role}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" onclick="toggleUserStatus(${user.id}, '${user.status === '正常' ? '禁用' : '正常'}')">
                            <i class="fas fa-${user.status === '正常' ? 'ban' : 'check'}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // 切换用户状态
    window.toggleUserStatus = function(userId, newStatus) {
        if (confirm(`确定要${newStatus}该用户吗？`)) {
            userService.updateUserStatus(userId, newStatus);
            renderUsersTable();
        }
    };

    // 用户筛选
    document.getElementById('userStatusFilter').addEventListener('change', function() {
        renderUsersTable();
    });

    document.getElementById('userRoleFilter').addEventListener('change', function() {
        renderUsersTable();
    });

    // 初始化用户表格
    renderUsersTable();

    // 移除通知相关代码
    document.querySelector('.btn-notification')?.remove();

    // 自动同步数据
    function syncData() {
        renderLyricsTable();
        renderUsersTable();
        updateStatistics();
    }

    // 定期同步数据
    setInterval(syncData, 30000); // 每30秒同步一次

    // 添加所有按钮的事件监听
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            if (action) {
                handleAction(action);
            }
        });
    });

    // 处理按钮动作
    function handleAction(action) {
        switch(action) {
            case 'filter':
                applyFilters();
                break;
            case 'sort':
                applySorting();
                break;
            // ... 其他动作处理 ...
        }
    }

    // 添加分页按钮事件监听
    document.querySelector('.prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderLyricsTable();
        }
    });

    document.querySelector('.next-page').addEventListener('click', () => {
        const totalItems = lyricsService.getAllLyrics().length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderLyricsTable();
        }
    });

    // 添加登出功能
    function logout() {
        localStorage.removeItem('adminAuthenticated');
        window.location.href = 'login.html';
    }

    // 在header-actions中添加登出按钮
    document.querySelector('.header-actions').innerHTML += `
        <button class="btn-logout" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    `;
});

// 修改数据统计功能
function updateStatistics() {
    const now = new Date();
    const lastUpdate = localStorage.getItem('lastStatsUpdate');
    const previousStats = JSON.parse(localStorage.getItem('previousStats')) || {};
    
    // 如果是首次更新或距离上次更新超过24小时，则更新统计数据
    if (!lastUpdate || (now - new Date(lastUpdate)) > 24 * 60 * 60 * 1000) {
        const lyrics = lyricsService.getAllLyrics();
        const users = userService.getAllUsers();
        
        // 计算基础统计数据
        const stats = {
            totalLyrics: lyrics.length,
            publishedLyrics: lyrics.filter(l => l.status === '已发布').length,
            totalViews: lyrics.reduce((sum, l) => sum + (l.views || 0), 0),
            totalLikes: lyrics.reduce((sum, l) => sum + (l.likes || 0), 0),
            activeUsers: users.filter(u => {
                const lastActivity = new Date(u.lastActivityTime || u.lastLoginTime);
                return (now - lastActivity) <= 7 * 24 * 60 * 60 * 1000;
            }).length,
            categoriesCount: {},
            weeklyTrends: []
        };

        // 计算变化百分比
        const changes = {
            totalLyrics: calculateChange(stats.totalLyrics, previousStats.totalLyrics),
            publishedLyrics: calculateChange(stats.publishedLyrics, previousStats.publishedLyrics),
            totalViews: calculateChange(stats.totalViews, previousStats.totalViews),
            totalLikes: calculateChange(stats.totalLikes, previousStats.totalLikes),
            activeUsers: calculateChange(stats.activeUsers, previousStats.activeUsers)
        };

        // 统计分类数据
        lyrics.forEach(lyric => {
            if (lyric.category) {
                stats.categoriesCount[lyric.category] = (stats.categoriesCount[lyric.category] || 0) + 1;
            }
        });

        // 更新分类管理中的数据
        updateCategoryCards(stats.categoriesCount);

        // 更新统计显示
        updateStatisticsDisplay(stats, changes);

        // 更新图表
        updateCharts(stats);

        // 保存当前统计作为下次比较的基准
        localStorage.setItem('previousStats', JSON.stringify(stats));
        localStorage.setItem('lastStatsUpdate', now.toISOString());
        localStorage.setItem('siteStats', JSON.stringify(stats));
    }
}

// 计算变化百分比
function calculateChange(current, previous) {
    if (!previous) return { value: 0, trend: 'neutral' };
    const change = ((current - previous) / previous) * 100;
    return {
        value: Math.abs(change).toFixed(1),
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
}

// 更新统计显示
function updateStatisticsDisplay(stats, changes) {
    // 更新数值和变化趋势
    updateStatItem('totalLyrics', stats.totalLyrics, changes.totalLyrics);
    updateStatItem('publishedLyrics', stats.publishedLyrics, changes.publishedLyrics);
    updateStatItem('totalViews', stats.totalViews, changes.totalViews);
    updateStatItem('totalLikes', stats.totalLikes, changes.totalLikes);
    updateStatItem('activeUsers', stats.activeUsers, changes.activeUsers);
}

// 更新单个统计项
function updateStatItem(id, value, change) {
    const element = document.getElementById(id);
    if (!element) return;

    const trendIcon = change.trend === 'up' ? '↑' : change.trend === 'down' ? '↓' : '–';
    const trendClass = change.trend === 'up' ? 'trend-up' : change.trend === 'down' ? 'trend-down' : 'trend-neutral';

    element.innerHTML = `
        <div class="stat-value">${value.toLocaleString()}</div>
        <div class="stat-change ${trendClass}">
            ${trendIcon} ${change.value}%
        </div>
    `;
}

// 更新分类卡片
function updateCategoryCards(categoriesCount) {
    const categoriesGrid = document.querySelector('.categories-grid');
    if (!categoriesGrid) return;

    Object.entries(categoriesCount).forEach(([category, count]) => {
        const card = categoriesGrid.querySelector(`[data-category="${category}"]`);
        if (card) {
            const countElement = card.querySelector('.count');
            if (countElement) {
                countElement.textContent = count;
            }
        }
    });
}

// 更新图表
function updateCharts(stats) {
    // 更新分类饼图
    const categoryChart = new Chart(document.getElementById('categoryChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(stats.categoriesCount),
            datasets: [{
                data: Object.values(stats.categoriesCount),
                backgroundColor: [
                    '#6366f1',
                    '#a855f7',
                    '#ec4899',
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });

    // 更新趋势图
    const trendsChart = new Chart(document.getElementById('trendsChart'), {
        type: 'line',
        data: {
            labels: stats.weeklyTrends.map(day => day.date),
            datasets: [
                {
                    label: '访问量',
                    data: stats.weeklyTrends.map(day => day.views),
                    borderColor: '#6366f1',
                    tension: 0.4
                },
                {
                    label: '点赞数',
                    data: stats.weeklyTrends.map(day => day.likes),
                    borderColor: '#ec4899',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 初始化时更新统计数据
document.addEventListener('DOMContentLoaded', () => {
    updateStatistics();
    
    // 每小时检查一次是否需要更新
    setInterval(updateStatistics, 60 * 60 * 1000);
}); 