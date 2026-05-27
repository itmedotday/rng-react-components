/** Symmetric icosahedron face-on projection (hex + 10 triangles). */

export const D20_VIEWBOX = { width: 200, height: 200 } as const;

const CX = 100;
const CY = 100;
const R = 88;
const HEX_R = (R * Math.sqrt(3)) / 2;

/** Flat-top regular hexagon, clockwise from top. */
export const D20_HEX = {
  top: { x: CX, y: CY - R },
  tr: { x: CX + HEX_R, y: CY - R / 2 },
  br: { x: CX + HEX_R, y: CY + R / 2 },
  bottom: { x: CX, y: CY + R },
  bl: { x: CX - HEX_R, y: CY + R / 2 },
  tl: { x: CX - HEX_R, y: CY - R / 2 },
} as const;

/** Central top face (equilateral, point-up); centroid at (100, 100). */
export const D20_CENTER = {
  top: { x: CX, y: 65 },
  bl: { x: 58, y: 118 },
  br: { x: 142, y: 118 },
} as const;

export const D20_TEXT_ANCHOR = {
  x: CX,
  y: (D20_CENTER.top.y + D20_CENTER.bl.y + D20_CENTER.br.y) / 3,
} as const;

export const D20_CENTER_TRIANGLE = `M ${D20_CENTER.top.x} ${D20_CENTER.top.y} L ${D20_CENTER.bl.x} ${D20_CENTER.bl.y} L ${D20_CENTER.br.x} ${D20_CENTER.br.y} Z`;

export const D20_HEX_OUTLINE = `M ${D20_HEX.top.x} ${D20_HEX.top.y} L ${D20_HEX.tr.x} ${D20_HEX.tr.y} L ${D20_HEX.br.x} ${D20_HEX.br.y} L ${D20_HEX.bottom.x} ${D20_HEX.bottom.y} L ${D20_HEX.bl.x} ${D20_HEX.bl.y} L ${D20_HEX.tl.x} ${D20_HEX.tl.y} Z`;

export type D20FacetGradientKey =
  | 'center'
  | 'innerLeft'
  | 'innerRight'
  | 'innerBottom'
  | 'outerTopLeft'
  | 'outerTopRight'
  | 'outerRightUpper'
  | 'outerRightLower'
  | 'outerLeftLower'
  | 'outerLeftUpper';

export interface D20FacetPath {
  id: string;
  d: string;
  gradient: D20FacetGradientKey;
}

const { top: Ht, tr: Htr, br: Hbr, bottom: Hb, bl: Hbl, tl: Htl } = D20_HEX;
const { top: Ct, bl: Cbl, br: Cbr } = D20_CENTER;

/** 1 center + 3 inner + 6 outer = 10 visible facets. */
export const D20_FACET_PATHS: D20FacetPath[] = [
  { id: 'center', d: `M ${Ct.x} ${Ct.y} L ${Cbl.x} ${Cbl.y} L ${Cbr.x} ${Cbr.y} Z`, gradient: 'center' },
  { id: 'innerLeft', d: `M ${Ct.x} ${Ct.y} L ${Cbl.x} ${Cbl.y} L ${Htl.x} ${Htl.y} Z`, gradient: 'innerLeft' },
  { id: 'innerRight', d: `M ${Ct.x} ${Ct.y} L ${Cbr.x} ${Cbr.y} L ${Htr.x} ${Htr.y} Z`, gradient: 'innerRight' },
  { id: 'innerBottom', d: `M ${Cbl.x} ${Cbl.y} L ${Cbr.x} ${Cbr.y} L ${Hb.x} ${Hb.y} Z`, gradient: 'innerBottom' },
  { id: 'outerTopLeft', d: `M ${Ct.x} ${Ct.y} L ${Htl.x} ${Htl.y} L ${Ht.x} ${Ht.y} Z`, gradient: 'outerTopLeft' },
  { id: 'outerTopRight', d: `M ${Ct.x} ${Ct.y} L ${Ht.x} ${Ht.y} L ${Htr.x} ${Htr.y} Z`, gradient: 'outerTopRight' },
  { id: 'outerRightUpper', d: `M ${Cbr.x} ${Cbr.y} L ${Htr.x} ${Htr.y} L ${Hbr.x} ${Hbr.y} Z`, gradient: 'outerRightUpper' },
  { id: 'outerRightLower', d: `M ${Cbr.x} ${Cbr.y} L ${Hbr.x} ${Hbr.y} L ${Hb.x} ${Hb.y} Z`, gradient: 'outerRightLower' },
  { id: 'outerLeftLower', d: `M ${Cbl.x} ${Cbl.y} L ${Hb.x} ${Hb.y} L ${Hbl.x} ${Hbl.y} Z`, gradient: 'outerLeftLower' },
  { id: 'outerLeftUpper', d: `M ${Cbl.x} ${Cbl.y} L ${Hbl.x} ${Hbl.y} L ${Htl.x} ${Htl.y} Z`, gradient: 'outerLeftUpper' },
];

/** Hex clip-path for CSS depth layers (percent coords). */
export const D20_HEX_CLIP_PATH = `polygon(
  ${((D20_HEX.top.x / 200) * 100).toFixed(2)}% ${((D20_HEX.top.y / 200) * 100).toFixed(2)}%,
  ${((D20_HEX.tr.x / 200) * 100).toFixed(2)}% ${((D20_HEX.tr.y / 200) * 100).toFixed(2)}%,
  ${((D20_HEX.br.x / 200) * 100).toFixed(2)}% ${((D20_HEX.br.y / 200) * 100).toFixed(2)}%,
  ${((D20_HEX.bottom.x / 200) * 100).toFixed(2)}% ${((D20_HEX.bottom.y / 200) * 100).toFixed(2)}%,
  ${((D20_HEX.bl.x / 200) * 100).toFixed(2)}% ${((D20_HEX.bl.y / 200) * 100).toFixed(2)}%,
  ${((D20_HEX.tl.x / 200) * 100).toFixed(2)}% ${((D20_HEX.tl.y / 200) * 100).toFixed(2)}%
)`;

export const LANDING_ROTATION = { rotateX: 0, rotateY: 0, rotateZ: 0 } as const;

const GRADIENT_DEFS: Record<D20FacetGradientKey, { stops: [string, string] }> = {
  center: { stops: ['#ddd6fe', '#8b5cf6'] },
  innerLeft: { stops: ['#a78bfa', '#5b21b6'] },
  innerRight: { stops: ['#c4b5fd', '#6d28d9'] },
  innerBottom: { stops: ['#9333ea', '#4c1d95'] },
  outerTopLeft: { stops: ['#b794f6', '#6d28d9'] },
  outerTopRight: { stops: ['#c4b5fd', '#7c3aed'] },
  outerRightUpper: { stops: ['#a855f7', '#581c87'] },
  outerRightLower: { stops: ['#7c3aed', '#312e81'] },
  outerLeftLower: { stops: ['#7c3aed', '#312e81'] },
  outerLeftUpper: { stops: ['#a78bfa', '#5b21b6'] },
};

/** Static SVG markup for bundled assets (src/assets, public). */
export function buildD20SvgMarkup(): string {
  const gradientXml = (Object.keys(GRADIENT_DEFS) as D20FacetGradientKey[])
    .map(
      (key) =>
        `<linearGradient id="g-${key}" x1="0%" y1="0%" x2="100%" y2="100%"><stop stop-color="${GRADIENT_DEFS[key].stops[0]}"/><stop offset="1" stop-color="${GRADIENT_DEFS[key].stops[1]}"/></linearGradient>`,
    )
    .join('');

  const facetsXml = D20_FACET_PATHS.map(
    (f) =>
      `<path d="${f.d}" fill="url(#g-${f.gradient})" stroke="#5b21b6" stroke-width="1.2" stroke-linejoin="round"/>`,
  ).join('');

  return `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>${gradientXml}</defs>
  <g>${facetsXml}</g>
  <path d="${D20_HEX_OUTLINE}" fill="none" stroke="#c4b5fd" stroke-width="1.5" stroke-linejoin="round" opacity="0.35"/>
</svg>`;
}

export const D20_GRADIENT_STOPS = GRADIENT_DEFS;
