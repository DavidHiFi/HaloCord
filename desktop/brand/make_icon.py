# HaloCord app icon: every size is derived from the hand-drawn source, halocord-source.png (1024 px, RGBA).
# The source is cropped to its visible tile (the faint outer glow edge stays) so the icon fills its frame.
from pathlib import Path
from PIL import Image
OUT = Path(__file__).parent
src = Image.open(OUT / "halocord-source.png").convert("RGBA")
l, t, r, b = src.getchannel("A").point(lambda v: 255 if v >= 32 else 0).getbbox()
cx, cy, half = (l + r) / 2, (t + b) / 2, max(r - l, b - t) / 2
big = src.crop((round(cx - half), round(cy - half), round(cx + half), round(cy + half))).resize((1024, 1024), Image.LANCZOS)

big.save(OUT / "halocord-1024.png")
big.resize((256, 256), Image.LANCZOS).save(OUT / "icon.png")
big.resize((128, 128), Image.LANCZOS).save(OUT.parent.parent / "browser" / "HaloCord_PluginIcon.png")
# Small sizes are prerendered so Windows never shrinks the 256 px image itself (title bar, tray, taskbar).
big.save(OUT / "halocord.ico", sizes=[(s, s) for s in (16, 20, 24, 32, 40, 48, 64, 128, 256)])
prev = Image.new("RGBA", (16 + 20 + 32 + 48 + 256 + 60, 266), (41, 41, 46, 255))
x = 10
for s in (16, 20, 32, 48, 256):
    prev.alpha_composite(big.resize((s, s), Image.LANCZOS), (x, 5))
    x += s + 10
prev.save(OUT / "preview-sizes.png")
