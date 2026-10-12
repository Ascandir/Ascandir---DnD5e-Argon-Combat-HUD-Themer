"""Bereitet die von GPT gezeichneten Teile für den Einsatz als 9-Slice-Rahmen und Deko vor."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

SRC, OUT = sys.argv[1], sys.argv[2]


def load(name):
    return np.array(Image.open(f"{SRC}/raw_{name}.png").convert("RGBA")).astype(np.float32)


def save(arr, name, fmt="WEBP"):
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    if fmt == "WEBP":
        img.save(f"{OUT}/{name}", "WEBP", quality=92, method=6)
    else:
        img.save(f"{OUT}/{name}", optimize=True)
    return img


def remove_drapes(a, min_size=400):
    """Entfernt große rote Stoffflächen, behält kleine rote Steine im Gold."""
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    # Samt: kräftiges Rot, kaum Grün, Blau >= Grün (Gold hat deutlich mehr Grün als Blau)
    red = (al > 10) & (r > 22) & (g < 0.17 * r + 2) & (b >= g - 2)
    lab, n = ndimage.label(ndimage.binary_dilation(red, iterations=1))
    sizes = ndimage.sum(red, lab, range(1, n + 1))
    big = np.isin(lab, np.where(sizes >= min_size)[0] + 1) & red
    # sehr dunkle Samtschatten direkt am Stoff (fast schwarz, rötlich, ohne Grünanteil)
    shadow = ndimage.binary_dilation(big, iterations=2) & (r + g + b < 60) & (g <= b + 1) & (r > g + 3)
    a[..., 3] = np.where(big | shadow, 0, al)
    return a


def pad(a, left, top, right, bottom):
    h, w = a.shape[:2]
    out = np.zeros((h + top + bottom, w + left + right, 4), np.float32)
    out[top:top + h, left:left + w] = a
    return out


def clear_center(a, inner, corner):
    """Innenfläche leeren (Störpixel), Eckbereiche mit Ornamenten behalten."""
    x0, y0, x1, y1 = inner
    h, w = a.shape[:2]
    m = np.zeros((h, w), bool)
    m[y0:y1, x0:x1] = True
    m[:corner, :corner] = m[:corner, w - corner:] = False
    m[h - corner:, :corner] = m[h - corner:, w - corner:] = False
    a[..., 3] = np.where(m, 0, a[..., 3])
    # vereinzelte Störpixel überall entfernen (kleine, schwach deckende Inseln)
    al = a[..., 3] > 20
    lab, n = ndimage.label(al)
    sizes = ndimage.sum(al, lab, range(1, n + 1))
    small = np.isin(lab, np.where(sizes < 30)[0] + 1)
    a[..., 3] = np.where(small, 0, a[..., 3])
    return a


# --- Großer Rahmen -------------------------------------------------------
big = remove_drapes(load("big"))
big = pad(big, 40, 15, 39, 0)                      # gleiche Außenränder (74 px)
H, W = big.shape[:2]
big = clear_center(big, (118, 108, W - 118, H - 103), 280)
save(big, "frame-gothic.webp")
print("frame-gothic", W, H)

# --- Kleiner Rahmen ------------------------------------------------------
small = load("small")
small = pad(small, 9, 0, 9, 2)
h, w = small.shape[:2]
small = clear_center(small, (52, 56, w - 52, h - 56), 90)
save(small, "frame-gothic-small.webp")
print("frame-gothic-small", w, h)

# --- Pergament: gespiegelt zu einer nahtlosen Kachel ----------------------
p = load("parch")[2:-2, 2:-2]
p[..., 3] = 255
top = np.concatenate([p, p[:, ::-1]], axis=1)
tile = np.concatenate([top, top[::-1]], axis=0)
Image.fromarray(tile[..., :3].astype(np.uint8), "RGB").save(f"{OUT}/parchment-gpt.webp", "WEBP", quality=90, method=6)
# Einzelblatt (für gestreckte Flächen wie den Tooltip)
Image.fromarray(p[..., :3].astype(np.uint8), "RGB").save(f"{OUT}/parchment-gpt-sheet.webp", "WEBP", quality=90, method=6)

# --- Deko ---------------------------------------------------------------
for name in ("drape", "arrow", "star"):
    a = load(name)
    save(a, f"gpt-{name}.webp")
print("ok")
