const express = require('express');
const path = require('path');
const net = require('net');
const app = express();
const port = process.env.PORT || 3000;

// 检查端口是否被占用
function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer()
            .once('error', () => resolve(false))
            .once('listening', () => {
                server.close();
                resolve(true);
            })
            .listen(port);
    });
}

// 启动服务器
async function startServer() {
    let currentPort = port;
    while (!(await isPortAvailable(currentPort))) {
        currentPort++;
    }

    app.use(express.static(path.join(__dirname)));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    app.get('/admin', (req, res) => {
        res.sendFile(path.join(__dirname, 'admin/index.html'));
    });

    app.listen(currentPort, () => {
        console.log(`服务器运行在 http://localhost:${currentPort}`);
    });
}

startServer(); 