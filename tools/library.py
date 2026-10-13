"""The shared sprite library: sprites any city can use, grouped by people (rohirrim, edain, noldor...).

    python tools/library.py list [<folk>]
    python tools/library.py add <folk> <city id> <index>=<key> [<index>=<key> ...]
    python tools/library.py add-batch <folk> <batch folder>[::<indexes>] <key> [<key> ...]
    python tools/library.py about <folk> "<who these people are, and how to describe them to sprite_forge>"

add        copies sprites a city already has (by their place in its people.json) into the library.
add-batch  takes sprites straight from a sprite_forge output folder, one key per sprite, in order.
Adding a key that is already there replaces it.

Each folk lives in library/<folk>/: folk.json (what build.py reads), sheets/<key>.png and preview.html.
A city then names library sprites in its sprites/cast.txt (see the README, "Reusing sprites").
The townsfolk roles every city uses are: water merchant lore gardener minstrel mason citizen lamplighter.
"""
import base64, io, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LIB = ROOT / "library"
TOWNSFOLK = ["water", "merchant", "lore", "gardener", "minstrel", "mason", "citizen", "lamplighter"]


def sprite_extras(batch, manifest, files):
    """What a sprite_forge batch knows about one sprite beyond its idle sheet: the character it was drawn from
    ("character", so it can be redrawn later) and its other animation sheets ("anims", e.g. walk and attack:
    {"walk": {"src", "frames", "ms"}}). Older batches have neither; tools/animate.py adds them afterwards."""
    out = {}
    if files.get("json"):
        out["character"] = json.loads((batch / files["json"]).read_text(encoding="utf-8"))["character"]
    anims = {a: {"src": "data:image/png;base64," + base64.b64encode((batch / name).read_bytes()).decode("ascii"),
                 "frames": manifest["animations"][a]["frames"], "ms": manifest["animations"][a]["frameDurationMs"]}
             for a, name in files.get("sheets", {}).items() if a != "idle"}
    if anims:
        out["anims"] = anims
    return out


def load(folk):
    path = LIB / folk / "folk.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {"about": "", "sprites": {}}


def save(folk, data):
    d = LIB / folk
    (d / "sheets").mkdir(parents=True, exist_ok=True)
    data["sprites"] = dict(sorted(data["sprites"].items()))
    for key, sp in data["sprites"].items():   # a plain PNG of each sheet, for looking at
        (d / "sheets" / f"{key}.png").write_bytes(base64.b64decode(sp["src"].split(",", 1)[1]))
    (d / "folk.json").write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
    anim_strip = lambda sp: "".join(f'<img class="a" src="{a["src"]}" alt="" title="{name}">'
                                    for name, a in sp.get("anims", {}).items())
    cards = "".join(
        f'<figure><img src="{sp["src"]}" alt="">{anim_strip(sp)}<figcaption><b>{folk}/{key}</b><br>{sp["name"]}'
        f'<br><small>{sp.get("from", "")}</small></figcaption></figure>' for key, sp in data["sprites"].items())
    (d / "preview.html").write_text(f"""<!doctype html><meta charset="utf-8"><title>{folk} sprites</title>
<style>body{{margin:0;padding:16px;background:#7f9c5b;font:13px system-ui;color:#1b2530}}
p{{max-width:70ch}} main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(272px,1fr));gap:10px}}
figure{{margin:0;background:#e7e0cc;border-radius:8px;padding:8px;text-align:center}}
img{{width:256px;height:128px;image-rendering:pixelated}} img.a{{height:64px;display:block;margin:2px auto 0}}</style>
<h1>{folk}</h1><p>{data.get("about", "")}</p><main>{cards}</main>""", encoding="utf-8")


def city_prompts(city):
    """The sprite_forge line behind each of a city's sprites, by its place in people.json (None where unknown)."""
    d = ROOT / "cities" / city / "sprites"
    lines = lambda f: [l.strip() for l in io.open(d / f, encoding="utf-8") if l.strip() and not l.startswith("#")] if (d / f).exists() else []
    lords, soldiers, folk = lines("lords.txt"), lines("soldiers.txt"), lines("townsfolk.txt")
    n = len(json.loads((d / "people.json").read_text(encoding="utf-8")))
    if not soldiers:   # no soldiers.txt: whatever lies between the lords and the townsfolk has no line
        soldiers = [None] * (n - len(lords) - len(folk))
    out = lords + soldiers + folk
    return out if len(out) == n else [None] * n


def cmd_add(folk, city, pairs):
    people = json.loads((ROOT / "cities" / city / "sprites" / "people.json").read_text(encoding="utf-8"))
    prompts, data = city_prompts(city), load(folk)
    for pair in pairs:
        i, _, key = pair.partition("=")
        sp = dict(people[int(i)])
        sp.pop("file", None)
        sp.update({"from": f"{city} #{i}", "prompt": prompts[int(i)]})
        data["sprites"][key] = sp
        print(f"{folk}/{key}  <-  {city} #{i}  {sp['name']}")
    save(folk, data)


def cmd_add_batch(folk, arg, keys):
    path, _, pick = arg.partition("::")
    batch = pathlib.Path(path)
    manifest = json.loads((batch / "manifest.json").read_text(encoding="utf-8"))
    anim = manifest.get("idle_animation") or manifest["animations"]["idle"]
    chars = manifest["characters"]
    if pick:
        chars = [chars[int(i)] for i in pick.split(",")]
    if len(chars) != len(keys):
        sys.exit(f"{len(chars)} sprites in the batch but {len(keys)} keys given")
    data = load(folk)
    for ch, key in zip(chars, keys):
        files = ch["files"]
        sheet = batch / (files["sheet"] if "sheet" in files else files["sheets"]["idle"])
        data["sprites"][key] = {"name": ch["name"], "race": ch.get("race"), "cls": ch.get("cls"),
                                "frames": anim["frames"], "w": anim["frameWidth"], "h": anim["frameHeight"], "ms": anim["frameDurationMs"],
                                "src": "data:image/png;base64," + base64.b64encode(sheet.read_bytes()).decode("ascii"),
                                "from": batch.name, "prompt": ch.get("description"),
                                **sprite_extras(batch, manifest, files)}
        print(f"{folk}/{key}  <-  {batch.name}  {ch['name']}")
    save(folk, data)


def cmd_list(folk=None):
    for d in sorted(LIB.iterdir()) if LIB.exists() else []:
        if folk and d.name != folk:
            continue
        data = load(d.name)
        keys = list(data["sprites"])
        missing = [r for r in TOWNSFOLK if r not in keys]
        print(f"{d.name} ({len(keys)}): {' '.join(keys)}")
        if missing and len(missing) < len(TOWNSFOLK):
            print(f"   no townsfolk yet for: {' '.join(missing)}")


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[:1] == ["list"]:
        cmd_list(*a[1:2])
    elif a[:1] == ["add"] and len(a) >= 4:
        cmd_add(a[1], a[2], a[3:])
    elif a[:1] == ["add-batch"] and len(a) >= 4:
        cmd_add_batch(a[1], a[2], a[3:])
    elif a[:1] == ["about"] and len(a) == 3:
        data = load(a[1]); data["about"] = a[2]; save(a[1], data)
    else:
        sys.exit(__doc__)
