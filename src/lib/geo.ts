// Equirectangular projection for our SVG world map (viewBox 1000x500).
export const MAP_W = 1000;
export const MAP_H = 500;

export function project(lon: number, lat: number): { x: number; y: number } {
  return {
    x: ((lon + 180) / 360) * MAP_W,
    y: ((90 - lat) / 180) * MAP_H,
  };
}

export interface StageGeo {
  iso: string;          // ISO 3166-1 alpha-2 lowercase
  country: string;
  lon: number;
  lat: number;
}

// Stage 10 is "World Champion" — anchored over the Atlantic / North Pole as a trophy.
export const STAGE_GEO: Record<number, StageGeo> = {
  1:  { iso: 'uz', country: 'Uzbekistan',     lon:  64.59, lat:  41.38 },
  2:  { iso: 'tr', country: 'Turkey',         lon:  35.24, lat:  38.96 },
  3:  { iso: 'eg', country: 'Egypt',          lon:  30.80, lat:  26.82 },
  4:  { iso: 'ke', country: 'Kenya',          lon:  37.91, lat:   0.02 },
  5:  { iso: 'in', country: 'India',          lon:  78.96, lat:  20.59 },
  6:  { iso: 'jp', country: 'Japan',          lon: 138.25, lat:  36.20 },
  7:  { iso: 'au', country: 'Australia',      lon: 133.77, lat: -25.27 },
  8:  { iso: 'br', country: 'Brazil',         lon: -51.92, lat: -14.24 },
  9:  { iso: 'us', country: 'United States',  lon: -98.58, lat:  39.83 },
  10: { iso: 'world', country: 'World Champion', lon: 0, lat: 70 },
};
