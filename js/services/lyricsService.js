// 歌词数据服务
const lyricsService = {
    // 获取所有歌词
    getAllLyrics() {
        const lyrics = JSON.parse(localStorage.getItem('lyrics')) || [];
        return lyrics;
    },

    // 添加歌词
    addLyric(lyric) {
        const lyrics = this.getAllLyrics();
        const newLyric = {
            ...lyric,
            id: lyrics.length > 0 ? Math.max(...lyrics.map(l => l.id)) + 1 : 1,
            addTime: new Date().toISOString().split('T')[0],
            views: 0,
            likes: 0
        };
        lyrics.push(newLyric);
        localStorage.setItem('lyrics', JSON.stringify(lyrics));
        // 触发自定义事件通知其他页面
        window.dispatchEvent(new CustomEvent('lyricsUpdated'));
        return newLyric;
    },

    // 更新歌词
    updateLyric(id, updatedLyric) {
        const lyrics = this.getAllLyrics();
        const index = lyrics.findIndex(l => l.id === parseInt(id));
        if (index !== -1) {
            lyrics[index] = { ...lyrics[index], ...updatedLyric };
            localStorage.setItem('lyrics', JSON.stringify(lyrics));
            window.dispatchEvent(new CustomEvent('lyricsUpdated'));
            return true;
        }
        return false;
    },

    // 删除歌词
    deleteLyric(id) {
        const lyrics = this.getAllLyrics();
        const filteredLyrics = lyrics.filter(lyric => lyric.id !== parseInt(id));
        localStorage.setItem('lyrics', JSON.stringify(filteredLyrics));
        window.dispatchEvent(new CustomEvent('lyricsUpdated'));
        return true;
    }
}; 