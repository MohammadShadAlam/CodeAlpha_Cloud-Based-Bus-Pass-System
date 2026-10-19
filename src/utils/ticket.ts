import type { Booking } from '../types';

// Draws the demo ticket on a canvas and wraps it as a one-page A4 PDF. No libraries, no server.
const W = 595, H = 842, SCALE = 3; // A4 in points; canvas is drawn at 3x for crisp print
const HEAD = "Outfit, 'DM Sans', Arial, sans-serif";
const BODY = "'DM Sans', Arial, sans-serif";
const C = { purple: '#4b2b84', ink: '#2c1a48', muted: '#5b4f68', line: '#e3d9eb', soft: '#f6f1fa', page: '#f4eff9', amber: '#ffa51f', amberSoft: '#fff4de' };
type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

async function loadFonts() {
  try { await Promise.all(['700 24px Outfit', '800 24px Outfit', '400 12px "DM Sans"', '500 12px "DM Sans"', '700 12px "DM Sans"'].map(f => document.fonts.load(f))); } catch { /* fall back to system fonts */ }
}

function text(x: Ctx, s: string, px: number, py: number, o: { font: string; color: string; align?: CanvasTextAlign; max?: number; spacing?: number }) {
  x.font = o.font; x.fillStyle = o.color; x.textAlign = o.align || 'left'; x.letterSpacing = `${o.spacing || 0}px`;
  let out = s;
  if (o.max) { while (out.length > 1 && x.measureText(out).width > o.max) out = out.slice(0, -1); if (out !== s) out = `${out.slice(0, -1)}…`; }
  x.fillText(out, px, py);
}
const label = (x: Ctx, s: string, px: number, py: number, align: CanvasTextAlign = 'left', color = C.muted) => text(x, s, px, py, { font: `700 8px ${BODY}`, color, align, spacing: 1.1 });
function fitPx(x: Ctx, s: string, weight: string, max: number, start: number, min: number) {
  let px = start;
  while (px > min) { x.font = `${weight} ${px}px ${HEAD}`; if (x.measureText(s).width <= max) break; px -= 1; }
  return px;
}
function box(x: Ctx, px: number, py: number, w: number, h: number, r: number, fill: string, stroke?: string) {
  x.beginPath(); x.roundRect(px, py, w, h, r); x.fillStyle = fill; x.fill();
  if (stroke) { x.strokeStyle = stroke; x.lineWidth = 1; x.stroke(); }
}
function dotted(x: Ctx, x1: number, x2: number, py: number, color: string, gap = 5) {
  x.fillStyle = color;
  for (let px = x1; px <= x2; px += gap) { x.beginPath(); x.arc(px, py, 1, 0, Math.PI * 2); x.fill(); }
}

export async function renderTicket(b: Booking): Promise<HTMLCanvasElement> {
  await loadFonts();
  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE; canvas.height = H * SCALE;
  const x = canvas.getContext('2d') as Ctx;
  x.scale(SCALE, SCALE);
  x.fillStyle = C.page; x.fillRect(0, 0, W, H);

  const L = 36, R = W - 36, CW = R - L, TOP = 36, BOT = 806;
  // Ticket card
  x.save(); x.shadowColor = 'rgba(48,19,75,.12)'; x.shadowBlur = 18; x.shadowOffsetY = 6; box(x, L, TOP, CW, BOT - TOP, 16, '#fff'); x.restore();
  x.save(); x.beginPath(); x.roundRect(L, TOP, CW, BOT - TOP, 16); x.clip();

  // Header band
  x.fillStyle = C.purple; x.fillRect(L, TOP, CW, 124);
  x.fillStyle = 'rgba(255,255,255,.06)'; x.beginPath(); x.arc(R - 30, TOP + 20, 90, 0, Math.PI * 2); x.fill();
  text(x, 'tripzo', L + 24, TOP + 42, { font: `800 26px ${HEAD}`, color: '#fff', spacing: -1 });
  x.font = `800 26px ${HEAD}`; x.letterSpacing = '-1px';
  const bw = x.measureText('tripzo').width; x.fillStyle = C.amber; x.beginPath(); x.arc(L + 24 + bw + 4, TOP + 40, 3.2, 0, Math.PI * 2); x.fill();
  label(x, 'DEMO BOOKING · NOT A VALID TRAVEL TICKET', R - 24, TOP + 36, 'right', '#d9c9ee');
  label(x, 'BOOKING REFERENCE', L + 24, TOP + 80, 'left', '#d9c9ee');
  text(x, b.reference, L + 24, TOP + 106, { font: `800 27px ${HEAD}`, color: '#fff', spacing: 1.5 });
  const cancelled = b.status === 'Cancelled';
  const chip = cancelled ? 'CANCELLED' : 'CONFIRMED';
  x.font = `800 9px ${BODY}`; x.letterSpacing = '1px';
  const cw = x.measureText(chip).width + 26;
  box(x, R - 24 - cw, TOP + 84, cw, 26, 13, cancelled ? '#f9e1e3' : C.amber);
  text(x, chip, R - 24 - cw / 2, TOP + 101, { font: `800 9px ${BODY}`, color: cancelled ? '#8e2f3b' : '#291740', align: 'center', spacing: 1 });

  // Route
  const ry = TOP + 124 + 34;
  const colW = 190;
  label(x, 'FROM', L + 24, ry);
  let px = fitPx(x, b.pickup.city, '700', colW, 26, 15); text(x, b.pickup.city, L + 24, ry + 30, { font: `700 ${px}px ${HEAD}`, color: C.ink, spacing: -0.5 });
  text(x, b.pickup.name, L + 24, ry + 48, { font: `500 10.5px ${BODY}`, color: C.muted, max: colW });
  text(x, `Departs ${b.bus.departure}`, L + 24, ry + 70, { font: `700 12px ${BODY}`, color: C.purple });
  label(x, 'TO', R - 24, ry, 'right');
  px = fitPx(x, b.drop.city, '700', colW, 26, 15); text(x, b.drop.city, R - 24, ry + 30, { font: `700 ${px}px ${HEAD}`, color: C.ink, align: 'right', spacing: -0.5 });
  text(x, b.drop.name, R - 24, ry + 48, { font: `500 10.5px ${BODY}`, color: C.muted, align: 'right', max: colW });
  text(x, `Arrives ${b.bus.arrival} (est.)`, R - 24, ry + 70, { font: `700 12px ${BODY}`, color: C.purple, align: 'right' });
  const mid = (L + R) / 2, ly = ry + 22;
  dotted(x, mid - 52, mid + 52, ly, '#a58cc9', 6);
  x.fillStyle = C.purple; x.beginPath(); x.arc(mid - 60, ly, 4.5, 0, Math.PI * 2); x.fill();
  x.fillStyle = C.amber; x.beginPath(); x.arc(mid + 60, ly, 4.5, 0, Math.PI * 2); x.fill();
  text(x, b.bus.duration, mid, ly - 10, { font: `700 10px ${BODY}`, color: C.muted, align: 'center' });

  // Ticket-stub divider with notches
  const dy = ry + 96;
  dotted(x, L + 16, R - 16, dy, '#cdbddf', 6);
  x.fillStyle = C.page; x.beginPath(); x.arc(L, dy, 10, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(R, dy, 10, 0, Math.PI * 2); x.fill();

  // Details grid
  const date = new Date(`${b.date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const cells: [string, string][] = [['TRAVEL DATE', date], ['BUS OPERATOR', b.bus.operator], ['BUS TYPE', b.bus.type], ['SEATS', [...b.seats].sort((a, c) => a - c).join(', ')], ['TRAVELLERS', `${b.passengers.length} ${b.passengers.length === 1 ? 'passenger' : 'passengers'}`], ['SERVICE', b.bus.service]];
  const gx = [L + 24, L + 24 + 165, L + 24 + 330], gy = dy + 28;
  cells.forEach(([k, v], i) => {
    const cx = gx[i % 3], cy = gy + Math.floor(i / 3) * 50;
    label(x, k, cx, cy);
    text(x, v, cx, cy + 20, { font: `700 13.5px ${HEAD}`, color: C.ink, max: 150 });
  });

  // Passengers table
  let y = gy + 100 + 14;
  label(x, 'PASSENGERS', L + 24, y);
  y += 10; box(x, L + 24, y, CW - 48, 24, 6, C.soft);
  [['SEAT', L + 36], ['NAME', L + 96], ['AGE', L + 360], ['GENDER', L + 410]].forEach(([k, cx]) => label(x, k as string, cx as number, y + 15.5));
  y += 24;
  const seatsSorted = [...b.seats].sort((a, c) => a - c);
  b.passengers.forEach((p, i) => {
    y += 22;
    text(x, String(seatsSorted[i] ?? '-'), L + 36, y - 6, { font: `700 11.5px ${HEAD}`, color: C.purple });
    text(x, p.name, L + 96, y - 6, { font: `600 11.5px ${BODY}`, color: C.ink, max: 245 });
    text(x, p.age, L + 360, y - 6, { font: `500 11.5px ${BODY}`, color: C.ink });
    text(x, p.gender, L + 410, y - 6, { font: `500 11.5px ${BODY}`, color: C.ink, max: 110 });
    x.fillStyle = C.line; x.fillRect(L + 24, y, CW - 48, 0.7);
  });

  // Fare
  y += 26;
  const fee = 49, base = Math.max(0, b.total - fee + b.discount);
  const fare: [string, string, boolean][] = [[`Seat fare × ${b.seats.length}`, inr(base), false], ['Demo convenience fee', inr(fee), false]];
  if (b.discount > 0) fare.push(['Discount', `-${inr(b.discount)}`, false]);
  fare.forEach(([k, v]) => { text(x, k, L + 24, y, { font: `500 11.5px ${BODY}`, color: C.muted }); text(x, v, R - 24, y, { font: `600 11.5px ${BODY}`, color: C.ink, align: 'right' }); y += 19; });
  y += 2; box(x, L + 24, y - 12, CW - 48, 34, 8, C.soft);
  text(x, 'Total (demo)', L + 38, y + 10, { font: `700 12.5px ${BODY}`, color: C.ink });
  text(x, inr(b.total), R - 38, y + 11, { font: `800 18px ${HEAD}`, color: C.purple, align: 'right' });
  y += 46;
  text(x, `Contact: ${b.email} · ${b.phone}`, L + 24, y, { font: `500 10.5px ${BODY}`, color: C.muted, max: CW - 48 });

  // Demo notice (anchored to the bottom of the card)
  const ny = BOT - 66;
  box(x, L + 24, ny, CW - 48, 44, 8, C.amberSoft, '#f3d9a8');
  text(x, 'This is a demo booking, not a real bus ticket.', L + 38, ny + 18, { font: `700 10.5px ${BODY}`, color: '#6b4510' });
  text(x, 'Saved in this browser only. No payment was collected and no seat is reserved with any operator.', L + 38, ny + 33, { font: `500 9.5px ${BODY}`, color: '#6b4510', max: CW - 76 });

  // Faint DEMO watermark
  x.save(); x.translate(W / 2, H / 2 + 30); x.rotate(-0.5); text(x, 'DEMO', 0, 0, { font: `800 120px ${HEAD}`, color: 'rgba(75,43,132,.035)', align: 'center' }); x.restore();
  x.restore();
  text(x, `Generated ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · Tripzo frontend demo`, W / 2, H - 20, { font: `500 8.5px ${BODY}`, color: C.muted, align: 'center' });
  return canvas;
}

function jpegToPdf(jpeg: Uint8Array, w: number, h: number, title: string): Blob {
  const enc = new TextEncoder(); const parts: BlobPart[] = []; const off: number[] = []; let len = 0;
  const push = (u: Uint8Array) => { parts.push(u as BlobPart); len += u.length; };
  const str = (s: string) => push(enc.encode(s));
  const mark = (n: number) => { off[n] = len; };
  str('%PDF-1.4\n');
  mark(1); str('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  mark(2); str('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  mark(3); str(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);
  mark(4); str(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`); push(jpeg); str('\nendstream\nendobj\n');
  const content = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
  mark(5); str(`5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`);
  mark(6); str(`6 0 obj\n<< /Title (${title.replace(/[^\x20-\x7e]/g, '').replace(/[()\\]/g, '')}) /Producer (Tripzo) >>\nendobj\n`);
  const xref = len;
  let table = 'xref\n0 7\n0000000000 65535 f \n';
  for (let i = 1; i <= 6; i++) table += `${String(off[i]).padStart(10, '0')} 00000 n \n`;
  str(`${table}trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts, { type: 'application/pdf' });
}

export async function ticketPdf(b: Booking): Promise<Blob> {
  const canvas = await renderTicket(b);
  const jpeg = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Ticket render failed'))), 'image/jpeg', 0.93));
  return jpegToPdf(new Uint8Array(await jpeg.arrayBuffer()), canvas.width, canvas.height, `Tripzo demo ticket ${b.reference}`);
}
