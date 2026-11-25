"""Make web logo assets from the official b-shirt logo (stacked: hanger-shirt icon above "b-shirt").

Usage (inside the site folder):
    python tools/make_logo_assets.py path/to/logo.png

Writes to assets/brand/:
    logo-wordmark.png      "b-shirt" lettering only, transparent, 96px tall (header, shown at 24–28px)
    logo-icon.png          hanger-shirt icon, transparent, 256px (OG / general use)
    favicon-32.png         icon on white, 32×32
    apple-touch-icon.png   icon on white, 180×180
    logo-full.png          full stacked logo, transparent, 400px wide (footer)

The logo is only cropped, scaled and made transparent; its artwork is not redrawn.
build.mjs picks these files up automatically.
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

def ink_mask(im, threshold=200):
    """True where the pixel is logo ink (dark)."""
    g = ImageOps.grayscale(im)
    return g.point(lambda v: 255 if v < threshold else 0)

def bbox_rows(mask):
    """Group consecutive rows that contain ink into bands (top, bottom)."""
    w, h = mask.size
    px = mask.load()
    rows = [any(px[x, y] for x in range(0, w, 2)) for y in range(h)]
    bands, start = [], None
    for y, has in enumerate(rows + [False]):
        if has and start is None:
            start = y
        elif not has and start is not None:
            bands.append((start, y))
            start = None
    return bands

def transparent(im, threshold=200):
    """Black ink on transparent background, keeping anti-aliased edges."""
    g = ImageOps.grayscale(im)
    alpha = g.point(lambda v: 0 if v >= 250 else min(255, int((250 - v) * 255 / (250 - 40))))
    out = Image.new('RGBA', im.size, (17, 17, 17, 0))
    out.putalpha(alpha)
    return out

def crop_band(im, mask, top, bottom, pad=4):
    band = mask.crop((0, top, mask.width, bottom))
    box = band.getbbox()
    left, right = box[0], box[2]
    return im.crop((max(0, left - pad), max(0, top - pad), min(im.width, right + pad), min(im.height, bottom + pad)))

def square(im, size, bg=(255, 255, 255, 255), margin=0.12):
    canvas = Image.new('RGBA', (size, size), bg)
    inner = int(size * (1 - 2 * margin))
    icon = im.copy()
    icon.thumbnail((inner, inner), Image.LANCZOS)
    canvas.alpha_composite(icon, ((size - icon.width) // 2, (size - icon.height) // 2))
    return canvas

def main(path):
    root = Path(__file__).resolve().parent.parent
    out = root / 'assets' / 'brand'
    out.mkdir(parents=True, exist_ok=True)
    src = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    mask = ink_mask(src)
    # Merge bands separated by tiny gaps (e.g. the hanger hook and the dot of "i").
    bands = [b for b in bbox_rows(mask) if b[1] - b[0] > 3]
    merged = []
    for b in bands:
        if merged and b[0] - merged[-1][1] < src.height * 0.03:
            merged[-1] = (merged[-1][0], b[1])
        else:
            merged.append(b)
    if len(merged) < 2:
        sys.exit(f'Expected icon + wordmark bands, found {len(merged)}: {merged}')
    # Everything above the lowest band is the icon (hook + shirt); the lowest band is the wordmark.
    icon_band, word_band = (merged[0][0], merged[-2][1]), merged[-1]

    icon = transparent(crop_band(src, mask, *icon_band))
    word = transparent(crop_band(src, mask, *word_band))
    full_box = mask.getbbox()
    full = transparent(src.crop((max(0, full_box[0] - 8), max(0, full_box[1] - 8), full_box[2] + 8, full_box[3] + 8)))

    def scale_h(im, h):
        return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)

    scale_h(word, 96).save(out / 'logo-wordmark.png', optimize=True)
    icon.thumbnail((256, 256), Image.LANCZOS)
    icon.save(out / 'logo-icon.png', optimize=True)
    square(icon, 32, margin=0.06).save(out / 'favicon-32.png', optimize=True)
    square(icon, 180).save(out / 'apple-touch-icon.png', optimize=True)
    full.thumbnail((400, 400), Image.LANCZOS)
    full.save(out / 'logo-full.png', optimize=True)
    w = Image.open(out / 'logo-wordmark.png')
    print(f'Wrote {out} (wordmark {w.width}×{w.height}, icon band {icon_band}, wordmark band {word_band})')

if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
