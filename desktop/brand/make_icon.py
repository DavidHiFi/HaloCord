# HaloCord app icon: every size is derived from the hand-drawn source, halocord-source.png (1024 px, RGBA).
# The source is cropped to its visible tile (the faint outer glow edge stays) so the icon fills its frame.
# Two variants: the stock green and a Catppuccin Mocha blue (#89b4fa) recolour of the same drawing.
from pathlib import Path
import numpy as np
from PIL import Image
OUT = Path(__file__).parent
src = Image.open(OUT / "halocord-source.png").convert("RGBA")
l, t, r, b = src.getchannel("A").point(lambda v: 255 if v >= 32 else 0).getbbox()
cx, cy, half = (l + r) / 2, (t + b) / 2, max(r - l, b - t) / 2
big = src.crop((round(cx - half), round(cy - half), round(cx + half), round(cy + half))).resize((1024, 1024), Image.LANCZOS)

# Green weight per pixel (0 on the grey tile and lavender tint, 1 at the brightest glow, (158, 227, 154)),
# then that much of the green to blue shift, so shading and anti-aliasing carry over unchanged.
px = np.asarray(big, dtype=np.float32)
k = np.clip((2 * px[..., 1] - px[..., 0] - px[..., 2]) / 142, 0, 1)[..., None]
px[..., :3] += k * (np.array([137, 180, 250]) - np.array([158, 227, 154]))
mocha = Image.fromarray(np.clip(np.rint(px), 0, 255).astype(np.uint8), "RGBA")

prev = Image.new("RGBA", (16 + 20 + 32 + 48 + 256 + 60, 532), (41, 41, 46, 255))
for row, (img, suffix) in enumerate(((big, ""), (mocha, "-mocha"))):
    img.save(OUT / f"halocord{suffix}-1024.png")
    img.resize((256, 256), Image.LANCZOS).save(OUT / f"icon{suffix}.png")
    img.resize((128, 128), Image.LANCZOS).save(OUT.parent.parent / "browser" / f"HaloCord_PluginIcon{suffix.title().replace('-', '_')}.png")
    # Small sizes are prerendered so Windows never shrinks the 256 px image itself (title bar, tray, taskbar).
    img.save(OUT / f"halocord{suffix}.ico", sizes=[(s, s) for s in (16, 20, 24, 32, 40, 48, 64, 128, 256)])
    x = 10
    for s in (16, 20, 32, 48, 256):
        prev.alpha_composite(img.resize((s, s), Image.LANCZOS), (x, 5 + row * 266))
        x += s + 10
prev.save(OUT / "preview-sizes.png")
