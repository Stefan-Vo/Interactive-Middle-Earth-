"""Gather sprite_forge batches into a city's sprites folder, for build.py.

    python tools/collect_sprites.py <city id> <batch folder> [<batch folder> ...]

A batch can be followed by ::<indexes> to take only some of its sprites, in that order: "out/2026-10-10_lords::1,2".
That lets a retry fill the gaps when the sprite service dropped a few lines.

Each batch folder is one sprite_forge output folder (it holds a manifest.json). List the batches in sprite order:
the lords first, then one soldier per district (in district order), then the townsfolk. Writes
cities/<id>/sprites/people.json (what build.py embeds), a sheets/ copy of every idle sheet, and preview.html.
"""
import base64, json, pathlib, shutil, sys

if len(sys.argv) < 3:
    sys.exit(__doc__)
HERE = pathlib.Path(__file__).resolve().parent.parent / "cities" / sys.argv[1] / "sprites"
if not HERE.parent.is_dir():
    sys.exit(f"No city folder at {HERE.parent}")
SHEETS = HERE / "sheets"
shutil.rmtree(SHEETS, ignore_errors=True)      # start fresh so sprites from an older run don't linger
SHEETS.mkdir(parents=True, exist_ok=True)   # OneDrive can be slow to finish removing the old folder

people = []
for arg in sys.argv[2:]:
    path, _, pick = arg.partition("::")
    batch = pathlib.Path(path)
    manifest = json.loads((batch / "manifest.json").read_text(encoding="utf-8"))
    anim = manifest.get("idle_animation") or manifest["animations"]["idle"]   # older batches, then newer ones (idle + walk)
    chars = manifest["characters"]
    if pick:
        chars = [chars[int(i)] for i in pick.split(",")]
    for ch in chars:
        files = ch["files"]
        sheet = batch / (files["sheet"] if "sheet" in files else files["sheets"]["idle"])
        dest = f"{len(people):02d}-{sheet.name}"   # numbered: two batches can both have a "Nydris"
        shutil.copy2(sheet, SHEETS / dest)
        people.append({
            "file": dest,
            "name": ch["name"],
            "race": ch.get("race"),
            "cls": ch.get("cls"),
            "frames": anim["frames"],
            "w": anim["frameWidth"],
            "h": anim["frameHeight"],
            "ms": anim["frameDurationMs"],
            "src": "data:image/png;base64," + base64.b64encode(sheet.read_bytes()).decode("ascii"),
        })

(HERE / "people.json").write_text(json.dumps(people, indent=1), encoding="utf-8")

cards = "".join(
    f'<figure><img src="{p["src"]}" alt=""><figcaption>{p["name"]}<br><small>{p["race"]} {p["cls"]}</small></figcaption></figure>'
    for p in people)
(HERE / "preview.html").write_text(f"""<!doctype html><meta charset="utf-8"><title>{sys.argv[1]} sprites</title>
<style>body{{margin:0;padding:16px;background:#7f9c5b;font:13px system-ui;color:#1b2530}}
main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(272px,1fr));gap:10px}}
figure{{margin:0;background:#e7e0cc;border-radius:8px;padding:8px;text-align:center}}
img{{width:256px;height:128px;image-rendering:pixelated}}</style>
<main>{cards}</main>""", encoding="utf-8")
print(f"{len(people)} sprites -> {HERE / 'people.json'}")
