import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { FLEET_SPECS, FleetId, TIME_SLOTS, TimeSlotId } from './src/lib/pricing';

interface ReservationRecord {
  bookingCode: string;
  createdAt: string;
  status: 'Terkonfirmasi' | 'Dijadwalkan Ulang' | 'Dibatalkan';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyType: string;
  originZoneName: string;
  originAddress: string;
  destinationZoneName: string;
  destinationAddress: string;
  distanceKm: number;
  fleetId: FleetId;
  fleetName: string;
  crewCount: number;
  date: string;
  timeSlot: TimeSlotId;
  timeRange: string;
  totalVolumeM3: number;
  totalCost: number;
  depositAmount: number;
  paymentMethod: 'dp-online' | 'bayar-lunas-lokasi';
  notes: string;
  lineItems: { label: string; detail: string; amount: number; isDiscount?: boolean }[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'reservations.json');

const MAX_CREWS_PER_SLOT = 3;
const MAX_UNITS_PER_FLEET_SLOT = 2;

function getOffsetDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getSeedReservations(): ReservationRecord[] {
  const tomorrow = getOffsetDateString(1);
  const dayAfter = getOffsetDateString(2);

  return [
    {
      bookingCode: 'GP-2026-1042',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'Terkonfirmasi',
      customerName: 'Budi Santoso',
      customerPhone: '081288441042',
      customerEmail: 'budi.santoso@example.com',
      propertyType: 'apartemen',
      originZoneName: 'Jakarta Selatan',
      originAddress: 'Apartemen Kemang Village Tower Tiffany Lt. 12, Kemang',
      destinationZoneName: 'Tangerang / BSD City',
      destinationAddress: 'Cluster The Zora Blok C8 No. 14, BSD City',
      distanceKm: 28,
      fleetId: 'cde-engkel',
      fleetName: FLEET_SPECS['cde-engkel'].name,
      crewCount: 3,
      date: tomorrow,
      timeSlot: 'pagi',
      timeRange: '08:00 – 11:00 WIB',
      totalVolumeM3: 6.8,
      totalCost: 1685000,
      depositAmount: 337000,
      paymentMethod: 'dp-online',
      notes: 'Surat izin loading apartemen sudah diurus ke pengelola.',
      lineItems: [
        { label: 'Armada CDE Engkel Box (4 Roda)', detail: 'Termasuk 2 kru inti & BBM dasar', amount: 850000 },
        { label: 'Biaya Jarak Tempuh (28 km)', detail: '5 km pertama gratis + 23 km × Rp 14.000', amount: 322000 },
        { label: 'Tambahan Tenaga Angkut (+1 kru)', detail: '1 orang × Rp 175.000', amount: 175000 },
        { label: 'Asuransi Perlindungan Kargo Penuh', detail: 'Proteksi kerusakan & kehilangan hingga Rp 100 Juta', amount: 140000 },
      ],
    },
    {
      bookingCode: 'GP-2026-1088',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'Terkonfirmasi',
      customerName: 'Ratna Permatasari',
      customerPhone: '081399201088',
      customerEmail: 'ratna.p@example.com',
      propertyType: 'rumah',
      originZoneName: 'Depok',
      originAddress: 'Jl. Margonda Raya Kav. 21, Beji, Depok',
      destinationZoneName: 'Jakarta Timur',
      destinationAddress: 'Perumahan Cibubur Country Blok D2 No. 9',
      distanceKm: 19,
      fleetId: 'cde-engkel',
      fleetName: FLEET_SPECS['cde-engkel'].name,
      crewCount: 3,
      date: tomorrow,
      timeSlot: 'pagi',
      timeRange: '08:00 – 11:00 WIB',
      totalVolumeM3: 8.1,
      totalCost: 1461000,
      depositAmount: 292000,
      paymentMethod: 'bayar-lunas-lokasi',
      notes: 'Mohon bawa troli untuk mesin cuci dan kulkas 2 pintu.',
      lineItems: [
        { label: 'Armada CDE Engkel Box (4 Roda)', detail: 'Termasuk 2 kru inti & BBM dasar', amount: 850000 },
        { label: 'Biaya Jarak Tempuh (19 km)', detail: '5 km pertama gratis + 14 km × Rp 14.000', amount: 196000 },
        { label: 'Tambahan Tenaga Angkut (+1 kru)', detail: '1 orang × Rp 175.000', amount: 175000 },
        { label: 'Bongkar-Pasang Furnitur Knock-Down', detail: 'Lemari & dipan', amount: 240000 },
      ],
    },
    {
      bookingCode: 'GP-2026-1105',
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      status: 'Terkonfirmasi',
      customerName: 'Hendra Wijaya',
      customerPhone: '081177601105',
      customerEmail: 'hendra.w@example.com',
      propertyType: 'kantor',
      originZoneName: 'Jakarta Pusat',
      originAddress: 'Menara Thamrin Lt. 7, Jl. MH Thamrin',
      destinationZoneName: 'Jakarta Selatan',
      destinationAddress: 'Gedung Graha Irama Lt. 4, Kuningan',
      distanceKm: 9,
      fleetId: 'cdd-box',
      fleetName: FLEET_SPECS['cdd-box'].name,
      crewCount: 5,
      date: dayAfter,
      timeSlot: 'siang',
      timeRange: '11:30 – 14:30 WIB',
      totalVolumeM3: 13.4,
      totalCost: 2396000,
      depositAmount: 479000,
      paymentMethod: 'dp-online',
      notes: 'Akses loading dock belakang buka pukul 11.30 WIB.',
      lineItems: [
        { label: 'Armada CDD Double Box (6 Roda)', detail: 'Termasuk 3 kru inti & BBM dasar', amount: 1350000 },
        { label: 'Biaya Jarak Tempuh (9 km)', detail: '5 km pertama gratis + 4 km × Rp 19.000', amount: 76000 },
        { label: 'Tambahan Tenaga Angkut (+2 kru)', detail: '2 orang × Rp 175.000', amount: 350000 },
        { label: 'Full Packing & Material Standar Ekspor', detail: 'Kardus & bubble wrap server/PC', amount: 620000 },
      ],
    },
  ];
}

function loadReservations(): ReservationRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const seeded = getSeedReservations();
      fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
      return seeded;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return getSeedReservations();
  }
}

function saveReservations(records: ReservationRecord[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '').replace(/^62/, '0');
}

function computeDateAvailability(date: string, records: ReservationRecord[]) {
  const activeForDate = records.filter(
    (r) => r.date === date && r.status !== 'Dibatalkan'
  );

  return TIME_SLOTS.map((slot) => {
    const slotBookings = activeForDate.filter((r) => r.timeSlot === slot.id);
    const bookedTotal = slotBookings.length;
    const remainingTotal = Math.max(0, MAX_CREWS_PER_SLOT - bookedTotal);

    const fleetRemaining: Record<FleetId, number> = {
      'blind-van': Math.max(
        0,
        Math.min(
          remainingTotal,
          MAX_UNITS_PER_FLEET_SLOT - slotBookings.filter((b) => b.fleetId === 'blind-van').length
        )
      ),
      'cde-engkel': Math.max(
        0,
        Math.min(
          remainingTotal,
          MAX_UNITS_PER_FLEET_SLOT - slotBookings.filter((b) => b.fleetId === 'cde-engkel').length
        )
      ),
      'cdd-box': Math.max(
        0,
        Math.min(
          remainingTotal,
          MAX_UNITS_PER_FLEET_SLOT - slotBookings.filter((b) => b.fleetId === 'cdd-box').length
        )
      ),
    };

    let statusText = `Tersedia ${remainingTotal} slot kru`;
    if (remainingTotal === 1) {
      statusText = 'Sisa 1 slot terakhir';
    } else if (remainingTotal === 0) {
      statusText = 'Jadwal penuh';
    }

    return {
      id: slot.id,
      label: slot.label,
      timeRange: slot.timeRange,
      note: slot.note,
      bookedTotal,
      maxTotal: MAX_CREWS_PER_SLOT,
      remainingTotal,
      isFull: remainingTotal === 0,
      statusText,
      fleetRemaining,
    };
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Ensure initial seeded data file exists on boot
  loadReservations();

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/availability', (req, res) => {
    const dateParam = typeof req.query.date === 'string' ? req.query.date : getOffsetDateString(1);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      res.status(400).json({ error: 'Format tanggal harus YYYY-MM-DD.' });
      return;
    }
    const records = loadReservations();
    const slots = computeDateAvailability(dateParam, records);
    res.json({ date: dateParam, slots });
  });

  app.post('/api/reservations', (req, res) => {
    const body = req.body || {};
    const requiredStrings = [
      'customerName',
      'customerPhone',
      'customerEmail',
      'originAddress',
      'destinationAddress',
      'date',
      'timeSlot',
      'fleetId',
    ];

    for (const field of requiredStrings) {
      if (!body[field] || typeof body[field] !== 'string' || !body[field].trim()) {
        res.status(400).json({ error: `Kolom wajib belum diisi: ${field}` });
        return;
      }
    }

    const fleetId = body.fleetId as FleetId;
    if (!FLEET_SPECS[fleetId]) {
      res.status(400).json({ error: 'Jenis armada tidak valid.' });
      return;
    }

    const slotDef = TIME_SLOTS.find((s) => s.id === body.timeSlot);
    if (!slotDef) {
      res.status(400).json({ error: 'Sesi waktu tidak valid.' });
      return;
    }

    const records = loadReservations();
    const slots = computeDateAvailability(body.date, records);
    const targetSlot = slots.find((s) => s.id === body.timeSlot);

    if (!targetSlot || targetSlot.isFull || targetSlot.fleetRemaining[fleetId] <= 0) {
      res.status(409).json({
        error: `Maaf, slot ${slotDef.label} (${slotDef.timeRange}) untuk ${FLEET_SPECS[fleetId].name} pada tanggal ${body.date} sudah penuh. Silakan pilih sesi atau tanggal lain.`,
      });
      return;
    }

    const randomDigits = String(Math.floor(2000 + Math.random() * 7999));
    const bookingCode = `GP-2026-${randomDigits}`;

    const newRecord: ReservationRecord = {
      bookingCode,
      createdAt: new Date().toISOString(),
      status: 'Terkonfirmasi',
      customerName: String(body.customerName).trim().slice(0, 100),
      customerPhone: String(body.customerPhone).trim().slice(0, 30),
      customerEmail: String(body.customerEmail).trim().slice(0, 100),
      propertyType: String(body.propertyType || 'rumah'),
      originZoneName: String(body.originZoneName || 'Jabodetabek'),
      originAddress: String(body.originAddress).trim().slice(0, 260),
      destinationZoneName: String(body.destinationZoneName || 'Jabodetabek'),
      destinationAddress: String(body.destinationAddress).trim().slice(0, 260),
      distanceKm: Number(body.distanceKm) || 15,
      fleetId,
      fleetName: FLEET_SPECS[fleetId].name,
      crewCount: Number(body.crewCount) || FLEET_SPECS[fleetId].includedCrew,
      date: String(body.date),
      timeSlot: slotDef.id,
      timeRange: slotDef.timeRange,
      totalVolumeM3: Number(body.totalVolumeM3) || 5,
      totalCost: Number(body.totalCost) || FLEET_SPECS[fleetId].baseFee,
      depositAmount: Number(body.depositAmount) || Math.round(FLEET_SPECS[fleetId].baseFee * 0.2),
      paymentMethod: body.paymentMethod === 'bayar-lunas-lokasi' ? 'bayar-lunas-lokasi' : 'dp-online',
      notes: String(body.notes || '').trim().slice(0, 400),
      lineItems: Array.isArray(body.lineItems) ? body.lineItems.slice(0, 15) : [],
    };

    records.unshift(newRecord);
    saveReservations(records);

    res.status(201).json({ reservation: newRecord });
  });

  app.get('/api/reservations/:query', (req, res) => {
    const rawQuery = decodeURIComponent(req.params.query || '').trim();
    if (!rawQuery) {
      res.status(400).json({ error: 'Masukkan kode reservasi atau nomor WhatsApp.' });
      return;
    }

    const records = loadReservations();
    const upperCode = rawQuery.toUpperCase();
    const normalizedPhone = normalizePhone(rawQuery);

    const matches = records.filter(
      (r) =>
        r.bookingCode.toUpperCase() === upperCode ||
        (normalizedPhone.length >= 8 && normalizePhone(r.customerPhone) === normalizedPhone)
    );

    if (matches.length === 0) {
      res.status(404).json({
        error: `Reservasi dengan kode atau nomor "${rawQuery}" tidak ditemukan.`,
      });
      return;
    }

    res.json({ reservations: matches });
  });

  app.patch('/api/reservations/:code', (req, res) => {
    const code = decodeURIComponent(req.params.code || '').trim().toUpperCase();
    const records = loadReservations();
    const idx = records.findIndex((r) => r.bookingCode.toUpperCase() === code);

    if (idx === -1) {
      res.status(404).json({ error: 'Kode reservasi tidak ditemukan.' });
      return;
    }

    const current = records[idx];
    const { action, date, timeSlot } = req.body || {};

    if (action === 'cancel') {
      records[idx] = { ...current, status: 'Dibatalkan' };
      saveReservations(records);
      res.json({ reservation: records[idx] });
      return;
    }

    if (action === 'reschedule') {
      if (!date || !timeSlot) {
        res.status(400).json({ error: 'Tanggal dan sesi waktu baru harus dipilih.' });
        return;
      }
      const slotDef = TIME_SLOTS.find((s) => s.id === timeSlot);
      if (!slotDef) {
        res.status(400).json({ error: 'Sesi waktu tidak valid.' });
        return;
      }

      const otherRecords = records.filter((r) => r.bookingCode !== current.bookingCode);
      const slots = computeDateAvailability(date, otherRecords);
      const targetSlot = slots.find((s) => s.id === timeSlot);

      if (!targetSlot || targetSlot.isFull || targetSlot.fleetRemaining[current.fleetId] <= 0) {
        res.status(409).json({
          error: `Slot ${slotDef.label} pada ${date} sudah penuh untuk ${current.fleetName}.`,
        });
        return;
      }

      records[idx] = {
        ...current,
        date,
        timeSlot: slotDef.id,
        timeRange: slotDef.timeRange,
        status: 'Dijadwalkan Ulang',
      };
      saveReservations(records);
      res.json({ reservation: records[idx] });
      return;
    }

    res.status(400).json({ error: 'Aksi pembaruan tidak dikenali.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pandawa Movers server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
