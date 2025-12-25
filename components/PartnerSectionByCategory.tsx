'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Building2, Shield, CreditCard, MoreHorizontal } from 'lucide-react';

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

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  capital: { label: '제휴 캐피탈/금융사', icon: Building2 },
  insurance: { label: '제휴 보험사', icon: Shield },
  card: { label: '제휴 카드사', icon: CreditCard },
  other: { label: '기타 제휴사', icon: MoreHorizontal },
};

export default function PartnerSectionByCategory() {
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

  // 카테고리별로 그룹화
  const partnersByCategory = partners.reduce((acc, partner) => {
    const category = partner.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(partner);
    return acc;
  }, {} as Record<string, Partner[]>);

  // 카테고리 순서 정의
  const categoryOrder = ['capital', 'insurance', 'card', 'other'];

  if (loading) {
    return (
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-bold text-sm tracking-wider">PARTNERS</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
            믿을 수 있는 제휴사
          </h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            국내 최고의 금융사, 캐피탈사와 함께합니다. 다양한 제휴사를 통해 최적의 조건을 제공합니다.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          {categoryOrder.map((category) => {
            const categoryPartners = partnersByCategory[category];
            if (!categoryPartners || categoryPartners.length === 0) return null;

            const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
            const Icon = config.icon;

            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{config.label}</h3>
                  <span className="text-sm text-gray-400">({categoryPartners.length}개사)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categoryPartners.map((partner) => {
                    const content = (
                      <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all h-full flex flex-col items-center justify-center min-h-[100px] group">
                        {partner.logo ? (
                          <div className="w-full h-12 relative mb-2 grayscale group-hover:grayscale-0 transition-all">
                            <Image
                              src={partner.logo}
                              alt={partner.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : null}
                        <p className="font-medium text-gray-700 text-sm">{partner.name}</p>
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
            );
          })}
        </div>

        {/* 신뢰도 강조 */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            * 다양한 금융사 비교를 통해 고객님께 가장 유리한 조건을 찾아드립니다
          </p>
        </div>
      </div>
    </section>
  );
}
