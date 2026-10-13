"""Give existing sprites animation sheets (walk, attack, ...) without designing new ones.

    python tools/animate.py library [<folk> ...]          every folk when none is named
    python tools/animate.py city <id> [<id> ...]          or: city all
    add --animations walk,attack to choose the sheets (default: walk,attack)
    add --force to redraw sprites that already have every requested sheet

Each sprite record (library/<folk>/folk.json, cities/<id>/sprites/people.json) gets:
  "character": the sprite_forge character it was drawn from (so it can be redrawn any time), and
  "anims":     {"walk": {"src": <data URL>, "frames": 4, "ms": 150}, "attack": {...}}, 64x64 frames side by side.
The idle fields (src, frames, ms, w, h) are never changed, so anything that ignores "anims" keeps working.

A record without "character" is matched to the sprite_forge output folders by name, race and class. Where
several saved versions exist, sprite_forge redraws each and keeps the one whose idle sheet matches this
sprite pixel for pixel; a sprite with no exact match is left alone and reported.

Runs agents/sprite_forge's `rerender` with its own Python (agents/sprite_forge/.venv), so that must be set up.
"""
import base64, json, os, pathlib, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
FORGE = ROOT.parent / "agents" / "sprite_forge"
sys.path.insert(0, str(ROOT / "tools"))
import library  # noqa: E402  (load/save keep folk.json and its preview in step)


def forge_python():
    for p in (FORGE / ".venv" / "Scripts" / "python.exe", FORGE / ".venv" / "bin" / "python"):
        if p.exists():
            return p
    sys.exit(f"sprite_forge has no .venv at {FORGE}. Set it up first (see {FORGE / 'README.md'}, Setup).")


def saved_characters():
    """(name, race, class) -> distinct saved characters, from every sprite_forge output folder."""
    found = {}
    for p in (FORGE / "output").rglob("*.json"):
        if p.name == "manifest.json":
            continue
        try:
            ch = json.loads(p.read_text(encoding="utf-8"))["character"]
        except (ValueError, KeyError, OSError):
            continue
        group = found.setdefault((ch["name"], ch.get("race"), ch.get("cls")), [])
        if ch not in group:
            group.append(ch)
    return found


def animate(records, label, animations, force, index):
    """Add "character" and "anims" to the records that need them. Returns how many changed."""
    jobs, which = [], []
    for i, r in enumerate(records):
        if not force and all(a in r.get("anims", {}) for a in animations):
            continue
        cands = [r["character"]] if r.get("character") else index.get((r["name"], r.get("race"), r.get("cls")), [])
        if not cands:
            print(f"  skip {label} #{i} {r['name']}: no saved character file in sprite_forge/output")
            continue
        jobs.append({"candidates": cands, "match": r["src"], "source": f"{label} #{i}"})
        which.append(i)
    if not jobs:
        return 0
    with tempfile.TemporaryDirectory() as tmp:
        (pathlib.Path(tmp) / "jobs.json").write_text(json.dumps(jobs), encoding="utf-8")
        cmd = [str(forge_python()), "-m", "sprites", "--config", str(FORGE / "config.yaml"), "rerender",
               str(pathlib.Path(tmp) / "jobs.json"), "--scale", "1", "--transparent",
               "--animations", ",".join(animations), "--out", tmp]
        run = subprocess.run(cmd, cwd=FORGE, capture_output=True, text=True, encoding="utf-8", errors="replace",
                             env={**os.environ, "PYTHONIOENCODING": "utf-8"})   # names like Fëanor
        if run.returncode != 0:
            sys.exit(f"sprite_forge rerender failed for {label}:\n{run.stdout}{run.stderr}")
        batch = next(d for d in pathlib.Path(tmp).iterdir() if d.is_dir())
        manifest = json.loads((batch / "manifest.json").read_text(encoding="utf-8"))
        changed = 0
        for i, entry in zip(which, manifest["characters"]):
            r = records[i]
            if entry.get("match_diff", 0) != 0:
                print(f"  skip {label} #{i} {r['name']}: no saved version redraws it exactly ({entry['match_diff']} px differ)")
                continue
            files = entry["files"]
            r["character"] = json.loads((batch / files["json"]).read_text(encoding="utf-8"))["character"]
            r["anims"] = {**r.get("anims", {}), **{
                a: {"src": "data:image/png;base64," + base64.b64encode((batch / files["sheets"][a]).read_bytes()).decode("ascii"),
                    "frames": manifest["animations"][a]["frames"], "ms": manifest["animations"][a]["frameDurationMs"]}
                for a in animations}}
            changed += 1
        return changed


def main(argv):
    animations, force, args = ["walk", "attack"], False, []
    it = iter(argv)
    for a in it:
        if a == "--animations":
            animations = [x.strip() for x in next(it, "").split(",") if x.strip()]
        elif a == "--force":
            force = True
        else:
            args.append(a)
    if not args or args[0] not in ("library", "city") or not animations:
        sys.exit(__doc__)
    index = saved_characters()
    if args[0] == "library":
        folks = args[1:] or sorted(d.name for d in (ROOT / "library").iterdir() if (d / "folk.json").exists())
        for folk in folks:
            data = library.load(folk)
            keys = list(data["sprites"])
            n = animate([data["sprites"][k] for k in keys], f"library/{folk}", animations, force, index)
            if n:
                library.save(folk, data)
            print(f"library/{folk}: {n} of {len(keys)} sprites animated")
    else:
        cities = args[1:]
        if cities == ["all"]:
            cities = sorted(d.name for d in (ROOT / "cities").iterdir() if (d / "sprites" / "people.json").exists())
        for city in cities:
            path = ROOT / "cities" / city / "sprites" / "people.json"
            if not path.exists():
                sys.exit(f"No {path}")
            people = json.loads(path.read_text(encoding="utf-8"))
            n = animate(people, city, animations, force, index)
            if n:
                path.write_text(json.dumps(people, indent=1), encoding="utf-8")
            print(f"{city}: {n} of {len(people)} sprites animated")


if __name__ == "__main__":
    main(sys.argv[1:])
