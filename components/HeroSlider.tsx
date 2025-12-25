'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { KakaoIcon } from '@/components/icons/KakaoIcon';

interface HeroSectionProps {
  kakaoUrl: string;
  phoneNumber: string;
}

export default function HeroSlider({ kakaoUrl, phoneNumber }: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] pt-16 bg-slate-900">
      {/* 심플한 배경 */}
      <div className="absolute inset-0 pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0099FF]/5" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(85vh-4rem)] md:min-h-[calc(90vh-4rem)]">
          {/* 왼쪽: 메인 컨텐츠 */}
          <div className="text-center lg:text-left py-8 lg:py-0">
            {/* 로고 */}
            <div className="mb-6">
              <Image
                src="/logo.png"
                alt="신차앤렌트"
                width={180}
                height={50}
                className="h-10 md:h-12 w-auto mx-auto lg:mx-0"
                priority
              />
            </div>

            {/* 메인 헤드라인 */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-tight mb-4 md:mb-6">
              새 차, 부담 없이
              <br />
              <span className="text-[#0099FF]">장기렌트</span>로 시작하세요
            </h1>

            {/* 서브카피 */}
            <p className="text-base md:text-lg text-slate-400 mb-6 md:mb-8 max-w-lg mx-auto lg:mx-0">
              취등록세·보험료·세금 모두 포함.
              <br className="hidden sm:block" />
              월 납입금만으로 신차를 이용하세요.
            </p>

            {/* 혜택 리스트 */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mb-8 text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#0099FF]" />
                초기 비용 0원
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#0099FF]" />
                보험료 포함
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#0099FF]" />
                정비 걱정 없음
              </span>
            </div>

            {/* CTA 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-[#0099FF] hover:bg-[#0088EE] text-white font-semibold text-base px-8 h-14"
              >
                <Link href="/vehicles" className="flex items-center justify-center gap-2">
                  차량 보러가기
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] font-semibold text-base px-8 h-14"
              >
                <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <KakaoIcon className="w-5 h-5" />
                  카카오톡 상담
                </a>
              </Button>
            </div>

            {/* 전화 상담 */}
            <div className="mt-6">
              <a
                href={`tel:${phoneNumber}`}
                className="inline-flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">전화 상담: <span className="font-semibold text-white">{phoneNumber}</span></span>
              </a>
            </div>
          </div>

          {/* 오른쪽: 통계 */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '200+', label: '보유 차량' },
                { value: '5,000+', label: '누적 고객' },
                { value: '10년+', label: '업계 경력' },
                { value: '98%', label: '고객 만족도' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* 인증 배지 */}
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#0099FF]" />
                공식 인증 업체
              </span>
              <span className="flex items-center gap-2">
                <span className="text-amber-400">★</span>
                5.0 평점
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
