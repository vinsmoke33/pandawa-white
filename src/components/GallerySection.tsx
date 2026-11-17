import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { GALLERY_ITEMS, GalleryCategory, GalleryItem } from '../lib/fleetData';
import { ResilientImage } from './ResilientImage';

type FilterTab = 'all' | GalleryCategory;

const FILTER_OPTIONS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'Semua Dokumentasi' },
  { id: 'rumah', label: 'Pindahan Rumah' },
  { id: 'komersial', label: 'Apartemen & Kantor' },
  { id: 'pengemasan', label: 'Pengemasan & Armada' },
];

export function GallerySection() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const visibleItems =
    activeFilter === 'all'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

  const selectedIndex = selectedItem
    ? visibleItems.findIndex((i) => i.id === selectedItem.id)
    : -1;

  const handleStep = (delta: number) => {
    if (selectedIndex === -1 || visibleItems.length === 0) return;
    const nextIdx = (selectedIndex + delta + visibleItems.length) % visibleItems.length;
    setSelectedItem(visibleItems[nextIdx]);
  };

  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
      } else if (e.key === 'ArrowRight') {
        handleStep(1);
      } else if (e.key === 'ArrowLeft') {
        handleStep(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, selectedIndex, visibleItems]);

  return (
    <section id="galeri" className="py-16 lg:py-24 border-t border-slate-200 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-sm font-semibold text-[#1D4ED8] mb-2">
              Dokumentasi Pelaksanaan
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Galeri Operasional Pandawa Movers
            </h2>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Potret standar pengemasan, perlindungan akses gedung, dan penataan muatan kru lapangan kami di berbagai lokasi pelanggan.
            </p>
          </div>

          {/* Interactive Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter kategori galeri"
            className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start lg:self-auto"
          >
            {FILTER_OPTIONS.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="group border border-slate-200 rounded-xl bg-[#F8FAFC] overflow-hidden flex flex-col justify-between"
            >
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  aria-label={`Perbesar foto: ${item.title}`}
                  className="relative block w-full aspect-[4/3] bg-slate-100 border-b border-slate-200 overflow-hidden text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
                >
                  <ResilientImage
                    src={item.src}
                    alt={item.title}
                    fallbackLabel={item.title}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                  <span className="absolute right-3 bottom-3 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900/75 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Expand className="w-4 h-4" />
                  </span>
                </button>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{item.categoryLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.location}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900 mt-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">{item.fleetUsed}</span>
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="font-semibold text-[#1D4ED8] hover:underline cursor-pointer whitespace-nowrap"
                >
                  Lihat Foto
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
                <span className="font-semibold text-slate-800 whitespace-nowrap">
                  {selectedItem.categoryLabel}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{selectedItem.location}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono whitespace-nowrap">{selectedItem.fleetUsed}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Tutup galeri"
                className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-slate-100 aspect-[16/10] sm:aspect-[4/3] max-h-[65vh] overflow-hidden">
              <ResilientImage
                src={selectedItem.src}
                alt={selectedItem.title}
                fallbackLabel={selectedItem.title}
                className="w-full h-full object-contain bg-slate-950"
              />

              {visibleItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStep(-1)}
                    aria-label="Foto sebelumnya"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center rounded-lg bg-white/90 hover:bg-white text-slate-900 border border-slate-200 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStep(1)}
                    aria-label="Foto berikutnya"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center rounded-lg bg-white/90 hover:bg-white text-slate-900 border border-slate-200 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {selectedItem.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{selectedItem.description}</p>
              </div>
              <div className="font-mono text-xs text-slate-500 whitespace-nowrap shrink-0 tabular-nums">
                {selectedIndex + 1} / {visibleItems.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
