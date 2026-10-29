# Foglio Protocollo: sample sheet

This page exercises every element the theme styles. Open it in the VS Code Markdown preview, then switch the colour theme between dark and light. The preview should flip between **Inchiostro** and **Carta** without touching the settings.

## Paragraphs and emphasis

Body text is set in Literata at about seventeen pixels, with a line height of 1.7 and a column capped at eighty characters. It should read like a well set book page: *italic for emphasis*, **bold for weight**, ***both at once***, ~~struck through~~, and a [link to the repository](https://github.com/simone-belli/foglio-protocollo). Inline code such as `markdown.styles` uses Ubuntu Mono, scaled up so it sits level with the serif.

A second paragraph, to check the spacing between paragraphs and how a long line wraps once it reaches the right edge of the column, which should happen at roughly eighty characters.

## Headings

### Third level heading

#### Fourth level heading

##### Fifth level heading

###### Sixth level heading

## Blockquotes

> Quoted text gets a thin accent border on the left and a muted italic voice.
>
> A second quoted paragraph, with `inline code` and a [link](https://example.com).
>
> > A nested quote, one level deeper.

## Lists

- An unordered item
- Another item, long enough to wrap onto a second line so the hanging indent is visible against the bullet marker
  - A nested item
    - Nested twice
- Back at the top level

1. First ordered item
2. Second ordered item
   1. Nested ordered item
   2. Another one
3. Third ordered item

Task list:

- [x] Write the spec
- [x] Build base.css and the six palettes
- [ ] Integrate with Read Along

## Code

A fenced block in Python:

```python
def contrast(a: float, b: float) -> float:
    """WCAG contrast ratio between two relative luminances."""
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)
```

A long line, which should scroll sideways instead of wrapping:

```json
{"markdown.styles": ["https://cdn.jsdelivr.net/gh/simone-belli/foglio-protocollo@v1.0.0/base.css", "https://cdn.jsdelivr.net/gh/simone-belli/foglio-protocollo@v1.0.0/palettes/dark-inchiostro.css"]}
```

## Tables

| Palette | Mode | Background | Text |
| :--- | :---: | :--- | ---: |
| Inchiostro | dark | `#1e1e1c` | `#dcd7cc` |
| Notte | dark | `#161b26` | `#cfd6e4` |
| Lavagna | dark | `#1c2321` | `#d6dcd4` |
| Carta | light | `#fbf8f1` | `#2b2925` |
| Bianco | light | `#ffffff` | `#24292f` |
| Foglio Protocollo | light | `#fdfdf8` | `#2a2a2a` |

## Maths

Inline maths sits in the line: the Gaussian density is $f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$, with mean $\mu$ and variance $\sigma^2$.

Display maths gets its own line and scrolls if it is too wide:

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
\qquad
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$

## Images

Images never grow wider than the column:

<img src="https://raw.githubusercontent.com/simone-belli/read-along/main/logo.svg" alt="The Read Along logo" width="120">

## Footnotes

Footnotes need the markdown-it-footnote plugin (for example the *Markdown Footnotes* extension in VS Code).[^1] Without it the marker stays as plain text.[^note]

[^1]: A short footnote.
[^note]: A longer footnote, with `code` and a [link](https://example.com).

## Horizontal rule

Above the rule.

---

Below the rule. <mark>Marked text</mark> uses `--highlight`, the colour meant for the spoken-word highlight in Read Along.
