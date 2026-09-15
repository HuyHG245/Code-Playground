const editorEl = document.getElementById('editor');
const runBtn = document.getElementById('runBtn');
const themeBtn = document.getElementById('themeBtn');
const preview = document.getElementById('preview');
const consoleEl = document.getElementById('console');
const consoleInputWrap = document.getElementById('consoleInputWrap');
const consoleInputLabel = document.getElementById('consoleInputLabel');
const consoleInput = document.getElementById('consoleInput');
let pendingInput = null;
const loadingEl = document.getElementById('loading');
const errorPanel = document.getElementById('errorPanel');
const errorText = document.getElementById('errorText');
const statusEl = document.getElementById('status');
const runTimeEl = document.querySelector('.run-time');
const tabBar = document.getElementById('tabBar');
const newTabBtn = document.getElementById('newTabBtn');
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
const newTabModal = document.getElementById('newTabModal');
const newTabName = document.getElementById('newTabName');
const newTabLang = document.getElementById('newTabLang');
const newTabConfirmBtn = document.getElementById('newTabConfirm');
const newTabCancelBtn = document.getElementById('newTabCancel');
const pkgBtn = document.getElementById('pkgBtn');
const pkgModal = document.getElementById('pkgModal');
const pkgLangName = document.getElementById('pkgLangName');
const pkgNote = document.getElementById('pkgNote');
const pkgList = document.getElementById('pkgList');
const pkgCustom = document.getElementById('pkgCustom');
const pkgInstallBtn = document.getElementById('pkgInstallBtn');
const pkgCloseBtn = document.getElementById('pkgClose');

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

// ---------- Tabs ----------
const EXT_LANG = {
    html: 'html', htm: 'html',
    js: 'javascript', mjs: 'javascript', cjs: 'node',
    py: 'python', ts: 'typescript',
    c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', hpp: 'cpp',
    cs: 'csharp', java: 'java', go: 'go', rs: 'rust',
    php: 'php', rb: 'ruby',
};

const FILE_MIME = {
    html: 'text/html', htm: 'text/html',
    js: 'text/javascript', mjs: 'text/javascript', cjs: 'text/javascript',
    py: 'text/x-python', ts: 'application/typescript',
    c: 'text/x-c', h: 'text/x-c', cpp: 'text/x-c++src', cc: 'text/x-c++src', hpp: 'text/x-c++src',
    cs: 'text/plain', java: 'text/x-java', go: 'text/x-go', rs: 'text/x-rust',
    php: 'text/php', rb: 'text/x-ruby',
};

let currentLangId = 'html';
let runTimer = null;
let runSeq = 0;
let pyodide = null;
let localAvailable = null;
let localLangs = new Set();

let tabs = [];
let activeTabId = null;
let tabsTimer = null;

function activeTab() { return tabs.find(t => t.id === activeTabId) || null; }

function langFromName(name) {
    const m = /\.([A-Za-z0-9]+)$/.exec(name || '');
    const ext = m ? m[1].toLowerCase() : '';
    return EXT_LANG[ext] || null;
}

function nextUntitledName(ext) {
    ext = ext || FILE_EXT[currentLangId] || 'py';
    let i = 1;
    while (tabs.some(t => {
        const n = t.name.toLowerCase();
        return n === ('untitled-' + i) || n === ('untitled-' + i + '.' + ext).toLowerCase();
    })) i++;
    return 'Untitled-' + i;
}

function ensureExtension(name, langId) {
    return /\.[A-Za-z0-9]+$/.test(name) ? name : name + '.' + (FILE_EXT[langId] || 'txt');
}

function createTab(name, langId, code) {
    const id = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const resolvedLang = langId || langFromName(name) || 'html';
    const tab = {
        id,
        name: ensureExtension(name, resolvedLang),
        langId: resolvedLang,
        code: code !== undefined ? code : LANGS[resolvedLang].preset(),
    };
    tabs.push(tab);
    schedulePersistTabs();
    return tab;
}

function activateTab(id) {
    const t = tabs.find(t => t.id === id);
    if (!t) return;
    if (activeTab() && editor) activeTab().code = editor.getValue();
    activeTabId = id;
    currentLangId = t.langId;
    editor.setOption('mode', CM_MODES[t.langId]);
    editor.setValue(t.code);
    editor.refresh();
    persistActive();
    renderTabs();
    void run();
}

function renameActiveTab(name) {
    const t = activeTab();
    if (!t || !name || !name.trim()) { renderTabs(); return; }
    name = name.trim();
    const langId = langFromName(name);
    if (langId && langId !== t.langId) {
        t.langId = langId;
        currentLangId = langId;
        editor.setOption('mode', CM_MODES[langId]);
        void run();
    }
    t.name = name;
    renderTabs();
    schedulePersistTabs();
}

function closeTab(id) {
    if (tabs.length <= 1) return;
    const idx = tabs.findIndex(t => t.id === id);
    if (idx === -1) return;
    tabs.splice(idx, 1);
    if (activeTabId === id) {
        const next = tabs[Math.min(idx, tabs.length - 1)];
        activeTabId = next.id;
        currentLangId = next.langId;
        editor.setOption('mode', CM_MODES[next.langId]);
        editor.setValue(next.code);
        editor.refresh();
        renderTabs();
        persistActive();
        void run();
    } else {
        renderTabs();
    }
    schedulePersistTabs();
}

function persistTabs() {
    persist('playground-tabs', JSON.stringify(tabs.map(t => ({ id: t.id, name: t.name, langId: t.langId, code: t.code }))));
}

function schedulePersistTabs() {
    clearTimeout(tabsTimer);
    tabsTimer = setTimeout(persistTabs, 400);
}

function persistActive() {
    persist('playground-active-tab', activeTabId);
}

function renderTabs() {
    tabBar.textContent = '';
    tabs.forEach((t) => {
        const el = document.createElement('div');
        el.className = 'tab' + (t.id === activeTabId ? ' active' : '');
        el.title = t.name;
        const name = document.createElement('span');
        name.className = 'tab-name';
        name.textContent = t.name;
        name.addEventListener('click', () => activateTab(t.id));
        name.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            startRename(el, name, t);
        });
        el.appendChild(name);
        if (tabs.length > 1) {
            const x = document.createElement('span');
            x.className = 'tab-x';
            x.textContent = '×';
            x.title = 'Close tab';
            x.addEventListener('click', (e) => {
                e.stopPropagation();
                closeTab(t.id);
            });
            el.appendChild(x);
        }
        tabBar.appendChild(el);
    });
}

function startRename(tabEl, nameEl, t) {
    const input = document.createElement('input');
    input.className = 'tab-rename-input';
    input.value = t.name;
    tabEl.replaceChild(input, nameEl);
    input.focus();
    input.select();
    let done = false;
    const commit = () => { if (done) return; done = true; renameActiveTab(input.value); };
    const cancel = () => { if (done) return; done = true; renderTabs(); };
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); commit(); }
        else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
        e.stopPropagation();
    });
    input.addEventListener('blur', commit);
}

// ---------- Persistence helpers ----------
function persist(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { /* ignore */ }
}

function load(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
}

// ---------- Editor ----------
let editor;

function bootTabs() {
    const raw = load('playground-tabs');
    if (raw) {
        try {
            tabs = JSON.parse(raw)
                .map((o, i) => {
                    const langId = LANGS[o.langId] && o.langId ? o.langId : (langFromName(o.name) || 'html');
                    return {
                        id: o.id || 't' + i,
                        name: o.name || LANGS[langId].file,
                        langId,
                        code: (o.code !== undefined && o.code !== '') ? o.code : LANGS[langId].preset(),
                    };
                })
                .filter(Boolean);
        } catch (err) { tabs = []; }
    }
    if (!tabs.length) {
        const lastLang = load('playground-lang');
        const langId = LANGS[lastLang] ? lastLang : 'html';
        const legacy = load('playground-' + langId);
        tabs = [{
            id: 't0',
            name: LANGS[langId].file,
            langId,
            code: legacy && legacy.trim() ? legacy : LANGS[langId].preset(),
        }];
    }
    const lastActive = load('playground-active-tab');
    activeTabId = tabs.some(t => t.id === lastActive) ? lastActive : tabs[0].id;
    currentLangId = activeTab().langId;
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
    if (activeTab()) activeTab().code = editor.getValue();
    schedulePersistTabs();
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

function showConsoleInput(promptText, resolve) {
    consoleInputLabel.textContent = promptText;
    consoleInputWrap.hidden = false;
    consoleInput.value = '';
    setStatus('Waiting for input…', true);
    consoleInput.focus();
    pendingInput = resolve;
}

// Rewrites `input(...)` calls into `await __py_input__(...)`, wraps the whole
// program in an async function, and runs it with runPythonAsync. That lets the
// page stay responsive so input() can be typed in the console panel instead of
// blocking on a native browser prompt().
const PY_INPUT_TRANSFORM = `
import io, sys, tokenize
_src = __runner_code__
_toks = list(tokenize.generate_tokens(io.StringIO(_src).readline))
_pairs = []
_n = len(_toks)
for _i, _tok in enumerate(_toks):
    _prev = _toks[_i - 1] if _i > 0 else None
    _nxt = _toks[_i + 1] if _i + 1 < _n else None
    _is_call = (
        _tok.type == tokenize.NAME
        and _tok.string == 'input'
        and _prev is not None
        and not (_prev.type == tokenize.OP and _prev.string == '.')
        and not (_prev.type == tokenize.NAME and _prev.string in ('def', 'class'))
        and _nxt is not None
        and _nxt.type == tokenize.OP
        and _nxt.string == '('
    )
    if _is_call:
        _pairs.append((_tok.start, _tok.end))
_offs = []
_p = 0
for _ln in _src.splitlines(keepends=True):
    _offs.append(_p)
    _p += len(_ln)
def _off(_pos):
    return _offs[_pos[0] - 1] + _pos[1]
_chunks = []
_prev = 0
for _s, _e in sorted(((_off(a), _off(b)) for a, b in _pairs)):
    _chunks.append(_src[_prev:_s])
    _chunks.append('await __py_input__')
    _prev = _e
_chunks.append(_src[_prev:])
_script = ''.join(_chunks)
_lines = _script.splitlines() or ['']
_indented = '\\n'.join(('    ' + _ln) if _ln.strip() else _ln for _ln in _lines)
_driver = (
    "import sys, io, traceback\\n"
    "import builtins\\n"
    "_old_out, _old_err = sys.stdout, sys.stderr\\n"
    "sys.stdout = io.StringIO()\\n"
    "sys.stderr = io.StringIO()\\n"
    "def __py_input__(p=\\"\\"):\\n"
    "    return __py_io_input__(str(p))\\n"
    "builtins.input = __py_input__\\n"
    "async def __py_main__():\\n"
    + _indented + "\\n"
    "try:\\n"
    "    await __py_main__()\\n"
    "except BaseException:\\n"
    "    traceback.print_exc(file=sys.stderr)\\n"
    "_stdout = sys.stdout.getvalue()\\n"
    "_stderr = sys.stderr.getvalue()\\n"
    "sys.stdout = _old_out\\n"
    "sys.stderr = _old_err\\n"
    "(_stdout, _stderr)\\n"
)
_driver
`;

async function runPythonInteractive(code) {
    const py = await getPyodide();
    py.globals.set('__runner_code__', code);
    py.globals.set('__py_io_input__', (p) => new Promise((resolve) => showConsoleInput(String(p), resolve)));
    let result;
    try {
        const driver = String(py.runPython(PY_INPUT_TRANSFORM));
        result = await py.runPythonAsync(driver);
    } finally {
        py.globals.delete('__runner_code__');
        py.globals.delete('__py_io_input__');
    }
    return { stdout: String(result[0] || ''), stderr: String(result[1] || '') };
}

async function runPython(code) {
    if (/\binput\s*\(/.test(code)) return runPythonInteractive(code);
    return runPythonBundled(code);
}

async function runPythonBundled(code) {
    const py = await getPyodide();
    py.globals.set(
        '__playground_prompt__',
        (p) => (typeof prompt === 'function' ? (prompt(String(p)) ?? '') : '')
    );
    py.globals.set('__runner_code__', code);
    let result;
    try {
        result = py.runPython(`
import sys, io, traceback, builtins
_old_out, _old_err = sys.stdout, sys.stderr
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
def __codeplayground_input__(_prompt=""):
    if _prompt:
        _old_out.write(str(_prompt))
        _old_out.flush()
    return str(__playground_prompt__(str(_prompt)))
builtins.input = __codeplayground_input__
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
        py.globals.delete('__playground_prompt__');
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

// ---------- Packages (usable on GitHub Pages) ----------
// Python runs in-browser on Pyodide -> wheels via micropip.
// JavaScript runs in-browser -> CDN script tags (global exposed).
// Everything else is local-runner only and can't install on GH Pages.
const PKG_GH = { python: true, javascript: true };

const PACKAGES = {
    python: [
        { n: 'numpy', d: 'Arrays & linear algebra' },
        { n: 'pandas', d: 'Data tables & analysis' },
        { n: 'matplotlib', d: 'Plotting & charts' },
        { n: 'scipy', d: 'Scientific computing' },
        { n: 'scikit-learn', d: 'Machine learning' },
        { n: 'seaborn', d: 'Statistical visualizations' },
        { n: 'sympy', d: 'Symbolic math' },
        { n: 'statsmodels', d: 'Statistical models' },
        { n: 'requests', d: 'HTTP client' },
        { n: 'pillow', d: 'Image processing (PIL)' },
        { n: 'beautifulsoup4', d: 'HTML/XML scraping (bs4)' },
        { n: 'lxml', d: 'Fast XML/HTML parsing' },
        { n: 'PyYAML', d: 'YAML parsing' },
        { n: 'jsonschema', d: 'JSON schema validation' },
        { n: 'pydantic', d: 'Data validation & models' },
        { n: 'pytest', d: 'Testing framework' },
        { n: 'tqdm', d: 'Progress bars' },
        { n: 'rich', d: 'Styled console output' },
    ],
    javascript: [
        { n: 'lodash', d: 'Utility functions (global _)' },
        { n: 'jquery', d: 'DOM helpers (global $)' },
        { n: 'axios', d: 'HTTP client (global axios)' },
        { n: 'moment', d: 'Dates & times (global moment)' },
        { n: 'dayjs', d: 'Tiny date library (global dayjs)' },
        { n: 'papaparse', d: 'CSV parsing (global Papa)' },
        { n: 'chartjs', d: 'Charts (global Chart)' },
        { n: 'd3', d: 'Data-driven DOM (global d3)' },
        { n: 'marked', d: 'Markdown → HTML (global marked)' },
    ],
    node: [
        { n: 'express', d: 'Web framework', local: true },
        { n: 'lodash', d: 'Utilities', local: true },
        { n: 'axios', d: 'HTTP client', local: true },
        { n: 'moment', d: 'Dates & times', local: true },
        { n: 'uuid', d: 'Unique IDs', local: true },
    ],
};

const JS_PKGS = {
    lodash: 'https://unpkg.com/lodash@4.17.21/lodash.min.js',
    jquery: 'https://unpkg.com/jquery@3.7.1/dist/jquery.min.js',
    axios: 'https://unpkg.com/axios@1.7.9/dist/axios.min.js',
    moment: 'https://unpkg.com/moment@2.30.1/min/moment.min.js',
    dayjs: 'https://cdn.jsdelivr.net/npm/dayjs@1.11.13/dayjs.min.js',
    papaparse: 'https://unpkg.com/papaparse@5.4.1/papaparse.min.js',
    chartjs: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js',
    d3: 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js',
    marked: 'https://cdn.jsdelivr.net/npm/marked@15.0.4/marked.min.js',
};

function getStoredPkgs(langId) {
    try {
        const arr = JSON.parse(load('playground-pkgs-' + langId) || '[]');
        return Array.isArray(arr) ? arr.filter(Boolean) : [];
    } catch (err) { return []; }
}

function setStoredPkgs(langId, arr) {
    const clean = [...new Set(arr.filter(Boolean))].sort();
    persist('playground-pkgs-' + langId, JSON.stringify(clean));
}

const pyPkgOk = new Set();

async function ensurePyPackages() {
    const stored = getStoredPkgs('python');
    const remaining = stored.filter(n => !pyPkgOk.has(n));
    if (!remaining.length) return;
    const py = await getPyodide();
    let micropip;
    try { micropip = pyodide.micropip; } catch (err) { /* fall through */ }
    if (!micropip) micropip = await py.pyimport('micropip');
    const failed = [];
    for (const n of remaining) {
        setStatus('Installing ' + n + '…', true);
        try {
            await micropip.install(n);
            pyPkgOk.add(n);
        } catch (err) {
            failed.push(n + ((err && err.message) ? ' — ' + err.message : ''));
        }
    }
    if (failed.length) {
        throw new Error('Package install failed: ' + failed.join('; '));
    }
}

const jsLoaded = new Set();

async function ensureJsPackages() {
    const stored = getStoredPkgs('javascript');
    for (const p of stored) {
        if (jsLoaded.has(p)) continue;
        const url = p.startsWith('http') ? p : JS_PKGS[p];
        if (!url) { setStatus('No CDN bundle for JS package: ' + p); continue; }
        setStatus('Loading ' + p + '…', true);
        await loadScript(url);
        jsLoaded.add(p);
    }
}
async function run() {
    const def = LANGS[currentLangId];
    const code = editor.getValue();
    const seq = ++runSeq;
    if (pendingInput) { const r = pendingInput; pendingInput = null; r(''); }
    consoleInputWrap.hidden = true;
    showError('');
    setLoading(true);
    const started = performance.now();
    let stdout = '';
    let stderr = '';

    try {
        if (def.mode === 'html') {
            showPreview(buildSrcdoc(code));
        } else if (def.mode === 'js') {
            await ensureJsPackages();
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
                await ensurePyPackages();
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
    const t = activeTab();
    const langId = t ? t.langId : currentLangId;
    const ext = FILE_EXT[langId] || 'txt';
    let name = (t ? t.name : 'script.txt') || ('script.' + ext);
    if (!/\.[A-Za-z0-9]+$/.test(name)) name += '.' + ext;
    const mime = FILE_MIME[ext] || 'text/plain';
    const desc = (LANGS[langId] ? LANGS[langId].name : 'Text') + ' file';
    const blob = new Blob([editor.getValue()], { type: mime });
    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: name,
                types: [{ description: desc, accept: { [mime]: ['.' + ext] } }],
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
    const t = activeTab();
    const stem = (t ? t.name : 'script').replace(/\.[^.]*$/, '') || 'script';
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
    const langId = LANGS[d.language] ? d.language : currentLangId;
    const t = activeTab();
    const stem = (d.name || 'script').replace(/\.[^.]*$/, '') || 'script';
    t.name = ensureExtension(stem, langId);
    t.langId = langId;
    t.code = d.code || '';
    currentLangId = langId;
    editor.setOption('mode', CM_MODES[langId]);
    editor.setValue(t.code);
    renderTabs();
    schedulePersistTabs();
    void run();
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
    newTabModal.hidden = true;
    pkgModal.hidden = true;
}

function openSignIn() {
    if (!isFirebaseConfigured() || typeof firebase === 'undefined') {
        setStatus('Sign-in is not configured yet — add your keys to firebase-config.js.');
        return;
    }
    openOverlay(signInModal);
}

// ---------- New tab ----------
function populateNewTabLang() {
    newTabLang.textContent = '';
    for (const id in LANGS) {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = LANGS[id].name;
        newTabLang.appendChild(opt);
    }
}

function openNewTabModal() {
    populateNewTabLang();
    newTabLang.value = currentLangId;
    newTabName.value = '';
    newTabName.placeholder = nextUntitledName(FILE_EXT[currentLangId] || 'py');
    openOverlay(newTabModal);
    newTabName.focus();
}

function syncNewTabLang() {
    const langId = langFromName(newTabName.value.trim());
    if (langId && LANGS[langId]) newTabLang.value = langId;
}

function handleNewTabCreate() {
    const selectLang = newTabLang.value;
    let name = newTabName.value.trim();
    let langId = selectLang;
    if (!name) {
        name = nextUntitledName(FILE_EXT[selectLang] || 'py') + '.' + (FILE_EXT[selectLang] || 'py');
    } else {
        const extLang = langFromName(name);
        if (extLang) langId = extLang;
    }
    const tab = createTab(name, langId);
    closeOverlay();
    activateTab(tab.id);
}

// ---------- Package manager ----------
function openPkgModal() {
    const def = LANGS[currentLangId];
    pkgLangName.textContent = def ? def.name : currentLangId;
    pkgCustom.placeholder = currentLangId === 'javascript'
        ? 'npm package name or script URL (https://…)'
        : 'custom package name (e.g. beautifulsoup4)';
    renderPkgList();
    openOverlay(pkgModal);
    pkgCustom.focus();
}

function pkgRow(p, stored, custom) {
    const row = document.createElement('label');
    row.className = 'pkg-row';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = stored.has(p.n);
    cb.addEventListener('change', () => {
        const cur = getStoredPkgs(currentLangId);
        const next = cb.checked ? [...cur, p.n] : cur.filter(x => x !== p.n);
        setStoredPkgs(currentLangId, next);
    });
    const label = document.createElement('span');
    label.className = 'pkg-name';
    label.textContent = p.n;
    const desc = document.createElement('span');
    desc.className = 'pkg-desc';
    desc.textContent = p.d || '';
    const badge = document.createElement('span');
    if (custom) {
        badge.className = 'badge pkg-badge badge--custom';
        badge.textContent = 'Custom';
    } else if (p.local) {
        badge.className = 'badge pkg-badge badge--local';
        badge.textContent = 'Local only';
    } else {
        badge.className = 'badge pkg-badge badge--gh';
        badge.textContent = 'GH Pages';
    }
    row.appendChild(cb);
    row.appendChild(label);
    row.appendChild(desc);
    row.appendChild(badge);
    return row;
}

function renderPkgList() {
    const langId = currentLangId;
    const stored = new Set(getStoredPkgs(langId));
    const catalog = PACKAGES[langId] || [];
    const catalogNames = new Set(catalog.map(p => p.n));
    const gh = PKG_GH[langId];
    if (!gh) {
        pkgNote.textContent = localAvailable
            ? 'This language only works with the local runner (node server.js) on your machine — the installed tools decide what packages exist.'
            : 'Packages for this language can\u2019t install on GitHub Pages. Start the local runner (node server.js) to use tools installed on your machine.';
    } else if (langId === 'javascript') {
        pkgNote.textContent = 'Tick bundles to include them on the next Run. Pick one, then use its global (e.g. lodash → _).';
    } else {
        pkgNote.textContent = 'Tick packages to install them on the next Run (Pyodide wheel = works in-browser).';
    }
    pkgList.textContent = '';
    for (const p of catalog) pkgList.appendChild(pkgRow(p, stored, false));
    for (const n of stored) {
        if (catalogNames.has(n)) continue;
        pkgList.appendChild(pkgRow({
            n,
            d: n.startsWith('http') ? 'External script URL' : 'Custom package',
        }, stored, true));
    }
    if (!catalog.length && !stored.size) {
        const none = document.createElement('p');
        none.className = 'pkg-empty';
        none.textContent = 'No package browser for this language yet — try a custom package name below.';
        pkgList.appendChild(none);
    }
}

function installCustomPkg() {
    const val = pkgCustom.value.trim();
    if (!val) return;
    const langId = currentLangId;
    const cur = getStoredPkgs(langId);
    if (!cur.includes(val)) {
        setStoredPkgs(langId, [...cur, val]);
    }
    pkgCustom.value = '';
    renderPkgList();
    if (PKG_GH[langId]) {
        if (langId === 'javascript') {
            setStatus('Will load ' + (val.startsWith('http') ? val : 'npm bundle ' + val) + ' on the next JS Run.');
        } else {
            setStatus('Will install ' + val + ' (Pyodide) on the next Python Run.');
        }
    } else {
        setStatus('Saved for ' + LANGS[langId].name + ' \u2014 available with the local runner.');
    }
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
bootTabs();

editor = CodeMirror.fromTextArea(editorEl, {
    mode: CM_MODES[currentLangId],
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

editor.setValue(activeTab().code);
currentLangId = activeTab().langId;
renderTabs();

editor.on('change', () => {
    persistCode();
    scheduleRun();
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

newTabBtn.addEventListener('click', openNewTabModal);
newTabConfirmBtn.addEventListener('click', handleNewTabCreate);
newTabCancelBtn.addEventListener('click', closeOverlay);
newTabName.addEventListener('input', syncNewTabLang);
newTabName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleNewTabCreate();
    }
});

pkgBtn.addEventListener('click', openPkgModal);
pkgCloseBtn.addEventListener('click', closeOverlay);
pkgInstallBtn.addEventListener('click', installCustomPkg);
pkgCustom.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        installCustomPkg();
    }
});

consoleInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const value = consoleInput.value;
    const resolve = pendingInput;
    pendingInput = null;
    consoleInputWrap.hidden = true;
    consoleInput.value = '';
    if (resolve) {
        setStatus('Ready');
        resolve(value);
    }
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