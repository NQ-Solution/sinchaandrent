'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Partner } from '@/types';

interface PartnerLogosProps {
  className?: string;
}

export default function PartnerLogos({ className = '' }: PartnerLogosProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const res = await fetch('/api/partners');
        const data = await res.json();
        setPartners(data);
      } catch (error) {
        console.error('Failed to fetch partners:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, []);

  if (loading || partners.length === 0) {
    return null;
  }

  return (
    <section className={`py-8 md:py-12 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
            제휴 금융사
          </h2>
          <p className="text-sm text-gray-500">
            신뢰할 수 있는 금융 파트너와 함께합니다.
          </p>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6 items-center justify-items-center">
          {partners.map((partner) => (
            <div key={partner.id} className="w-full flex items-center justify-center">
              {partner.link ? (
                <Link
                  href={partner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-16 h-10 md:w-24 md:h-12 relative grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100"
                >
                  {partner.logo ? (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">{partner.name}</span>
                  )}
                </Link>
              ) : (
                <div className="w-16 h-10 md:w-24 md:h-12 relative grayscale opacity-70">
                  {partner.logo ? (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 flex items-center justify-center h-full">
                      {partner.name}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
