'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Building2 } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logo?: string | null;
  link?: string | null;
  category?: string | null;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
}

// 카테고리 한글 매핑
const CATEGORY_LABELS: Record<string, string> = {
  capital: '캐피탈/금융',
  insurance: '보험',
  card: '카드',
  other: '기타',
};

export default function PartnerSection() {
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
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            제휴사
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            신뢰할 수 있는 파트너사와 함께합니다
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
          {partners.map((partner) => {
            const content = (
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow h-full flex flex-col items-center justify-center">
                {/* Logo or Placeholder */}
                <div className="w-20 h-20 mb-4 flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden">
                  {partner.logo ? (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-gray-400" />
                  )}
                </div>

                {/* Partner Info */}
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                  {partner.name}
                </h3>
                {partner.category && (
                  <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full mb-2">
                    {CATEGORY_LABELS[partner.category] || partner.category}
                  </span>
                )}
                {partner.description && (
                  <p className="text-gray-500 text-sm">{partner.description}</p>
                )}
              </div>
            );

            if (partner.link) {
              return (
                <a
                  key={partner.id}
                  href={partner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {content}
                </a>
              );
            }

            return <div key={partner.id}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
