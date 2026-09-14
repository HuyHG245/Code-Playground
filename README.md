# Code Playground — Live Editor

# https://huyhg245.github.io/Code-Playground/

Write code in many languages with a live result panel on the right and VS Code
colors. Dark / Light theme toggle included.

## Languages

- **HTML / JavaScript / Python** — run instantly in your browser (Python uses
  Pyodide / WebAssembly).
- **C, C++, C#, Java, Go, Rust, PHP, Ruby, TypeScript, Node.js** — run via
  Piston's free API (https://emkc.org) when no local server is running.

## Use your own installed tools and modules

The included local runner executes every language with the compilers / runtimes
that are **already installed on your machine** — Python and Node.js get your pip
modules and globally installed npm packages (`node server.js` sets `NODE_PATH`
to your global npm folder), and any compiler you have (gcc/g++, javac+java, go,
rustc, php, ruby, tsc+node, csc or dotnet SDK) is used automatically.

Start it once in a terminal from this folder:

```powershell
node server.js
```

It listens on `http://127.0.0.1:8787` only. The status bar shows
`Local engine: ON — N languages use your installed tools` when the playground
finds it, and only the languages whose tools are installed are listed. The
startup banner prints exactly which ones were detected on your machine.

> Piston's public API became whitelist-only on 2/15/2026, so without this local
> runner, server-side languages need a self-hosted Piston instance.

> Security: this server executes arbitrary code on your computer. Keep it on
> your own machine — it binds to 127.0.0.1 and is not meant to be deployed.

## Editor features

- Autocomplete dropdown with keywords per language + words you already typed
  (Tab / Enter accepts, Esc closes, Ctrl+Space triggers)
- Auto-closing quotes, brackets, and HTML tags
- Match-bracket highlighting, active-line highlight
- Live results update while you type; Ctrl+Enter re-runs
- Your code is saved per language in the browser (localStorage)

## Deploy

Static site — push to GitHub and enable GitHub Pages, or just open `index.html`.

## Run

```powershell
# serve locally
python -m http.server 8000
# or with the local engine
node server.js
```
