import React, { useEffect, useState, useMemo } from 'react';
import worldSvgUrl from '@/assets/world-map.svg?url';

interface Props {
  /** ISO codes (lowercase) to emphasize with a thicker border / ring */
  highlighted?: string[];
  className?: string;
}

/**
 * Geographically accurate world map with EVERY country filled by its national flag.
 * Flag images come from flagcdn.com (free, CDN-hosted, ~3KB each) so we don't
 * have to bundle ~195 SVGs into the app.
 */
const WorldMapSVG: React.FC<Props> = ({ highlighted = [], className }) => {
  const [svgText, setSvgText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(worldSvgUrl)
      .then(r => r.text())
      .then(t => { if (!cancelled) setSvgText(t); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const enriched = useMemo(() => {
    if (!svgText) return null;

    // Collect every iso code present in the svg
    const isoSet = new Set<string>();
    const re = /data-iso="([a-z]{2})"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(svgText)) !== null) isoSet.add(m[1]);

    const isos = [...isoSet];

    const defs = isos
      .map(
        iso => `
      <pattern id="flag-${iso}" patternContentUnits="objectBoundingBox" width="1" height="1">
        <image href="https://flagcdn.com/w160/${iso}.png" width="1" height="1" preserveAspectRatio="xMidYMid slice"/>
      </pattern>`,
      )
      .join('');

    const baseStyle = `
      .c{stroke:#0f172a;stroke-width:.25;opacity:.95}
      ${isos
        .map(
          iso =>
            `.iso-${iso}{fill:url(#flag-${iso})}`,
        )
        .join('')}
      ${highlighted
        .map(
          iso =>
            `.iso-${iso}{stroke:#0b1220;stroke-width:.7;filter:drop-shadow(0 0 .8px rgba(0,0,0,.5))}`,
        )
        .join('')}
    `;

    return svgText.replace(
      /<svg([^>]*)>([\s\S]*?<style>)([\s\S]*?)(<\/style>)/,
      `<svg$1><defs>${defs}</defs>$2$3${baseStyle}$4`,
    );
  }, [svgText, highlighted.join(',')]);

  if (!enriched) {
    return (
      <div className={`flex items-center justify-center bg-sky-50 ${className ?? ''}`}>
        <span className="text-sm text-muted-foreground">Loading map…</span>
      </div>
    );
  }

  return (
    <div
      className={className}
      // Inline SVG built at dev time from trusted Natural Earth data.
      dangerouslySetInnerHTML={{ __html: enriched }}
    />
  );
};

export default WorldMapSVG;
