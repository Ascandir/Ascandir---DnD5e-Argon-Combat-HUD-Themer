"""
Übernimmt die Themes aus „Ascandir - DnD5e Character Sheet“ als HUD-Vorlagen.

Aufruf (aus dem Themer-Ordner):
    python3 tools/import-sheet-themes.py <pfad/zum/character-sheet-repo>

Erzeugt:
    assets/sheet/<theme>/   Rahmen, Pergament, Holz, Medaillon (WebP), ggf. Klassen-Symbol (SVG, eingefärbt)
    scripts/sheet-presets.js  die Vorlagen (nicht von Hand bearbeiten – Skript erneut ausführen)

Benötigt Python 3 mit Pillow.
"""
import json
import os
import re
import sys

from PIL import Image

SHEET = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_ASSETS = os.path.join(ROOT, "assets", "sheet")
OUT_JS = os.path.join(ROOT, "scripts", "sheet-presets.js")

BASE = ["parchment", "nightwatch", "crimson", "arcane"]
DAMAGE = ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison",
          "psychic", "radiant", "slashing", "thunder"]
CLASSES = ["barbarian", "bard", "cleric", "druid", "fighter", "monk", "paladin", "ranger", "rogue",
           "sorcerer", "warlock", "wizard", "artificer"]

# ---------------------------------------------------------------- Farben

def parse_vars(css_text):
    """{theme_id: {var: value}} aus allen Blöcken `.ascandir-sheet.asc-theme-<id> { --… }`."""
    out = {}
    for m in re.finditer(r"\.ascandir-sheet\.asc-theme-([a-z-]+)\s*\{", css_text):
        start = m.end()
        end = css_text.index("}", start)
        body = css_text[start:end]
        vars_ = {k: " ".join(v.split()) for k, v in re.findall(r"--([\w-]+)\s*:\s*([^;]+);", body, re.S)}
        if vars_:
            out.setdefault(m.group(1), {}).update(vars_)
    return out


def to_rgba(value):
    """Erste Farbe aus einem CSS-Wert als (r, g, b, a 0..1)."""
    if not value:
        return None
    m = re.search(r"#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b", value)
    if m:
        h = m.group(1)
        if len(h) == 3:
            h = "".join(c * 2 for c in h)
        a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)
    m = re.search(r"rgba?\(([^)]*)\)", value)
    if m:
        parts = [p for p in re.split(r"[\s,/]+", m.group(1).strip()) if p]
        r, g, b = (float(x) for x in parts[:3])
        a = 1.0
        if len(parts) > 3:
            a = float(parts[3].rstrip("%")) / 100 if parts[3].endswith("%") else float(parts[3])
        return (r, g, b, a)
    return None


def hx(c, alpha=None):
    r, g, b, a = c
    a = a if alpha is None else alpha
    return "#%02x%02x%02x%02x" % (round(r), round(g), round(b), round(a * 255))


def mix(c1, c2, t):
    """t = Anteil von c2."""
    return tuple(c1[i] * (1 - t) + c2[i] * t for i in range(3)) + (1.0,)


BLACK, WHITE = (0, 0, 0, 1.0), (255, 255, 255, 1.0)


def lum(c):
    return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255

# ---------------------------------------------------------------- Grafiken

def convert(src, dst, quality=88):
    im = Image.open(src)
    im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
    im.save(dst, "WEBP", quality=quality, method=6)


def tint_svg(src, dst, color):
    svg = open(src, encoding="utf-8").read()
    svg = svg.replace('fill="currentColor"', f'fill="{color}"')
    if "fill=" not in svg:
        svg = svg.replace("<path ", f'<path fill="{color}" ', 1)
    open(dst, "w", encoding="utf-8").write(svg)

# ---------------------------------------------------------------- Vorlage

def build(theme_id, label, vars_, asset_dir, group_kind):
    v = lambda k, d=None: to_rgba(vars_.get(k)) or (to_rgba(d) if d else None)
    gold = v("asc-gold", "#c9a35c")
    gold_light = v("asc-gold-light", "#ecd59c")
    badge = v("asc-badge-bg", "#16100a")
    badge_text = v("asc-badge-text", "#f5ead0")
    text = v("asc-text", "#2b1f14")
    heading = v("asc-text-heading", "#2b1b0e")
    on_dark = v("asc-text-on-dark", "#f0dfb6")
    header = v("asc-header-color", "#1c130c")
    header_text = v("asc-panel-header-text", "#f0dfb6")
    accent = v("asc-accent", "#5b2614")
    accent_c = v("asc-accent-contrast", "#fff4dc")
    gem = v("asc-gem", "#3f8ae0")
    glow = v("asc-glow", "rgb(255 200 120 / 70%)")
    hd2 = v("asc-hd-fill-2", "#6b1c27")
    meter = v("asc-meter-bg", "#0e0906")
    panel = v("asc-panel-color", "#ead8b0")
    frame_bg = v("asc-frame-bg", "#0f0a06")
    positive = v("asc-positive", "#3f6b2a")
    row_hover = v("asc-row-hover", "rgb(160 120 60 / 22%)")

    light_panel = lum(panel) > 0.5
    a = f"`${{ASSETS}}/sheet/{theme_id}"

    def m(c, t, base=badge):
        return hx(mix(base, c, t))

    colors = {
        "text": hx(on_dark), "hoverText": "#ffffffff", "border": hx(gold), "hoverBorder": hx(gold_light),
        "portrait": hx(frame_bg), "container": hx(badge, 0.95),
        "panel": hx(badge), "panelHover": m(glow, 0.28),
        "bonus": m(accent, 0.16), "bonusHover": m(accent, 0.34),
        "free": m(gem, 0.14), "freeHover": m(gem, 0.30),
        "reaction": m(accent, 0.28), "reactionHover": m(accent, 0.45),
        "endTurn": m(positive, 0.25), "endTurnHover": m(positive, 0.42),
        "ttHeader": "#00000000", "ttHeaderText": hx(heading),
        "ttSubtitle": hx(accent), "ttSubtitleText": hx(accent_c),
        "ttBody": "#00000000", "ttBodyText": hx(text),
        "textGlow": "#00000000", "accentGlow": hx(glow, 0.6),
        "button": hx(accent), "buttonHover": hx(mix(accent, WHITE, 0.18)), "buttonText": hx(accent_c),
        "moveUsed": hx(meter, 0.5), "moveBase": hx(gem), "moveBaseGlow": hx(gem, 0.6),
        "moveDash": "#e0b040ff", "moveDashGlow": "#f0c86099", "moveDanger": "#c23a2aff", "moveDangerGlow": "#e05a4a99",
    }
    menu = {
        "abilityMenu-background": hx(panel),
        "abilityMenu-color": hx(text),
        "abilityMenu-border": hx(gold),
        "abilityMenu-base-color": hx(text),
        "abilityMenu-base-boxShadow": "#00000000",
        "abilityMenu-hover-color": hx(accent if light_panel else gold_light),
        "abilityMenu-hover-boxShadow": "#00000000",
    }
    extras = {
        "accent": hx(mix(gem, WHITE, 0.62)), "hp": "#8fe08aff", "pip": hx(gem), "pipGlow": hx(gem, 0.5),
        "pipUsed": hx(meter), "statText": "#f3e7cfff", "statBackground": hx(mix(header, BLACK, 0.35), 0.92),
        "panelText": hx(header_text), "headerBg": hx(header),
        "highlight": hx(row_hover, max(0.18, row_hover[3])), "iconTint": hx(gold_light),
        "hpBox": hx(hd2), "accentBox": hx(mix(gem, BLACK, 0.55)),
    }
    gold_css = hx(gold)[:7]
    rest_text = hx(text)[:7]
    custom = f"""/* Rast-Knöpfe auf Pergament */
.extended-combat-hud .movement-hud:has(.button-hud-button) {{ gap: 10px; background: none !important; border: none !important; border-image: none !important; backdrop-filter: none !important; }}
.extended-combat-hud .button-hud-button, .extended-combat-hud .button-hud-button i {{ color: {rest_text} !important; text-shadow: none !important; }}
/* Zauberleiste: freie Punkte */
.extended-combat-hud .feature-spell-slots {{ background: none !important; border: none !important; border-image: none !important; backdrop-filter: none !important; }}
.extended-combat-hud .feature-spell-slots .spell-slot:not(.spell-cantrip) {{ border: 2px solid #000000aa !important; box-shadow: 0 0 0 2px {gold_css}, 0 2px 4px #000000 !important; }}
.extended-combat-hud .feature-spell-slots .spell-cantrip {{ color: {hx(gold_light)[:7]} !important; }}
.extended-combat-hud .feature-element .feature-element-title {{ font-size: 1.1em !important; text-transform: none !important; }}
/* Portrait: Name groß */
.extended-combat-hud .portrait-hud .player-details {{ background: linear-gradient(#000000c0, #00000000) !important; -webkit-mask-image: none !important; mask-image: none !important; padding-left: 1.6rem !important; }}
.extended-combat-hud .portrait-hud .player-details .player-name {{ font-size: 2.1rem !important; font-weight: 700; color: {hx(gold_light)[:7]} !important; }}
.extended-combat-hud .portrait-hud .player-details .player-detail {{ display: inline-block; font-size: 1.1em !important; color: #f0e2c4 !important; border-bottom: 2px solid {gold_css}; padding-bottom: 3px; }}
/* Menü */
.extended-combat-hud .ability-menu ul > li.ability-title, .extended-combat-hud .ability-menu ul.ability-toggle li {{ border-radius: 6px; border-color: {gold_css} !important; }}
.extended-combat-hud .ability-menu ul > li:not(.ability-title) {{ border-top-color: {hx(gold, 0.18)} !important; box-shadow: none !important; }}
.extended-combat-hud .ability-menu ul.collapsible-panel > li.ability-title > span:not(:first-child) {{ font-size: 0.78em; letter-spacing: 0; }}
/* Tooltip */
.ech-tooltip .ech-tooltip-header {{ padding: 1rem 1.3rem 0.3rem !important; }}
.ech-tooltip .ech-tooltip-body {{ padding: 0 1.3rem 1.1rem !important; }}
.ech-tooltip, .ech-tooltip .ech-tooltip-description {{ color: {rest_text} !important; }}"""

    ornaments = []
    if os.path.exists(os.path.join(asset_dir, "emblem.svg")):
        ornaments.append({"src": f"__ASSETS__/sheet/{theme_id}/emblem.svg", "anchor": "portrait", "corner": "top-right",
                          "x": 14, "y": 12, "width": 46, "height": 46, "layer": "middle", "animation": "none"})

    return {
        "id": f"sheet-{theme_id}",
        "name": label,
        "group": "sheet",
        "colors": colors, "menu": menu, "extras": extras,
        "style": {
            "font": "EB Garamond", "headingFont": "Cinzel", "fontScale": 115, "radius": 0, "borderWidth": 1,
            "hoverGlow": True, "glowColor": hx(glow, 0.65), "glowSize": 10, "textShadow": False, "portraitFrame": False,
            "skillIcons": True, "ornateMenu": True, "squarePips": True, "titleStrip": True,
            "tooltipTitleLeft": True, "joinedStats": False, "continuousBar": True, "hideName": False,
            "abilityMedallions": False, "highlightProficient": True, "tintIcons": True, "statBoxColors": False,
            "tooltipDivider": True,
        },
        "textures": {
            "panel": f"__ASSETS__/sheet/{theme_id}/wood-dark.webp", "panelSize": 300,
            "menuPanel": f"__ASSETS__/sheet/{theme_id}/parchment.webp",
            "tooltip": f"__ASSETS__/sheet/{theme_id}/parchment.webp",
            "frame": f"__ASSETS__/sheet/{theme_id}/frame-window.webp", "frameSlice": 62, "frameWidth": 22, "frameRepeat": "stretch",
            "tooltipFrame": f"__ASSETS__/sheet/{theme_id}/frame-panel.webp", "tooltipFrameSlice": 40, "tooltipFrameWidth": 16,
            "barFrame": f"__ASSETS__/sheet/{theme_id}/frame-window.webp", "barFrameSlice": 62, "barFrameWidth": 22,
            "buttonFrame": f"__ASSETS__/sheet/{theme_id}/frame-panel.webp", "buttonFrameSlice": 40, "buttonFrameWidth": 11,
            "medallion": f"__ASSETS__/sheet/{theme_id}/medallion.webp",
        },
        "ornaments": ornaments,
        "customCss": custom,
    }

# ---------------------------------------------------------------- Ablauf

css = ""
for name in ("parchment", "nightwatch", "crimson", "arcane", "damage-types", "class-themes"):
    css += open(os.path.join(SHEET, "styles", "themes", f"{name}.css"), encoding="utf-8").read() + "\n"
all_vars = parse_vars(css)

lang = json.load(open(os.path.join(SHEET, "lang", "de.json"), encoding="utf-8"))
labels = lang.get("ASCSHEET", {}).get("Theme", {})

presets = []
for kind, ids, sub in (("base", BASE, ""), ("damage", DAMAGE, "damage/"), ("class", CLASSES, "classes/")):
    for tid in ids:
        src_dir = os.path.join(SHEET, "assets", sub + tid)
        dst_dir = os.path.join(OUT_ASSETS, tid)
        os.makedirs(dst_dir, exist_ok=True)
        for f in ("frame-window.png", "frame-panel.png", "medallion.png"):
            convert(os.path.join(src_dir, f), os.path.join(dst_dir, f.replace(".png", ".webp")), 90)
        for f in ("parchment.jpg", "wood-dark.jpg"):
            convert(os.path.join(src_dir, f), os.path.join(dst_dir, f.replace(".jpg", ".webp")), 82)
        vars_ = all_vars.get(tid, {})
        if not vars_:
            print("WARNUNG: keine Farben für", tid)
        label = labels.get(tid, tid)
        label = re.sub(r"^(Klasse|Schadenstyp):\s*", lambda m: m.group(1) + " – ", label)
        preset = build(tid, f"Charakterbogen · {label}", vars_, src_dir, kind)
        if os.path.exists(os.path.join(src_dir, "emblem.svg")):
            gl = to_rgba(vars_.get("asc-gold-light")) or (236, 213, 156, 1)
            tint_svg(os.path.join(src_dir, "emblem.svg"), os.path.join(dst_dir, "emblem.svg"), hx(gl)[:7])
        presets.append(preset)

js = json.dumps(presets, ensure_ascii=False, indent=2)
js = js.replace('"__ASSETS__', "`${ASSETS}").replace('.webp"', '.webp`').replace('.svg"', '.svg`')
open(OUT_JS, "w", encoding="utf-8").write(f"""/**
 * Automatisch erzeugt von tools/import-sheet-themes.py aus „Ascandir - DnD5e Character Sheet“.
 * Nicht von Hand bearbeiten – stattdessen das Skript erneut ausführen.
 */
import {{ MODULE_ID }} from "./schema.js";

const ASSETS = `modules/${{MODULE_ID}}/assets`;

export const SHEET_PRESETS = {js};
""")
print(len(presets), "Vorlagen erzeugt")
