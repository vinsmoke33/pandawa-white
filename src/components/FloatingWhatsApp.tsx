import { useState } from 'react';
import { ExternalLink, MessageCircle, X } from 'lucide-react';
import { EstimateInput, EstimateResult, ZONES, formatIDR } from '../lib/pricing';

interface FloatingWhatsAppProps {
  input: EstimateInput;
  estimate: EstimateResult;
  selectedDate: string;
}

const WHATSAPP_NUMBER = '6285218739913';

export function FloatingWhatsApp({
  input,
  estimate,
  selectedDate,
}: FloatingWhatsAppProps) {
  const [open, setOpen] = useState(false);
  const [customNote, setCustomNote] = useState('');

  const originName = ZONES.find((z) => z.id === input.originZoneId)?.name ?? 'Jakarta';
  const destName = ZONES.find((z) => z.id === input.destinationZoneId)?.name ?? 'Jakarta';

  const defaultMessage = [
    'Halo Pandawa Movers, saya ingin konsultasi jadwal pindahan:',
    `- Rute: ${originName} -> ${destName} (${input.distanceKm} km)`,
    `- Armada: ${estimate.activeFleet.name} (${estimate.totalVolumeM3} m³)`,
    `- Estimasi Kalkulator: ${formatIDR(estimate.totalCost)}`,
    `- Rencana Tanggal: ${selectedDate}`,
    customNote.trim() ? `- Catatan: ${customNote.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label="Konsultasi WhatsApp Pandawa Movers"
          className="w-[calc(100vw-2rem)] sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#0F172A] text-white">
            <div>
              <div className="font-display text-sm font-bold">Pandawa Movers</div>
              <div className="text-[11px] text-slate-300 font-mono tabular-nums">
                0852-1873-9913 · 07:00 – 20:00 WIB
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup panel WhatsApp"
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-semibold text-slate-900">
                Ringkasan estimasi Anda siap dikirim:
              </div>
              <div>
                {originName} → {destName} ({input.distanceKm} km)
              </div>
              <div className="font-mono tabular-nums text-slate-800">
                {estimate.activeFleet.name} · {formatIDR(estimate.totalCost)}
              </div>
              <div className="font-mono tabular-nums text-slate-500">
                Jadwal: {selectedDate}
              </div>
            </div>

            <div>
              <label
                htmlFor="wa-custom-note"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Tambahan pertanyaan (opsional)
              </label>
              <textarea
                id="wa-custom-note"
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Mis. tanya survei video call atau izin gedung..."
                className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D]"
              />
            </div>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              Kirim Pesan via WhatsApp
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={open ? 'Tutup konsultasi WhatsApp' : 'Konsultasi via WhatsApp'}
        className="h-11 px-4 inline-flex items-center gap-2 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-sm font-semibold shadow-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803D]"
      >
        {open ? <X className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
        <span>{open ? 'Tutup' : 'WhatsApp Kami'}</span>
      </button>
    </div>
  );
}
