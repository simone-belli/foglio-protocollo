# Foglio Protocollo – Spec for Claude Code

## Goal

Build **Foglio Protocollo**, a custom CSS theme for the VS Code built-in Markdown preview. It lives in a dedicated **public GitHub repo** (`foglio-protocollo`) and is served via **jsDelivr**, so it can be used from any project and any machine (primary dev machine: Ubuntu).

Why hosted: the VS Code Markdown preview refuses to load local CSS files outside the open workspace folders, so a local absolute path in `markdown.styles` does not work. A public HTTPS URL does.

## Requirements

### Layout

- Text column capped at **80ch**, centred (`margin: 0 auto`), with comfortable side padding (\~1.5rem) and top/bottom padding (\~2rem).
- Override VS Code's default preview width/padding where needed.

### Typography

- **Body:** Literata (serif), \~17px, line-height \~1.7. Include italic and bold weights.
- **Headings (h1–h6):** IBM Plex Sans, semi-bold (600), line-height \~1.25, clear size scale, generous top margin.
- **Code (inline and blocks):** Ubuntu Mono. It renders small, so bump it to roughly **1.05–1.1em** relative to body so it visually matches Literata.
- Load fonts from Google Fonts via `@import` at the top of the base CSS, with sensible fallbacks (`serif`, `sans-serif`, `monospace`).

### Elements to style

Paragraphs, headings, links, emphasis/strong, blockquotes (left accent border, muted italic), inline code, fenced code blocks (rounded, padded, horizontal scroll), lists (including nested and task lists), tables (clean borders, header row, zebra optional), horizontal rules, images (max-width 100%), footnotes, and KaTeX math (make sure it isn't broken by the font overrides).

### Palettes

Six palettes, each defined only through CSS custom properties: `--bg`, `--fg`, `--head`, `--link`, `--accent`, `--muted`, `--codebg` (plus `--rule` and `--margin` for the ruled one).

| Palette | Mode | bg | fg | head | link | accent | muted | codebg |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Inchiostro | dark | #1e1e1c | #dcd7cc | #f0ebe0 | #d9a35f | #c96b5a | #9a948a | #2a2a27 |
| Notte | dark | #161b26 | #cfd6e4 | #e8edf7 | #7fb4e6 | #b39ddb | #8792a8 | #1f2533 |
| Lavagna | dark | #1c2321 | #d6dcd4 | #eef2ea | #9fcf8f | #e3c567 | #8e9a92 | #252e2b |
| Carta | light | #fbf8f1 | #2b2925 | #1a1916 | #a0522d | #b33a3a | #7a746a | #f0ebdf |
| Bianco | light | #ffffff | #24292f | #111418 | #1f5fbf | #1f5fbf | #6e7781 | #f4f6f8 |
| Foglio Protocollo | light | #fdfdf8 | #2a2a2a | #1c2a4a | #2b4c8c | #c0392b | #777777 | #f1f1ea |

Foglio Protocollo extras: faint ruled horizontal lines (`--rule: #dfe6f0`) aligned to the body line-height, and a thin red vertical margin line (`--margin: #e7a3a3`) on the left, like an Italian exam sheet. Keep it subtle and readable.

**Defaults:** Inchiostro (dark) and Carta (light).

### Automatic dark/light switching

The VS Code preview adds `vscode-dark`, `vscode-light` or `vscode-high-contrast` classes to `body`, matching the editor theme. Each dark palette file scopes its variables to `body.vscode-dark`, each light one to `body.vscode-light`. The user lists one dark and one light palette in settings; the preview picks the right one automatically. Leave high-contrast reasonably usable (fall back to the default dark values).

## Repo structure

```text
foglio-protocollo/
  base.css              # fonts, layout, element styles, using only CSS variables
  palettes/
    dark-inchiostro.css
    dark-notte.css
    dark-lavagna.css
    light-carta.css
    light-bianco.css
    light-foglio-protocollo.css
  demo/
    sample.md           # exercises every element listed above
  README.md
  LICENSE               # MIT
```

Optionally also provide `foglio-protocollo.css` bundling base + the two defaults, for a one-line setup.

## Usage (goes in README)

In VS Code user settings (JSON), pinned to a release tag:

```json
"markdown.styles": [
  "https://cdn.jsdelivr.net/gh/<github-user>/foglio-protocollo@v1.0.0/base.css",
  "https://cdn.jsdelivr.net/gh/<github-user>/foglio-protocollo@v1.0.0/palettes/dark-inchiostro.css",
  "https://cdn.jsdelivr.net/gh/<github-user>/foglio-protocollo@v1.0.0/palettes/light-carta.css"
]
```

To switch palette, change one URL. After editing, reload the window and reopen the preview.

## Versioning

- Use semver git tags (`v1.0.0`, `v1.1.0`, …) and always reference a tag in settings: jsDelivr caches branch URLs for hours, tags are effectively immutable.
- Document in the README how to purge the jsDelivr cache if ever needed.

## Acceptance checks

1. Open `demo/sample.md` in VS Code with the settings above: column is \~80 characters wide and centred.
2. Fonts render as Literata / IBM Plex Sans / Ubuntu Mono on Ubuntu (no reliance on locally installed fonts).
3. Switching the VS Code colour theme between dark and light flips the preview between Inchiostro and Carta without reloading settings.
4. Each of the six palettes works when swapped in, with readable contrast for body text, links and code.
5. Code blocks scroll horizontally rather than wrapping awkwardly; tables and math render correctly.

## Future extension: Read Along integration

**Not part of version one**, but a planned later extension. Foglio Protocollo should work with Simone's Read Along repo (`simone-belli/read-along`), which renders Markdown and reads it aloud with synced word highlighting.

- **How they connect:** Foglio Protocollo is only a stylesheet and never reads anything aloud itself. Read Along would load the same jsDelivr CSS, so text looks identical in both tools, and its spoken-word highlight would use the active theme's palette (for example `--accent` or a dedicated highlight variable).
- **Requirement for version one:** keep the CSS custom properties (`--bg`, `--fg`, `--head`, `--link`, `--accent`, `--muted`, `--codebg`, `--rule`, `--margin`) and any class names stable, and document them in the README as the theme's public API, so Read Along can rely on them later. Treat renaming any of them as a breaking change (major version bump).
- **First Claude Code task:** before finalising any design decisions, inspect the Read Along code to see how it renders Markdown and how it marks and styles the highlighted word, so the variable and class choices in version one are compatible with it.

## Out of scope (for now)

Syntax-highlighting colour themes for code tokens, print styles, and support for extensions like Markdown Preview Enhanced.
