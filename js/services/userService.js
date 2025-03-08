// 用户数据服务
const userService = {
    // 获取所有用户
    getAllUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    },

    // 注册新用户
    register(userData) {
        const users = this.getAllUsers();
        // 检查邮箱是否已存在
        if (users.some(user => user.email === userData.email)) {
            throw new Error('该邮箱已被注册');
        }

        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            ...userData,
            registerTime: new Date().toISOString().split('T')[0],
            lastLoginTime: new Date().toISOString(),
            status: '正常',
            role: 'user'
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return newUser;
    },

    // 用户登录
    login(email, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('邮箱或密码错误');
        }

        // 更新最后登录时间
        user.lastLoginTime = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));

        // 存储当前用户信息
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    },

    // 获取当前登录用户
    getCurrentUser() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            // 更新最后活动时间
            user.lastActivityTime = new Date().toISOString();
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
        return user;
    },

    // 退出登录
    logout() {
        localStorage.removeItem('currentUser');
    },

    // 更新用户状态
    updateUserStatus(userId, status) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === parseInt(userId));
        if (index !== -1) {
            users[index].status = status;
            localStorage.setItem('users', JSON.stringify(users));
            return true;
        }
        return false;
    },

    // 检查登录状态
    checkLoginStatus() {
        const user = this.getCurrentUser();
        if (user) {
            const lastActivity = new Date(user.lastActivityTime);
            const now = new Date();
            // 如果超过24小时未活动，自动登出
            if (now - lastActivity > 24 * 60 * 60 * 1000) {
                this.logout();
                return null;
            }
            return user;
        }
        return null;
    }
}; 