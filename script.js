const editorEl = document.getElementById('editor');
const langSel = document.getElementById('lang');
const runBtn = document.getElementById('runBtn');
const themeBtn = document.getElementById('themeBtn');
const preview = document.getElementById('preview');
const consoleEl = document.getElementById('console');
const loadingEl = document.getElementById('loading');
const errorPanel = document.getElementById('errorPanel');
const errorText = document.getElementById('errorText');
const statusEl = document.getElementById('status');
const runTimeEl = document.querySelector('.run-time');
const fileNameEl = document.getElementById('fileName');
const downloadBtn = document.getElementById('downloadBtn');
const saveBtn = document.getElementById('saveBtn');
const savedBtn = document.getElementById('savedBtn');
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const userArea = document.getElementById('userArea');
const userAvatar = document.getElementById('userAvatar');
const userNameEl = document.getElementById('userNameEl');
const overlay = document.getElementById('overlay');
const signInModal = document.getElementById('signInModal');
const saveModal = document.getElementById('saveModal');
const savedModal = document.getElementById('savedModal');
const saveName = document.getElementById('saveName');
const saveConfirmBtn = document.getElementById('saveConfirm');
const saveCancelBtn = document.getElementById('saveCancel');
const signInCloseBtn = document.getElementById('signInClose');
const savedCloseBtn = document.getElementById('savedClose');
const savedList = document.getElementById('savedList');
const googleBtn = document.getElementById('googleBtn');
const githubBtn = document.getElementById('githubBtn');
const facebookBtn = document.getElementById('facebookBtn');

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';
const LOCAL_URL = 'http://127.0.0.1:8787';

// ---------- Per-language config ----------
const CM_MODES = {
    html: 'htmlmixed', javascript: 'javascript', python: 'python',
    typescript: 'javascript', node: 'javascript',
    c: 'text/x-csrc', cpp: 'text/x-c++src', csharp: 'text/x-csharp',
    java: 'text/x-java', go: 'text/x-csrc', rust: 'text/x-csrc',
    php: 'application/x-httpd-php', ruby: 'ruby',
};

const KW = {
    html: ['a','abbr','address','article','aside','audio','b','base','body','br','button','canvas','code','div','em','fieldset','footer','form','h1','h2','h3','h4','h5','h6','head','header','hr','html','iframe','img','input','label','li','link','main','meta','nav','ol','option','p','picture','pre','script','section','select','source','span','strong','style','svg','table','tbody','td','textarea','th','thead','title','tr','ul','video','class','id','src','href','alt','onclick','onload','onchange','display','flex','block','inline','margin','padding','background','color','font-family','font-size','width','height','position','border','border-radius','box-shadow','align-items','justify-content','grid','gap','text-decoration','cursor'],
    javascript: ['const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','class','extends','super','new','this','typeof','instanceof','in','of','try','catch','finally','throw','import','from','export','default','async','await','null','undefined','true','false','console','log','warn','error','document','window','alert','Math','JSON','Object','Array','String','Number','Boolean','Promise','setTimeout','setInterval','clearTimeout','map','filter','reduce','forEach','push','pop','length','join','split','indexOf','includes','slice','splice','find','some','every','Date','parseInt','parseFloat','isNaN','NaN','Infinity'],
    python: ['def','return','if','elif','else','for','while','import','from','class','try','except','finally','with','as','in','not','and','or','None','True','False','lambda','self','break','continue','pass','global','yield','print','input','len','range','str','int','float','bool','list','dict','set','tuple','enumerate','zip','sorted','sum','min','max','abs','round','open','type','isinstance','math','random','datetime','json','os','sys','re','time'],
    typescript: ['const','let','var','function','return','if','else','for','while','switch','case','break','continue','class','interface','type','enum','extends','implements','new','this','typeof','keyof','in','of','try','catch','finally','throw','import','from','export','default','async','await','readonly','public','private','protected','number','string','boolean','void','any','never','unknown','null','undefined','true','false','console','log','error','Math','JSON','Object','Array','String','Number','Boolean','Promise','map','filter','reduce','forEach'],
    node: ['const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','try','catch','finally','throw','import','from','require','module','exports','process','__dirname','__filename','global','Buffer','console','log','error','warn','setTimeout','clearTimeout','setInterval','Promise','async','await','null','undefined','true','false','new','this','typeof','instanceof'],
    c: ['#include','main','int','void','char','float','double','long','short','unsigned','signed','return','if','else','for','while','do','switch','case','default','break','continue','struct','union','enum','typedef','static','const','extern','sizeof','printf','scanf','malloc','calloc','free','stdio.h','stdlib.h','string.h','math.h','NULL','true','false'],
    cpp: ['#include','main','int','char','float','double','bool','void','long','unsigned','return','if','else','for','while','do','switch','case','default','break','continue','class','public','private','protected','virtual','override','static','const','struct','enum','namespace','using','template','typename','this','new','delete','cout','cin','endl','vector','string','map','set','iterator','std','iostream','algorithm','NULL','nullptr','true','false'],
    csharp: ['using','namespace','class','interface','public','private','protected','internal','static','void','int','string','bool','double','float','long','var','ref','out','return','if','else','foreach','for','while','do','switch','case','default','break','continue','try','catch','finally','throw','new','this','base','null','true','false','Console','WriteLine','ReadLine','Write','List','Dictionary','Array','System','Math','async','await','Task','readonly'],
    java: ['public','private','protected','static','final','class','interface','abstract','extends','implements','package','import','void','int','long','float','double','boolean','char','String','return','if','else','for','while','do','switch','case','default','break','continue','try','catch','finally','throw','throws','new','this','super','null','true','false','System','out','println','print','main','args','Math','List','ArrayList','HashMap','Override','instanceof','var'],
    go: ['package','import','func','main','fmt','Println','Printf','Sprintf','Print','var','const','type','struct','interface','string','int','int32','int64','float32','float64','bool','byte','rune','nil','true','false','if','else','for','range','switch','case','default','break','continue','goto','return','defer','go','chan','map','make','len','append','cap','copy','new','error'],
    rust: ['fn','main','let','mut','const','static','if','else','else if','match','for','in','loop','while','return','struct','enum','impl','trait','pub','use','mod','crate','self','Self','super','String','str','Vec','i8','i32','i64','u8','u32','u64','f32','f64','bool','char','true','false','Option','Some','None','Result','Ok','Err','vec!','println!','print!','format!','break','continue','async','await'],
    php: ['echo','print','print_r','var_dump','function','return','if','else','elseif','foreach','as','for','while','do','switch','case','default','break','continue','class','public','private','protected','static','count','array','isset','empty','unset','include','include_once','require','require_once','new','this','string','int','float','bool','array','object','null','true','false','exit','die','json_encode','json_decode'],
    ruby: ['def','end','puts','print','p','return','if','elsif','else','unless','while','until','for','in','do','class','module','require','attr_reader','attr_writer','attr_accessor','each','map','select','find','reject','join','push','pop','length','size','true','false','nil','new','self','yield','break','next','case','when','then','private','public','protected'],
};

// ---------- Presets ----------
function htmlPreset() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Page</title>
    <style>
        body { font-family: system-ui, sans-serif; padding: 24px; color: #1f2937; }
        h1 { color: #0ea5e9; }
        .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-top: 12px; }
        button { padding: 8px 16px; font-size: 16px; border: none;
                 border-radius: 8px; background: #0ea5e9; color: #fff; cursor: pointer; }
    </style>
</head>
<body>
    <h1>Hello, world!</h1>
    <div class="card">
        <p>This is a live HTML preview — the rendered UI appears on the right while you type.</p>
        <button onclick="this.textContent = 'Clicked! UI updated.'">Click me</button>
    </div>
</body>
</html>`;
}

function jsPreset() {
    return `let total = 0;
for (let i = 1; i <= 5; i++) {
    total += i;
}
console.log("Sum of 1..5 =", total);

function fibonacci(n) {
    if (n < 2) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log("fib(10) =", fibonacci(10));`;
}

function pyPreset() {
    return `import math

for i in range(1, 11):
    print(f"{i} squared = {i * i}")

def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
print("pi =", round(math.pi, 4))`;
}

function tsPreset() {
    return `const items: number[] = [3, 7, 1, 9, 4];
const sorted = items.slice().sort((a, b) => a - b);

function describe(list: number[]): string {
    return \`values: \${list.join(", ")} (min \${Math.min(...list)})\`;
}

console.log(describe(sorted));`;
}

function nodePreset() {
    return `const os = require('os');

console.log('Platform:', os.platform());
console.log('CPUs:', os.cpus().length);

const squares = [1, 2, 3, 4, 5].map(n => n * n);
console.log('squares:', squares.join(', '));`;
}

function cPreset() {
    return `#include <stdio.h>

int main(void) {
    printf("Hello from C\\n");
    int sum = 0;
    for (int i = 1; i <= 10; i++) sum += i;
    printf("1..10 sums to %d\\n", sum);
    return 0;
}`;
}

function cppPreset() {
    return `#include <iostream>
#include <algorithm>
#include <vector>

int main() {
    std::vector<int> nums = {5, 3, 8, 1, 2};
    std::sort(nums.begin(), nums.end());
    std::cout << "Sorted: ";
    for (int n : nums) std::cout << n << " ";
    std::cout << std::endl;
    return 0;
}`;
}

function csPreset() {
    return `using System;

class Program {
    static int Factorial(int n) {
        if (n <= 1) return 1;
        return n * Factorial(n - 1);
    }

    static void Main() {
        for (int i = 1; i <= 5; i++) {
            Console.WriteLine($"{i}! = {Factorial(i)}");
        }
    }
}`;
}

function javaPreset() {
    return `public class Main {
    public static void main(String[] args) {
        int[] nums = { 4, 8, 15, 16, 23, 42 };
        int sum = 0;
        for (int n : nums) sum += n;
        System.out.println("Sum = " + sum);
        System.out.println("Average = " + (double) sum / nums.length);
    }
}`;
}

function goPreset() {
    return `package main

import "fmt"

func main() {
    for i := 1; i <= 5; i++ {
        if i%2 == 0 {
            fmt.Println(i, "is even")
        } else {
            fmt.Println(i, "is odd")
        }
    }
}`;
}

function rustPreset() {
    return `fn main() {
    let words = ["Hello", "from", "Rust"];
    let joined = words.join(" ");
    println!("{}", joined);
    println!("2^10 = {}", 2i32.pow(10));
}`;
}

function phpPreset() {
    return `<?php
$fruits = ["apple", "banana", "cherry"];
echo "Count: " . count($fruits) . "\\n";
foreach ($fruits as $f) {
    echo "- " . $f . "\\n";
}`;
}

function rubyPreset() {
    return `nums = (1..6).to_a
evens = nums.select { |n| n.even? }
puts "Evens: #{evens.join(", ")}"
puts "Squares: #{nums.map { |n| n * n }.join(", ")}"`;
}

const LANGS = {
    html:       { name: 'HTML',       file: 'index.html', mode: 'html',   lang: null, preset: htmlPreset },
    javascript: { name: 'JavaScript', file: 'script.js',  mode: 'js',     lang: null, preset: jsPreset },
    python:     { name: 'Python',     file: 'main.py',    mode: 'pyb',    lang: null, preset: pyPreset },
    typescript: { name: 'TypeScript', file: 'main.ts',    mode: 'server', lang: 'typescript', preset: tsPreset },
    node:       { name: 'Node.js',    file: 'main.js',    mode: 'server', lang: 'javascript', preset: nodePreset },
    c:          { name: 'C',          file: 'main.c',     mode: 'server', lang: 'c',          preset: cPreset },
    cpp:        { name: 'C++',        file: 'main.cpp',   mode: 'server', lang: 'c++',        preset: cppPreset },
    csharp:     { name: 'C#',         file: 'main.cs',    mode: 'server', lang: 'csharp',     preset: csPreset },
    java:       { name: 'Java',       file: 'Main.java',  mode: 'server', lang: 'java',       preset: javaPreset },
    go:         { name: 'Go',         file: 'main.go',    mode: 'server', lang: 'go',         preset: goPreset },
    rust:       { name: 'Rust',       file: 'main.rs',    mode: 'server', lang: 'rust',       preset: rustPreset },
    php:        { name: 'PHP',        file: 'main.php',   mode: 'server', lang: 'php',        preset: phpPreset },
    ruby:       { name: 'Ruby',       file: 'main.rb',    mode: 'server', lang: 'ruby',       preset: rubyPreset },
};

const DELAY = { html: 500, js: 600, pyb: 900, server: 1400 };

let currentLangId = 'html';
let runTimer = null;
let runSeq = 0;
let pyodide = null;
let localAvailable = null;
let localLangs = new Set();
const savedCode = {};

// ---------- Setup ----------
function initLanguages() {
    for (const id in LANGS) {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = LANGS[id].name;
        langSel.appendChild(opt);
    }
}

function persist(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { /* ignore */ }
}

function load(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
}

// ---------- Editor ----------
let editor;

function applyLanguage(id) {
    const def = LANGS[id];
    if (!def) return;
    const existing = savedCode[id] !== undefined ? savedCode[id] : load('playground-' + id);
    editor.setValue(existing != null && existing !== '' ? existing : def.preset());
    savedCode[id] = editor.getValue();
    editor.setOption('mode', CM_MODES[id]);
    fileNameEl.textContent = def.file;
    currentLangId = id;
}

// Custom autocomplete: keywords + what you've already typed
function hintWords(cm) {
    const cur = cm.getCursor();
    const line = cm.getLine(cur.line);
    let from = cur.ch;
    const m = /[\w$]*$/.exec(line.slice(0, cur.ch));
    if (m && m[0]) from = cur.ch - m[0].length;
    const prefix = line.slice(from, cur.ch);
    if (!prefix) return null;

    const words = new Set(KW[currentLangId] || []);
    const m2 = cm.getValue().match(/[A-Za-z_$][\w$]*/g);
    if (m2) for (const w of m2) words.add(w);

    const list = [...words]
        .filter(w => w !== prefix && w.toLowerCase().startsWith(prefix.toLowerCase()))
        .sort()
        .slice(0, 40);
    if (!list.length) return null;
    return { list, from: CodeMirror.Pos(cur.line, from), to: CodeMirror.Pos(cur.line, cur.ch) };
}

function maybeAutoHint(cm, change) {
    if (cm.state.completionActive) return;
    const lastText = change.text[change.text.length - 1];
    if (!lastText || !/[\w$]/.test(lastText[lastText.length - 1])) return;
    const tok = cm.getTokenAt(cm.getCursor());
    if (tok.type && (tok.type.indexOf('string') !== -1 || tok.type.indexOf('comment') !== -1)) return;
    CodeMirror.showHint(cm);
}

function scheduleRun() {
    clearTimeout(runTimer);
    runTimer = setTimeout(run, DELAY[LANGS[currentLangId].mode]);
}

function persistCode() {
    persist('playground-' + currentLangId, editor.getValue());
}

// ---------- Status / panels ----------
function setStatus(text, running) {
    statusEl.textContent = text;
    statusEl.classList.toggle('running', !!running);
}

function setLoading(on) {
    loadingEl.hidden = !on;
}

function showResult(stdout) {
    consoleEl.hidden = false;
    preview.style.display = 'none';
    consoleEl.textContent = stdout || '';
}

function showPreview(srcdoc) {
    preview.style.display = 'block';
    consoleEl.hidden = true;
    preview.srcdoc = srcdoc;
}

function showError(msg) {
    if (!msg) {
        errorPanel.hidden = true;
        errorText.textContent = '';
        return;
    }
    errorPanel.hidden = false;
    errorText.textContent = msg;
}

// ---------- HTML mode ----------
function buildSrcdoc(code) {
    if (/<html[\s>]/i.test(code)) return code;
    return `<!doctype html>
<html>
<head><meta charset="utf-8">
<style>body{font-family:sans-serif;padding:16px;line-height:1.5}</style>
<script>
window.addEventListener('error', function (e) {
    parent.postMessage({ type: 'playground-error', msg: String(e.message || 'Unknown error') }, '*');
    return false;
});
<\/script>
</head>
<body>${code}</body>
</html>`;
}

window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'playground-error') {
        showError(e.data.msg);
    }
});

// ---------- JavaScript mode ----------
function formatVal(v) {
    if (typeof v === 'string') return v;
    if (v === null) return 'null';
    if (typeof v === 'object') {
        try { return JSON.stringify(v); } catch (err) { return String(v); }
    }
    if (typeof v === 'undefined') return 'undefined';
    return String(v);
}

function runBrowserJS(code) {
    const out = [];
    const original = {
        log: console.log, info: console.info,
        warn: console.warn, error: console.error,
    };
    const collect = (...args) => out.push(args.map(formatVal).join(' '));
    console.log = collect;
    console.info = collect;
    console.warn = (...args) => out.push('Warning: ' + args.map(formatVal).join(' '));
    console.error = (...args) => out.push('Error: ' + args.map(formatVal).join(' '));
    let value;
    let runError = '';
    try {
        value = new Function(code)();
    } catch (err) {
        runError = (err && err.name ? err.name + ': ' : '') + (err && err.message ? err.message : String(err));
    } finally {
        console.log = original.log;
        console.info = original.info;
        console.warn = original.warn;
        console.error = original.error;
    }
    if (value !== undefined) out.push('=> ' + formatVal(value));
    return { stdout: out.join('\n'), stderr: runError };
}

// ---------- Python (Pyodide) ----------
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = () => reject(new Error('Failed to load ' + src));
        document.head.appendChild(s);
    });
}

async function getPyodide() {
    if (pyodide) return pyodide;
    setStatus('Loading Python engine…', true);
    await loadScript(PYODIDE_CDN + 'pyodide.js');
    pyodide = await window.loadPyodide({ indexURL: PYODIDE_CDN });
    return pyodide;
}

async function runPython(code) {
    const py = await getPyodide();
    py.globals.set('__runner_code__', code);
    let result;
    try {
        result = py.runPython(`
import sys, io, traceback
_old_out, _old_err = sys.stdout, sys.stderr
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
try:
    exec(compile(__runner_code__, "<code>", "exec"))
except BaseException:
    traceback.print_exc(file=sys.stderr)
_stdout = sys.stdout.getvalue()
_stderr = sys.stderr.getvalue()
sys.stdout = _old_out
sys.stderr = _old_err
(_stdout, _stderr)
        `);
    } finally {
        py.globals.delete('__runner_code__');
    }
    return { stdout: String(result[0] || ''), stderr: String(result[1] || '') };
}

// ---------- Server languages (Piston API) ----------
const SERVER_FILES = {
    typescript: 'main.ts', node: 'main.js', c: 'main.c', cpp: 'main.cpp',
    csharp: 'main.cs', java: 'Main.java', go: 'main.go', rust: 'main.rs',
    php: 'main.php', ruby: 'main.rb',
};

async function runServer(langId, code) {
    const payload = {
        language: LANGS[langId].lang,
        version: '*',
        files: [{ name: SERVER_FILES[langId] || 'main.txt', content: code }],
    };
    const res = await fetch(PISTON_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (res.status === 401) {
        throw new Error('Piston public API is whitelist-only since 2/15/2026. Start the local runner (node server.js) to use the compilers installed on this machine.');
    }
    if (res.status === 429) {
        throw new Error('Rate limited by the free Piston API — wait a few seconds and hit Run again.');
    }
    if (!res.ok) {
        const text = await res.text();
        throw new Error('API error ' + res.status + ': ' + text.slice(0, 300));
    }
    const data = await res.json();
    const compileErr = data.compile && data.compile.code && data.compile.code !== 0
        ? (data.compile.stderr || 'Compilation failed')
        : '';
    const runOut = (data.run && data.run.stdout) || '';
    const runErr = (data.run && data.run.stderr) || '';
    return { stdout: runOut, stderr: compileErr || runErr };
}

// ---------- Local runner (optional `node server.js`) ----------
// Runs Python / Node.js and every compiled language with the tools installed
// on THIS machine. Only reachable at 127.0.0.1, so visitors on GitHub Pages
// can't use it (and Piston's public API is whitelist-only since 2/15/2026).
async function checkLocal() {
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 1200);
        const res = await fetch(LOCAL_URL + '/langs', { signal: ctrl.signal });
        clearTimeout(t);
        if (!res.ok) throw new Error('bad status');
        const d = await res.json();
        localAvailable = true;
        localLangs = new Set(d.langs || []);
    } catch (e) {
        localAvailable = false;
        localLangs = new Set();
    }
    setStatus(localAvailable
        ? 'Local engine: ON — ' + localLangs.size + ' languages use your installed tools'
        : 'Ready');
    return localAvailable;
}

async function runLocal(runLang, code) {
    const res = await fetch(LOCAL_URL + '/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: runLang, code }),
    });
    if (!res.ok) throw new Error('Local runner error ' + res.status);
    const d = await res.json();
    if (d.error) throw new Error(d.error);
    let stderr = d.stderr || '';
    if (d.timedOut && !stderr) stderr = 'Timed out after 20s';
    if (d.code && d.code !== 0 && !stderr) stderr = 'Process exited with code ' + d.code;
    return { stdout: d.stdout || '', stderr };
}

// ---------- Main run ----------
async function run() {
    const def = LANGS[currentLangId];
    const code = editor.getValue();
    const seq = ++runSeq;
    showError('');
    setLoading(true);
    const started = performance.now();
    let stdout = '';
    let stderr = '';

    try {
        if (def.mode === 'html') {
            showPreview(buildSrcdoc(code));
        } else if (def.mode === 'js') {
            const r = runBrowserJS(code);
            stdout = r.stdout;
            stderr = r.stderr;
            showResult(stdout);
        } else if (def.mode === 'pyb') {
            if (localAvailable) {
                setStatus('Running Python (local)…', true);
                const r = await runLocal('python', code);
                stdout = r.stdout;
                stderr = r.stderr;
            } else {
                const r = await runPython(code);
                stdout = r.stdout;
                stderr = r.stderr;
            }
            showResult(stdout);
        } else if (def.mode === 'server') {
            if (localAvailable && localLangs.has(currentLangId)) {
                setStatus('Running ' + def.name + ' (local)…', true);
                const r = await runLocal(currentLangId, code);
                stdout = r.stdout;
                stderr = r.stderr;
            } else if (localAvailable) {
                stderr = 'No local tool for ' + def.name + ' right now. Install it (or start with node server.js).';
            } else {
                setStatus('Running on server…', true);
                const r = await runServer(currentLangId, code);
                stdout = r.stdout;
                stderr = r.stderr;
            }
            showResult(stdout);
        }
    } catch (err) {
        stderr = (err && err.name ? err.name + ': ' : '') + (err && err.message ? err.message : String(err));
        showResult(stdout);
    }

    if (seq !== runSeq) return;
    setLoading(false);
    showError(stderr);
    setStatus('Ready');
    runTimeEl.textContent = (performance.now() - started).toFixed(0) + ' ms';
}

// ---------- Download ----------
const FILE_EXT = {
    html: 'html', javascript: 'js', python: 'py', typescript: 'ts', node: 'js',
    c: 'c', cpp: 'cpp', csharp: 'cs', java: 'java', go: 'go', rust: 'rs',
    php: 'php', ruby: 'rb',
};

async function downloadScript() {
    const ext = FILE_EXT[currentLangId] || 'txt';
    const stem = (fileNameEl.textContent || 'script').replace(/\.[^.]*$/, '') || 'script';
    const name = stem + '.' + ext;
    const blob = new Blob([editor.getValue()], { type: 'text/plain' });
    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: name,
                types: [{ description: 'Source file', accept: { 'text/plain': ['.' + ext] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            setStatus('Downloaded ' + name);
            return;
        } catch (err) {
            if (err && err.name === 'AbortError') { setStatus('Download cancelled'); return; }
        }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    setStatus('Downloaded ' + name);
}

// ---------- Sign in (Firebase: Google, GitHub; Facebook opt-in) ----------
let auth = null;
let db = null;
let currentUser = null;

const AUTH_PROVIDERS = {
    google: { enabled: true },
    github: { enabled: true },
    facebook: { enabled: false },
};

function isFirebaseConfigured() {
    return typeof FIREBASE_CONFIG !== 'undefined' && FIREBASE_CONFIG &&
        FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey.indexOf('YOUR_') === -1;
}

function firebaseProvider(name) {
    if (!auth) return null;
    const map = { google: 'GoogleAuthProvider', github: 'GithubAuthProvider', facebook: 'FacebookAuthProvider' };
    return new firebase.auth[map[name]]();
}

function refreshAuthUI() {
    signInBtn.hidden = !!currentUser;
    userArea.hidden = !currentUser;
    saveBtn.disabled = !currentUser;
    savedBtn.hidden = !currentUser;
    if (currentUser) {
        userNameEl.textContent = currentUser.displayName || currentUser.email || 'User';
        if (currentUser.photoURL) { userAvatar.src = currentUser.photoURL; userAvatar.hidden = false; }
        else userAvatar.hidden = true;
    }
    facebookBtn.hidden = !AUTH_PROVIDERS.facebook.enabled;
}

function signIn(name) {
    if (!auth) { setStatus('Sign-in is not configured yet — add your keys to firebase-config.js.'); closeOverlay(); return; }
    const provider = firebaseProvider(name);
    if (!provider) return;
    auth.signInWithPopup(provider)
        .then(() => { closeOverlay(); setStatus('Signed in'); })
        .catch((err) => {
            if (err && err.code === 'auth/popup-closed-by-user') { closeOverlay(); return; }
            setStatus('Sign-in failed: ' + ((err && err.message) || err));
        });
}

function signOut() {
    if (!auth) return;
    auth.signOut().then(() => setStatus('Signed out')).catch(() => setStatus('Sign out failed'));
}

// ---------- Saved scripts (Firestore) ----------
function openSaveModal() {
    if (!currentUser) { setStatus('Sign in to save scripts.'); openSignIn(); return; }
    const stem = (fileNameEl.textContent || 'script').replace(/\.[^.]*$/, '');
    saveName.value = stem;
    saveName.focus();
    openOverlay(saveModal);
}

async function doSave() {
    const name = (saveName.value || '').trim();
    if (!name) { saveName.focus(); return; }
    const data = {
        uid: currentUser.uid,
        name,
        language: currentLangId,
        code: editor.getValue(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    saveConfirmBtn.disabled = true;
    try {
        const q = await db.collection('saved_scripts').where('uid', '==', currentUser.uid).where('name', '==', name).get();
        if (q.empty) {
            await db.collection('saved_scripts').add(data);
        } else {
            await q.docs[0].ref.update({ language: data.language, code: data.code, updatedAt: data.updatedAt });
        }
        setStatus('Saved "' + name + '"');
        closeOverlay();
    } catch (err) {
        setStatus('Save failed: ' + ((err && err.message) || err));
    } finally {
        saveConfirmBtn.disabled = false;
    }
}

async function openSaved() {
    if (!currentUser) return;
    savedList.textContent = 'Loading…';
    openOverlay(savedModal);
    try {
        const snap = await db.collection('saved_scripts')
            .where('uid', '==', currentUser.uid)
            .orderBy('updatedAt', 'desc')
            .get();
        savedList.textContent = '';
        if (snap.empty) {
            const empty = document.createElement('p');
            empty.className = 'saved-empty';
            empty.textContent = 'No saved scripts yet.';
            savedList.appendChild(empty);
            return;
        }
        snap.forEach((doc) => {
            const d = doc.data();
            const row = document.createElement('div');
            row.className = 'saved-item';
            const info = document.createElement('div');
            info.className = 'saved-info';
            const nm = document.createElement('div');
            nm.className = 'saved-name';
            nm.textContent = d.name;
            const meta = document.createElement('div');
            meta.className = 'saved-meta';
            const t = d.updatedAt && d.updatedAt.toDate ? d.updatedAt.toDate() : null;
            meta.textContent = (LANGS[d.language] ? LANGS[d.language].name : (d.language || 'code')) +
                (t ? ' · ' + t.toLocaleString() : '');
            info.appendChild(nm);
            info.appendChild(meta);
            const loadBtn = document.createElement('button');
            loadBtn.className = 'btn btn--small';
            loadBtn.textContent = 'Load';
            loadBtn.addEventListener('click', () => loadSaved(d));
            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn--small btn--danger';
            delBtn.textContent = 'Delete';
            delBtn.addEventListener('click', () => deleteSaved(doc));
            row.appendChild(info);
            row.appendChild(loadBtn);
            row.appendChild(delBtn);
            savedList.appendChild(row);
        });
    } catch (err) {
        savedList.textContent = 'Failed to load: ' + ((err && err.message) || err);
    }
}

function loadSaved(d) {
    if (LANGS[d.language]) {
        langSel.value = d.language;
        persist('playground-lang', d.language);
        applyLanguage(d.language);
        editor.setValue(d.code);
        savedCode[d.language] = d.code;
        void run();
    } else {
        editor.setValue(d.code || '');
    }
    setStatus('Loaded "' + d.name + '"');
    closeOverlay();
}

async function deleteSaved(doc) {
    try {
        await doc.ref.delete();
    } catch (err) { /* ignore */ }
    await openSaved();
}

// ---------- Overlay ----------
function openOverlay(modal) {
    overlay.hidden = false;
    modal.hidden = false;
}

function closeOverlay() {
    overlay.hidden = true;
    signInModal.hidden = true;
    saveModal.hidden = true;
    savedModal.hidden = true;
}

function openSignIn() {
    if (!isFirebaseConfigured() || typeof firebase === 'undefined') {
        setStatus('Sign-in is not configured yet — add your keys to firebase-config.js.');
        return;
    }
    openOverlay(signInModal);
}

// ---------- Firebase init ----------
async function initFirebase() {
    if (!isFirebaseConfigured()) { refreshAuthUI(); return; }
    try {
        if (typeof firebase === 'undefined') {
            setStatus('Loading sign-in…', true);
            await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');
        }
        firebase.initializeApp(FIREBASE_CONFIG);
        auth = firebase.auth();
        db = firebase.firestore();
        auth.onAuthStateChanged((user) => {
            currentUser = user || null;
            refreshAuthUI();
        });
    } catch (err) {
        setStatus('Sign-in unavailable: ' + ((err && err.message) || err));
    }
    refreshAuthUI();
}

// ---------- Init ----------
initLanguages();
const lastLang = load('playground-lang');
if (lastLang && LANGS[lastLang]) langSel.value = lastLang;

editor = CodeMirror.fromTextArea(editorEl, {
    mode: CM_MODES[langSel.value],
    theme: 'vsc',
    lineNumbers: true,
    lineWrapping: false,
    tabSize: 4,
    indentUnit: 4,
    indentWithTabs: false,
    autoCloseBrackets: true,
    autoCloseTags: true,
    matchBrackets: true,
    styleActiveLine: true,
    hintOptions: { hint: hintWords, completeSingle: false },
    extraKeys: {
        'Ctrl-Space': 'autocomplete',
        'Ctrl-Enter': () => run(),
        Tab: (cm) => {
            if (cm.state.completionActive) { cm.state.completionActive.complete(); return; }
            if (cm.somethingSelected()) { cm.indentSelection('add'); return; }
            cm.replaceSelection(' '.repeat(cm.getOption('indentUnit')), 'end');
        },
        Backspace: (cm) => {
            if (cm.somethingSelected()) { cm.deleteH(-1, 'char'); return; }
            const pos = cm.getCursor();
            const before = cm.getLine(pos.line).slice(0, pos.ch);
            const unit = cm.getOption('indentUnit');
            if (pos.ch > 0 && !/[^ \t]/.test(before) && pos.ch % unit === 0) {
                cm.replaceRange('', CodeMirror.Pos(pos.line, Math.max(0, pos.ch - unit)), pos);
                return;
            }
            cm.execCommand('delCharBefore');
        },
    },
});

// Size indent-guide spacing to the editor's real 4-space width.
const unitPx = Math.round(editor.defaultCharWidth() * 4);
editor.getWrapperElement().style.setProperty('--indent-unit-px', unitPx + 'px');

editor.on('change', () => {
    scheduleRun();
    persistCode();
    requestAnimationFrame(applyIndentGuides);
});

editor.on('inputRead', maybeAutoHint);

editor.on('refresh', () => {
    setStatus('Ready');
    applyIndentGuides();
});

// Indentation guides: draw a faint vertical line at each indent level by
// marking each line's leading whitespace and painting a repeating gradient
// sized to one indent unit (indentUnit * real character width).
function applyIndentGuides() {
    if (!editor) return;
    const vp = editor.getViewport();
    updateIndentUnitPx(vp);
    for (const mk of editor.getAllMarks()) if (mk.__guide) mk.clear();
    for (let ln = vp.from; ln < vp.to; ln++) {
        const m = /^[ \t]+/.exec(editor.getLine(ln));
        if (!m) continue;
        const mk = editor.markText(CodeMirror.Pos(ln, 0), CodeMirror.Pos(ln, m[0].length), { className: 'cm-indent' });
        mk.__guide = true;
    }
}

function updateIndentUnitPx(vp) {
    let px = Math.round(editor.defaultCharWidth() * 4);
    for (let ln = vp.from; ln < vp.to; ln++) {
        const m = /^ +/.exec(editor.getLine(ln));
        if (!m || m[0].length < 4) continue;
        const a = editor.charCoords(CodeMirror.Pos(ln, 0), 'local');
        const b = editor.charCoords(CodeMirror.Pos(ln, 4), 'local');
        if (b.left > a.left + 1) { px = b.left - a.left; break; }
    }
    editor.getWrapperElement().style.setProperty('--indent-unit-px', px.toFixed(2) + 'px');
}
editor.on('viewportChange', applyIndentGuides);

langSel.addEventListener('change', () => {
    persist('playground-' + currentLangId, editor.getValue());
    persist('playground-lang', langSel.value);
    applyLanguage(langSel.value);
    void run();
});

runBtn.addEventListener('click', () => void run());

// ---------- Theme toggle (VS Code Dark+ / Light+) ----------
function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    themeBtn.textContent = theme === 'dark' ? 'Light' : 'Dark';
    editor.refresh();
}

themeBtn.addEventListener('click', () => {
    const next = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    persist('playground-theme', next);
    applyTheme(next);
});

applyLanguage(langSel.value);
applyTheme(load('playground-theme') === 'light' ? 'light' : 'dark');
void run();
void checkLocal();

// ---------- Event wiring (download, save, auth) ----------
downloadBtn.addEventListener('click', () => void downloadScript());
saveBtn.addEventListener('click', openSaveModal);
savedBtn.addEventListener('click', () => void openSaved());
signInBtn.addEventListener('click', openSignIn);
signOutBtn.addEventListener('click', signOut);
googleBtn.addEventListener('click', () => signIn('google'));
githubBtn.addEventListener('click', () => signIn('github'));
facebookBtn.addEventListener('click', () => signIn('facebook'));
saveConfirmBtn.addEventListener('click', () => void doSave());
saveCancelBtn.addEventListener('click', closeOverlay);
signInCloseBtn.addEventListener('click', closeOverlay);
savedCloseBtn.addEventListener('click', closeOverlay);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
saveName.addEventListener('keydown', (e) => { if (e.key === 'Enter') void doSave(); });

void initFirebase();