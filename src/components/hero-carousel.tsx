'use client';
import React from 'react';

interface HeroCarouselProps {
  banners: any[];
  className?: string;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners, className }) => {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) return null;
  const banner = banners[current];

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      {banner.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={banner.imageUrl} alt={banner.title ?? ''} className="h-64 w-full object-cover opacity-60 md:h-80" />
      )}
      {banner.title && (
        <div className="absolute inset-0 flex items-end p-8">
          <h2 className="font-display text-3xl uppercase text-cream">{banner.title}</h2>
        </div>
      )}
    </div>
  );
};
