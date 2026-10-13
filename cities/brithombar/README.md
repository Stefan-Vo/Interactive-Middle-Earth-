# Brithombar

Build: `python build.py brithombar`. Open `dist/brithombar.html` with internet access for the existing Three.js CDN dependencies.

The northern haven has a compact terraced upper town, western and eastern residential shelves, a broad harbour stair, crescent stone quays, four stone piers, two breakwaters, harbour-mouth towers, a fishing landing, working shipyard, sailcloth market and bridge across the Brithon. People have routines in the upper town and on the terraces, waterfront and headland.

The bay shape, street plan, residential terraces, bridge, buildings, vessels and activities are interpretations. The invented harbour watch is not Barad Nimras, which belongs near Eglarest. Existing Elven library sprites represent the Falathrim; there is no named Cirdan portrait. Cast order: four district guards followed by the eight standard townsfolk.

## Sources

*The Silmarillion*, chapters 14 and 20, for the havens, Cirdan's friendship with Finrod, stone quays and piers, and the fall of the Falas. Cross-checks:

- https://tolkiengateway.net/wiki/Brithombar
- https://tolkiengateway.net/wiki/Havens_of_the_Falas
- https://tolkiengateway.net/wiki/Fall_of_the_Falas

## Integration

The shared `world/world.html` already has Brithombar at `(138,470)` in Beleriand. After publishing the city, add `brithombar:"<artifact URL>"` to `CITY_URL` and `city:"brithombar"` to the existing place. Republish the world map. The city already links back to its Beleriand tab.

Only this new city folder and `dist/brithombar.html` were created. Shared engine, styles, libraries, map and other cities were left untouched for concurrent work.

## Validation

- Node syntax check and Python build passed: 12 assembled sprites.
- Headless Chrome, SwiftShader, 1600 x 1000: no JavaScript errors or console warnings.
- Search for Brithon returned the estuary and bridge. Bridge and harbour lore cards opened.
- Build pane opened locally; the clock changed to night without runtime errors.
- Overview and harbour previews are saved in this folder.
- Hosted database persistence and publishing have not been checked. Frame timing under headless Chrome is not representative of interactive performance.
