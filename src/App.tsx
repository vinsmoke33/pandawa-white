import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Header } from './components/Header';
import { ResilientImage } from './components/ResilientImage';
import { CostEstimator } from './components/CostEstimator';
import { GallerySection } from './components/GallerySection';
import { ReservationSection } from './components/ReservationSection';
import { BookingLookupSection } from './components/BookingLookupSection';
import { FLEET_IMAGES, HERO_IMAGE_PATH, PACKING_IMAGE_PATH } from './lib/fleetData';
import {
  DEFAULT_INVENTORY,
  EstimateInput,
  FLEET_SPECS,
  FleetId,
  calculateEstimate,
  estimateRoadDistanceKm,
  formatIDR,
} from './lib/pricing';

function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowString);
  const [externalLookupCode, setExternalLookupCode] = useState<string | null>(null);

  const [estimateInput, setEstimateInput] = useState<EstimateInput>(() => ({
    propertyType: 'apartemen',
    originZoneId: 'jaksel',
    destinationZoneId: 'bsd',
    distanceKm: estimateRoadDistanceKm('jaksel', 'bsd'),
    inventory: { ...DEFAULT_INVENTORY },
    autoFleet: true,
    selectedFleetId: 'cde-engkel',
    crewCount: 2,
    originFloor: 1,
    originHasElevator: true,
    destinationFloor: 1,
    destinationHasElevator: true,
    includePacking: false,
    includeDisassembly: false,
    includeInsurance: true,
    scheduledDate: getTomorrowString(),
  }));

  const handleDateChange = (nextDate: string) => {
    setSelectedDate(nextDate);
    setEstimateInput((prev) => ({ ...prev, scheduledDate: nextDate }));
  };

  const estimateResult = useMemo(
    () => calculateEstimate(estimateInput),
    [estimateInput]
  );

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectFleetFromShowcase = (fleetId: FleetId) => {
    setEstimateInput((prev) => ({
      ...prev,
      autoFleet: false,
      selectedFleetId: fleetId,
      crewCount: Math.max(FLEET_SPECS[fleetId].includedCrew, prev.crewCount),
    }));
    scrollToSection('estimasi');
  };

  const handleInspectCode = (code: string) => {
    setExternalLookupCode(code);
    scrollToSection('cek-reservasi');
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Header onNavigate={scrollToSection} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center">
                <p className="text-xs sm:text-sm font-medium text-slate-600 mb-4">
                  Jabodetabek & Antarkota Jawa · Asuransi Penuh · Terjadwal
                </p>

                <h1 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight text-slate-900 text-balance">
                  Pindahan Terencana dengan Biaya Pasti Sejak Awal.
                </h1>

                <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  Hitung estimasi tarif pindahan rumah, apartemen, atau kantor secara otomatis berdasarkan volume muatan dan jarak aktual, lalu kunci jadwal kedatangan armada secara langsung.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <button
                    type="button"
                    onClick={() => scrollToSection('estimasi')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
                  >
                    Hitung Estimasi Biaya
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('reservasi')}
                    className="text-sm font-semibold text-slate-800 hover:text-[#1D4ED8] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-2"
                  >
                    Lihat Jadwal Tersedia
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1D4ED8]" />
                    Tanpa biaya tambahan mendadak di lokasi
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1D4ED8]" />
                    Bongkar-pasang & packing tersedia
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="h-full min-h-[280px] sm:min-h-[360px] rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <ResilientImage
                    src={HERO_IMAGE_PATH}
                    alt="Kru Pandawa Movers memuat furnitur yang sudah dibungkus rapi ke dalam truk box"
                    fallbackLabel="Tim Lapangan Pandawa Movers — Armada Box Tertutup"
                    className="w-full h-full lg:h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* 4-Column Quantitative Proof Strip */}
            <div className="mt-10 lg:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 border border-slate-200 rounded-xl bg-white p-6">
              <div>
                <div className="font-display font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  12.400+
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Pindahan rumah & kantor tuntas sejak 2019
                </div>
              </div>
              <div className="lg:border-l lg:border-slate-200 lg:pl-6">
                <div className="font-display font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  99,4%
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Ketepatan tiba armada sesuai sesi jadwal
                </div>
              </div>
              <div className="lg:border-l lg:border-slate-200 lg:pl-6">
                <div className="font-display font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  0 Biaya
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Selisih tagihan dari estimasi yang terikat
                </div>
              </div>
              <div className="lg:border-l lg:border-slate-200 lg:pl-6">
                <div className="font-display font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  Rp 250 Juta
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Plafon proteksi asuransi kerusakan kargo
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 01: Asymmetric Bento Capabilities */}
        <section id="layanan" className="py-16 lg:py-24 border-t border-slate-200 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-10">
              <p className="text-sm font-semibold text-[#1D4ED8] mb-2">
                Standar Operasional Pindahan
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                Dari Pengemasan Rapi hingga Penataan di Lokasi Baru
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Marquee Tile (col-span-2) */}
              <div className="md:col-span-2 border border-slate-200 rounded-xl overflow-hidden bg-[#F8FAFC] grid grid-cols-1 sm:grid-cols-2">
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900">
                      01. Pengemasan Berlapis & Inventarisasi
                    </h3>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      Setiap barang pecah belah, perangkat elektronik, dan lukisan dibungkus dengan kertas kraft, bubble wrap tebal, serta kardus double-wall berlabel ruangan agar penataan di lokasi baru berjalan cepat.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-600">
                    Material standar ekspor · Label kode ruangan · Troli lantai bebas gores
                  </div>
                </div>
                <div className="min-h-[240px]">
                  <ResilientImage
                    src={PACKING_IMAGE_PATH}
                    alt="Kru pengemasan membungkus barang pecah belah dengan kertas pelindung dan kardus tebal"
                    fallbackLabel="Layanan Full Packing Pandawa Movers"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Tile 2 */}
              <div className="border border-slate-200 rounded-xl p-6 sm:p-8 bg-white flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    02. Estimasi Biaya Mengikat
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    Sistem menghitung kebutuhan volume ruang bak, tenaga angkut, serta akses tangga secara langsung. Angka yang Anda konfirmasi menjadi tarif final tanpa negosiasi ulang di depan pintu.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-mono text-slate-500">
                  Tarif transparan per km & volume m³
                </div>
              </div>

              {/* Tile 3 */}
              <div className="border border-slate-200 rounded-xl p-6 sm:p-8 bg-white flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    03. Bongkar-Pasang Furnitur
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    Kru membawa perkakas listrik untuk melepas dan merangkai kembali lemari pakaian knock-down, ranjang dipan, meja kerja, serta pelindung sudut sofa sebelum masuk ke dalam truk.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-mono text-slate-500">
                  Selimut pelindung furnitur tersedia di setiap truk
                </div>
              </div>

              {/* Tile 4 (col-span-2) */}
              <div className="md:col-span-2 border border-slate-200 rounded-xl p-6 sm:p-8 bg-[#0F172A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="max-w-lg">
                  <h3 className="font-display text-xl font-bold tracking-wide">
                    04. Jadwal Kedatangan Tepat Sesi & Rute Antarkota
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    Pilih sesi kedatangan pagi, siang, atau sore sesuai jam izin loading apartemen dan gedung perkantoran Anda. Tersedia pula layanan pengiriman antarkota dari Jabodetabek menuju Bandung, Semarang, dan Surabaya.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToSection('reservasi')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-center"
                >
                  Cek Slot Jadwal
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 02: Fleet Showcase */}
        <section id="armada" className="py-16 lg:py-24 border-t border-slate-200 bg-[#F8FAFC]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-sm font-semibold text-[#1D4ED8] mb-2">
                  Spesifikasi Armada Box Tertutup
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                  Pilih Ukuran Truk Sesuai Volume Muatan
                </h2>
              </div>
              <p className="text-sm text-slate-600 max-w-md">
                Seluruh unit menggunakan bak tertutup tahan hujan dengan lantai rata dan titik kait pengikat kargo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(Object.keys(FLEET_SPECS) as FleetId[]).map((fid) => {
                const fleet = FLEET_SPECS[fid];
                return (
                  <article
                    key={fid}
                    className="border border-slate-200 rounded-xl bg-white overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[4/3] bg-slate-100 border-b border-slate-200 overflow-hidden">
                        <ResilientImage
                          src={FLEET_IMAGES[fid]}
                          alt={fleet.name}
                          fallbackLabel={fleet.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-6">
                        <div className="text-xs font-mono text-slate-500 tabular-nums">
                          {fleet.dimensions} · Maks {fleet.capacityM3} m³
                        </div>
                        <h3 className="font-display text-lg font-bold text-slate-900 mt-1">
                          {fleet.name}
                        </h3>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                          {fleet.idealFor}
                        </p>

                        <dl className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <dt className="text-slate-500">Beban Maksimal</dt>
                            <dd className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5">
                              {fleet.maxWeightKg.toLocaleString('id-ID')} kg
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Kru Inti</dt>
                            <dd className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5">
                              {fleet.includedCrew} orang (maks {fleet.maxCrew})
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Tarif Dasar (5 km)</dt>
                            <dd className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5">
                              {formatIDR(fleet.baseFee)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Tarif per km</dt>
                            <dd className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5">
                              {formatIDR(fleet.ratePerKm)}/km
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      <button
                        type="button"
                        onClick={() => handleSelectFleetFromShowcase(fid)}
                        className="w-full py-2.5 px-4 text-sm font-semibold text-slate-900 bg-white border border-slate-300 hover:border-[#1D4ED8] hover:text-[#1D4ED8] rounded-lg transition-colors cursor-pointer"
                      >
                        Hitung dengan Armada Ini
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 03: Field Operations Gallery */}
        <GallerySection />

        {/* Section 04: Automatic Cost Estimator */}
        <CostEstimator
          input={estimateInput}
          estimate={estimateResult}
          onChange={setEstimateInput}
          onProceedToReservation={() => scrollToSection('reservasi')}
        />

        {/* Section 04: Online Schedule Reservation */}
        <ReservationSection
          input={estimateInput}
          estimate={estimateResult}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onEditEstimate={() => scrollToSection('estimasi')}
          onInspectCode={handleInspectCode}
        />

        {/* Section 05: Proof / Testimonials + Booking Lookup */}
        <section className="py-16 lg:py-24 border-t border-slate-200 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-14">
            <div>
              <p className="text-sm font-semibold text-[#1D4ED8] mb-2">
                Catatan Pelaksanaan Pelanggan
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                Hasil Nyata di Lapangan
              </h2>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <blockquote className="border border-slate-200 rounded-xl p-6 bg-[#F8FAFC] flex flex-col justify-between">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    “Sebelumnya khawatir biaya membengkak karena pindah dari apartemen lantai 18 di Kuningan ke rumah di BSD. Dengan kalkulator otomatis dan tambahan 1 kru, seluruh 24 kardus plus sofa L selesai terpasang dalam 3,5 jam sesuai angka estimasi awal.”
                  </p>
                  <footer className="mt-5 pt-4 border-t border-slate-200 text-xs">
                    <div className="font-semibold text-slate-900">Nadia Kusumawardhani</div>
                    <div className="text-slate-500 mt-0.5">
                      Product Lead, PT Ruang Data · CDE Engkel Box (28 km)
                    </div>
                  </footer>
                </blockquote>

                <blockquote className="border border-slate-200 rounded-xl p-6 bg-[#F8FAFC] flex flex-col justify-between">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    “Kami memindahkan 18 meja kerja dan rak arsip kantor dari Sudirman ke TB Simatupang pada sesi siang. Tim datang pukul 11.20 sebelum jam loading gedung dibuka, semua monitor dibungkus rapi tanpa satu pun lecet.”
                  </p>
                  <footer className="mt-5 pt-4 border-t border-slate-200 text-xs">
                    <div className="font-semibold text-slate-900">Dimas Prakoso</div>
                    <div className="text-slate-500 mt-0.5">
                      Head of Operations, Studio Arsitektur Karsa · CDD Double Box
                    </div>
                  </footer>
                </blockquote>

                <blockquote className="border border-slate-200 rounded-xl p-6 bg-[#F8FAFC] flex flex-col justify-between">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    “Jadwal serah terima kunci rumah mundur dua hari dari rencana. Melalui menu Cek Reservasi, jadwal truk Blind Van langsung kami geser ke hari Rabu tanpa biaya penalti dan malah mendapat potongan hari kerja.”
                  </p>
                  <footer className="mt-5 pt-4 border-t border-slate-200 text-xs">
                    <div className="font-semibold text-slate-900">Reza Mahendra</div>
                    <div className="text-slate-500 mt-0.5">
                      Dokter Gigi · Pindahan Depok – Bekasi (24 km)
                    </div>
                  </footer>
                </blockquote>
              </div>
            </div>

            {/* Lookup Panel */}
            <BookingLookupSection externalLookupCode={externalLookupCode} />
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-[#0F172A] text-slate-300 py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <div className="font-display text-lg font-bold text-white tracking-tight">
              PANDAWA MOVERS
            </div>
            <p className="mt-2.5 text-sm text-slate-400 max-w-sm leading-relaxed">
              Jasa pindahan residensial dan komersial berbasis estimasi tarif terikat serta penjadwalan armada daring.
            </p>
          </div>

          <div className="md:col-span-3 text-sm space-y-2">
            <div className="font-semibold text-white mb-2">Navigasi</div>
            <div>
              <a href="#layanan" className="hover:text-white transition-colors">
                Layanan & Packing
              </a>
            </div>
            <div>
              <a href="#armada" className="hover:text-white transition-colors">
                Spesifikasi Armada
              </a>
            </div>
            <div>
              <a href="#galeri" className="hover:text-white transition-colors">
                Galeri Lapangan
              </a>
            </div>
            <div>
              <a href="#estimasi" className="hover:text-white transition-colors">
                Kalkulator Estimasi
              </a>
            </div>
            <div>
              <a href="#reservasi" className="hover:text-white transition-colors">
                Reservasi Jadwal
              </a>
            </div>
          </div>

          <div className="md:col-span-4 text-sm space-y-2">
            <div className="font-semibold text-white mb-2">Pusat Operasional</div>
            <div className="text-slate-400">
              Pool Jakarta: Jl. Raya Bekasi Km. 18, Cakung, Jakarta Timur
            </div>
            <div className="text-slate-400">
              Pool Bandung: Jl. Soekarno Hatta No. 412, Bandung
            </div>
            <div className="font-mono text-xs text-slate-400 pt-1">
              Operasional Lapangan: Setiap Hari 07:00 – 20:00 WIB
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>© 2026 Pandawa Movers Indonesia. Hak cipta dilindungi.</span>
          <span>Tarif transparan · Reschedule gratis H-1</span>
        </div>
      </footer>
    </div>
  );
}
