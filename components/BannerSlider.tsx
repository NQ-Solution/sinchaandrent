'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { Banner } from '@/types';

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch('/api/banners');
        const data = await res.json();
        setBanners(data);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // 로딩 중이거나 배너가 없으면 아무것도 표시하지 않음
  if (loading || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const imageUrl = isMobile && currentBanner.mobileImage
    ? currentBanner.mobileImage
    : currentBanner.image;

  const hasImage = !!imageUrl;
  const bgColor = currentBanner.backgroundColor || '#1e3a5f';
  const textColor = currentBanner.textColor || '#ffffff';

  // 이미지가 있는 경우의 배너 콘텐츠
  const ImageBannerContent = () => (
    <div className="relative w-full h-full">
      <Image
        src={imageUrl!}
        alt={currentBanner.title}
        fill
        className="object-cover"
        priority
      />
    </div>
  );

  // 텍스트 기반 배너 콘텐츠 (이미지가 없는 경우)
  const TextBannerContent = () => (
    <div
      className="relative w-full h-full flex items-center justify-center px-6 md:px-12"
      style={{ backgroundColor: bgColor }}
    >
      <div className="text-center max-w-2xl">
        {currentBanner.subtitle && (
          <p
            className="text-sm md:text-base font-medium mb-2 opacity-90"
            style={{ color: textColor }}
          >
            {currentBanner.subtitle}
          </p>
        )}
        <h2
          className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3"
          style={{ color: textColor }}
        >
          {currentBanner.title}
        </h2>
        {currentBanner.description && (
          <p
            className="text-sm md:text-base opacity-80 mb-4"
            style={{ color: textColor }}
          >
            {currentBanner.description}
          </p>
        )}
        {currentBanner.link && currentBanner.linkText && (
          <span
            className="inline-flex items-center gap-2 text-sm md:text-base font-medium hover:gap-3 transition-all"
            style={{ color: textColor }}
          >
            {currentBanner.linkText}
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  );

  const BannerContent = hasImage ? ImageBannerContent : TextBannerContent;

  // 외부 링크인지 확인
  const isExternalLink = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // 링크 렌더링
  const renderBannerWithLink = () => {
    if (!currentBanner.link) {
      return <BannerContent />;
    }

    if (isExternalLink(currentBanner.link)) {
      return (
        <a
          href={currentBanner.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <BannerContent />
        </a>
      );
    }

    return (
      <Link href={currentBanner.link} className="block w-full h-full">
        <BannerContent />
      </Link>
    );
  };

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="relative w-full h-40 md:h-56 lg:h-64 overflow-hidden rounded-xl shadow-lg">
          {renderBannerWithLink()}

          {banners.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
              </button>
            </>
          )}

          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white w-5'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
