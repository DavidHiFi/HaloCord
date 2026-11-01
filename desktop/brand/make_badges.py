# HaloCord profile badges: the app icon tile from halocord-1024.png (made by make_icon.py) with a fresh outer glow.
# The tile is shrunk inside the frame so the glow keeps about 2 px at Discord's 22 px badge size.
# Usage: python make_badges.py   (writes browser/HaloCordOwnerBadge.png and browser/HaloCordContributorBadge.png)
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

OUT = Path(__file__).parent
BROWSER = OUT.parent.parent / "browser"
BADGES = {"HaloCordOwnerBadge.png": (166, 227, 161), "HaloCordContributorBadge.png": (137, 180, 250)}
SS, SIZE, TILE = 1024, 128, 0.74


def extract_tile():
    # The source glow is Catppuccin green over a dark tile; its greenness gives how much of each edge pixel is glow.
    px = np.asarray(Image.open(OUT / "halocord-1024.png").convert("RGBA")).astype(np.float32)
    r, g, b, a = px[..., 0], px[..., 1], px[..., 2], px[..., 3]
    glow = np.clip(((g - r) + (g - b)) / 127, 0, 1)
    cover = np.where(a >= 254, 1 - glow, 0)
    rgb = px[..., :3].copy()
    rgb[cover < 1] = (20, 18, 20)
    out = np.dstack([rgb, cover * 255]).round().clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def badge(tile, color):
    side = round(SS * TILE)
    canvas = Image.new("RGBA", (SS, SS), (0, 0, 0, 0))
    canvas.alpha_composite(tile.resize((side, side), Image.LANCZOS), ((SS - side) // 2, (SS - side) // 2))
    mask = canvas.getchannel("A").filter(ImageFilter.MaxFilter(41)).filter(ImageFilter.GaussianBlur(SS * 0.03))
    glow = Image.new("RGBA", (SS, SS), color + (0,))
    glow.putalpha(mask.point(lambda v: min(255, round(v * 1.8))))
    glow.alpha_composite(canvas)
    return glow.resize((SIZE, SIZE), Image.LANCZOS)


tile = extract_tile()
for name, color in BADGES.items():
    badge(tile, color).save(BROWSER / name, optimize=True)
