# Eglarest

Build with `python build.py eglarest`, then open `dist/eglarest.html`.
The page loads the project's existing Three.js CDN dependencies, so an internet connection is required.

Includes a walled haven, harbour quays and five jetties, moored and offshore vessels, shipyards with unfinished hulls, a market, the Nenning estuary, and Barad Nimras on a western cape. Local shipwrights, traders, mariners and watchers supplement the town's daily routines.

The architecture, districts and harbour plan are interpretations. Existing Noldorin library artwork stands in for the Falathrim. Cirdan has no named portrait here. Sprite order: four district soldiers, then the eight standard townsfolk; no lord sprites.

Lore references: *The Silmarillion*, chapters 14 and 20. Cross-check: https://tolkiengateway.net/wiki/Eglarest and https://tolkiengateway.net/wiki/Barad_Nimras.

## World map integration

The shared world file already contains the Eglarest place at `(236,546)` in Beleriand. Once the city is published, add `eglarest: "<published artifact URL>"` to `CITY_URL` and `city:"eglarest"` to that existing place, then republish the world map. The city already links back to the published map's Beleriand tab.

Shared engine, styles, world map, libraries and other city files were left untouched to avoid conflicts with concurrent work.

## Validation

- JavaScript syntax check and Python build passed (12 assembled sprites).
- Rendered in headless Chrome at 1600 x 1000 with SwiftShader; saved `preview.png`.
- Search for Barad Nimras and opening its lore card passed.
- Build persistence and publishing require the hosting environment and were not verified locally.
