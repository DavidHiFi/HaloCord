# HaloCord app icon: a glowing halo ring over voice level bars, on the theme's navy tile.
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
OUT = Path(__file__).parent
S = 2048  # supersample, downscaled for antialiasing
TILE, RING, CORE, BAR = (27, 29, 43), (122, 167, 255), (226, 236, 255), (122, 167, 255)

im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
ImageDraw.Draw(im).rounded_rectangle((64, 64, S - 64, S - 64), radius=420, fill=TILE)

halo = (380, 330, S - 380, 830)
glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse(halo, outline=RING + (200,), width=210)
im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(70)))
d = ImageDraw.Draw(im)
d.ellipse(halo, outline=RING, width=150)
d.ellipse((halo[0] + 40, halo[1] + 40, halo[2] - 40, halo[3] - 40), outline=CORE, width=56)

# five voice bars, tallest in the middle
w, gap, base = 170, 90, 1760
for i, h in enumerate((330, 560, 760, 560, 330)):
    x = S // 2 - (5 * w + 4 * gap) // 2 + i * (w + gap)
    d.rounded_rectangle((x, base - h, x + w, base), radius=w // 2, fill=BAR)

big = im.resize((1024, 1024), Image.LANCZOS)
big.save(OUT / "halocord-1024.png")
big.resize((256, 256), Image.LANCZOS).save(OUT / "icon.png")
big.save(OUT / "halocord.ico", sizes=[(s, s) for s in (16, 24, 32, 48, 64, 128, 256)])
prev = Image.new("RGBA", (16 + 32 + 48 + 256 + 50, 266), (41, 41, 46, 255))
x = 10
for s in (16, 32, 48, 256):
    prev.alpha_composite(big.resize((s, s), Image.LANCZOS), (x, 5))
    x += s + 10
prev.save(OUT / "preview-sizes.png")
