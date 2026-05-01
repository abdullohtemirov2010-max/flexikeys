import React, { useEffect, useState } from 'react';
import worldSvgUrl from '@/assets/world-map.svg?url';
import flagUz from '@/assets/flags/uz.svg';
import flagTr from '@/assets/flags/tr.svg';
import flagEg from '@/assets/flags/eg.svg';
import flagKe from '@/assets/flags/ke.svg';
import flagIn from '@/assets/flags/in.svg';
import flagJp from '@/assets/flags/jp.svg';
import flagAu from '@/assets/flags/au.svg';
import flagBr from '@/assets/flags/br.svg';
import flagUs from '@/assets/flags/us.svg';

const FLAGS: Record<string, string> = {
  uz: flagUz, tr: flagTr, eg: flagEg, ke: flagKe, in: flagIn,
  jp: flagJp, au: flagAu, br: flagBr, us: flagUs,
};

interface Props {
  /** ISO codes (lowercase) to paint with their flag */
  highlighted: string[];
  className?: string;
}

/**
 * Geographically accurate world map. Loads the prebuilt SVG, then rewrites
 * highlighted countries' fill to a flag <pattern>.
 */
const WorldMapSVG: React.FC<Props> = ({ highlighted, className }) => {
  const [svgText, setSvgText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(worldSvgUrl)
      .then(r => r.text())
      .then(t => { if (!cancelled) setSvgText(t); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!svgText) {
    return (
      <div className={`flex items-center justify-center bg-sky-50 ${className ?? ''}`}>
        <span className="text-sm text-muted-foreground">Loading map…</span>
      </div>
    );
  }

  // Inject <defs> with flag patterns, then add per-country fill rules.
  const defs = highlighted
    .filter(iso => FLAGS[iso])
    .map(iso => `
      <pattern id="flag-${iso}" patternContentUnits="objectBoundingBox" width="1" height="1">
        <image href="${FLAGS[iso]}" width="1" height="1" preserveAspectRatio="xMidYMid slice"/>
      </pattern>`)
    .join('');

  const styles = highlighted
    .filter(iso => FLAGS[iso])
    .map(iso => `.iso-${iso}{fill:url(#flag-${iso});stroke:#0f172a;stroke-width:.7}`)
    .join('');

  // Insert defs + extra styles right after the opening <svg ...>
  const enriched = svgText.replace(
    /<svg([^>]*)>/,
    `<svg$1><defs>${defs}</defs><style>${styles}</style>`,
  );

  return (
    <div
      className={className}
      // Inline SVG — safe: built at dev time from trusted Natural Earth data.
      dangerouslySetInnerHTML={{ __html: enriched }}
    />
  );
};

export default WorldMapSVG;
