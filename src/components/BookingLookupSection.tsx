import { FormEvent, useEffect, useState } from 'react';
import { CalendarClock, Check, Loader2, Search, XCircle } from 'lucide-react';
import { TIME_SLOTS, TimeSlotId, formatIDR } from '../lib/pricing';
import { CreatedReservation } from './ReservationSection';

interface BookingLookupSectionProps {
  externalLookupCode?: string | null;
}

export function BookingLookupSection({ externalLookupCode }: BookingLookupSectionProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<CreatedReservation[]>([]);

  const [rescheduleTarget, setRescheduleTarget] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState<TimeSlotId>('pagi');
  const [actionBusy, setActionBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [confirmCancelCode, setConfirmCancelCode] = useState<string | null>(null);

  const performLookup = async (searchValue: string) => {
    const trimmed = searchValue.trim();
    if (!trimmed) {
      setError('Masukkan kode reservasi (mis. GP-2026-1042) atau nomor WhatsApp.');
      return;
    }

    setLoading(true);
    setError('');
    setActionMessage('');
    setRescheduleTarget(null);
    setConfirmCancelCode(null);

    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Data reservasi tidak ditemukan.');
      }
      setResults(data.reservations || []);
    } catch (err) {
      setResults([]);
      setError(err instanceof Error ? err.message : 'Gagal mencari reservasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (externalLookupCode) {
      setQuery(externalLookupCode);
      performLookup(externalLookupCode);
    }
  }, [externalLookupCode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    performLookup(query);
  };

  const handleReschedule = async (code: string) => {
    if (!newDate) {
      setError('Pilih tanggal baru untuk penjadwalan ulang.');
      return;
    }
    setActionBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(code)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reschedule', date: newDate, timeSlot: newSlot }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menjadwalkan ulang.');
      }
      setResults((prev) =>
        prev.map((item) => (item.bookingCode === code ? data.reservation : item))
      );
      setRescheduleTarget(null);
      setActionMessage(`Jadwal ${code} berhasil diperbarui ke ${newDate}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui jadwal.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleCancel = async (code: string) => {
    setActionBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(code)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal membatalkan reservasi.');
      }
      setResults((prev) =>
        prev.map((item) => (item.bookingCode === code ? data.reservation : item))
      );
      setConfirmCancelCode(null);
      setActionMessage(`Reservasi ${code} telah dibatalkan.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membatalkan reservasi.');
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div id="cek-reservasi" className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
      <div className="max-w-xl">
        <p className="text-xs font-semibold text-[#1D4ED8] mb-1.5">
          Lacak & Kelola Jadwal
        </p>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
          Cek Status atau Ubah Jadwal Reservasi
        </h3>
        <p className="text-sm text-slate-600 mt-1.5">
          Masukkan kode booking atau nomor WhatsApp Anda untuk melihat rincian armada, menjadwalkan ulang tanggal, atau membatalkan pesanan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Kode reservasi atau nomor WhatsApp"
            placeholder="Contoh: GP-2026-1042 atau 081288441042"
            className="w-full h-11 pl-10 pr-4 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-11 px-5 text-sm font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
        >
          {loading ? 'Mencari...' : 'Cek Reservasi'}
        </button>
      </form>

      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>Contoh kode aktif untuk uji coba:</span>
        <button
          type="button"
          onClick={() => {
            setQuery('GP-2026-1042');
            performLookup('GP-2026-1042');
          }}
          className="font-mono font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
        >
          GP-2026-1042
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={() => {
            setQuery('GP-2026-1105');
            performLookup('GP-2026-1105');
          }}
          className="font-mono font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
        >
          GP-2026-1105
        </button>
      </div>

      {error && (
        <div className="mt-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      {actionMessage && (
        <div className="mt-5 flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
          <Check className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((item) => {
            const isCancelled = item.status === 'Dibatalkan';
            return (
              <div
                key={item.bookingCode}
                className="border border-slate-200 rounded-xl p-5 bg-[#F8FAFC]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-bold text-slate-900">
                        {item.bookingCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          isCancelled
                            ? 'text-red-700'
                            : item.status === 'Dijadwalkan Ulang'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        Status: {item.status}
                      </span>
                    </div>
                    <h4 className="font-display text-base font-bold text-slate-900 mt-1">
                      {item.fleetName} ({item.crewCount} kru)
                    </h4>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-500">Total Biaya</div>
                    <div className="font-mono text-base font-bold text-slate-900 tabular-nums">
                      {formatIDR(item.totalCost)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs">
                  <div>
                    <div className="text-slate-500 mb-0.5">Jadwal Pelaksanaan</div>
                    <div className="font-mono font-semibold text-slate-900 tabular-nums">
                      {item.date} · {item.timeRange}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-0.5">Asal ({item.originZoneName})</div>
                    <div className="text-slate-800">{item.originAddress}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-0.5">Tujuan ({item.destinationZoneName})</div>
                    <div className="text-slate-800">{item.destinationAddress}</div>
                  </div>
                </div>

                {!isCancelled && (
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRescheduleTarget(
                          rescheduleTarget === item.bookingCode ? null : item.bookingCode
                        );
                        setNewDate(item.date);
                        setNewSlot(item.timeSlot);
                        setConfirmCancelCode(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <CalendarClock className="w-3.5 h-3.5" />
                      Ubah Jadwal (Gratis)
                    </button>

                    {confirmCancelCode === item.bookingCode ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-700 font-medium">Yakin batalkan?</span>
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => handleCancel(item.bookingCode)}
                          className="px-3 py-1.5 font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md cursor-pointer"
                        >
                          Ya, Batalkan
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCancelCode(null)}
                          className="px-3 py-1.5 font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          Tidak
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmCancelCode(item.bookingCode);
                          setRescheduleTarget(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Batalkan Pesanan
                      </button>
                    )}
                  </div>
                )}

                {rescheduleTarget === item.bookingCode && (
                  <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Tanggal Baru
                      </label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="h-9 px-3 text-xs font-mono bg-white border border-slate-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Sesi Waktu Baru
                      </label>
                      <select
                        value={newSlot}
                        onChange={(e) => setNewSlot(e.target.value as TimeSlotId)}
                        className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-md"
                      >
                        {TIME_SLOTS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label} ({s.timeRange})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => handleReschedule(item.bookingCode)}
                      className="h-9 px-4 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-md cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {actionBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Simpan Jadwal Baru
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
