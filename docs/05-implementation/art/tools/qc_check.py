"""Automatic part of the Cowdi QC (Art Bible section 13). Checks a 1080 sprite PNG.

Usage: python qc_check.py sprite.png --char radish --stage c3
Reports: canvas size, off-palette pixel share, outline color, center axis, baseline,
ground shadow color/size, safe area. Human review (silhouette, face, mood) is still required.
"""
import argparse, json, os
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("png"); ap.add_argument("--char", required=True); ap.add_argument("--stage", default="c3")
ap.add_argument("--spec", default=os.path.join(HERE, "..", "art-spec.json"))
a = ap.parse_args()
spec = json.load(open(a.spec, encoding="utf-8"))
im = Image.open(a.png).convert("RGBA")
res = []
def check(name, ok, info): res.append((name, ok, info))

W, H = im.size
check("Canvas 1080x1080", (W, H) == (1080, 1080), f"{W}x{H}")
arr = np.array(im.resize((1080, 1080)) if (W, H) != (1080, 1080) else im).astype(int)
rgb, al = arr[..., :3], arr[..., 3]
opaque = al > 250
white = (rgb.min(-1) > 250)
fg = opaque & ~white

c = spec["characters"][a.char]
cols = [v for k, v in spec["system_colors"].items()] + [c["base"], c["shade"]] + [x for p in c["extra"].values() for x in p]
pal = np.array([[int(h[i:i+2], 16) for i in (1, 3, 5)] for h in dict.fromkeys(cols)])
# flat interior pixels only (all 8 neighbours identical) -> anti-aliased edges are ignored
key = rgb[..., 0] * 65536 + rgb[..., 1] * 256 + rgb[..., 2]
flat = np.ones_like(fg)
for dy in (-1, 0, 1):
    for dx in (-1, 0, 1):
        flat &= np.roll(np.roll(key, dy, 0), dx, 1) == key
px = rgb[fg & flat]
d = np.sqrt(((px[:, None, :] - pal[None]) ** 2).sum(-1)).min(1) if len(px) else np.ones(1) * 99
off = (d > 6).mean()
check("Flat areas use palette colors (<= 2% off)", off <= 0.02, f"{off*100:.1f}% of flat pixels off-palette")

dark = fg & (rgb.max(-1) < 40)
brownish = fg & (rgb.max(-1) >= 40) & (rgb.max(-1) < 90) & (np.abs(rgb[..., 0] - rgb[..., 2]) > 25)
check("Outline is black, not brown", dark.sum() > 5 * brownish.sum(), f"black {dark.sum()} / brownish {brownish.sum()}")

sh = fg & (np.abs(rgb - np.array([162, 151, 171])).sum(-1) < 12)
st = spec["ground_shadow"]["by_stage"][a.stage]
if sh.sum() > 500:
    lab, n = ndimage.label(sh); big = np.argmax(ndimage.sum(sh, lab, range(1, n + 1))) + 1
    ys, xs = np.where(lab == big)
    w = xs.max() - xs.min(); cx = (xs.max() + xs.min()) / 2
    check("Ground shadow #A297AB width", abs(w - st[0]) <= 0.06 * st[0], f"{w}px (target {st[0]})")
    check("Center axis x=540 (+-10)", abs(cx - 540) <= 10, f"x={cx:.0f}")
    bottom = ys.max(); exp = spec["canvas"]["baseline_y"] + st[1] / 2
    check("Baseline (shadow bottom ~ y=800+h/2, +-15)", abs(bottom - exp) <= 15, f"bottom y={bottom} (target {exp:.0f})")
else:
    check("Ground shadow #A297AB present", False, "not found (wrong color or missing)")

ys, xs = np.where(fg)
x0, y0, x1, y1 = spec["canvas"]["safe_area"]
check("Inside safe area", xs.min() >= x0 and xs.max() <= x1 and ys.min() >= y0 and ys.max() <= y1,
      f"bbox x{xs.min()}-{xs.max()} y{ys.min()}-{ys.max()}")
hgt = ys.max() - ys.min(); tgt = spec["stages"][a.stage]["height_px"]
if a.stage == "c3" and "height_c3_px" in c: tgt = c["height_c3_px"]
check(f"Height near {a.stage} target (+-15%)", abs(hgt - tgt) <= 0.15 * tgt, f"{hgt}px (target {tgt})")

ok = all(r[1] for r in res)
for n, o, i in res: print(("PASS " if o else "FAIL ") + f"{n}: {i}")
print("\nAUTO-QC:", "PASS" if ok else "FAIL", "- still do the human checks in Art Bible 13.1-13.3")
