// CodePlayground local runner
// Allows Python and Node.js code in the playground to use the modules that are
// ALREADY INSTALLED on this machine, instead of the in-browser / remote engines.
//
// Usage:  node server.js
// Then open the playground (locally or on GitHub Pages) — it detects this
// server automatically and runs Python / Node.js code locally.
//
// SECURITY: this executes arbitrary code on your machine. It binds to
// 127.0.0.1 only (not exposed to your local network) and is intended solely
// for running it on your own computer. Don't deploy this publicly.

const http = require('http');
const { spawn, execSync } = require('child_process');
const os = require('os');

const HOST = '127.0.0.1';
const PORT = process.env.PORT || 8787;
const TIMEOUT_MS = 20000;
const MAX_OUTPUT = 2 * 1024 * 1024;

// Let Node scripts require globally installed npm packages (npm i -g ...).
let NODE_PATH = '';
try {
    NODE_PATH = execSync('npm root -g', { shell: true }).toString().trim();
} catch (e) {
    /* npm not available — global node_modules won't resolve */
}

function spawnOne(cmd, code) {
    return new Promise((resolve) => {
        let child;
        try {
            child = spawn(cmd, [], {
                cwd: os.homedir(),
                shell: true,
                env: Object.assign({}, process.env, NODE_PATH ? { NODE_PATH } : {}),
            });
        } catch (e) {
            resolve({ error: e.message });
            return;
        }

        let out = '';
        let err = '';
        let settled = false;
        let timedOut = false;

        const timer = setTimeout(() => {
            if (settled) return;
            timedOut = true;
            try { child.kill(); } catch (e) { /* ignore */ }
        }, TIMEOUT_MS);

        child.stdout.on('data', (d) => {
            out += d;
            if (out.length > MAX_OUTPUT) timedOut = true, child.kill();
        });
        child.stderr.on('data', (d) => {
            err += d;
            if (err.length > MAX_OUTPUT) timedOut = true, child.kill();
        });
        child.on('error', (e) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve({ error: 'Cannot run "' + cmd + '" — ' + e.message + '. Is it installed and in PATH?' });
        });
        child.on('close', (code, signal) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            const note = timedOut ? ' (timed out after ' + TIMEOUT_MS / 1000 + 's)' : '';
            resolve({ stdout: out, stderr: err, code, timedOut, signal, note });
        });
        child.stdin.on('error', () => { /* EPIPE — process exited early */ });

        child.stdin.write(code);
        child.stdin.end();
    });
}

async function runCode(lang, code) {
    const candidates = lang === 'node' ? ['node'] : ['python', 'py', 'python3'];
    let lastError = null;
    for (const cmd of candidates) {
        const res = await spawnOne(cmd, code);
        if (res.error) {
            lastError = res.error;
            continue; // try the next command name
        }
        return res;
    }
    return { error: lastError || 'No executable found (tried ' + candidates.join(', ') + ')' };
}

function sendJson(res, obj) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
}

http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ok');
        return;
    }

    if (req.method === 'POST' && req.url === '/run') {
        let body = '';
        req.on('data', (d) => {
            body += d;
            if (body.length > 1e6) req.destroy();
        });
        req.on('error', () => {});
        req.on('end', async () => {
            let payload;
            try {
                payload = JSON.parse(body);
            } catch (e) {
                sendJson(res, { error: 'Bad JSON payload' });
                return;
            }
            if (payload.lang !== 'python' && payload.lang !== 'node') {
                sendJson(res, { error: 'Unsupported language: ' + payload.lang });
                return;
            }
            if (typeof payload.code !== 'string') {
                sendJson(res, { error: 'No code provided' });
                return;
            }
            const result = await runCode(payload.lang, payload.code);
            sendJson(res, result);
        });
        return;
    }

    res.writeHead(404);
    res.end('not found');
}).listen(PORT, HOST, () => {
    console.log('\n  CodePlayground local runner ready');
    console.log('  URL:      http://' + HOST + ':' + PORT);
    console.log('  Python + Node.js code now uses your installed modules.');
    console.log('  (Runs arbitrary code locally — keep it on your own machine)\n');
});