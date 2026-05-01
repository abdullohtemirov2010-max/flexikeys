## Goal

1. A real, geographically accurate world map (not a stylized PNG) where each of the 10 stage countries is filled with its own flag pattern.
2. Pins placed at the correct latitude/longitude of each country (Uzbekistan, Turkey, Egypt, Kenya, India, Japan, Australia, Brazil, USA, plus a "World" trophy at the top).
3. Replace the current "3D bot-looking" location indicator with a clean, flat map marker styled like a real map pin (small circle + tail + flag chip).
4. Fix the alphabet pronunciation so every letter (especially A, E, I, O, U) is spoken correctly across browsers/voices.

---

## 1. Real World Map (geographically accurate)

**Approach:** Use an inline SVG world map based on a standard equirectangular projection (Natural Earth admin-0 simplified, ~50KB). Each `<path>` carries an `id` like `country-UZ`. We render it as an SVG component so we can:
- fill specific countries with their flag image via `<pattern>` + `<image>` defs
- keep all other countries in a soft neutral land color (so the painted countries pop)
- overlay pins at exact `[longitude, latitude]` projected to SVG coordinates

**New files:**
- `src/assets/world-map.svg` — Natural Earth simplified world map with ISO country IDs
- `src/assets/flags/` — 10 small flag PNGs/SVGs (uz, tr, eg, ke, in, jp, au, br, us, + a globe for stage 10)
- `src/components/WorldMapSVG.tsx` — renders the SVG, accepts `highlighted: { iso, flagUrl }[]` and paints those countries with `<pattern patternUnits="objectBoundingBox">` referencing the flag image
- `src/lib/geo.ts` — exports the lon/lat for each stage country and a `project(lon, lat)` helper for the equirectangular SVG viewBox

**Stage coordinates (real-world):**
```
1  Uzbekistan      64.59°E, 41.38°N
2  Turkey          35.24°E, 38.96°N
3  Egypt           30.80°E, 26.82°N
4  Kenya           37.91°E,  0.02°S
5  India           78.96°E, 20.59°N
6  Japan          138.25°E, 36.20°N
7  Australia      133.77°E,-25.27°N
8  Brazil         -51.92°E,-14.24°N
9  United States  -98.58°E, 39.83°N
10 World Champion (centered above the map, not on a country)
```

## 2. Rework `StageScreen.tsx`

- Remove the `<img src={worldMap}>` background.
- Render `<WorldMapSVG highlighted={...} />` filling the map area.
- Pins are now absolutely positioned using the `project(lon, lat)` helper so they sit exactly on the painted country.
- Replace the current pin (chip + stem + dot, the "3D bot" look) with a flat map-marker:
  - small circular flag badge (24px, white border, soft shadow)
  - 1px tail down to a 6px dot anchored at the geo coordinate
  - current stage gets a subtle pulsing ring (no bouncing emoji)
- Keep the curriculum list below the map unchanged.

## 3. Pronunciation fix (every letter verified)

The current bug ("A sounds like I") is caused by some TTS voices interpreting `"ay"` as the word "eye". Fix:

- Switch from ad-hoc spellings to SSML where supported, and to a curated per-letter phrase otherwise.
- New `letterPhonetic` map uses **distinctive carrier words** that force the correct vowel sound on every voice:
  ```
  A → "the letter A, as in apple"
  E → "the letter E, as in egg"
  I → "the letter I, as in igloo"
  O → "the letter O, as in orange"
  U → "the letter U, as in umbrella"
  ```
  and for consonants `"the letter B"` etc. The "as in" anchor prevents Google/Apple voices from collapsing A→eye or E→I.
- Add a hidden dev helper page (only mounted when `?voicecheck=1`) that plays A–Z in sequence so we can audibly QA each one, then remove or hide it.
- Lower default rate to 0.72 for the letter call so the carrier sentence stays clear.
- Keep `userRate`/`userVolume` overrides intact.

## 4. Files changed

```
edited   src/components/screens/StageScreen.tsx
created  src/components/WorldMapSVG.tsx
created  src/lib/geo.ts
created  src/assets/world-map.svg
created  src/assets/flags/{uz,tr,eg,ke,in,jp,au,br,us,world}.svg
edited   src/lib/voiceFeedback.ts
edited   src/styles.css        (flat pin styles + map land color)
```

## 5. Out of scope (ask before doing)

- Replacing the Earth intro globe — keeping current intro.
- Adding click-to-zoom on the map — current scroll/responsive layout stays.

## Technical notes

- The SVG map uses `viewBox="0 0 1000 500"` with equirectangular projection: `x = (lon + 180) / 360 * 1000`, `y = (90 - lat) / 180 * 500`. Pins use the same formula so they always align with the painted country.
- Flag fills use `<pattern id="flag-uz" patternContentUnits="objectBoundingBox" width="1" height="1"><image href="..." width="1" height="1" preserveAspectRatio="xMidYMid slice"/></pattern>` and the country path gets `fill="url(#flag-uz)"`.
- For the alphabet fix, we cannot rely on SSML across all browsers, so the carrier-phrase approach is the portable fix; SSML is added as a progressive enhancement when `speechSynthesis` reports an SSML-capable voice.
