# design-reference

Source of truth for the ronn.ai dashboard UI. Read this before opening any file.

## What these files are

- `*.dc.html` are design mockups in a small templating format. They cannot be opened directly in a browser (they need a runtime that is not included). Read them as source code.
- Every visual value you need is written as an **inline style** in the markup: sizes, colors, gaps, radii, font sizes, weights, letter-spacing. Copy those values exactly.
- Template syntax you will see:
  - `{{accent}}` means the CSS variable `var(--accent)`.
  - `{{item.field}}` is a data binding. The matching mock data lives in the `renderVals()` function at the bottom of the same file. Treat those objects as the shape of the data and as the placeholder content.
  - `<sc-for list="{{xs}}" as="x">` is a loop. `<sc-if value="{{cond}}">` is a conditional.
  - `<helmet>` holds the font links and the base `body` style.
  - `data-props` at the bottom declares tweakable props. Only `accent` is a real design lever (3 options, see `design-tokens.css`).
- `canvas.json` gives each artboard's intended frame (`w`, `h`) and title. All pages are designed at width 1440 and are fluid (flex-wrap, `min-width: 0`).
- `design-tokens.css` is the extracted token set. Use it as the single source for colors, fonts, radii.

## Page map

| File | Route | Layer |
|---|---|---|
| `Main.dc.html` | `/` Radio Hub | Public |
| `Commands.dc.html` | `/commands` Command Catalog | Public |
| `Groups.dc.html` | `/owner/groups` | Owner |
| `Telemetry.dc.html` | `/owner/system` | Owner |
| `Logs.dc.html` | `/owner/terminal` | Owner |

`AICenter.dc.html` and `Observatory.dc.html` are linked in the sidebar but **not designed yet**.

## Known gaps in the mockup

The mockup is a draft. It has no hover, focus, active, loading, empty or error states, no mobile navigation, and no motion spec. All numbers, names and phone numbers are placeholders (phone numbers are already masked in the design on purpose).
