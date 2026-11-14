// 공유용 이미지(public/og.png, 1200x630)를 만든다.  실행: npm run og
// 문구나 색을 바꾸고 싶을 때만 다시 실행하면 된다.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const W = 1200;
const H = 630;
let grid = '';
for (let x = 40; x < W; x += 40) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
for (let y = 30; y < H; y += 40) grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;


const mono = 'JetBrains Mono, Consolas, monospace';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f8f9ff"/>
  <g stroke="#0b1c30" stroke-opacity="0.05" stroke-width="1">${grid}</g>
  <rect x="80" y="90" width="92" height="92" rx="14" fill="#131b2e"/>
  <text x="126" y="153" text-anchor="middle" font-family="${mono}" font-size="44" font-weight="700"><tspan fill="#8fb4ff">A</tspan><tspan fill="#34d399">C</tspan></text>
  <text x="80" y="330" font-family="${mono}" font-size="92" font-weight="700" fill="#0b1c30" letter-spacing="4">AI CRAFT LOG</text>
  <text x="84" y="400" font-family="${mono}" font-size="34" fill="#047857">&gt; We create value with AI.</text>
  <text x="84" y="540" font-family="${mono}" font-size="26" fill="#515f74" letter-spacing="3">BUILD · EARN · LEARN · TREND</text>
  <text x="1120" y="540" text-anchor="end" font-family="${mono}" font-size="26" fill="#667085">aicraftlog.com</text>
  <g fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M640 170 H700 V120 H760 V170 H820 V120 H900 V170 H960 V120 H1060 V170 H1120" stroke="#047857"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(fileURLToPath(new URL('../public/og.png', import.meta.url)));
console.log('public/og.png 생성 완료');
