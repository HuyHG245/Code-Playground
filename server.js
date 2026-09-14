// CodePlayground local runner
// Runs every language with the tools ALREADY INSTALLED on this machine, so no
// external compiler service (Piston) is needed and any modules you have
// installed remain available.
//
// Usage:  node server.js
// Then open the playground (locally or on GitHub Pages) — it detects this
// server automatically and uses your local toolchains (Python, Node, GCC,
// Javac, Go, Rust, PHP, Ruby, tsc, dotnet/csc).
//
// SECURITY: this executes arbitrary code on your machine. It binds to
// 127.0.0.1 only and is intended for your own computer. Don't expose it.

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync, execSync } = require('child_process');

const HOST = '127.0.0.1';
const PORT = process.env.PORT || 8787;
const TIMEOUT_MS = 20000;
const MAX_OUTPUT = 2 * 1024 * 1024;

// Let Node/tsc scripts resolve globally installed npm packages (npm i -g ...).
let NODE_PATH = '';
try {
    NODE_PATH = execSync('npm root -g', { shell: true }).toString().trim();
} catch (e) { /* npm not available */ }

const EXE = process.platform === 'win32' ? '.exe' : '';

// ---------- Tool detection ----------
function find(cmd) {
    if (!cmd) return false;
    try {
        const r = spawnSync(cmd, ['--version'], { shell: true, stdio: 'ignore' });
        return !r.error && r.status === 0;
    } catch (e) {
        return false;
    }
}

function firstFind() {
    for (const c of arguments) if (find(c)) return c;
    return null;
}

const AVAILABLE = {};
const AVAILABLE_LANGS = [];

function detect() {
    AVAILABLE.python = !!firstFind('python', 'py', 'python3');
    AVAILABLE.node = !!firstFind('node');
    AVAILABLE.javascript = AVAILABLE.node;
    AVAILABLE.c = !!firstFind('gcc', 'clang');
    AVAILABLE.cpp = !!firstFind('g++', 'clang++');
    AVAILABLE.java = !!find('javac') && !!find('java');
    AVAILABLE.go = !!find('go');
    AVAILABLE.rust = !!firstFind('rustc');
    AVAILABLE.php = !!find('php');
    AVAILABLE.ruby = !!find('ruby');
    AVAILABLE.typescript = !!find('tsc') && !!find('node');
    AVAILABLE.csharp = !!find('csc') || !!find('dotnet');
    for (const k of Object.keys(AVAILABLE)) if (AVAILABLE[k]) AVAILABLE_LANGS.push(k);
}

const FILENAMES = {
    python: 'main.py', node: 'main.js', javascript: 'main.js',
    c: 'main.c', cpp: 'main.cpp', java: 'Main.java', csharp: 'Program.cs',
    go: 'main.go', rust: 'main.rs', php: 'main.php', ruby: 'main.rb',
    typescript: 'main.ts',
};

// ---------- Process runner ----------
function runProc(cmd, args, cwd, opts = {}) {
    return new Promise((resolve) => {
        if (!cmd) {
            resolve({ error: 'Tool not installed' });
            return;
        }
        let child;
        try {
            child = spawn(cmd, args, {
                cwd: cwd || os.homedir(),
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
        const limit = opts.timeout || TIMEOUT_MS;

        const timer = setTimeout(() => {
            if (settled) return;
            timedOut = true;
            try { child.kill(); } catch (e) { /* ignore */ }
        }, limit);

        child.stdout.on('data', (d) => { out += d; if (out.length > MAX_OUTPUT) child.kill(); });
        child.stderr.on('data', (d) => { err += d; if (err.length > MAX_OUTPUT) child.kill(); });
        child.on('error', (e) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve({ error: 'Cannot run "' + cmd + '" — ' + e.message });
        });
        child.on('close', (code) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            const note = timedOut ? ' (timed out after ' + limit / 1000 + 's)' : '';
            resolve({ stdout: out, stderr: err, code, timedOut, note });
        });
    });
}

// ---------- Per-language execution ----------
async function runLang(lang, dir, code) {
    const file = path.join(dir, FILENAMES[lang] || 'main.txt');
    fs.writeFileSync(file, code);

    if (lang === 'c' || lang === 'cpp') {
        const cc = lang === 'c' ? firstFind('gcc', 'clang') : firstFind('g++', 'clang++');
        const exe = path.join(dir, 'out' + EXE);
        const c = await runProc(cc, ['-o', exe, file], dir);
        if (c.error || c.code) return { stdout: '', stderr: c.error || c.stderr, code: c.code };
        return runProc(exe, [], dir);
    }

    if (lang === 'java') {
        const c = await runProc('javac', [file], dir);
        if (c.error || c.code) return { stdout: '', stderr: c.error || c.stderr, code: c.code };
        return runProc('java', ['-cp', dir, 'Main'], dir);
    }

    if (lang === 'rust') {
        const exe = path.join(dir, 'out' + EXE);
        const c = await runProc('rustc', ['-o', exe, file], dir);
        if (c.error || c.code) return { stdout: '', stderr: c.error || c.stderr, code: c.code };
        return runProc(exe, [], dir);
    }

    if (lang === 'typescript') {
        if (!find('tsc')) return { error: 'TypeScript compiler (tsc) not found — install with: npm i -g typescript' };
        const c = await runProc('tsc', ['--module', 'commonjs', '--target', 'es2020', '--outDir', dir, file], dir);
        if (c.error || c.code) return { stdout: '', stderr: c.error || c.stderr, code: c.code };
        return runProc('node', [path.join(dir, 'main.js')], dir);
    }

    if (lang === 'csharp') {
        if (find('csc')) {
            const exe = path.join(dir, 'out' + EXE);
            const c = await runProc('csc', ['/nologo', '/out:' + exe, file], dir);
            if (c.error || c.code) return { stdout: '', stderr: c.error || c.stderr, code: c.code };
            return runProc(exe, [], dir);
        }
        if (find('dotnet')) {
            const csproj = path.join(dir, 'App.csproj');
            fs.writeFileSync(csproj, `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>disable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>
`);
            return runProc('dotnet', ['run', '--project', dir, '--nologo', '--verbosity', 'quiet'], dir, { timeout: 120000 });
        }
        return { error: 'C# requires the csc compiler or the dotnet SDK' };
    }

    // Interpreted
    if (lang === 'python') return runProc(firstFind('python', 'py', 'python3'), [file], dir);
    if (lang === 'node' || lang === 'javascript') return runProc('node', [file], dir);
    if (lang === 'go') return runProc('go', ['run', file], dir);
    if (lang === 'php') return runProc('php', [file], dir);
    if (lang === 'ruby') return runProc('ruby', [file], dir);

    return { error: 'Unsupported language: ' + lang };
}

async function runCode(lang, code) {
    let dir = null;
    try {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cplay-'));
        const result = await runLang(lang, dir, code);
        return result;
    } catch (e) {
        return { error: String(e.message || e) };
    } finally {
        if (dir) { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* ignore */ } }
    }
}

// ---------- HTTP server ----------
function sendJson(res, obj) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
}

http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    if (req.method === 'GET' && (req.url === '/health' || req.url === '/langs')) {
        if (req.url === '/langs') {
            sendJson(res, { langs: AVAILABLE_LANGS, nodePath: NODE_PATH ? true : false });
        } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('ok');
        }
        return;
    }

    if (req.method === 'POST' && req.url === '/run') {
        let body = '';
        req.on('data', (d) => { body += d; if (body.length > 1e6) req.destroy(); });
        req.on('error', () => {});
        req.on('end', async () => {
            let payload;
            try { payload = JSON.parse(body); } catch (e) { sendJson(res, { error: 'Bad JSON payload' }); return; }
            const allowed = ['python', 'node', 'javascript', 'c', 'cpp', 'java', 'go', 'rust', 'php', 'ruby', 'typescript', 'csharp'];
            if (allowed.indexOf(payload.lang) === -1) {
                sendJson(res, { error: 'Unsupported language: ' + payload.lang });
                return;
            }
            if (typeof payload.code !== 'string') { sendJson(res, { error: 'No code provided' }); return; }
            const result = await runCode(payload.lang, payload.code);
            sendJson(res, result);
        });
        return;
    }

    res.writeHead(404);
    res.end('not found');
}).listen(PORT, HOST, () => {
    detect();
    console.log('\n  CodePlayground local runner ready');
    console.log('  URL:        http://' + HOST + ':' + PORT);
    console.log('  Languages:  ' + (AVAILABLE_LANGS.join(', ') || 'none detected — install some tools!'));
    console.log('  (Runs arbitrary code locally — keep it on your own machine)\n');
});