# ronn.ai: implement the dashboard UI exactly as designed

You are a senior front-end engineer. Your job is to implement an existing, approved design **pixel-faithfully**. You are not here to redesign, "improve" or reinterpret it.

Product: ronn.ai is a web dashboard for a WhatsApp bot (Node.js, Baileys). It has two layers:
- **Public Deck**: live radio stream and song queue, command catalog, public bot status.
- **Owner Mission Control** (behind auth): groups, AI center, message observatory, system, terminal.

Design direction in one line: *Mission Control x Late-Night Radio Booth.* Dark, desaturated, calm, technical. One accent color. Sans for UI, mono for every number, command, timestamp and log. Almost no shadows, depth comes from surface contrast and 1px borders.

---

## 0. Source of truth (read first)

The folder `design-reference/` is the specification. Start with `design-reference/README.md`.

- `*.dc.html` files are mockups written as source code with **inline styles**. Every size, color, gap, radius, weight and letter-spacing you need is in them. Copy values exactly. Do not eyeball.
- `design-tokens.css` is the extracted token set. Import it as the single source for colors, fonts and radii.
- If `design-reference/screenshots/*.png` exists, use them for visual comparison. If it does not, tell me and I will add them.
- If this prompt and a `.dc.html` file disagree on a value, **the `.dc.html` file wins**. Tell me about the conflict.

## 1. Fidelity rules (non-negotiable)

1. No invented styles. Every color, font size, spacing, radius and border must trace back to the reference or to `design-tokens.css`. No hardcoded hex values in components, only tokens.
2. No UI-kit defaults leaking in. No default shadows, no default focus rings from a library, no default font stacks, no library color themes.
3. No emoji in the UI. Icons are inline stroke SVG, 1.5px stroke, round caps and joins. **Port the SVG paths from the reference verbatim** into a local `Icon` component. Do not substitute an icon library (default stroke widths differ and the shapes will drift).
4. Mono font for all numbers, timestamps, commands, aliases, usage strings, log lines. Sans for everything else. Keep the exact weights (400, 500, 600) and letter-spacing from the reference.
5. Status colors appear only as a dot, text, or a 1px border. Never as a large filled block.
6. Minimum hit target is 44px for buttons, chips and toggles, exactly as in the reference.
7. Keep UI copy in Indonesian exactly as written. Do not translate or rephrase it.
8. Any deviation, even a "small improvement", must be logged in `DEVIATIONS.md` with the reason. Unlogged deviations count as bugs.

## 2. Design tokens

Use `design-reference/design-tokens.css` verbatim. Summary:

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B0D10` | page |
| `--surface` | `#12161B` | cards, sidebar items |
| `--surface-inset` | `#0E1116` | console body |
| `--border` / `--border-strong` | `#1E242C` / `#2A323C` | 1px borders |
| `--text` / `--text-muted` / `--text-dim` | `#E6E8EB` / `#8A929C` / `#7D858F` | text |
| `--accent` | `#7FD1C7` (alt `#C9B6FF`, `#E8C27A`) | the only accent, switch via `data-accent` on `<html>` |
| `--success` / `--warning` / `--danger` / `--error` | `#7BC8A0` / `#E0B46A` / `#E8909A` / `#F08B8B` | status only |

Type: Inter (400, 500, 600) and JetBrains Mono (400, 500) from Google Fonts. Radii: 4 (badges, kbd), 6 (nav items, inner boxes), 8 (cards, buttons, inputs), 999 (pills). Borders are always 1px.

## 3. App shell (identical on every page)

- Root: flex row with wrap, `min-height: 100vh`, background `--bg`.
- Sidebar: `flex: 0 1 248px`, padding `24px 16px`, right border 1px `--border`, column with gap 28.
  - Brand: 22px radio icon in accent + `ronn` + `.ai` (accent), 16px/600, letter-spacing -0.01em.
  - Nav: two groups, **PUBLIK** (Radio Hub, Commands) and **OWNER** (Groups, AI Center, Observatory, System, Terminal). Group label is mono 11px, letter-spacing 0.12em, color `--text-dim`. Nav item is 40px high, padding `0 12px`, gap 12, radius 6, 14px. Active item: background `--surface`, text `--text`, icon in accent. Inactive: `--text-muted`. Owner items show a 14px lock icon on the right.
  - Persistent mini-player pinned to the bottom (`margin-top: auto`): 36px cover, title, artist, 44px round pause button, 2px progress line in accent.
- Main: `flex: 999 1 560px; min-width: 0`, padding `28px 40px 56px`, column, gap 24 (Radio Hub uses 32).
- Page header: `h1` 20px/600 on the left, status pill(s) on the right (32px high, radius 999, 1px border).

**The mini-player and the audio element live at app level, outside the router outlet, so music never stops when navigating.**

## 4. Components to build once, reuse everywhere

Pill/Chip (44px filter chip, 32px status pill), Badge (24px, radius 4, 1px colored border), Card (1px `--border`, radius 8, `--surface`, padding 20-24), StatTile (mono number 28-36px, 12px muted label), Sparkline (SVG `viewBox 0 0 200 40`, `preserveAspectRatio="none"`, stroke 1.5, `vector-effect: non-scaling-stroke`, 44px high), ProgressBar (4px, radius 2, track `--border`), Toggle (switch, 44px hit area), SearchInput (56px on Radio, 64px on Commands), Button (primary: accent fill with `#0B0D10` text; secondary: 1px `--border-strong`; danger: 1px `--danger-border` with `--danger` text), Kbd, StatusDot (8-12px with a soft ring in `--success-ring`), ListRow (border-top 1px `--border`), ConsoleRow.

## 5. Pages

Read each referenced file in full before building the page.

### 5.1 Radio Hub, `/` (`Main.dc.html`, public)
Header with "ON AIR" pill. Now Playing hero: ambient blurred blobs behind (decorative, `aria-hidden`), 280px cover, "NOW PLAYING" label in accent, 48px title (-0.03em), artist, duration chip and "requested by" chip, **visualizer of 64 thin bars** (2px wide, height `8 + v*64`, opacity `.35 + v*.65`, 80px container, `space-between`), progress line, 48px circular pause/play button, volume track, "live · tidak bisa di-seek". Song request: 56px search, `/` kbd hint, accent button "Kirim ke antrean", rate-limit hint. Two panels: "Antrean siaran" (rows with index, 40px cover tint, title, artist and masked requester, WA/WEB chip, duration) and "Baru diputar". Public bot status strip at the bottom (status dot, messages today, uptime, latency).

### 5.2 Command Catalog, `/commands` (`Commands.dc.html`, public)
64px spotlight search with a `Ctrl K` hint, 6 category chips with counts, result count line, responsive grid `repeat(auto-fill, minmax(320px, 1fr))` gap 16. Each card: mono command name, access badge (Public green, Admin Grup amber, Master Owner rose), alias chips, description, usage box with a 44px Copy button (turns into accent "Copied" with a check icon).

### 5.3 Groups, `/owner/groups` (`Groups.dc.html`, owner)
Master-detail. Left: searchable list of groups (initials avatar with tint, name, member count, `AI ON/OFF` and `MOD n/3` badges). Right: detail of the selected group with four toggles (AI auto-chat, Anti-link, Anti-toxic, Badword filter), a broadcast message box, and a danger zone to make the bot leave that group, which requires typing the group name to confirm.

### 5.4 System, `/owner/system` (`Telemetry.dc.html`, owner)
WhatsApp session card (Online / Reconnecting / QR Pairing states, with pairing code), resource cards (CPU sparkline, RAM with RSS and Heap bars, SQLite sparkline, Swap, Disk), AI routing card (stacked bar 61/31/8 and a table of Tier 0/1/2 with count, percent, latency), network and uptime card, data sync card (SQLite and WhatsApp session to a private dataset, "Sinkronkan sekarang"), restart card (type `RESTART` to enable the danger button), self-healing table (Transient, State, App, Infrastructure).

### 5.5 Terminal, `/owner/terminal` (`Logs.dc.html`, owner)
Level filter chips with counts, Pause button, console panel (`--surface-inset`, mono 13px, row = time 64px + level 96px + message). Level colors: INFO muted, WARN amber, ERROR red with row tint, AI-ROUTER accent. Blinking-style cursor block at the end. Right card: 4 daily stats and a 24-slot hourly bar chart with the latest bar in accent.

### 5.6 Not designed yet: `/owner/ai` and `/owner/observatory`
The sidebar links exist but there is **no design**. Do not invent one. Build the route inside the shell with a restrained empty state ("Segera hadir") using existing tokens. I will supply the designs later.

## 6. Behavior (the mockup is static, so build these)

- **Radio**: `<audio>` pointed at the stream URL from config. Play/pause, volume, `MediaSession` metadata. Visualizer via Web Audio `AnalyserNode` (needs `crossOrigin="anonymous"` and CORS headers on the stream; if unavailable, fall back to a calm idle animation and tell me). Respect `prefers-reduced-motion`. Stop analysis when the tab is hidden.
- **Commands**: search matches name, alias and description. `/` and `Ctrl/Cmd+K` focus the search (ignore `/` while typing in an input). Category chips filter. Copy uses the Clipboard API, shows "Copied" for about 1.5s, announces via `aria-live="polite"`.
- **Terminal**: ring buffer (max 1000 lines), virtualize rendering. Auto-scroll sticks to bottom and pauses when the user scrolls up. Pause stops appending but keeps buffering a short while, then shows a "N baris baru" jump control. **Render log text as plain text only, never as HTML.**
- **Groups**: toggles are optimistic with rollback on failure. Broadcast and leave require confirmation. Leave requires typing the exact group name.
- **System**: restart stays disabled until `RESTART` is typed exactly. Every destructive action must call an API that writes an audit log entry (build the call, mock it for now).
- **States**: the design has no loading, empty, error, hover, focus or disabled states. Derive them strictly from existing tokens, keep them minimal, and list every one you add in `DEVIATIONS.md` for my review.

## 7. Responsiveness

The reference is fluid (flex-wrap, `min-width: 0`) and designed at 1440. Match it at 1440, 1024 and 390 using the same wrapping rules. On narrow screens the sidebar currently just stacks above the content, which is not acceptable on a phone. Propose a mobile nav (bottom tab bar for Radio and Commands, owner pages under a "More" sheet, mini-player kept above it) **in your implementation plan and wait for my approval** before building it.

## 8. Stack and structure

- Vite + React + TypeScript (strict) + React Router. CSS: Tailwind v4 with `@theme` mapped to the tokens, or CSS Modules with the CSS variables. Pick one in the plan and stay consistent. No component library. Radix primitives only for Dialog and Switch if needed, fully restyled.
- Add dependencies only when clearly necessary and justify each one in the plan. Prefer native platform features.
- Structure: `src/app` (shell, router, providers), `src/components/ui`, `src/features/{radio,commands,groups,system,terminal}`, `src/lib`, `src/types`, `src/mocks`.
- Data layer: define TypeScript interfaces from the `renderVals()` shapes in the reference. Put a mock adapter and a real adapter behind the **same interface**, selected by config. All pages must work on mock data first. Backend comes later.
- Config via environment variables (`VITE_*`) for public values only. No secrets in the front-end bundle or the repo.

## 9. Security baseline (front-end side)

- Owner routes are guarded in the client for UX only. Real enforcement is server-side, so every owner API call must assume the server rejects unauthorized requests and handle 401/403 cleanly.
- Do not store tokens in `localStorage`. Assume httpOnly cookie sessions and design the API client with `credentials: 'include'`.
- Never use `dangerouslySetInnerHTML`. Phone numbers are already masked by the server, do not unmask them and do not log them.
- Add a strict CSP in the dev and build config where possible.

## 10. Process

1. **Plan first.** Before writing code, produce an implementation plan: stack choice, folder structure, component list, data interfaces, page order, mobile nav proposal, and risks. Stop and wait for my approval.
2. **Phases** (commit after each, one focused diff per phase): (1) scaffold, tokens, fonts, shell, Icon; (2) UI primitives; (3) Radio Hub; (4) Commands; (5) Groups; (6) System; (7) Terminal; (8) placeholder routes, a11y pass, responsive pass.
3. **After each page**, compare against the reference at 1440, 1024 and 390 (use the browser and screenshots). Report concrete differences in px, not "looks close".
4. **Self-audit before finishing**: grep for hex values outside `design-tokens.css`, arbitrary pixel values with no reference source, missing `aria-label` on icon-only buttons, interactive elements that are not real `<button>`, `<a>` or `<input>`.

## 11. Definition of done

- Every page matches its reference at 1440 within 1px on layout and exact on tokens.
- No hardcoded colors outside tokens. No unlogged deviations.
- Keyboard navigable, visible focus on every interactive element, text contrast at least 4.5:1, `prefers-reduced-motion` respected.
- `tsc --noEmit` and the linter pass with zero errors. Build succeeds.
- `README.md` explains how to run, the config variables, and how to swap the mock adapter for the real one.

## 12. Do NOT

- Do not add pages, features, widgets or charts that are not in the reference.
- Do not change copy, layout order or visual hierarchy.
- Do not build the backend, auth server or bot integration in this task.
- Do not add analytics, tracking or third-party scripts.
- Do not guess missing decisions. Ask me (auth method, stream URL, API base URL, whether the API runs in the bot process or separately).
