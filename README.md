# citymaker

Makes interactive 3D maps of walled hill cities, like **Gondolin from Above**. One engine draws every city. Each
city is a single data file plus its pixel-art sprites. `build.py` combines them into one self-contained page.

```
engine/  shell.html, engine.css, engine.js      the same for every city
         recipes.js                          ready-made landmark pieces (bridges, falls, towns...)
styles/  noldor.js, rohan.js                     how a culture builds: houses, walls, gates, halls, yards
cities/  <id>/city.js                            everything specific to one city (it names its style)
         <id>/sprites/                           its sprite_forge sprites (people.json is what the build embeds)
library/ <folk>/folk.json                       shared sprites any city can use (rohirrim, edain, noldor...)
tools/   collect_sprites.py                      turns sprite_forge output into a city's sprites/people.json
         library.py                              stocks the library and lists what is in it
build.py                                         python build.py <id>  ->  dist/<id>.html
```

Every city gets, from the engine:
- a hill with a walled summit, rising in walled levels, with gates and stairs where avenues climb
- ring roads, avenues and generated houses, gardens, courtyards and fountain squares
- a hall for each district, built in one of 12 styles
- people with daily routines, a city clock, and lamps that are lit at dusk
- the Explore list and info cards, and Build mode with saving

## Styles

A style is how a culture builds. The engine decides *where* things go: levels, streets, rows of houses, yards and
plazas, with all the random choices. The style decides *what* stands there:

| style | used by | look |
| --- | --- | --- |
| `noldor` | Gondolin | white stone, slate and gold caps, battlements and round towers, fountains, hedged gardens |
| `rohan` | Edoras | timber longhouses with thatched gables, an earth bank with a log palisade, fieldstone terraces with fences, wells, haystacks, kitchen gardens |
| `eldarin` | Barad Eithel | High Elven: walls and terraces faced with pointed (lancet) arches, tall narrow houses with steep roofs and pinnacles, domes, needle spires, cypress gardens. Landmarks can reuse its arch panel with `E.STYLE.arcadeGeo(THREE)`. |

A style file sets:
- **`palette`:** terrace, paving and lamp colors.
- **`rows`:** house size and spacing.
- **`yards`:** how many courtyards and gardens.
- **`buckets`:** any extra instanced shapes, such as Rohan's gable roofs.
- **Builders:** `hall(h,E)`, `outerWall(E)`, `levelWalls(E)`, and `pieces(B,E)`.

`pieces(B,E)` returns `tree`, `fountain`, `statue`, `courtyard`, `garden`, `plaza`, `avenueDecor` and `lot`.

To add a culture, copy the closest style and change what each piece draws. Don't change the number or order of
`rand()` calls in a style other cities already use: that re-lays their houses and resets their saved demolitions.

A city's hill is also set in its data:
- **`terrain.profile`:** the hill's shape, as [radius fraction, height fraction] pairs. Gondolin has sheer cliffs; Edoras has gentle slopes.
- **`terrain.colors`:** the hill's colors.

## Making a new city

1. **Copy the template.** Copy `cities/_template` to `cities/<id>` (for example `minas-tirith`) and set `id:"<id>"` in
   `city.js`. Build it right away to see the starting point:
   ```bash
   python build.py <id>
   ```
   Open `dist/<id>.html` in a browser. It works without people until the sprites exist.

2. **Fill in `city.js`.** Work through the TODOs, top to bottom:
   | field | what it sets |
   | --- | --- |
   | `id`, `style`, `name`, `title`, `tagline`, `footnote`, `searchPlaceholder` | the style file and the page text. Keep each a plain one-line "string": `build.py` reads them. |
   | `seed` | where generated houses go. Changing it, or the streets or districts, re-lays the city and resets saved demolitions. |
   | `terrain` | summit height and radius, the outline's waves, and the mountain ring |
   | `levels` | wall radii between levels, and the step height. `radii:[]` gives a flat city. |
   | `streets` | ring roads `[radius, width]`, and avenues `{b, r0, w, main}`. Bearings: 0 is north, measured clockwise. |
   | `gate` | the outer gate's bearing, which must be on a main avenue. `channel:true` adds a water channel down that avenue. |
   | `districts` | name, color, `sector` `[from, to]`, `hall` `[bearing, radius]`, hall `motif`, and lore |
   | `places`, `groups` | the Explore list. `walls` and `gate` are required. |
   | `reserves` | ground kept clear for landmarks, as `[x, z, radius]` |
   | `landmarks(E)` | your own buildings. `E` holds the engine's helpers; the Gondolin file shows big examples. |
   | `people(E)` | the lords, guard posts and townsfolk roles |
   | `routines` | market squares, the square walk, where people study, and the patrol ring |

3. **Make the sprites with sprite_forge** (`agents/sprite_forge`). They must come in this order:
   1. one sprite per lord, in the order of `people().lords`
   2. one soldier per district, in district order
   3. the townsfolk, in the order of `people().townsfolk`

   **First look in the library** (`python tools/library.py list`): most soldiers and all the townsfolk of a
   known people are already there, so usually only the lords need new sprites. See "Reusing sprites" below.

   Put each group in a text file, one description per line. Gondolin's lists are in
   `cities/gondolin/sprites/*.txt`. Then render them:
   ```bash
   path\to\agents\sprite_forge\sprites.bat describe --file lords.txt --scale 1 --transparent
   ```
   The Gemini free tier allows 15 requests a minute, so keep each file to 14 lines or fewer, and wait a minute between files.

4. **Collect the sprites** into the city, listing the sprite_forge output folders in the same order:
   ```bash
   python tools/collect_sprites.py <id> <lords batch> <soldiers batch> <townsfolk batch>
   ```
   Open `cities/<id>/sprites/preview.html` to check them.
   If you used library sprites, write `cities/<id>/sprites/cast.txt` to put the city's own sprites and the library's
   together in map order (see "Reusing sprites").

5. **Build, then publish** `dist/<id>.html` as its own artifact. Each artifact keeps its own saved buildings.

6. **Put it on the world map.** `world/world.html` is the illustrated map of Arda, with one tab per age:
   - Add the new artifact's link to `CITY_URL` near the top of that file.
   - Give the place a `city:"<id>"` in that age's `places` list, or add the place if it isn't there yet. It turns from a grey dot into a red seal.
   - Set `worldUrl` (with `#beleriand` or `#middle-earth`) and `worldLabel` in the city's `city.js`, so the city links back.
   - Republish both pages.

## Optional city settings

Every city so far is a walled place on a hill, but not every city needs the rest:

| setting | what it does | example |
| --- | --- | --- |
| `levels` | Leave it out, or use `radii:[]`, for a flat summit with no terrace walls. | the template with `radii:[]` |
| `streets.rings` | Can be empty. A city with no ring roads has no fountain squares or markets; people use the central square instead. | Helm's Deep |
| `streets.paths` | Footpaths beyond the streets, `{from:"E:<bearing>", points:[[x,z],...]}`. `E:<bearing>` is the inner end of that avenue. A point can be `[x,z,height]` where the path leaves the ground, on a bridge or a stair. | the postern stair down into the Deep; the bridge of Tol Sirion |
| `gate.stair` | `false` leaves out the Noldor style's great stair down from the gate, for a city that builds its own way out. | Tol Sirion's bridge |
| `gate.posterns` | Extra bearings where the outer wall has a small gap (styles that support it, like `hornburg`). | Helm's Deep |
| `fill` | `{rows:false, yards:false}` turns off the generated houses, courtyards and gardens, for a fortress or a camp. `yards:{courts:1, gardens:3}` changes how many each district gets instead. | Helm's Deep; Aldburg |
| `terrain.shape(x,z)` | Extra ground height anywhere, for valleys, gorges and cliffs. Use `terrain.detail` (default 260) for a finer ground grid. | the Deeping-coomb and the Deep |
| `terrain.profile`, `terrain.colors` | The hill's shape and colors. | Edoras's gentle green hill |
| `terrain.tint(x,z,y,color)` | Recolors the land around the city: change the `THREE.Color` it is given. | Anfauglith's ash below Barad Eithel |
| `terrain.rough` | `0` makes the hill's slopes smooth grass instead of broken rock (default `1`). | Dor-lómin's green hill |
| `camera` | `{scale, dist, target:[x,y,z], from:<bearing>, limit}`, for maps much wider than their summit. `from` is the bearing the camera looks from; `limit` is how far from the center the view may pan (default 440). | Helm's Deep looks up the coomb from the east |

Landmarks can give people somewhere to go. `E.addHome(x,z)` adds a place to sleep (Aglarond's caves),
`E.addFountainPOI(x,z)` a place to fetch water (the Deeping Stream), and `E.addGardenPOI(x,z,R)` a garden.

A style can extend another style. `styles/hornburg.js` says `extends:"rohan"` and replaces only the walls, so
it has Gondor's stone walls around Rohirric timber halls. The build includes the base style first.

## Beyond the walls: settlements and spacing

Not every city has to be rings of houses packed onto a walled hill.
- **`walls:false`** leaves out the wall round the summit (and its gate): an open town. Walls between levels stay.
- **`terrain.flat:true`** (with a small `terrain.height`, e.g. `.3`, and no `levels`) sets the town on level ground like a village:
  the hill isn't drawn, so the town stands on the ordinary land with no ring of hillside around it (Mithrim).
- **`fill:{gap:2.6}`** multiplies the gaps between the houses in the rows, for a roomier town (Mithrim). Add gardens with `fill.yards`.
- **`settlements(E)`** returns houses to place out on the land, in the city's own style, standing on the ground rather than on
  the hill's levels (they can be demolished in Build mode like any other house):
  - a cluster around a green with a well: `{c:[x,z], r, n, clear, spacing, w:[min,extra], d:[min,extra], district, owner, avoid(x,z)}`
  - rows along a line (a shore, a road): `{along:[[x,z],...], side:1|-1, offset, rows, rowGap, spacing, w, d, district, owner, avoid}`
  `district` picks the roof colors; `owner` is the place the houses belong to (give it an entry in `places`).
  People live in these houses too, a cluster's well is somewhere to fetch water and its green somewhere to stroll
  (`well:false` / `green:false` to leave them out).
- **`streets.paths`** are footpaths people walk: `{from:"E:270", to:"WEST", points:[[x,z],...]}` starts at the end of the
  avenue at bearing 270 and makes a new junction "WEST" that other paths can start from. Run them out to the settlements,
  or people living there cut straight across the fields.
- **`markets:[{x, z, r, stalls}]`** is a market square of its own out on the land: a ring of stalls (traders come to each one
  in the morning and pack away in the evening) that shoppers walk to. Build its hall and storehouses with `E.hall`.
- **`people().locals`** puts people at places of their own: `{sprite:"citizen" | soldier:<district>, count, spread, a, b,
  home, dayText, name, kicker, desc, house}`. By day they walk between `a` and `b`; at night they are at `home`.
  Mithrim uses them for fishers, Grey-elves in their village, families in the camp, farmers and boatwrights.
- Then dress the land with recipes: `E.camp`, `E.huts`, `E.track`, `E.fields`, `E.scatter`. Mithrim's `city.js` shows all of it:
  three steadings with orchards and fields, a waterside in two rows, the host's camp, a Grey-elf village and fishers' huts.

## Landmark recipes

`engine/recipes.js` adds ready-made pieces to `E`, so a city's `landmarks(E)` can call them instead of building them
from boxes. They take their colors from the style's `look`, so the same bridge suits Elves or Rohirrim.

| recipe | what it builds | used by |
| --- | --- | --- |
| `E.bridge(add, [x,z], [x,z], {y, w, span, arches, cutwaters, lamps})` | a bridge on piers and arches sized to the ground below; `y0`/`y1` for a sloping deck | Barad Eithel's high bridges |
| `E.waterfall(add, top, bottom, width)` | white water falling from a dark arch, with spray | the falls of Eithel Sirion |
| `E.stair(add, from, to, width)` | steps built up from the ground | Tol Sirion's landing |
| `E.lamp(add, x, y, z)` | a lamp post the lamplighters light | everywhere |
| `E.arcRing(add, material, x, y, z, r, n, h)` | a ring of arch panels, for round halls and towers | Barad Eithel |
| `E.scatter({kind, n, area, size, keep, owner})` | trees, cypresses, pines, rocks, reeds or snow, as one instanced mesh | Tol Sirion's pass, Barad Eithel's rock |
| `E.herd(add, x, z, n)` | a herd of horses | Aldburg, Barad Eithel |
| `E.distantPeaks(add, x, z)` | dark peaks on the horizon, with smoke | Thangorodrim |
| `E.fields({area, avoid, owner})` | a patchwork of farmland with hedgerows | the Folde around Aldburg |
| `E.town({c, y0, radii, levelH, gate, keep})` | a small terraced town on a shelf of rock, with its wall, gate, stair and tower | the North Watch |
| `E.quay(add, [[x,z],...], {y, w, lampEvery})` | a stone embankment along a shore, with bollards and lamps | the quays of Mithrim |
| `E.pier(add, [x,z], [x,z], {y, w, stone})` | a wooden jetty on posts, or a stone landing on piers | Mithrim |
| `E.boat(add, x, z, yaw, {len, sail, color})` | a small boat, moored or out on the water (yaw 0 points along +x) | Mithrim |
| `E.mist({n, area, y, size, opacity, flat, keep})` | soft banks of mist over water or low ground | Lake Mithrim |
| `E.camp({c, n, r, stretch, size, colors, banner, fires, keep, owner})` | tents and pavilions scattered loosely, with banners and camp-fires | Fingolfin's host and the Fëanorians at Mithrim |
| `E.huts({c, n, r, size, wall, thatch, stilts, racks, fire, keep, owner})` | round thatched huts, or huts on stilts at the water's edge with net racks | the Grey-elves' village and the fishers at Mithrim |
| `E.track([[x,z],...], {w, color, owner})` | a beaten path over the land, following the ground (skipped under water) | the tracks between Mithrim's steadings |
| `E.hall(add, x, z, {w, d, h, yaw, porch, tower, wall, roof})` | a big building out on the land: a hall with a porch and tower, a barn, a storehouse | the Western Steading and the Lakeside Market |
| `E.tower(add, x, z, {r, h, beacon, banner})` | a round watchtower, or a beacon tower whose fire the lamplighters light | Mithrim's watchtowers |

Two recipes shape the ground itself, so they are terrain settings:
- **`terrain.shelves: [{x, z, r, y, side}]`** cuts the land level: a shelf on a mountain, or a pinnacle of rock.
- **`terrain.water: {level, bed, rivers:[{points, width:[w0,w1]}], pools:[{x,z,r}], carve(x,z), place}`** carves rivers and pools
  below the water and lays one sheet of water at its level.
  For a lake, give `carve(x,z)` a function that is 1 in the water and 0 on land (Mithrim's oval lake); `place` makes the water clickable.
  If the map reaches well beyond the hill, raise `camera.limit` so the view can pan there.

## Reusing sprites

`library/` holds sprites by people, so a second Rohan city doesn't need new water-carriers, riders and farmers.
`python tools/library.py list` shows what is there; each `library/<folk>/preview.html` shows the pictures.

| folk | what it has |
|---|---|
| `rohirrim` | Théoden, Éowyn, Éomer, Gríma, Háma, Gamling, Éothain, Erkenbrand; guard, rider, smith, herdsman, spearman, shieldmaiden, yeoman, gatewarden, archer, horse-thegn, watchman; the eight townsfolk, farmer, stonemason, refugee, old-refugee |
| `edain` | Hador, Galdor, Húrin, Huor, Morwen, Túrin (as a child, and as the Mormegil), Lalaith, Sador, Tuor; guard, woodwright, herdsman; the eight townsfolk |
| `noldor` | Fingolfin, Fingon, Turgon, Idril, Finrod, Orodreth, Finduilas, Gwindor, Gelmir, Arminas, Edrahil, Glorfindel, Ecthelion and the other lords of Gondolin; guard, archer, warden, smith, river-warden, bridge-guard (and golden-haired `-golden` guards for Finrod's people); the eight townsfolk |
| `fellowship` | Aragorn, Gimli, Legolas |

A city uses them through `cities/<id>/sprites/cast.txt`, which lists its sprites in map order (lords, one soldier per
district, townsfolk). Each word is one or more sprites; `#` starts a comment:

```
own:0-5                                     # the city's own sprites (its people.json), by place: own, own:3, own:0-5
edain/guard edain/woodwright edain/herdsman # one sprite from library/<folk>
edain/townsfolk                             # the folk's eight townsfolk: water merchant lore gardener minstrel mason citizen lamplighter
```

Without a `cast.txt` the city uses its own `people.json`, as before. If the count is wrong, the page warns in the console
(`citymaker: 16 sprites, but the city expects 17`).

Growing the library:
```bash
python tools/library.py add rohirrim aldburg 6=yeoman 12=farmer
python tools/library.py add-batch noldor <sprite_forge batch folder>[::0,2] sentinel herald
python tools/library.py about rohirrim "who these people are, for writing new sprite lines"
```
`add` copies sprites a city already has; `add-batch` takes new ones straight from sprite_forge. Each library sprite keeps
the sprite_forge line it was made from (`prompt` in folk.json), so a new variant can be written to match. Add a city's new
soldiers and named characters to the library once they look right, so the next city can use them.

## Keeping it fast

- `E.surfaceY(x,z)` works the height out from the terrain's shapes; it's cheap, so call it as often as you like.
  `E.surfaceYExact` casts a ray at the meshes, which is slow; avoid it in loops.
- Landmark groups passed to `own()` are merged into one mesh per material, so hundreds of boxes cost a few draw calls.
  Give pieces that must stay separate `userData.keep=true`. See-through materials are never merged.
- Shadows are drawn once and redrawn only when something changes (Build mode, demolitions, market stalls).
- The ground is a polar grid: as fine as `terrain.detail` out to `terrain.fine` (default 1200 × scale), coarser beyond.

## Rules worth knowing

- **What changes the layout:** generated houses come from `seed`, `streets`, `levels`, `districts` and `reserves`.
  Change any of these after people have demolished buildings in Build mode, and those demolitions no longer
  match. The buildings people placed themselves are kept.
- **Order matters:** sprite order and district order must line up. Soldier *k* is district *k*.
- **Fixed-height places:** places whose position isn't on the summit set `fixedY:true`. Gondolin's cliff, hill and
  plain do this. Other places move up with their level automatically.
- **Optional place fields:** a place can set `view` (where the camera flies instead of `pos`) and `showAs` (its name on
  "Show …" buttons).
- **Landmark helpers:** inside `landmarks(E)`:
  - `own(placeId, group)` makes the group clickable as that place.
  - `addWater(material)` makes water shimmer.
  - `addLantern(mesh, x, z)` lets the lamplighters light it.
  - `reveal(placeId, object)` shows the object only while that place is selected, like Idril's secret way.
