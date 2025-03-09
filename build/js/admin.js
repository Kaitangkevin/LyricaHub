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
        lyricModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // 关闭模态框函数
    window.closeModal = function() {
        lyricModal.classList.remove('active');
        document.body.style.overflow = '';
        lyricForm.reset();
    };

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
            platforms: selectedPlatforms
        };

        // 验证必填字段
        if (!formData.title || !formData.artist || !formData.lyrics) {
            alert('请填写所有必填字段');
            return;
        }

        // 使用服务添加歌词
        lyricsService.addLyric(formData);

        // 更新表格
        renderLyricsTable();

        // 关闭模态框
        closeModal();
        alert('歌词添加成功！');
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
        showModal(id);
    }

    // 删除歌词
    function deleteLyric(id) {
        if (confirm('确定要删除这条歌词吗？')) {
            lyricsService.deleteLyric(id);
            renderLyricsTable();
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
});

// 在现有代码中添加统计功能
function updateStatistics() {
    // 计算总数
    const totalLyrics = lyrics.length;
    const totalViews = lyrics.reduce((sum, lyric) => sum + lyric.views, 0);
    const totalLikes = lyrics.reduce((sum, lyric) => sum + lyric.likes, 0);
    
    // 更新显示
    document.getElementById('totalLyrics').textContent = totalLyrics;
    document.getElementById('totalViews').textContent = totalViews.toLocaleString();
    document.getElementById('totalLikes').textContent = totalLikes.toLocaleString();
    document.getElementById('activeUsers').textContent = '1,234'; // 示例数据

    // 如果使用Chart.js，更新图表
    updateCharts();
}

function updateCharts() {
    // 分类统计
    const categories = {};
    lyrics.forEach(lyric => {
        categories[lyric.category] = (categories[lyric.category] || 0) + 1;
    });

    // 使用Chart.js绘制图表
    const categoryChart = new Chart(document.getElementById('categoryChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    '#6366f1',
                    '#a855f7',
                    '#ec4899',
                    '#3b82f6',
                    '#10b981'
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

    // 趋势图
    const trendsChart = new Chart(document.getElementById('trendsChart'), {
        type: 'line',
        data: {
            labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
            datasets: [{
                label: '访问量',
                data: [1200, 1900, 3000, 5000, 4000, 6000],
                borderColor: '#6366f1',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
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