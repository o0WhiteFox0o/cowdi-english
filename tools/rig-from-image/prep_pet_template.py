import json, os
import numpy as np, cv2
from PIL import Image
from scipy import ndimage as nd

CFG = {
 1: {"slots": {}},
 2: {"slots": {"head": {"poly": [[0,0],[165,0],[165,112],[100,118],[60,118],[0,112]], "pivot": [85,118]}},
     "eyes": [[57,66,15,14],[106,90,16,17]], "mouth": None},
 3: {"slots": {"head": {"poly": [[0,0],[203,0],[203,129],[0,129]], "pivot": [95,130]},
               "armL": {"poly": [[0,133],[40,138],[40,188],[0,188]], "pivot": [40,146], "z": -1},
               "armR": {"poly": [[128,132],[203,132],[203,240],[128,240]], "pivot": [130,150], "z": 1, "keep": 1}},
     "eyes": [[40,85,16,17],[98,83,17,18]], "mouth": [66,108,12]},
 4: {"slots": {"head": {"poly": [[85,95],[270,95],[270,160],[238,165],[238,252],[85,252]], "pivot": [165,250]},
               "armL": {"poly": [[38,250],[106,250],[106,375],[38,375]], "pivot": [102,268], "z": 1},
               "armR": {"poly": [[238,150],[343,150],[343,305],[238,305]], "pivot": [245,275], "z": 1, "keep": 1}},
     "eyes": [[174,185,16,23],[113,188,11,16]], "mouth": None, "fx": True},
 5: {"slots": {"head": {"poly": [[165,95],[300,95],[300,60],[395,60],[395,180],[360,330],[200,330],[165,300]], "pivot": [290,320]}},
     "eyes": [], "mouth": None, "aura": True},
}
os.makedirs('assets', exist_ok=True); rig = {}
for k, cfg in CFG.items():
    im = Image.open(f's{k}.png').convert('RGBA'); a = np.array(im).astype(int); H, W = a.shape[:2]
    yy, xx = np.mgrid[:H, :W]; fg = a[..., 3] > 0
    lab, n = nd.label(nd.binary_dilation(fg, iterations=2)); sz = nd.sum(fg, lab, range(1, n + 1))
    main = (lab == 1 + np.argmax(sz)) & fg
    layers = {}
    d = f'assets/c{k}'; os.makedirs(d, exist_ok=True)
    def save(name, mask, src=a):
        L = src.copy().astype(np.uint8); L[~mask, 3] = 0; Image.fromarray(L).save(f'{d}/{name}.png')
    rest = main.copy()
    if cfg.get('fx'):
        save('fx', fg & ~main); layers['fx'] = {"z": 3, "kind": "float"}
    if cfg.get('aura'):
        hsv = cv2.cvtColor(a[..., :3].astype(np.uint8), cv2.COLOR_RGB2HSV).astype(int)
        neon = fg & (hsv[..., 0] >= 33) & (hsv[..., 0] <= 58) & (hsv[..., 1] > 130) & (hsv[..., 2] > 175)
        neon = nd.binary_dilation(neon, iterations=1) & fg
        save('aura', neon | (fg & ~main)); layers['aura'] = {"z": 3, "kind": "flicker"}
        rest &= ~neon
    slots = {}
    work = a.copy(); front = []
    for name in ['armL', 'armR', 'head']:
        if name not in cfg['slots']: continue
        S = cfg['slots'][name]
        pm = np.zeros((H, W), np.uint8); cv2.fillPoly(pm, [np.array(S['poly'], np.int32)], 1)
        m = rest & pm.astype(bool)
        slots[name] = {"pivot": S['pivot'], "z": S.get('z', 2 if name == 'head' else -1), "mask": m}
        if name != 'head' and not S.get('keep'):
            rest &= ~m
            if S.get('z', -1) > 0: front.append(m)
    head_m = slots['head']['mask'] if 'head' in slots else None
    # eyes: sprite + erase with surrounding patch colour
    eyes = []
    for i, (cx, cy, ew, eh) in enumerate(cfg.get('eyes', [])):
        em = np.zeros((H, W), np.uint8); cv2.ellipse(em, (cx, cy), (ew // 2 + 1, eh // 2 + 1), 0, 0, 360, 1, -1); em = em.astype(bool)
        ring = nd.binary_dilation(em, iterations=3) & ~nd.binary_dilation(em, iterations=1) & fg
        col = np.median(a[ring][:, :3], axis=0)
        spr = a.copy().astype(np.uint8); spr[~em, 3] = 0
        x0, y0, x1, y1 = cx - ew // 2 - 2, cy - eh // 2 - 2, cx + ew // 2 + 3, cy + eh // 2 + 3
        Image.fromarray(spr[y0:y1, x0:x1]).save(f'{d}/eye{i}.png')
        work[em, :3] = col
        eyes.append({"c": [cx, cy], "w": ew, "h": eh, "box": [x0, y0, x1 - x0, y1 - y0]})
    # body: everything left (keep neck band under head)
    if head_m is not None:
        piv_y = slots['head']['pivot'][1]
        body_m = rest & ~(head_m & (yy < piv_y - 10))
    else:
        body_m = rest
    if front:   # vá phần thân bị tay phía trước che
        core = nd.binary_closing(rest, iterations=10) & main
        hole = np.zeros_like(rest)
        for m in front: hole |= m & core
        bgr = cv2.cvtColor(work[..., :3].astype(np.uint8), cv2.COLOR_RGB2BGR)
        f = cv2.cvtColor(cv2.inpaint(bgr, (~rest).astype(np.uint8) * 255, 6, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB)
        work = work.copy(); work[hole, :3] = f[hole]; body_m = body_m | hole
    save('body', body_m, work)
    out = {"size": [W, H], "ground": [float(xx[main].mean()), int(np.where(main.any(1))[0].max())], "slots": []}
    out['slots'].append({"name": "body", "img": "body", "z": 0, "kind": "body", "face": head_m is None})
    for name, S in slots.items():
        save(name, S['mask'], work if name == 'head' else a)
        out['slots'].append({"name": name, "img": name, "z": S['z'], "kind": "head" if name == 'head' else "arm",
                             "drive": name, "pivot": S['pivot'], "face": name == 'head', "maxRot": 12 if cfg['slots'][name].get('z', 0) > 0 and name != 'head' else 90})
    for name, L in layers.items(): out['slots'].append({"name": name, "img": name, "z": L['z'], "kind": L['kind']})
    out['eyes'] = eyes; out['mouth'] = cfg.get('mouth')
    bm = body_m | (head_m if head_m is not None else False)
    ys, xs = np.where(bm); out['ellipse'] = [float(xs.mean()), float(ys.mean()), float(xs.max() - xs.min()), float(ys.max() - ys.min())]
    hm = head_m if head_m is not None else bm
    ys, xs = np.where(hm); out['headBox'] = [float((xs.min()+xs.max())/2), float((ys.min()+ys.max())/2), float(xs.max()-xs.min()), float(ys.max()-ys.min())]
    out['headLine'] = slots['head']['pivot'][1] if 'head' in slots else out['ellipse'][1]
    rig[f'c{k}'] = out; print(k, [s['name'] for s in out['slots']], len(eyes))
json.dump(rig, open('assets/rig.json', 'w'), indent=1)
