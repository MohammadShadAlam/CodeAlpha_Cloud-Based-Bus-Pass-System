import type { Booking } from '../types';
import { renderTicket, ticketPdf } from './ticket';

// Downloads the demo ticket as a designed one-page PDF.
export async function downloadBooking(b: Booking) {
  const url = URL.createObjectURL(await ticketPdf(b));
  const a = document.createElement('a');
  a.href = url; a.download = `tripzo-ticket-${b.reference}.pdf`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// Opens the browser print dialog (choose "Save as PDF" or a printer) with the same ticket design.
// A hidden iframe is used instead of a pop-up window, so pop-up blockers cannot stop it.
export async function printBooking(b: Booking): Promise<boolean> {
  try {
    const src = (await renderTicket(b)).toDataURL('image/jpeg', 0.95);
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(frame);
    const doc = frame.contentDocument!;
    doc.open();
    doc.write(`<!doctype html><title>Tripzo demo ticket ${b.reference}</title><style>@page{size:A4;margin:0}html,body{margin:0}img{display:block;width:210mm;height:297mm}</style><img alt="Tripzo demo ticket ${b.reference}" src="${src}">`);
    doc.close();
    const img = doc.querySelector('img')!;
    if (!img.complete) await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
    frame.contentWindow!.focus();
    frame.contentWindow!.print();
    setTimeout(() => frame.remove(), 60000);
    return true;
  } catch { return false; }
}
