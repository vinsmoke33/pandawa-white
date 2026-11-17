import { FleetId } from './pricing';

export const HERO_IMAGE_PATH = '/src/assets/images/hero_movers_crew_1794938340872.jpg';
export const PACKING_IMAGE_PATH = '/src/assets/images/service_packing_team_1794938342699.jpg';

export const FLEET_IMAGES: Record<FleetId, string> = {
  'blind-van': '/src/assets/images/fleet_blind_van_1794938341281.jpg',
  'cde-engkel': '/src/assets/images/fleet_engkel_box_1794938341205.jpg',
  'cdd-box': '/src/assets/images/fleet_cdd_box_1794938342038.jpg',
};

export type GalleryCategory = 'rumah' | 'komersial' | 'pengemasan';

export interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category: GalleryCategory;
  categoryLabel: string;
  location: string;
  fleetUsed: string;
  description: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'furniture-wrap',
    src: '/src/assets/images/gallery_furniture_wrap_1794939106996.jpg',
    title: 'Proteksi Selimut Tebal & Stretch Film Furnitur Kayu',
    category: 'rumah',
    categoryLabel: 'Pindahan Rumah',
    location: 'Pondok Indah, Jakarta Selatan',
    fleetUsed: 'CDE Engkel Box',
    description:
      'Meja makan kayu solid dan kursi ruang tamu dilapisi selimut pelindung berlapis sebelum dipindahkan melewati koridor rumah.',
  },
  {
    id: 'office-relocation',
    src: '/src/assets/images/gallery_office_relocation_1794939106371.jpg',
    title: 'Relokasi Perangkat IT & Kursi Kerja Kantor',
    category: 'komersial',
    categoryLabel: 'Apartemen & Kantor',
    location: 'SCBD – Kuningan, Jakarta Selatan',
    fleetUsed: 'CDD Double Box',
    description:
      'Pemindahan kontainer server berlabel khusus dan kursi ergonomis menggunakan troli datar roda karet tanpa merusak lantai lobi.',
  },
  {
    id: 'truck-loading',
    src: '/src/assets/images/gallery_truck_loading_1794939107142.jpg',
    title: 'Penataan Muatan & Pengikatan Tali Ratchet',
    category: 'pengemasan',
    categoryLabel: 'Pengemasan & Armada',
    location: 'Jakarta Timur – Bandung',
    fleetUsed: 'CDD Double Box',
    description:
      'Susunan kardus seragam dan furnitur terbungkus dikunci menggunakan sabuk ratchet di dinding rel aluminium agar stabil di rute tol antarkota.',
  },
  {
    id: 'apartment-elevator',
    src: '/src/assets/images/gallery_apartment_elevator_1794939107462.jpg',
    title: 'Akses Lift Barang Apartemen Sesuai Jam Loading',
    category: 'komersial',
    categoryLabel: 'Apartemen & Kantor',
    location: 'Kemang Village – BSD City',
    fleetUsed: 'CDE Engkel Box',
    description:
      'Tumpukan kardus berlabel ruangan diangkut menggunakan troli tangan melalui lift servis apartemen berpelindung dinding.',
  },
  {
    id: 'packing-living-room',
    src: '/src/assets/images/service_packing_team_1794938342699.jpg',
    title: 'Pengemasan Pecah Belah & Dekorasi Ruang Keluarga',
    category: 'pengemasan',
    categoryLabel: 'Pengemasan & Armada',
    location: 'Menteng, Jakarta Pusat',
    fleetUsed: 'Blind Van Cargo',
    description:
      'Setiap lampu meja, vas keramik, dan bingkai foto dibungkus kertas kraft berlapis di dalam kardus double-wall.',
  },
  {
    id: 'residential-loading',
    src: '/src/assets/images/hero_movers_crew_1794938340872.jpg',
    title: 'Pemuatan Sofa & Lemari via Ramp Belakang Truk',
    category: 'rumah',
    categoryLabel: 'Pindahan Rumah',
    location: 'Bintaro Jaya, Tangerang Selatan',
    fleetUsed: 'CDE Engkel Box',
    description:
      'Empat kru lapangan bekerja terkoordinasi menaikkan sofa berbungkus plastik ke dalam bak truk melalui papan ramp anti-selip.',
  },
];
