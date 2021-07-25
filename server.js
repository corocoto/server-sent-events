const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pid = process.pid;

function sse(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let id = 0;
    const intervalTimer = setInterval(() => {
        res.write(`data: ${crypto.randomBytes(16).toString('hex')}\n`);
        res.write(`id: ${++id} \n`);
        res.write("\n");
    }, 1000);

    const timoutTimer = setTimeout(() => {
        clearInterval(intervalTimer);
        res.write('event: end-of-stream\n');
        res.write('data: close stream\n');
        res.write('\n');
        res.end('Ok');
        clearTimeout(timoutTimer);
    }, 15000);

}

const server = http.createServer((req, res) => {
    const url = new URL(`http://${req.headers.host}${req.url}`);

    if (url.pathname === '/stream') {
        sse(req, res);
        return;
    }

    const fileStream = fs.createReadStream(
        path.join(
            __dirname,
            'index.html'
        )
    );
    fileStream.pipe(res);
}).listen(8000, () => {
    console.log(`Server started on 8000. Pid: ${pid}`)
});