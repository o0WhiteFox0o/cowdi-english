"""Snap every pixel of an image to the Cowdi palette of one character (alpha kept).

Usage:
  python palette_lock.py in.png out.png --char radish [--spec ../art-spec.json]
  python palette_lock.py in.png out.png --colors FFFFFF C2B8CA 81A95C 5D7A44
System colors (line, highlight, blush, ground shadow, white shade) are always included.
Snapping makes edges jagged: use it to find stray colors and for checks; final sprites
should still be vectorised and exported with anti-aliasing.
"""
import argparse, json, os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("dst")
ap.add_argument("--char"); ap.add_argument("--colors", nargs="*", default=[])
ap.add_argument("--spec", default=os.path.join(HERE, "..", "art-spec.json"))
a = ap.parse_args()
spec = json.load(open(a.spec, encoding="utf-8"))
cols = [v for k, v in spec["system_colors"].items() if k != "mouth_inside"]
if a.char:
    c = spec["characters"][a.char]
    cols += [c["base"], c["shade"]] + [x for pair in c["extra"].values() for x in pair]
cols += ["#" + h.lstrip("#") for h in a.colors]
pal = np.array([[int(h.lstrip("#")[i:i+2], 16) for i in (0, 2, 4)] for h in dict.fromkeys(cols)])
img = np.array(Image.open(a.src).convert("RGBA")).astype(int)
rgb, al = img[..., :3], img[..., 3:]
d = ((rgb[..., None, :] - pal[None, None]) ** 2).sum(-1)
out = pal[d.argmin(-1)]
Image.fromarray(np.concatenate([out, al], -1).astype(np.uint8)).save(a.dst)
print(f"palette: {len(pal)} colors -> {a.dst}")
