# MochaCord app icon: mocha mug, steam drawn as a sound wave, on the theme's navy tile.
import math
from pathlib import Path
from PIL import Image, ImageDraw
OUT = Path(__file__).parent
S = 2048  # supersample, downscaled for antialiasing
TILE, MUG, MUG_DARK, WAVE = (27, 29, 43), (201, 162, 126), (160, 120, 88), (122, 167, 255)
im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(im)
d.rounded_rectangle((64, 64, S - 64, S - 64), radius=420, fill=TILE)
# mug body and handle
body = (520, 980, 1400, 1700)
d.ellipse((1210, 1080, 1640, 1520), outline=MUG, width=120)
d.rounded_rectangle(body, radius=150, fill=MUG)
d.rectangle((520, 980, 1400, 1100), fill=MUG)
d.ellipse((520, 920, 1400, 1060), fill=MUG_DARK)  # coffee surface
d.rounded_rectangle((420, 1720, 1500, 1800), radius=40, fill=MUG)  # saucer
# steam: three short sound-wave strokes
def wave(x0, top, bottom, amp, phase):
    pts = [(x0 + amp * math.sin((y - top) / (bottom - top) * 2 * math.pi + phase), y) for y in range(top, bottom, 8)]
    d.line(pts, fill=WAVE, width=95, joint="curve")
    for p in (pts[0], pts[-1]):
        d.ellipse((p[0] - 47, p[1] - 47, p[0] + 47, p[1] + 47), fill=WAVE)
wave(700, 470, 820, 55, 0)
wave(960, 330, 840, 60, 0)
wave(1220, 470, 820, 55, 0)
big = im.resize((1024, 1024), Image.LANCZOS)
big.save(OUT / "mochacord-1024.png")
big.resize((256, 256), Image.LANCZOS).save(OUT / "icon.png")
big.save(OUT / "mochacord.ico", sizes=[(s, s) for s in (16, 24, 32, 48, 64, 128, 256)])
