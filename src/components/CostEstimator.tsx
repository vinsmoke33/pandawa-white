import { ArrowRight, Check, Info, Minus, Plus, RotateCcw } from 'lucide-react';
import {
  EstimateInput,
  EstimateResult,
  FLEET_SPECS,
  FleetId,
  INVENTORY_CATALOG,
  InventoryCounts,
  PROPERTY_PRESETS,
  PropertyType,
  ZONES,
  estimateRoadDistanceKm,
  formatIDR,
} from '../lib/pricing';

interface CostEstimatorProps {
  input: EstimateInput;
  estimate: EstimateResult;
  onChange: (next: EstimateInput) => void;
  onProceedToReservation: () => void;
}

const PROPERTY_TABS: { id: PropertyType; label: string; hint: string }[] = [
  { id: 'apartemen', label: 'Apartemen / Kos', hint: 'Studio s.d. 2BR' },
  { id: 'rumah', label: 'Rumah Tinggal', hint: 'Tipe 36 s.d. 120+' },
  { id: 'kantor', label: 'Kantor / Ruko', hint: 'Meja kerja & arsip' },
];

export function CostEstimator({
  input,
  estimate,
  onChange,
  onProceedToReservation,
}: CostEstimatorProps) {
  const handlePropertySwitch = (propertyType: PropertyType) => {
    const preset = PROPERTY_PRESETS[propertyType];
    onChange({
      ...input,
      propertyType,
      inventory: { ...preset },
      autoFleet: true,
    });
  };

  const handleZoneChange = (field: 'originZoneId' | 'destinationZoneId', value: string) => {
    const nextOrigin = field === 'originZoneId' ? value : input.originZoneId;
    const nextDest = field === 'destinationZoneId' ? value : input.destinationZoneId;
    const nextDistance = estimateRoadDistanceKm(nextOrigin, nextDest);
    onChange({
      ...input,
      [field]: value,
      distanceKm: nextDistance,
    });
  };

  const updateInventory = (key: keyof InventoryCounts, delta: number) => {
    const def = INVENTORY_CATALOG.find((i) => i.key === key);
    const maxCount = def?.maxCount ?? 50;
    const current = input.inventory[key] || 0;
    const nextVal = Math.max(0, Math.min(maxCount, current + delta));
    onChange({
      ...input,
      inventory: {
        ...input.inventory,
        [key]: nextVal,
      },
    });
  };

  const handleReset = () => {
    const preset = PROPERTY_PRESETS[input.propertyType];
    onChange({
      ...input,
      inventory: { ...preset },
      autoFleet: true,
      crewCount: 2,
      originFloor: 1,
      originHasElevator: true,
      destinationFloor: 1,
      destinationHasElevator: true,
      includePacking: false,
      includeDisassembly: false,
      includeInsurance: true,
    });
  };

  const activeFleet = estimate.activeFleet;

  return (
    <section id="estimasi" className="py-16 lg:py-24 border-t border-slate-200 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-semibold text-[#1D4ED8] mb-2">
              Kalkulator Tarif Transparan
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Estimasi Biaya Pindahan Otomatis
            </h2>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Sesuaikan rute, daftar barang, dan akses gedung untuk mendapatkan perhitungan biaya final yang mengikat sebelum armada diberangkatkan.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 self-start md:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Atur Ulang Muatan
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Configurator */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Property Type */}
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  01. Jenis Properti & Skala Pindahan
                </h3>
                <span className="text-xs text-slate-500">Mengisi estimasi muatan awal</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl">
                {PROPERTY_TABS.map((tab) => {
                  const isActive = input.propertyType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handlePropertySwitch(tab.id)}
                      className={`text-left px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <div className="text-sm font-semibold whitespace-nowrap">{tab.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{tab.hint}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Origin & Destination Route */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  02. Rute Penjemputan & Tujuan
                </h3>
                <span className="font-mono text-xs text-slate-600 tabular-nums">
                  {input.distanceKm} km estimasi jalan
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="origin-zone"
                    className="block text-xs font-medium text-slate-700 mb-1.5"
                  >
                    Kota / Zona Asal
                  </label>
                  <select
                    id="origin-zone"
                    value={input.originZoneId}
                    onChange={(e) => handleZoneChange('originZoneId', e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                  >
                    {ZONES.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} ({z.region})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="dest-zone"
                    className="block text-xs font-medium text-slate-700 mb-1.5"
                  >
                    Kota / Zona Tujuan
                  </label>
                  <select
                    id="dest-zone"
                    value={input.destinationZoneId}
                    onChange={(e) => handleZoneChange('destinationZoneId', e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                  >
                    {ZONES.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} ({z.region})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label htmlFor="distance-slider" className="font-medium text-slate-700">
                    Sesuaikan Jarak Tempuh Aktual (5 km pertama gratis)
                  </label>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {input.distanceKm} km
                  </span>
                </div>
                <input
                  id="distance-slider"
                  type="range"
                  min={5}
                  max={750}
                  step={1}
                  value={input.distanceKm}
                  onChange={(e) =>
                    onChange({ ...input, distanceKm: Number(e.target.value) })
                  }
                  className="w-full accent-[#1D4ED8] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums mt-1">
                  <span>5 km (Dalam Kota)</span>
                  <span>60 km (Jabodetabek)</span>
                  <span>150+ km (Bandung)</span>
                  <span>750 km (Surabaya)</span>
                </div>
              </div>
            </div>

            {/* Step 3: Inventory & Volume Calculator */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  03. Perkiraan Barang & Volume Muatan
                </h3>
                <span className="font-mono text-xs text-slate-700 tabular-nums">
                  Total Volume: <strong>{estimate.totalVolumeM3} m³</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INVENTORY_CATALOG.map((item) => {
                  const count = input.inventory[item.key] || 0;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-3 px-4 py-3 border border-slate-200 rounded-lg bg-[#F8FAFC]"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {item.label}
                        </div>
                        <div className="text-xs text-slate-500 font-mono tabular-nums">
                          {item.unitVolumeM3} m³/unit
                          {item.note ? ` · ${item.note}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          aria-label={`Kurangi ${item.label}`}
                          onClick={() => updateInventory(item.key, -1)}
                          disabled={count <= 0}
                          className="w-9 h-9 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-mono text-sm font-semibold text-slate-900 tabular-nums">
                          {count}
                        </span>
                        <button
                          type="button"
                          aria-label={`Tambah ${item.label}`}
                          onClick={() => updateInventory(item.key, 1)}
                          disabled={count >= item.maxCount}
                          className="w-9 h-9 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fleet Selection Mode */}
              <div className="mt-5 p-4 border border-slate-200 rounded-xl bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Pemilihan Armada Angkut
                    </div>
                    <div className="text-xs text-slate-600">
                      Rekomendasi sistem untuk {estimate.totalVolumeM3} m³:{' '}
                      <span className="font-semibold text-[#1D4ED8]">
                        {FLEET_SPECS[estimate.recommendedFleetId].name}
                      </span>
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={input.autoFleet}
                      onChange={(e) =>
                        onChange({
                          ...input,
                          autoFleet: e.target.checked,
                          selectedFleetId: estimate.recommendedFleetId,
                        })
                      }
                      className="w-4 h-4 rounded accent-[#1D4ED8]"
                    />
                    Pilih armada otomatis
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(Object.keys(FLEET_SPECS) as FleetId[]).map((fid) => {
                    const spec = FLEET_SPECS[fid];
                    const isSelected = activeFleet.id === fid;
                    return (
                      <button
                        key={fid}
                        type="button"
                        onClick={() =>
                          onChange({
                            ...input,
                            autoFleet: false,
                            selectedFleetId: fid,
                            crewCount: Math.max(spec.includedCrew, Math.min(spec.maxCrew, input.crewCount)),
                          })
                        }
                        className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[#1D4ED8] bg-[#EFF6FF]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {spec.name.split(' (')[0]}
                          </span>
                          {fid === estimate.recommendedFleetId && (
                            <span className="text-[11px] font-semibold text-[#1D4ED8]">
                              Ideal
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-600 tabular-nums mt-1">
                          Maks {spec.capacityM3} m³ · {formatIDR(spec.baseFee)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Capacity Bar */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-600">
                      Okupansi Ruang Bak ({estimate.totalVolumeM3} / {activeFleet.capacityM3} m³)
                    </span>
                    <span
                      className={`font-semibold tabular-nums ${
                        estimate.isOverCapacity ? 'text-amber-700' : 'text-slate-800'
                      }`}
                    >
                      {estimate.capacityUtilizationPct}% —{' '}
                      {estimate.isOverCapacity ? 'Melebihi Kapasitas (Naikkan Armada)' : 'Kapasitas Aman'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        estimate.isOverCapacity ? 'bg-amber-600' : 'bg-[#1D4ED8]'
                      }`}
                      style={{ width: `${Math.min(100, estimate.capacityUtilizationPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Crew, Stairs & Add-ons */}
            <div className="pt-6 border-t border-slate-200 space-y-5">
              <h3 className="font-display text-base font-semibold text-slate-900">
                04. Tenaga Angkut, Akses Lantai & Layanan Tambahan
              </h3>

              {/* Crew Stepper */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-slate-200 rounded-lg bg-[#F8FAFC]">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Jumlah Kru Lapangan Profesional
                  </div>
                  <div className="text-xs text-slate-600">
                    Sudah termasuk {activeFleet.includedCrew} kru inti. Tambahan Rp 175.000/orang.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Kurangi jumlah kru"
                    onClick={() =>
                      onChange({
                        ...input,
                        crewCount: Math.max(activeFleet.includedCrew, input.crewCount - 1),
                      })
                    }
                    disabled={input.crewCount <= activeFleet.includedCrew}
                    className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    {Math.max(activeFleet.includedCrew, Math.min(activeFleet.maxCrew, input.crewCount))} orang
                  </span>
                  <button
                    type="button"
                    aria-label="Tambah jumlah kru"
                    onClick={() =>
                      onChange({
                        ...input,
                        crewCount: Math.min(activeFleet.maxCrew, input.crewCount + 1),
                      })
                    }
                    disabled={input.crewCount >= activeFleet.maxCrew}
                    className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Floor & Lift Access */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg bg-white space-y-3">
                  <div className="text-xs font-semibold text-slate-900">Akses Lokasi Asal</div>
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="origin-floor" className="text-xs text-slate-600">
                      Posisi Lantai
                    </label>
                    <select
                      id="origin-floor"
                      value={input.originFloor}
                      onChange={(e) => onChange({ ...input, originFloor: Number(e.target.value) })}
                      className="h-9 px-2.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 font-mono"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 15, 20].map((fl) => (
                        <option key={fl} value={fl}>
                          Lantai {fl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={input.originHasElevator}
                      onChange={(e) =>
                        onChange({ ...input, originHasElevator: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-[#1D4ED8]"
                    />
                    Tersedia lift barang / akses datar
                  </label>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg bg-white space-y-3">
                  <div className="text-xs font-semibold text-slate-900">Akses Lokasi Tujuan</div>
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="dest-floor" className="text-xs text-slate-600">
                      Posisi Lantai
                    </label>
                    <select
                      id="dest-floor"
                      value={input.destinationFloor}
                      onChange={(e) =>
                        onChange({ ...input, destinationFloor: Number(e.target.value) })
                      }
                      className="h-9 px-2.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 font-mono"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 15, 20].map((fl) => (
                        <option key={fl} value={fl}>
                          Lantai {fl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={input.destinationHasElevator}
                      onChange={(e) =>
                        onChange({ ...input, destinationHasElevator: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-[#1D4ED8]"
                    />
                    Tersedia lift barang / akses datar
                  </label>
                </div>
              </div>

              {/* Add-on Services */}
              <div className="space-y-2.5">
                <label className="flex items-start justify-between gap-4 p-3.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={input.includePacking}
                      onChange={(e) =>
                        onChange({ ...input, includePacking: e.target.checked })
                      }
                      className="mt-0.5 w-4 h-4 rounded accent-[#1D4ED8]"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        Full Packing & Material Standar Ekspor
                      </div>
                      <div className="text-xs text-slate-600">
                        Kru membungkus seluruh barang pecah belah, elektronik, dan pakaian gantung
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-800 whitespace-nowrap tabular-nums">
                    {formatIDR(Math.max(150000, Math.ceil(estimate.totalVolumeM3) * 65000))}
                  </span>
                </label>

                <label className="flex items-start justify-between gap-4 p-3.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={input.includeDisassembly}
                      onChange={(e) =>
                        onChange({ ...input, includeDisassembly: e.target.checked })
                      }
                      className="mt-0.5 w-4 h-4 rounded accent-[#1D4ED8]"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        Bongkar-Pasang Furnitur (Lemari & Dipan)
                      </div>
                      <div className="text-xs text-slate-600">
                        Peralatan lengkap beserta perangkaian ulang di ruangan tujuan
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-800 whitespace-nowrap tabular-nums">
                    {formatIDR(
                      Math.min(
                        600000,
                        150000 + Math.max(1, input.inventory.wardrobe + input.inventory.mattress) * 50000
                      )
                    )}
                  </span>
                </label>

                <label className="flex items-start justify-between gap-4 p-3.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={input.includeInsurance}
                      onChange={(e) =>
                        onChange({ ...input, includeInsurance: e.target.checked })
                      }
                      className="mt-0.5 w-4 h-4 rounded accent-[#1D4ED8]"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        Asuransi Perlindungan Kargo Penuh
                      </div>
                      <div className="text-xs text-slate-600">
                        Perlindungan finansial terhadap risiko kerusakan fisik selama pengangkutan
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-800 whitespace-nowrap tabular-nums">
                    {formatIDR(activeFleet.id === 'cdd-box' ? 220000 : 140000)}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Live Itemized Receipt */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="border border-slate-200 rounded-xl bg-[#F8FAFC] p-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Rincian Estimasi Otomatis
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                    {activeFleet.name}
                  </h3>
                  <div className="text-xs text-slate-600 mt-1">
                    {ZONES.find((z) => z.id === input.originZoneId)?.name} →{' '}
                    {ZONES.find((z) => z.id === input.destinationZoneId)?.name} ·{' '}
                    <span className="font-mono tabular-nums">{input.distanceKm} km</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-500">Estimasi Durasi</div>
                  <div className="font-mono text-xs font-semibold text-slate-900 mt-0.5 tabular-nums">
                    {estimate.estimatedDurationHours}
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="py-4 space-y-3 border-b border-slate-200">
                {estimate.lineItems.map((line, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-4 text-sm">
                    <div className="min-w-0">
                      <div
                        className={`font-medium ${
                          line.isDiscount ? 'text-emerald-700' : 'text-slate-800'
                        }`}
                      >
                        {line.label}
                      </div>
                      <div className="text-xs text-slate-500">{line.detail}</div>
                    </div>
                    <div
                      className={`font-mono text-sm font-medium whitespace-nowrap tabular-nums ${
                        line.isDiscount ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {formatIDR(line.amount)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="py-5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-700">
                    Total Estimasi Biaya
                  </span>
                  <span className="font-display font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                    {formatIDR(estimate.totalCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span>Uang muka kunci jadwal (20%)</span>
                  <span className="font-mono font-medium text-slate-700 tabular-nums">
                    {formatIDR(estimate.depositAmount)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 mb-5">
                <Info className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
                <span>
                  Harga sudah mencakup BBM, tol dalam kota standar, dan perlengkapan pengaman selimut serta tali pengikat.
                </span>
              </div>

              <button
                type="button"
                onClick={onProceedToReservation}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
              >
                Lanjut ke Reservasi Jadwal
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-slate-700" />
                  Reschedule gratis H-1
                </span>
                <span aria-hidden="true">·</span>
                <span>Tanpa biaya tersembunyi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
