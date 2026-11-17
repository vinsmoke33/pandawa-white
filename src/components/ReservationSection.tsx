import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  Loader2,
  MapPin,
  Search,
} from 'lucide-react';
import {
  EstimateInput,
  EstimateResult,
  TimeSlotId,
  ZONES,
  formatIDR,
} from '../lib/pricing';

interface SlotAvailability {
  id: TimeSlotId;
  label: string;
  timeRange: string;
  note: string;
  bookedTotal: number;
  maxTotal: number;
  remainingTotal: number;
  isFull: boolean;
  statusText: string;
  fleetRemaining: Record<string, number>;
}

export interface CreatedReservation {
  bookingCode: string;
  createdAt: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  originZoneName: string;
  originAddress: string;
  destinationZoneName: string;
  destinationAddress: string;
  distanceKm: number;
  fleetName: string;
  crewCount: number;
  date: string;
  timeSlot: TimeSlotId;
  timeRange: string;
  totalVolumeM3: number;
  totalCost: number;
  depositAmount: number;
  paymentMethod: string;
  notes: string;
}

interface ReservationSectionProps {
  input: EstimateInput;
  estimate: EstimateResult;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onEditEstimate: () => void;
  onInspectCode: (code: string) => void;
}

function getUpcomingDays(count: number): { dateStr: string; dayShort: string; dateNum: string; monthShort: string; isMidweek: boolean }[] {
  const days = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  for (let i = 1; i <= count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dow = d.getDay();
    days.push({
      dateStr: `${yyyy}-${mm}-${dd}`,
      dayShort: dayNames[dow],
      dateNum: String(d.getDate()),
      monthShort: monthNames[d.getMonth()],
      isMidweek: dow >= 2 && dow <= 4,
    });
  }
  return days;
}

export function ReservationSection({
  input,
  estimate,
  selectedDate,
  onDateChange,
  onEditEstimate,
  onInspectCode,
}: ReservationSectionProps) {
  const upcomingDays = useMemo(() => getUpcomingDays(10), []);
  const minDateStr = upcomingDays[0].dateStr;

  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotId>('pagi');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'dp-online' | 'bayar-lunas-lokasi'>('dp-online');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<CreatedReservation | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const originZoneName = ZONES.find((z) => z.id === input.originZoneId)?.name ?? 'Jakarta';
  const destinationZoneName = ZONES.find((z) => z.id === input.destinationZoneId)?.name ?? 'Jakarta';

  const fetchAvailability = async (dateToFetch: string) => {
    setSlotsLoading(true);
    setSlotsError('');
    try {
      const res = await fetch(`/api/availability?date=${encodeURIComponent(dateToFetch)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memuat ketersediaan jadwal.');
      }
      setSlots(data.slots || []);
      const firstAvailable = (data.slots || []).find(
        (s: SlotAvailability) =>
          !s.isFull && (s.fleetRemaining?.[estimate.activeFleet.id] ?? 0) > 0
      );
      if (firstAvailable) {
        setSelectedSlot((prev) => {
          const prevStillValid = (data.slots || []).find(
            (s: SlotAvailability) =>
              s.id === prev && !s.isFull && (s.fleetRemaining?.[estimate.activeFleet.id] ?? 0) > 0
          );
          return prevStillValid ? prev : firstAvailable.id;
        });
      }
    } catch (err) {
      setSlotsError(
        err instanceof Error ? err.message : 'Koneksi terputus saat memeriksa slot.'
      );
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate, estimate.activeFleet.id]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (customerName.trim().length < 2) {
      errors.customerName = 'Masukkan nama lengkap pemesan.';
    }
    const cleanPhone = customerPhone.replace(/[^0-9+]/g, '');
    if (!/^(\+62|62|0)8[0-9]{7,12}$/.test(cleanPhone)) {
      errors.customerPhone = 'Gunakan format WhatsApp Indonesia yang valid (mis. 081234567890).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      errors.customerEmail = 'Masukkan alamat email aktif untuk pengiriman salinan jadwal.';
    }
    if (originAddress.trim().length < 10) {
      errors.originAddress = 'Tuliskan nama jalan, nomor bangunan, atau gedung asal.';
    }
    if (destinationAddress.trim().length < 10) {
      errors.destinationAddress = 'Tuliskan alamat tujuan secara lengkap.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    const chosenSlot = slots.find((s) => s.id === selectedSlot);
    if (
      !chosenSlot ||
      chosenSlot.isFull ||
      (chosenSlot.fleetRemaining?.[estimate.activeFleet.id] ?? 0) <= 0
    ) {
      setSubmitError('Sesi waktu yang dipilih sudah penuh. Silakan pilih sesi atau tanggal lain.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          propertyType: input.propertyType,
          originZoneName,
          originAddress: originAddress.trim(),
          destinationZoneName,
          destinationAddress: destinationAddress.trim(),
          distanceKm: input.distanceKm,
          fleetId: estimate.activeFleet.id,
          crewCount: Math.max(estimate.activeFleet.includedCrew, input.crewCount),
          date: selectedDate,
          timeSlot: selectedSlot,
          totalVolumeM3: estimate.totalVolumeM3,
          totalCost: estimate.totalCost,
          depositAmount: estimate.depositAmount,
          paymentMethod,
          notes: notes.trim(),
          lineItems: estimate.lineItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan reservasi.');
      }

      setConfirmed(data.reservation);
      fetchAvailability(selectedDate);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses reservasi.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Clipboard blocked in sandbox fallback ignored silently
    }
  };

  const handleDownloadReceipt = (resData: CreatedReservation) => {
    const content = [
      'BUKTI RESERVASI JADWAL — PANDAWA MOVERS',
      '========================================',
      `Kode Reservasi : ${resData.bookingCode}`,
      `Status         : ${resData.status}`,
      `Tanggal Pindah : ${resData.date}`,
      `Sesi Waktu     : ${resData.timeRange}`,
      `Armada         : ${resData.fleetName} (${resData.crewCount} kru)`,
      `Rute           : ${resData.originZoneName} -> ${resData.destinationZoneName} (${resData.distanceKm} km)`,
      `Alamat Asal    : ${resData.originAddress}`,
      `Alamat Tujuan  : ${resData.destinationAddress}`,
      `Pemesan        : ${resData.customerName} (${resData.customerPhone})`,
      `Total Biaya    : ${formatIDR(resData.totalCost)}`,
      `Metode Bayar   : ${resData.paymentMethod === 'dp-online' ? `DP 20% (${formatIDR(resData.depositAmount)})` : 'Bayar Lunas di Lokasi'}`,
      '========================================',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reservasi-${resData.bookingCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="reservasi" className="py-16 lg:py-24 border-t border-slate-200 bg-[#F8FAFC]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-semibold text-[#1D4ED8] mb-2">
              Penjadwalan Real-Time
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Reservasi Jadwal Pindahan Online
            </h2>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Ketersediaan kru dan unit armada diperbarui secara langsung. Pilih tanggal, sesi kedatangan, dan lengkapi alamat penjemputan.
            </p>
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-3">
            <span>
              Estimasi Aktif: <strong className="font-mono text-slate-900 tabular-nums">{formatIDR(estimate.totalCost)}</strong>
            </span>
            <button
              type="button"
              onClick={onEditEstimate}
              className="text-[#1D4ED8] font-semibold hover:underline cursor-pointer whitespace-nowrap"
            >
              Ubah Estimasi
            </button>
          </div>
        </div>

        {confirmed ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 max-w-3xl">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-1">
                  <Check className="w-4 h-4" />
                  Jadwal Berhasil Dikonfirmasi
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  Kode Booking:{' '}
                  <span className="font-mono text-[#1D4ED8]">{confirmed.bookingCode}</span>
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Simpan kode reservasi ini untuk memantau status atau melakukan penjadwalan ulang kapan saja.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyCode(confirmed.bookingCode)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Tersalin' : 'Salin Kode'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadReceipt(confirmed)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Bukti
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-sm">
              <div>
                <div className="text-xs text-slate-500 mb-1">Jadwal & Armada</div>
                <div className="font-semibold text-slate-900 font-mono tabular-nums">
                  {confirmed.date} · {confirmed.timeRange}
                </div>
                <div className="text-slate-700 mt-1">
                  {confirmed.fleetName} ({confirmed.crewCount} kru)
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Pemesan</div>
                <div className="font-semibold text-slate-900">{confirmed.customerName}</div>
                <div className="text-slate-600 font-mono text-xs mt-1">
                  {confirmed.customerPhone} · {confirmed.customerEmail}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Lokasi Asal ({confirmed.originZoneName})</div>
                <div className="text-slate-800">{confirmed.originAddress}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Lokasi Tujuan ({confirmed.destinationZoneName})</div>
                <div className="text-slate-800">{confirmed.destinationAddress}</div>
              </div>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">Total Biaya Terikat</div>
                <div className="font-display font-mono text-xl font-bold text-slate-900 tabular-nums">
                  {formatIDR(confirmed.totalCost)}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {confirmed.paymentMethod === 'dp-online'
                    ? `Pembayaran DP 20% (${formatIDR(confirmed.depositAmount)}) via tautan tagihan ke ${confirmed.customerEmail}`
                    : 'Pembayaran penuh langsung saat tim tiba di lokasi'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onInspectCode(confirmed.bookingCode)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  Kelola / Ubah Jadwal
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmed(null)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg cursor-pointer whitespace-nowrap"
                >
                  Buat Reservasi Lain
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form Column */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-8">
              {/* Date Selection */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#1D4ED8]" />
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      01. Pilih Tanggal Keberangkatan
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="custom-date" className="text-xs text-slate-600">
                      Tanggal lain:
                    </label>
                    <input
                      id="custom-date"
                      type="date"
                      min={minDateStr}
                      value={selectedDate}
                      onChange={(e) => {
                        if (e.target.value) onDateChange(e.target.value);
                      }}
                      className="h-9 px-2.5 text-xs font-mono border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-[#1D4ED8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {upcomingDays.map((d) => {
                    const isSelected = selectedDate === d.dateStr;
                    return (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => onDateChange(d.dateStr)}
                        className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg border text-center transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-[11px] font-medium">{d.dayShort}</span>
                        <span className="font-mono text-base font-bold tabular-nums my-0.5">
                          {d.dateNum}
                        </span>
                        <span className="text-[10px] text-slate-500">{d.monthShort}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-2.5">
                  Selasa – Kamis otomatis memperoleh potongan 5% tarif armada & jarak pada rincian estimasi.
                </p>
              </div>

              {/* Time Slot Selection */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1D4ED8]" />
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      02. Pilih Sesi Kedatangan Kru
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    {selectedDate}
                  </span>
                </div>

                {slotsLoading ? (
                  <div className="flex items-center gap-2 py-6 text-sm text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin text-[#1D4ED8]" />
                    Memeriksa ketersediaan armada dan kru...
                  </div>
                ) : slotsError ? (
                  <div className="flex items-center justify-between gap-4 p-4 border border-red-200 bg-red-50 rounded-lg text-sm text-red-800">
                    <span>{slotsError}</span>
                    <button
                      type="button"
                      onClick={() => fetchAvailability(selectedDate)}
                      className="text-xs font-semibold underline cursor-pointer shrink-0"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {slots.map((slot) => {
                      const fleetUnitsLeft = slot.fleetRemaining?.[estimate.activeFleet.id] ?? 0;
                      const unavailable = slot.isFull || fleetUnitsLeft <= 0;
                      const isSelected = selectedSlot === slot.id && !unavailable;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={unavailable}
                          onClick={() => setSelectedSlot(slot.id)}
                          className={`text-left p-4 rounded-lg border transition-colors ${
                            unavailable
                              ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                              : isSelected
                              ? 'border-[#1D4ED8] bg-[#EFF6FF] cursor-pointer'
                              : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {slot.label}
                            </span>
                            <span
                              className={`text-[11px] font-semibold ${
                                unavailable
                                  ? 'text-red-700'
                                  : slot.remainingTotal === 1
                                  ? 'text-amber-700'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {unavailable ? 'Penuh' : `${fleetUnitsLeft} unit siap`}
                            </span>
                          </div>
                          <div className="font-mono text-xs text-slate-700 mt-1 tabular-nums">
                            {slot.timeRange}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-2">
                            {slot.statusText}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Contact & Addresses */}
              <div className="pt-6 border-t border-slate-200 space-y-5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1D4ED8]" />
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    03. Data Pemesan & Alamat Lengkap
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="res-name" className="block text-xs font-medium text-slate-700 mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      id="res-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Contoh: Andi Pratama"
                      className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                    />
                    {fieldErrors.customerName && (
                      <p className="text-xs text-red-700 mt-1">{fieldErrors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="res-phone" className="block text-xs font-medium text-slate-700 mb-1.5">
                      Nomor WhatsApp Aktif
                    </label>
                    <input
                      id="res-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="w-full h-11 px-3.5 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                    />
                    {fieldErrors.customerPhone && (
                      <p className="text-xs text-red-700 mt-1">{fieldErrors.customerPhone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="res-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                      Email Konfirmasi
                    </label>
                    <input
                      id="res-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                    />
                    {fieldErrors.customerEmail && (
                      <p className="text-xs text-red-700 mt-1">{fieldErrors.customerEmail}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="res-origin-addr" className="block text-xs font-medium text-slate-700 mb-1.5">
                      Alamat Lengkap Penjemputan ({originZoneName})
                    </label>
                    <textarea
                      id="res-origin-addr"
                      rows={3}
                      value={originAddress}
                      onChange={(e) => setOriginAddress(e.target.value)}
                      placeholder="Nama jalan, nomor rumah / tower & unit apartemen, patokan parkir truk"
                      className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                    />
                    {fieldErrors.originAddress && (
                      <p className="text-xs text-red-700 mt-1">{fieldErrors.originAddress}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="res-dest-addr" className="block text-xs font-medium text-slate-700 mb-1.5">
                      Alamat Lengkap Tujuan ({destinationZoneName})
                    </label>
                    <textarea
                      id="res-dest-addr"
                      rows={3}
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      placeholder="Nama jalan, nomor rumah / cluster / lantai kantor tujuan"
                      className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                    />
                    {fieldErrors.destinationAddress && (
                      <p className="text-xs text-red-700 mt-1">{fieldErrors.destinationAddress}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="res-notes" className="block text-xs font-medium text-slate-700 mb-1.5">
                    Catatan Khusus untuk Kru Lapangan (Opsional)
                  </label>
                  <input
                    id="res-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Portal kompleks tutup jam 21.00, ada lemari kaca perlu perhatian ekstra"
                    className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                  />
                </div>
              </div>
            </div>

            {/* Right Booking Confirmation Sidebar */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div className="pb-4 border-b border-slate-200">
                <div className="text-xs text-slate-500">Ringkasan Jadwal Anda</div>
                <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                  {estimate.activeFleet.name}
                </h3>
                <div className="text-xs text-slate-600 mt-2 space-y-1">
                  <div>
                    Rute: <strong className="text-slate-900">{originZoneName} → {destinationZoneName}</strong> ({input.distanceKm} km)
                  </div>
                  <div>
                    Tanggal: <strong className="font-mono text-slate-900 tabular-nums">{selectedDate}</strong>
                  </div>
                  <div>
                    Sesi:{' '}
                    <strong className="font-mono text-slate-900 tabular-nums">
                      {slots.find((s) => s.id === selectedSlot)?.timeRange ?? '08:00 – 11:00 WIB'}
                    </strong>
                  </div>
                  <div>
                    Kru & Volume:{' '}
                    <strong className="text-slate-900">
                      {Math.max(estimate.activeFleet.includedCrew, input.crewCount)} orang · {estimate.totalVolumeM3} m³
                    </strong>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <div className="text-xs font-semibold text-slate-800 mb-2">
                  Pilih Skema Pembayaran
                </div>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'dp-online'}
                      onChange={() => setPaymentMethod('dp-online')}
                      className="mt-0.5 accent-[#1D4ED8]"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900">
                        Kunci Jadwal dengan DP 20% ({formatIDR(estimate.depositAmount)})
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        Pelunasan 80% setelah seluruh barang tiba di tujuan
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'bayar-lunas-lokasi'}
                      onChange={() => setPaymentMethod('bayar-lunas-lokasi')}
                      className="mt-0.5 accent-[#1D4ED8]"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900">
                        Bayar Penuh Saat Kru Tiba di Lokasi
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        Transfer atau QRIS langsung ke koordinator lapangan
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-baseline justify-between">
                <span className="text-sm font-medium text-slate-600">Total Terikat</span>
                <span className="font-display font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  {formatIDR(estimate.totalCost)}
                </span>
              </div>

              {submitError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || slotsLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-[#0F172A] hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Memproses Jadwal...' : 'Konfirmasi Reservasi Jadwal'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
