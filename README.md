# Foglio Protocollo

A calm, bookish theme for the **VS Code Markdown preview**: Literata for body text, IBM Plex Sans for headings, Ubuntu Mono for code, an 80-character column, and six colour palettes. The preview follows VS Code's colour theme, using your dark palette when the editor is dark and your light one when it is light.

The CSS is served from jsDelivr, so it works in any project and on any machine. VS Code refuses to load local stylesheets from outside the open workspace, but an HTTPS URL works everywhere.

## Setup

Add this to your VS Code user settings (JSON). It loads the base stylesheet, one dark palette and one light palette:

```json
"markdown.styles": [
  "https://cdn.jsdelivr.net/gh/simone-belli/foglio-protocollo@v1.0.0/base.css",
  "https://cdn.jsdelivr.net/gh/simone-belli/foglio-protocollo@v1.0.0/palettes/dark-inchiostro.css",
  "https://cdn.jsdelivr.net/gh/simone-belli/foglio-protocollo@v1.0.0/palettes/light-carta.css"
]
```

Or use the one-file bundle, which is the same base with the two default palettes:

```json
"markdown.styles": [
  "https://cdn.jsdelivr.net/gh/simone-belli/foglio-protocollo@v1.0.0/foglio-protocollo.css"
]
```

After editing the settings, run **Developer: Reload Window**, then reopen the preview. Load `base.css` first and the palettes after it.

To switch palette, change one URL. List one `dark-…` file and one `light-…` file.

## Palettes

| File | Mode | Character |
| --- | --- | --- |
| `palettes/dark-inchiostro.css` | dark | Warm ink on dark paper. **Default dark.** |
| `palettes/dark-notte.css` | dark | Night blue |
| `palettes/dark-lavagna.css` | dark | Blackboard green |
| `palettes/light-carta.css` | light | Warm paper. **Default light.** |
| `palettes/light-bianco.css` | light | Plain white |
| `palettes/light-foglio-protocollo.css` | light | An Italian exam sheet: faint ruled lines and a red margin |

High-contrast editor themes fall back to Inchiostro, or to Carta for high-contrast light.

## Footnotes, task lists, maths

VS Code's preview renders maths (KaTeX) out of the box, and the theme leaves KaTeX's fonts alone. Footnotes and task lists need a preview extension that adds the markdown-it plugins, such as *Markdown Footnotes* and *Markdown Checkboxes*. Once they are rendered, the theme styles them.

`demo/sample.md` exercises every element. Open it in the preview to see the theme.

## Public API

Other tools can rely on the names below. Renaming or removing any of them is a breaking change and needs a major version.

**Palette variables**, set by each palette file:

| Variable | Used for |
| --- | --- |
| `--bg` | Page background |
| `--fg` | Body text |
| `--head` | Headings, table headers |
| `--link` | Links |
| `--accent` | Blockquote border, checkboxes, highlights |
| `--muted` | Quotes, footnotes, list markers, `h6` |
| `--codebg` | Code background, table header, zebra rows |
| `--rule` | Ruled lines (`transparent` unless the palette sets it) |
| `--margin` | Margin line (`transparent` unless the palette sets it) |

**Derived variables**, which `base.css` computes from `--accent` (a palette may override them):

| Variable | Used for |
| --- | --- |
| `--highlight` | `<mark>`, text selection, and the spoken word in Read Along |
| `--highlight-soft` | A fainter tint, for the spoken sentence in Read Along |

Variables starting `--fp-` are internal and may change in any release.

**Selectors:**

- `body.vscode-dark` and `body.vscode-light` choose the palette. VS Code sets these classes itself; another page sets one of them on `<body>`.
- The content root is `body.vscode-body` in VS Code. Another page can put class `foglio` on the element that holds the rendered Markdown instead, and the theme styles only that element, leaving the rest of the page alone.

## Read Along

[Read Along](https://github.com/simone-belli/read-along) reads Markdown aloud and highlights each word as it is spoken. A later Read Along release can load these same stylesheets, so a document looks the same in both tools. To use the theme, Read Along will:

- Add class `foglio` to its `#doc` element, and `vscode-dark` or `vscode-light` to `<body>`.
- Drop its own `#doc` typography rules, which outrank the theme's.
- Colour its `::highlight(tts-word)` and `::highlight(tts-sentence)` with `var(--highlight)` and `var(--highlight-soft)`, and use `var(--muted)` for unread text.
- Account for the variable names both projects use. Read Along's own `--bg`, `--link` and `--accent` are set on `:root`. The theme sets its versions on `<body>`, so they win everywhere inside the page, toolbar included. Renaming Read Along's other variables (`--text`, `--heading`, `--dim`, `--code-bg`) to the theme's names (`--fg`, `--head`, `--muted`, `--codebg`) would let the toolbar follow the palette too.

## Versions and the jsDelivr cache

Releases are semver git tags (`v1.0.0`, `v1.1.0`, …). Always point your settings at a tag. jsDelivr caches branch URLs such as `@main` for hours, while tag URLs never change.

If a URL ever serves stale content, purge it by opening the same path on `purge.jsdelivr.net`:

```
https://purge.jsdelivr.net/gh/simone-belli/foglio-protocollo@v1.0.0/base.css
```

## Development

```
cd tests && npm install && cd ..    # once: local markdown-it, KaTeX and plugins
node tests/check.js                 # renders demo/sample.md in Chromium and checks it
scripts/bundle.sh                   # rebuild foglio-protocollo.css after editing base.css or the default palettes
```

`tests/check.js` checks the column width, fonts, palette switching, every palette, code scrolling, tables, maths and the bundle. It saves screenshots to `tests/out/`. To test against VS Code's own preview stylesheet as well, save it as `tests/vscode-markdown.css`:

```
curl -o tests/vscode-markdown.css https://raw.githubusercontent.com/microsoft/vscode/main/extensions/markdown-language-features/media/markdown.css
```

The checks need Node and Playwright with Chromium.

## License

MIT, see [LICENSE](LICENSE).
