const editor = document.getElementById('editor');
const gutter = document.getElementById('gutter');
const langSel = document.getElementById('lang');
const runBtn = document.getElementById('runBtn');
const preview = document.getElementById('preview');
const consoleEl = document.getElementById('console');
const loadingEl = document.getElementById('loading');
const errorPanel = document.getElementById('errorPanel');
const errorText = document.getElementById('errorText');
const statusEl = document.getElementById('status');
const runTimeEl = document.querySelector('.run-time');
const fileNameEl = document.getElementById('fileName');

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

const LANGS = {
    html:       { name: 'HTML',           file: 'index.html', mode: 'html',   lang: null,        preset: htmlPreset },
    javascript: { name: 'JavaScript',     file: 'script.js',  mode: 'js',     lang: null,        preset: jsPreset },
    python:     { name: 'Python',         file: 'main.py',    mode: 'pyb',    lang: null,        preset: pyPreset },
    typescript: { name: 'TypeScript',     file: 'main.ts',    mode: 'server', lang: 'typescript', preset: tsPreset },
    node:       { name: 'Node.js',        file: 'main.js',    mode: 'server', lang: 'javascript', preset: nodePreset },
    c:          { name: 'C',              file: 'main.c',     mode: 'server', lang: 'c',          preset: cPreset },
    cpp:        { name: 'C++',            file: 'main.cpp',   mode: 'server', lang: 'c++',        preset: cppPreset },
    csharp:     { name: 'C#',             file: 'main.cs',    mode: 'server', lang: 'csharp',     preset: csPreset },
    java:       { name: 'Java',           file: 'Main.java',  mode: 'server', lang: 'java',       preset: javaPreset },
    go:         { name: 'Go',             file: 'main.go',    mode: 'server', lang: 'go',         preset: goPreset },
    rust:       { name: 'Rust',           file: 'main.rs',    mode: 'server', lang: 'rust',       preset: rustPreset },
    php:        { name: 'PHP',            file: 'main.php',   mode: 'server', lang: 'php',        preset: phpPreset },
    ruby:       { name: 'Ruby',           file: 'main.rb',    mode: 'server', lang: 'ruby',       preset: rubyPreset },
};

const DELAY = { html: 500, js: 600, pyb: 900, server: 1400 };

const savedCode = {};
let runTimer = null;
let runSeq = 0;
let pyodide = null;

// ---------- Presets ----------
function htmlPreset() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Page</title>
    <style>
        body { font-family: sans-serif; padding: 24px; }
        h1 { color: #0ea5e9; }
        button { padding: 8px 16px; cursor: pointer; font-size: 16px; }
    </style>
</head>
<body>
    <h1>Hello, world!</h1>
    <button onclick="document.body.style.background = getRandomColor()">Change color</button>
    <script>
        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
            return color;
        }
    <\/script>
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

// ---------- Setup ----------
function initLanguages() {
    for (const id in LANGS) {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = LANGS[id].name;
        langSel.appendChild(opt);
    }
}

// ---------- Editor helpers ----------
function updateGutter() {
    const count = Math.min(editor.value.split('\n').length, 5000);
    let html = '';
    for (let i = 1; i <= count; i++) html += i + '\n';
    gutter.textContent = html;
}

editor.addEventListener('scroll', () => {
    gutter.scrollTop = editor.scrollTop;
});

editor.addEventListener('input', () => {
    updateGutter();
    scheduleRun();
});

editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const s = editor.selectionStart;
        const en = editor.selectionEnd;
        editor.setRangeText('  ', s, en, 'end');
        updateGutter();
        scheduleRun();
    } else if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        run();
    }
});

// ---------- Scheduling ----------
function scheduleRun() {
    const mode = LANGS[langSel.value].mode;
    clearTimeout(runTimer);
    runTimer = setTimeout(run, DELAY[mode]);
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

async function runServer(langId, langName, code) {
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

// ---------- Main run ----------
async function run() {
    const id = langSel.value;
    const def = LANGS[id];
    const code = editor.value;
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
            const r = await runPython(code);
            stdout = r.stdout;
            stderr = r.stderr;
            showResult(stdout);
        } else if (def.mode === 'server') {
            setStatus('Running on server…', true);
            const r = await runServer(id, def.name, code);
            stdout = r.stdout;
            stderr = r.stderr;
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

runBtn.addEventListener('click', run);

// ---------- Language switching ----------
function persist(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { /* ignore */ }
}

function load(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
}

let currentLangId = 'html';

function applyLanguage(id) {
    const def = LANGS[id];
    const savedKey = 'playground-' + id;
    const existing = savedCode[id] !== undefined ? savedCode[id] : load(savedKey);
    editor.value = existing != null && existing !== '' ? existing : def.preset();
    savedCode[id] = editor.value;
    fileNameEl.textContent = def.file;
    updateGutter();
    currentLangId = id;
}

langSel.addEventListener('change', () => {
    persist('playground-' + currentLangId, savedCode[currentLangId]);
    persist('playground-lang', langSel.value);
    applyLanguage(langSel.value);
    void run();
});

initLanguages();
const lastLang = load('playground-lang');
if (lastLang && LANGS[lastLang]) {
    langSel.value = lastLang;
}
applyLanguage(langSel.value);
editor.addEventListener('input', () => persist('playground-' + currentLangId, editor.value));
void run();