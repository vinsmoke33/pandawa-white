export type FleetId = 'blind-van' | 'cde-engkel' | 'cdd-box';
export type PropertyType = 'apartemen' | 'rumah' | 'kantor';
export type TimeSlotId = 'pagi' | 'siang' | 'sore';

export interface FleetSpec {
  id: FleetId;
  name: string;
  subtitle: string;
  capacityM3: number;
  maxWeightKg: number;
  dimensions: string;
  includedCrew: number;
  maxCrew: number;
  baseFee: number;
  ratePerKm: number;
  idealFor: string;
}

export const FLEET_SPECS: Record<FleetId, FleetSpec> = {
  'blind-van': {
    id: 'blind-van',
    name: 'Blind Van Cargo',
    subtitle: 'Unit ringkas akses jalan sempit & basement',
    capacityM3: 3.5,
    maxWeightKg: 800,
    dimensions: '2,2m × 1,4m × 1,2m',
    includedCrew: 2,
    maxCrew: 3,
    baseFee: 450000,
    ratePerKm: 9000,
    idealFor: 'Kos, apartemen studio, atau pindahan 10–25 kardus',
  },
  'cde-engkel': {
    id: 'cde-engkel',
    name: 'CDE Engkel Box (4 Roda)',
    subtitle: 'Armada paling populer untuk apartemen 2BR & rumah tipe 45–70',
    capacityM3: 9.0,
    maxWeightKg: 2200,
    dimensions: '3,1m × 1,7m × 1,7m',
    includedCrew: 2,
    maxCrew: 5,
    baseFee: 850000,
    ratePerKm: 14000,
    idealFor: 'Apartemen 1–3 kamar, rumah keluarga kecil, kantor ruko',
  },
  'cdd-box': {
    id: 'cdd-box',
    name: 'CDD Double Box (6 Roda)',
    subtitle: 'Kapasitas ekstra dengan hydraulic tail-lift untuk muatan besar',
    capacityM3: 16.5,
    maxWeightKg: 4500,
    dimensions: '4,3m × 1,9m × 2,0m',
    includedCrew: 3,
    maxCrew: 6,
    baseFee: 1350000,
    ratePerKm: 19000,
    idealFor: 'Rumah besar 3+ kamar, pindahan kantor penuh, antarkota',
  },
};

export interface ZoneOption {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
}

export const ZONES: ZoneOption[] = [
  { id: 'jaksel', name: 'Jakarta Selatan', region: 'DKI Jakarta', lat: -6.2615, lng: 106.8106 },
  { id: 'jakpus', name: 'Jakarta Pusat', region: 'DKI Jakarta', lat: -6.1862, lng: 106.8341 },
  { id: 'jakbar', name: 'Jakarta Barat', region: 'DKI Jakarta', lat: -6.1674, lng: 106.7637 },
  { id: 'jaktim', name: 'Jakarta Timur', region: 'DKI Jakarta', lat: -6.225, lng: 106.9004 },
  { id: 'jakut', name: 'Jakarta Utara', region: 'DKI Jakarta', lat: -6.1384, lng: 106.8639 },
  { id: 'bsd', name: 'Tangerang / BSD City', region: 'Banten', lat: -6.3017, lng: 106.6524 },
  { id: 'depok', name: 'Depok', region: 'Jawa Barat', lat: -6.4025, lng: 106.7942 },
  { id: 'bekasi', name: 'Bekasi', region: 'Jawa Barat', lat: -6.2383, lng: 106.9756 },
  { id: 'bogor', name: 'Bogor', region: 'Jawa Barat', lat: -6.5971, lng: 106.806 },
  { id: 'bandung', name: 'Bandung', region: 'Jawa Barat', lat: -6.9175, lng: 107.6191 },
  { id: 'semarang', name: 'Semarang', region: 'Jawa Tengah', lat: -6.9667, lng: 110.4167 },
  { id: 'surabaya', name: 'Surabaya', region: 'Jawa Timur', lat: -7.2575, lng: 112.7521 },
];

export function estimateRoadDistanceKm(originId: string, destinationId: string): number {
  if (originId === destinationId) return 9;
  const o = ZONES.find((z) => z.id === originId);
  const d = ZONES.find((z) => z.id === destinationId);
  if (!o || !d) return 15;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(d.lat - o.lat);
  const dLng = toRad(d.lng - o.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(o.lat)) * Math.cos(toRad(d.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;
  return Math.max(8, Math.round(straightKm * 1.28));
}

export interface InventoryKeyDef {
  key: keyof InventoryCounts;
  label: string;
  unitVolumeM3: number;
  defaultCount: number;
  maxCount: number;
  note?: string;
}

export interface InventoryCounts {
  boxes: number;
  mattress: number;
  sofa: number;
  wardrobe: number;
  appliance: number;
  desk: number;
  heavy: number;
}

export const INVENTORY_CATALOG: InventoryKeyDef[] = [
  { key: 'boxes', label: 'Kardus & Kontainer', unitVolumeM3: 0.09, defaultCount: 12, maxCount: 120 },
  { key: 'mattress', label: 'Kasur & Ranjang', unitVolumeM3: 1.1, defaultCount: 1, maxCount: 10 },
  { key: 'sofa', label: 'Sofa & Meja Tamu', unitVolumeM3: 1.35, defaultCount: 1, maxCount: 8 },
  { key: 'wardrobe', label: 'Lemari Pakaian', unitVolumeM3: 1.45, defaultCount: 1, maxCount: 10 },
  { key: 'appliance', label: 'Kulkas / Mesin Cuci', unitVolumeM3: 0.9, defaultCount: 1, maxCount: 8 },
  { key: 'desk', label: 'Meja Kerja & Komputer', unitVolumeM3: 0.7, defaultCount: 1, maxCount: 25 },
  {
    key: 'heavy',
    label: 'Item Khusus (Piano / Brankas)',
    unitVolumeM3: 1.2,
    defaultCount: 0,
    maxCount: 5,
    note: '+Rp 250.000/unit',
  },
];

export const DEFAULT_INVENTORY: InventoryCounts = {
  boxes: 14,
  mattress: 1,
  sofa: 1,
  wardrobe: 1,
  appliance: 1,
  desk: 1,
  heavy: 0,
};

export const PROPERTY_PRESETS: Record<PropertyType, InventoryCounts> = {
  apartemen: { boxes: 12, mattress: 1, sofa: 1, wardrobe: 1, appliance: 1, desk: 1, heavy: 0 },
  rumah: { boxes: 28, mattress: 3, sofa: 2, wardrobe: 3, appliance: 2, desk: 2, heavy: 0 },
  kantor: { boxes: 35, mattress: 0, sofa: 1, wardrobe: 2, appliance: 1, desk: 8, heavy: 1 },
};

export interface EstimateInput {
  propertyType: PropertyType;
  originZoneId: string;
  destinationZoneId: string;
  distanceKm: number;
  inventory: InventoryCounts;
  autoFleet: boolean;
  selectedFleetId: FleetId;
  crewCount: number;
  originFloor: number;
  originHasElevator: boolean;
  destinationFloor: number;
  destinationHasElevator: boolean;
  includePacking: boolean;
  includeDisassembly: boolean;
  includeInsurance: boolean;
  scheduledDate?: string;
}

export interface EstimateLineItem {
  label: string;
  detail: string;
  amount: number;
  isDiscount?: boolean;
}

export interface EstimateResult {
  totalVolumeM3: number;
  recommendedFleetId: FleetId;
  activeFleet: FleetSpec;
  capacityUtilizationPct: number;
  isOverCapacity: boolean;
  lineItems: EstimateLineItem[];
  subtotal: number;
  discountAmount: number;
  totalCost: number;
  depositAmount: number;
  estimatedDurationHours: string;
}

export function getRecommendedFleet(volumeM3: number): FleetId {
  if (volumeM3 <= 3.5) return 'blind-van';
  if (volumeM3 <= 9.0) return 'cde-engkel';
  return 'cdd-box';
}

export function calculateEstimate(input: EstimateInput): EstimateResult {
  let totalVolumeM3 = 0;
  for (const item of INVENTORY_CATALOG) {
    totalVolumeM3 += (input.inventory[item.key] || 0) * item.unitVolumeM3;
  }
  totalVolumeM3 = Math.round(totalVolumeM3 * 10) / 10;

  const recommendedFleetId = getRecommendedFleet(totalVolumeM3);
  const effectiveFleetId = input.autoFleet ? recommendedFleetId : input.selectedFleetId;
  const activeFleet = FLEET_SPECS[effectiveFleetId];

  const capacityUtilizationPct = Math.min(
    180,
    Math.round((totalVolumeM3 / activeFleet.capacityM3) * 100)
  );
  const isOverCapacity = totalVolumeM3 > activeFleet.capacityM3;

  const effectiveCrew = Math.max(activeFleet.includedCrew, Math.min(activeFleet.maxCrew, input.crewCount));
  const extraCrewCount = Math.max(0, effectiveCrew - activeFleet.includedCrew);

  const lineItems: EstimateLineItem[] = [];

  lineItems.push({
    label: `Armada ${activeFleet.name}`,
    detail: `Termasuk ${activeFleet.includedCrew} kru inti & BBM dasar`,
    amount: activeFleet.baseFee,
  });

  const billableKm = Math.max(0, input.distanceKm - 5);
  const distanceFee = billableKm * activeFleet.ratePerKm;
  lineItems.push({
    label: `Biaya Jarak Tempuh (${input.distanceKm} km)`,
    detail:
      billableKm === 0
        ? 'Termasuk gratis 5 km pertama'
        : `5 km pertama gratis + ${billableKm} km × ${formatIDR(activeFleet.ratePerKm)}`,
    amount: distanceFee,
  });

  if (extraCrewCount > 0) {
    lineItems.push({
      label: `Tambahan Tenaga Angkut (+${extraCrewCount} kru)`,
      detail: `${extraCrewCount} orang × Rp 175.000`,
      amount: extraCrewCount * 175000,
    });
  }

  const originStairFloors = !input.originHasElevator && input.originFloor > 1 ? input.originFloor - 1 : 0;
  const destStairFloors =
    !input.destinationHasElevator && input.destinationFloor > 1 ? input.destinationFloor - 1 : 0;
  const totalStairFloors = originStairFloors + destStairFloors;

  if (totalStairFloors > 0) {
    lineItems.push({
      label: `Penanganan Tangga Manual (${totalStairFloors} lantai)`,
      detail: 'Tanpa akses lift barang (Rp 75.000/lantai)',
      amount: totalStairFloors * 75000,
    });
  }

  if (input.inventory.heavy > 0) {
    lineItems.push({
      label: `Penanganan Item Khusus (${input.inventory.heavy} unit)`,
      detail: 'Alat bantu tali sling & proteksi ekstra',
      amount: input.inventory.heavy * 250000,
    });
  }

  if (input.includePacking) {
    const packingFee = Math.max(150000, Math.ceil(totalVolumeM3) * 65000);
    lineItems.push({
      label: 'Full Packing & Material Standar Ekspor',
      detail: 'Kardus double-wall, bubble wrap, stretch film & pelabelan',
      amount: packingFee,
    });
  }

  if (input.includeDisassembly) {
    const furnitureUnits = Math.max(1, input.inventory.wardrobe + input.inventory.mattress);
    const disassemblyFee = Math.min(600000, 150000 + furnitureUnits * 50000);
    lineItems.push({
      label: 'Bongkar-Pasang Furnitur Knock-Down',
      detail: 'Lemari, dipan, dan pemasangan ulang di tujuan',
      amount: disassemblyFee,
    });
  }

  if (input.includeInsurance) {
    const insuranceFee = activeFleet.id === 'cdd-box' ? 220000 : 140000;
    const coverageLimit = activeFleet.id === 'cdd-box' ? 'Rp 250 Juta' : 'Rp 100 Juta';
    lineItems.push({
      label: 'Asuransi Perlindungan Kargo Penuh',
      detail: `Proteksi kerusakan & kehilangan hingga ${coverageLimit}`,
      amount: insuranceFee,
    });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  // Midweek (Tue-Thu) scheduling discount: 5% off base + distance
  let discountAmount = 0;
  if (input.scheduledDate) {
    const day = new Date(`${input.scheduledDate}T00:00:00`).getDay();
    if (day >= 2 && day <= 4) {
      discountAmount = Math.round(((activeFleet.baseFee + distanceFee) * 0.05) / 1000) * 1000;
      if (discountAmount > 0) {
        lineItems.push({
          label: 'Potongan Jadwal Hari Kerja (Sel–Kam)',
          detail: 'Diskon 5% tarif armada & jarak untuk slot non-akhir pekan',
          amount: -discountAmount,
          isDiscount: true,
        });
      }
    }
  }

  const totalCost = Math.max(0, subtotal - discountAmount);
  const depositAmount = Math.round((totalCost * 0.2) / 1000) * 1000;

  let estimatedDurationHours = '2 – 3 jam';
  if (input.distanceKm > 100) {
    const driveHrs = Math.ceil(input.distanceKm / 55);
    estimatedDurationHours = `${driveHrs + 2} – ${driveHrs + 4} jam (antarkota)`;
  } else if (totalVolumeM3 > 9 || totalStairFloors >= 3) {
    estimatedDurationHours = '4 – 6 jam';
  } else if (totalVolumeM3 > 4) {
    estimatedDurationHours = '3 – 4 jam';
  }

  return {
    totalVolumeM3,
    recommendedFleetId,
    activeFleet,
    capacityUtilizationPct,
    isOverCapacity,
    lineItems,
    subtotal,
    discountAmount,
    totalCost,
    depositAmount,
    estimatedDurationHours,
  };
}

export function formatIDR(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('id-ID').format(abs);
  return amount < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

export const TIME_SLOTS: { id: TimeSlotId; label: string; timeRange: string; note: string }[] = [
  { id: 'pagi', label: 'Sesi Pagi', timeRange: '08:00 – 11:00 WIB', note: 'Berangkat paling awal, bebas macet siang' },
  { id: 'siang', label: 'Sesi Siang', timeRange: '11:30 – 14:30 WIB', note: 'Ideal untuk check-out apartemen pukul 12.00' },
  { id: 'sore', label: 'Sesi Sore', timeRange: '15:00 – 18:00 WIB', note: 'Tersedia untuk pindahan dalam kota' },
];
