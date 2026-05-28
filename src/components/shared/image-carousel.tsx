import { useState, useRef } from 'react';
import type { UIEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ImageCarouselProps {
  images: string[];
  /** Default: '16/9' */
  aspectRatio?: string;
  /** Function to generate alt text for accessibility */
  getAltText?: (index: number) => string;
}

export default function ImageCarousel({
  images,
  aspectRatio = '16/9',
  getAltText,
}: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const scrollPos = el.scrollLeft;
    const itemWidth = el.clientWidth;
    const index = Math.round(scrollPos / itemWidth);
    if (index !== current && index >= 0 && index < images.length) {
      setCurrent(index);
    }
  };

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
    }
  };

  const prev = () => scrollTo(current > 0 ? current - 1 : images.length - 1);
  const next = () => scrollTo(current < images.length - 1 ? current + 1 : 0);

  if (!images?.length) return null;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl"
      style={{ aspectRatio }}
    >
      {/* Hide scrollbars with embedded style */}
      <style
        dangerouslySetInnerHTML={{
          __html: `.no-scrollbar::-webkit-scrollbar { display: none; }`,
        }}
      />

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((img, i) => (
          <div key={i} className="h-full min-w-full shrink-0 snap-center">
            <img
              src={img}
              alt={getAltText ? getAltText(i) : `Image ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Nav Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition-all hover:scale-110"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              boxShadow: 'rgba(0,0,0,0.08) 0px 4px 12px',
            }}
          >
            <ChevronLeft size={20} style={{ color: '#222222' }} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition-all hover:scale-110"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              boxShadow: 'rgba(0,0,0,0.08) 0px 4px 12px',
            }}
          >
            <ChevronRight size={20} style={{ color: '#222222' }} />
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === current ? 24 : 8,
                backgroundColor:
                  i === current ? '#ffffff' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div
          className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#ffffff' }}
        >
          {current + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
