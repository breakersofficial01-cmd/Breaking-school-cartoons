// Breaking School cartoon characters: three schoolboys (white shirt, blue half pant).
// Each character is built from named parts so it can be rigged for animation later.

const INK = '#1b1b1b';
const SW = 5; // outline width

function boy(p) {
  const {
    x, skin, skinShade, headRx, headRy, torsoW, torsoH, shortsH, legL, legW,
    hair, glasses = false, eyeR = 22, mouth = 'grin', brows = 'normal', belly = 0,
    bag = false, untucked = false, cheeks = false,
  } = p;
  const s = [];
  const shoeH = 20, sockH = 34;
  const legTop = -(shoeH + sockH + legL);
  const shortsBottom = legTop + 6;
  const shortsTop = shortsBottom - shortsH;
  const shirtBottom = shortsTop + (untucked ? 26 : 12);
  const shirtTop = shirtBottom - torsoH;
  const hw = torsoW / 2;
  const headCy = shirtTop - headRy * 0.82;
  const legGap = Math.max(10, torsoW * 0.12);

  s.push(`<g transform="translate(${x},0)">`);
  s.push(`<ellipse cx="0" cy="4" rx="${hw + 40}" ry="14" fill="#000" opacity="0.12"/>`);

  // ---- legs ----
  for (const side of [-1, 1]) {
    const lx = side * (legGap / 2 + legW / 2);
    s.push(`<g id="leg-${side < 0 ? 'l' : 'r'}">`);
    s.push(`<rect x="${lx - legW / 2}" y="${legTop}" width="${legW}" height="${legL + 4}" rx="${legW / 2.4}" fill="${skin}" stroke="${INK}" stroke-width="${SW}"/>`);
    s.push(`<rect x="${lx - legW / 2 - 2}" y="${-(shoeH + sockH)}" width="${legW + 4}" height="${sockH + 6}" rx="6" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>`);
    s.push(`<line x1="${lx - legW / 2 + 2}" y1="${-(shoeH + sockH) + 9}" x2="${lx + legW / 2 - 2}" y2="${-(shoeH + sockH) + 9}" stroke="#2f55b8" stroke-width="4"/>`);
    const toe = side * 22;
    s.push(`<path d="M ${lx - legW / 2 - 8 + Math.min(0, toe)} 0 Q ${lx - legW / 2 - 10 + Math.min(0, toe)} ${-shoeH - 4} ${lx} ${-shoeH - 4} Q ${lx + legW / 2 + 10 + Math.max(0, toe)} ${-shoeH - 2} ${lx + legW / 2 + 12 + Math.max(0, toe)} 0 Z" fill="#222" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`);
    s.push(`<path d="M ${lx - 6} ${-shoeH + 2} q 8 -6 16 0" fill="none" stroke="#666" stroke-width="3"/>`);
    s.push(`</g>`);
  }

  // ---- shorts (blue half pant) ----
  const sw2 = hw + 4 + belly * 0.4;
  s.push(`<g id="shorts">`);
  s.push(`<path d="M ${-sw2} ${shortsTop} L ${sw2} ${shortsTop} L ${sw2 + 10} ${shortsBottom} L ${legGap / 2} ${shortsBottom} L 0 ${shortsTop + shortsH * 0.45} L ${-legGap / 2} ${shortsBottom} L ${-sw2 - 10} ${shortsBottom} Z" fill="#2350B8" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`);
  s.push(`<path d="M ${sw2 - 8} ${shortsTop + 10} L ${sw2 + 2} ${shortsBottom - 6}" stroke="#163a8c" stroke-width="5" fill="none"/>`);
  s.push(`<path d="M ${-sw2 + 8} ${shortsTop + 10} L ${-sw2 - 2} ${shortsBottom - 6}" stroke="#163a8c" stroke-width="5" fill="none"/>`);
  if (!untucked) {
    s.push(`<rect x="${-sw2}" y="${shortsTop - 2}" width="${sw2 * 2}" height="14" fill="#151515" stroke="${INK}" stroke-width="3"/>`);
    s.push(`<rect x="-12" y="${shortsTop - 4}" width="24" height="18" rx="3" fill="#C9A227" stroke="${INK}" stroke-width="3"/>`);
  }
  s.push(`</g>`);

  // ---- torso / white shirt ----
  const bw = hw + belly;
  s.push(`<g id="torso">`);
  s.push(`<path d="M ${-hw + 4} ${shirtTop + 8} Q ${-hw - 6} ${shirtTop + torsoH * 0.5} ${-bw} ${shirtBottom} L ${bw} ${shirtBottom} Q ${hw + 6} ${shirtTop + torsoH * 0.5} ${hw - 4} ${shirtTop + 8} Q 0 ${shirtTop - 8} ${-hw + 4} ${shirtTop + 8} Z" fill="#fff" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`);
  s.push(`<path d="M ${bw - 26} ${shirtTop + 30} Q ${bw - 4} ${shirtTop + torsoH * 0.6} ${bw - 6} ${shirtBottom - 4} L ${bw - 22} ${shirtBottom - 4} Z" fill="#DDE4EE"/>`);
  if (untucked) s.push(`<path d="M ${-bw + 6} ${shirtBottom - 2} q 18 -8 30 2" fill="none" stroke="#c6cfdc" stroke-width="4"/>`);
  s.push(`<line x1="0" y1="${shirtTop + 22}" x2="0" y2="${shirtBottom - 4}" stroke="#c6cfdc" stroke-width="3"/>`);
  for (let i = 0; i < 3; i++) s.push(`<circle cx="0" cy="${shirtTop + 36 + i * (torsoH - 50) / 3}" r="4" fill="#fff" stroke="#8a95a5" stroke-width="2"/>`);
  const px = -hw * 0.55;
  s.push(`<rect x="${px - 20}" y="${shirtTop + 34}" width="40" height="40" rx="4" fill="#fff" stroke="#9aa5b5" stroke-width="3"/>`);
  s.push(`<path d="M ${px - 12} ${shirtTop + 40} h 24 v 14 q 0 12 -12 16 q -12 -4 -12 -16 Z" fill="#B3261E" stroke="${INK}" stroke-width="2.5"/>`);
  s.push(`<text x="${px}" y="${shirtTop + 57}" font-family="Arial Black, Arial" font-weight="900" font-size="12" fill="#fff" text-anchor="middle">B</text>`);
  s.push(`<path d="M -26 ${shirtTop + 2} L 0 ${shirtTop + 26} L -6 ${shirtTop + 34} L -34 ${shirtTop + 14} Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`);
  s.push(`<path d="M 26 ${shirtTop + 2} L 0 ${shirtTop + 26} L 6 ${shirtTop + 34} L 34 ${shirtTop + 14} Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`);
  s.push(`</g>`);

  if (bag) {
    s.push(`<path d="M ${hw - 30} ${shirtTop + 4} L ${-hw + 14} ${shirtBottom - 6}" stroke="${INK}" stroke-width="18" stroke-linecap="round"/>`);
    s.push(`<path d="M ${hw - 30} ${shirtTop + 4} L ${-hw + 14} ${shirtBottom - 6}" stroke="#8B4A22" stroke-width="10" stroke-linecap="round"/>`);
  }

  // ---- arms ----
  const armL = torsoH * 0.9;
  for (const side of [-1, 1]) {
    const ax = side * (hw + 12 + belly * 0.5);
    const tilt = -side * 7;
    s.push(`<g id="arm-${side < 0 ? 'l' : 'r'}" transform="rotate(${tilt} ${ax} ${shirtTop + 14})">`);
    s.push(`<rect x="${ax - 12}" y="${shirtTop + 30}" width="24" height="${armL}" rx="12" fill="${skin}" stroke="${INK}" stroke-width="${SW}"/>`);
    s.push(`<circle cx="${ax}" cy="${shirtTop + 30 + armL}" r="16" fill="${skin}" stroke="${INK}" stroke-width="${SW}"/>`);
    s.push(`<path d="M ${ax - 22} ${shirtTop + 8} Q ${ax} ${shirtTop - 4} ${ax + 22} ${shirtTop + 8} L ${ax + 24} ${shirtTop + 62} Q ${ax} ${shirtTop + 70} ${ax - 24} ${shirtTop + 62} Z" fill="#fff" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`);
    s.push(`</g>`);
  }

  // ---- neck ----
  s.push(`<rect x="-14" y="${shirtTop - 14}" width="28" height="26" fill="${skinShade}" stroke="${INK}" stroke-width="4"/>`);

  // ---- head ----
  s.push(`<g id="head" transform="translate(0,${headCy})">`);
  for (const side of [-1, 1]) {
    s.push(`<ellipse cx="${side * (headRx - 2)}" cy="6" rx="13" ry="18" fill="${skin}" stroke="${INK}" stroke-width="${SW}"/>`);
    s.push(`<path d="M ${side * (headRx - 2)} -2 q ${side * 6} 8 0 16" fill="none" stroke="${skinShade}" stroke-width="4"/>`);
  }
  s.push(`<ellipse cx="0" cy="0" rx="${headRx}" ry="${headRy}" fill="${skin}" stroke="${INK}" stroke-width="${SW}"/>`);
  if (cheeks) {
    s.push(`<ellipse cx="${-headRx * 0.55}" cy="${headRy * 0.32}" rx="16" ry="9" fill="#E0735A" opacity="0.45"/>`);
    s.push(`<ellipse cx="${headRx * 0.55}" cy="${headRy * 0.32}" rx="16" ry="9" fill="#E0735A" opacity="0.45"/>`);
  }
  s.push(hair(headRx, headRy));
  const ey = -headRy * 0.05, ex = headRx * 0.36;
  s.push(`<g id="eyes">`);
  for (const side of [-1, 1]) {
    s.push(`<ellipse cx="${side * ex}" cy="${ey}" rx="${eyeR}" ry="${eyeR * 1.15}" fill="#fff" stroke="${INK}" stroke-width="4"/>`);
    s.push(`<circle cx="${side * ex + 4}" cy="${ey + 4}" r="${eyeR * 0.42}" fill="${INK}"/>`);
    s.push(`<circle cx="${side * ex + 7}" cy="${ey}" r="${eyeR * 0.13}" fill="#fff"/>`);
  }
  s.push(`</g>`);
  if (glasses) {
    s.push(`<g id="glasses" fill="none" stroke="${INK}" stroke-width="5">`);
    for (const side of [-1, 1]) s.push(`<rect x="${side * ex - eyeR - 8}" y="${ey - eyeR - 8}" width="${eyeR * 2 + 16}" height="${eyeR * 2.3 + 12}" rx="12" fill="#bfe3ff" fill-opacity="0.25"/>`);
    s.push(`<path d="M ${-ex + eyeR + 8} ${ey - 2} q ${ex - eyeR - 8} -8 ${2 * (ex - eyeR - 8)} 0"/>`);
    s.push(`<line x1="${-ex - eyeR - 8}" y1="${ey - 6}" x2="${-headRx + 4}" y2="${ey - 10}"/><line x1="${ex + eyeR + 8}" y1="${ey - 6}" x2="${headRx - 4}" y2="${ey - 10}"/>`);
    s.push(`</g>`);
  }
  const by = ey - eyeR * 1.35 - (glasses ? 10 : 0);
  if (brows === 'raised') {
    s.push(`<path d="M ${-ex - 16} ${by} q 16 -14 32 -2" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`);
    s.push(`<path d="M ${ex - 16} ${by - 6} q 16 -8 32 4" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`);
  } else if (brows === 'thick') {
    s.push(`<path d="M ${-ex - 18} ${by + 2} L ${-ex + 16} ${by - 4}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`);
    s.push(`<path d="M ${ex - 16} ${by - 4} L ${ex + 18} ${by + 2}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`);
  } else {
    s.push(`<path d="M ${-ex - 14} ${by} q 14 -8 28 0" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`);
    s.push(`<path d="M ${ex - 14} ${by} q 14 -8 28 0" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`);
  }
  s.push(`<path d="M 2 ${headRy * 0.12} q 10 10 -2 16" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`);
  const my = headRy * 0.48;
  if (mouth === 'grin') {
    s.push(`<path d="M -34 ${my - 6} Q 0 ${my + 34} 34 ${my - 6} Z" fill="#5a1717" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`);
    s.push(`<path d="M -28 ${my - 3} L 28 ${my - 3} L 24 ${my + 6} L -24 ${my + 6} Z" fill="#fff"/>`);
    s.push(`<path d="M -12 ${my + 18} q 12 -8 24 0 q -12 8 -24 0" fill="#e2625a"/>`);
  } else if (mouth === 'smirk') {
    s.push(`<path d="M -20 ${my + 4} Q 6 ${my + 12} 24 ${my - 6}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`);
  } else if (mouth === 'open') {
    s.push(`<ellipse cx="0" cy="${my + 4}" rx="20" ry="16" fill="#5a1717" stroke="${INK}" stroke-width="4"/>`);
    s.push(`<path d="M -12 ${my + 12} q 12 -8 24 0 q -12 7 -24 0" fill="#e2625a"/>`);
  }
  s.push(`</g>`);
  s.push(`</g>`);
  return s.join('\n');
}

// ---- hair styles ----
const spiky = (rx, ry) => {
  const pts = [];
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (i / n) * Math.PI;
    const r = i % 2 === 0 ? 1.0 : 1.26;
    pts.push([Math.cos(a) * rx * r * 1.04, Math.sin(a) * ry * r * 1.0 - ry * 0.08]);
  }
  const top = pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L ');
  return `<path d="M ${-rx - 4} ${-ry * 0.05} L ${top} L ${rx + 4} ${-ry * 0.05} Q ${rx * 0.4} ${-ry * 0.5} 0 ${-ry * 0.42} Q ${-rx * 0.5} ${-ry * 0.5} ${-rx - 4} ${-ry * 0.05} Z" fill="#141414" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
};
const bowl = (rx, ry) =>
  `<path d="M ${-rx - 6} ${-ry * 0.02} Q ${-rx - 10} ${-ry * 1.18} 0 ${-ry * 1.12} Q ${rx + 10} ${-ry * 1.18} ${rx + 6} ${-ry * 0.02} L ${rx * 0.75} ${-ry * 0.3} L ${rx * 0.45} ${-ry * 0.36} L ${rx * 0.15} ${-ry * 0.3} L ${-rx * 0.15} ${-ry * 0.36} L ${-rx * 0.45} ${-ry * 0.3} L ${-rx * 0.75} ${-ry * 0.36} Z" fill="#141414" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
   <path d="M ${-rx * 0.4} ${-ry * 0.9} q 30 -16 60 -6" fill="none" stroke="#444" stroke-width="5" stroke-linecap="round"/>`;
const sidePart = (rx, ry) =>
  `<path d="M ${-rx - 6} ${ry * 0.05} Q ${-rx - 14} ${-ry * 1.2} ${rx * 0.1} ${-ry * 1.14} Q ${rx + 18} ${-ry * 1.05} ${rx + 6} ${ry * 0.0} Q ${rx * 0.8} ${-ry * 0.55} ${rx * 0.25} ${-ry * 0.6} Q ${-rx * 0.2} ${-ry * 0.68} ${-rx * 0.35} ${-ry * 0.45} Q ${-rx * 0.6} ${-ry * 0.55} ${-rx - 6} ${ry * 0.05} Z" fill="#141414" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
   <path d="M ${-rx * 0.35} ${-ry * 0.95} Q ${-rx * 0.3} ${-ry * 0.7} ${-rx * 0.35} ${-ry * 0.47}" fill="none" stroke="#555" stroke-width="4"/>
   <path d="M ${rx * 0.0} ${-ry * 1.0} q 40 -6 70 30" fill="none" stroke="#444" stroke-width="5" stroke-linecap="round"/>`;

const W = 1500, H = 1000;
const chars = [
  { name: 'A', title: 'The Prankster', tag: 'Tall, skinny, spiky hair, never studies',
    x: 260, skin: '#C98B5B', skinShade: '#A86F44', headRx: 92, headRy: 104, torsoW: 128, torsoH: 168, shortsH: 92, legL: 150, legW: 30,
    hair: spiky, mouth: 'grin', brows: 'raised', untucked: true, eyeR: 24 },
  { name: 'B', title: 'The Foodie', tag: 'Short, chubby, bowl cut, always hungry',
    x: 750, skin: '#B9784A', skinShade: '#955D35', headRx: 112, headRy: 104, torsoW: 170, torsoH: 150, shortsH: 92, legL: 92, legW: 38,
    hair: bowl, mouth: 'open', brows: 'normal', belly: 22, cheeks: true, eyeR: 20 },
  { name: 'C', title: 'The Topper', tag: 'Neat, glasses, side parting, knows everything',
    x: 1240, skin: '#D49A69', skinShade: '#B27A4C', headRx: 94, headRy: 108, torsoW: 140, torsoH: 162, shortsH: 92, legL: 128, legW: 30,
    hair: sidePart, mouth: 'smirk', brows: 'thick', glasses: true, bag: true, eyeR: 21 },
];

const groundY = 830;
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6C9A6"/><stop offset="1" stop-color="#F3E3C3"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect y="${groundY}" width="${W}" height="${H - groundY}" fill="#D9B98A"/>
<line x1="0" y1="${groundY}" x2="${W}" y2="${groundY}" stroke="${INK}" stroke-width="4"/>
<text x="${W / 2}" y="70" font-family="Arial Black, Arial" font-weight="900" font-size="44" text-anchor="middle" fill="${INK}">BREAKING SCHOOL <tspan fill="#E8541E">CHARACTERS</tspan></text>`;
for (const c of chars) {
  svg += `<g transform="translate(0,${groundY})">` + boy(c) + `</g>`;
  svg += `<g font-family="Arial, sans-serif" text-anchor="middle">
    <circle cx="${c.x}" cy="${groundY + 52}" r="26" fill="#E8541E" stroke="${INK}" stroke-width="4"/>
    <text x="${c.x}" y="${groundY + 63}" font-size="30" font-weight="900" fill="#fff">${c.name}</text>
    <text x="${c.x}" y="${groundY + 118}" font-size="30" font-weight="800" fill="${INK}">${c.title}</text>
    <text x="${c.x}" y="${groundY + 152}" font-size="20" fill="#333">${c.tag}</text></g>`;
}
svg += `</svg>`;

require('fs').writeFileSync(__dirname + '/characters.svg', svg);
console.log('ok');
