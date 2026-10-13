# citymaker

Interactive 3D maps of Tolkien's cities (three.js), each built into one self-contained HTML page and published as a
claude.ai artifact, plus an illustrated world map whose seals link to them. **Read README.md first**: it documents the
workflow, every city setting, the landmark recipes, settlements and the sprite library.

## Layout
- `engine/` shared code: `engine.js` (terrain, layout, people, UI), `recipes.js` (landmark recipes), `shell.html`, `engine.css`
- `styles/<style>.js` how a culture builds (noldor, eldarin, rohan, hornburg)
- `cities/<id>/city.js` everything about one city; `cities/<id>/sprites/` its sprites (`people.json`, `cast.txt`, prompt .txt files)
- `library/<folk>/folk.json` shared sprites (rohirrim, edain, noldor, sindar, fellowship); `tools/library.py list` shows them
- `world/world.html` the world map (ages: Beleriand and Middle-earth)
- `python build.py <id>` -> `dist/<id>.html`
- `sandbox/` the map editor; `python build_sandbox.py` -> `dist/sandbox.html` (publish with `{"db":{},"downloads":true}`);
  `engine/objects.js` builds its objects (shared with cities); `tools/sandbox_city.py <map.json> <id>` turns a map into a city

## Published artifacts (republish to the same URL)
| page | artifact |
|---|---|
| World map | https://claude.ai/artifact/VwpEMuMDiwPQZW4FJAg4uf |
| Gondolin | https://claude.ai/artifact/S224yYEAXsBDd5kg1pQkfd |
| Edoras | https://claude.ai/artifact/HgmBDQSjrahbirnWnFdQo3 |
| Helm's Deep | https://claude.ai/artifact/1Faiw37b9b54XUMFUXwSak |
| Aldburg | https://claude.ai/artifact/Ara8vj5DDY9j391gUxSn87 |
| Tol Sirion | https://claude.ai/artifact/MHA4SbKLCqAc94zUvEoWjB |
| Barad Eithel | https://claude.ai/artifact/WGYCZF91pRa9Bh4L6HfHb2 |
| Dor-lómin | https://claude.ai/artifact/M5cQuEg9Y88F672etT37Wh |
| Mithrim | https://claude.ai/artifact/QorzE6oLgA7Pxmatzy7C9g |
| Nargothrond | https://claude.ai/artifact/49qYVDh32vhyXzMM2inH3r |
| Sandbox (map editor) | https://claude.ai/artifact/NTVDdyt2Dpm7TMptAYJCWL |

City pages are published with `capabilities: {"db":{}}` (Build mode saves pieces in collection `pieces`); after a first
publish, check with ArtifactData `list pieces` that it starts empty. Each new city also needs its link in `CITY_URL` in
`world/world.html` and a place with `city:"<id>"` on its age's map (Beleriand coordinates are pixels of the 1280×949
reference image); republish the world map, and set `worldUrl`/`worldLabel` in the city.

## What the user wants
- **Lore accuracy.** Follow The Silmarillion / LotR / Children of Húrin; say plainly on each card what is the map's
  interpretation. Paraphrase Tolkien; never quote long passages.
- **Variety.** Not every city on walled rings on a hill: use `walls:false`, `terrain.flat`, `settlements`, markets out on
  the land, camps, huts, towers, harbours (see Mithrim). Spread people over the whole map, not just the city.
- **Performance.** The user notices lag. Target about 2–3 ms CPU per frame; use instancing and the recipes, avoid ray
  casts in bulk (use the analytic `surfaceY`), keep transparent effects few.
- **Efficiency.** Reuse the template, recipes and library sprites; generate only what's missing (usually the lords).

## Rules learned the hard way
- After any JS edit: `node --check` the file, rebuild, load the page and check the console **before publishing**.
  Never put a `//` comment in the middle of a line (code packs statements onto one line; it once broke every city).
- Keep city layout deterministic: changing seed, streets, levels, districts, reserves or the order of `rand()` calls
  re-lays the houses and breaks saved Build-mode demolitions. New engine features must not change existing cities.
- Sprite order in a city is fixed: lords, then one soldier per district (district order), then townsfolk. With a
  `cast.txt` the build assembles it; the page warns in the console if the count is wrong.
- Check renders with headless Chrome (swiftshader) at 1600×1000; the app's preview pane is small. Headless Chrome
  throttles requestAnimationFrame, so don't trust it for frame timing.
- Bash heredocs mangle quotes and `\n`: write patch scripts to files instead of inline heredocs.

## Sprites
Made with the user's tool `..\agents\sprite_forge` (outside this folder):
`sprites.bat describe --file <lines.txt> --scale 1 --transparent`. Never read or print `agents/sprite_forge/.env`
(it holds the API key). Gemini free tier is 15 requests/min: at most 14 lines per batch, wait ~70 s between batches;
503 "high demand" errors are common, so retry only the failed lines and splice with `collect_sprites.py <id> batch::i,j`.
Add good new sprites to the library (`tools/library.py add ...`).
Sprite records carry `anims` (walk and attack sheets) and `character` (the design, for redrawing) beside the idle
fields; see README "Sprite records and animations". When the workshop gains an animation, don't regenerate sprites:
run `python tools/animate.py library` and `python tools/animate.py city all` (no Gemini, under a minute).

## Ideas not yet done
New layouts: Minas Tirith (spur and staggered gates), a tree city, sea harbours (Eldalondë,
the Havens). Attack animations (records carry `anims.attack`; the engine plays only idle and walk). Shadows
cover only the area around the town, so far settlements have none.
