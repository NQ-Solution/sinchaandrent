import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import {
  ArrowRight, Phone, Award, Car, TrendingUp,
  ChevronRight, Star, Zap, Battery, Users, HelpCircle, ChevronDown
} from 'lucide-react';
import { KakaoIcon } from '@/components/icons/KakaoIcon';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE, VehicleWithBrand } from '@/lib/db';
import PartnerSection from '@/components/PartnerSection';
import BannerSlider from '@/components/BannerSlider';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

async function getPopularVehicles(): Promise<VehicleWithBrand[]> {
  try {
    if (DB_MODE === 'local') {
      const vehicles = localDb.vehicles.findMany({
        where: {
          isActive: true,
          isPopular: true,
        },
        include: { brand: true },
        orderBy: { sortOrder: 'asc' },
      }) as VehicleWithBrand[];
      return vehicles.slice(0, 6);
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        isActive: true,
        isPopular: true,
      },
      include: {
        brand: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      take: 6,
    });
    return vehicles as unknown as VehicleWithBrand[];
  } catch (error) {
    console.error('Failed to fetch popular vehicles:', error);
    return [];
  }
}

interface CompanyInfo {
  phone?: string;
  kakaoChannelUrl?: string;
}

function readCompanyInfoJson(): Record<string, string> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'company-info.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function getCompanyInfo(): Promise<CompanyInfo> {
  try {
    if (DB_MODE === 'local') {
      return readCompanyInfoJson();
    }

    const companyInfo = await prisma.companyInfo.findMany();
    const result: CompanyInfo = {};
    companyInfo.forEach((info) => {
      if (info.key === 'phone') result.phone = info.value;
      if (info.key === 'kakaoChannelUrl') result.kakaoChannelUrl = info.value;
    });
    return result;
  } catch (error) {
    console.error('Failed to fetch company info:', error);
    return readCompanyInfoJson();
  }
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// 기본 FAQ 데이터 (DB 조회 실패 시 fallback)
const DEFAULT_FAQ_PREVIEW: FAQItem[] = [
  {
    id: 'default-1',
    question: '장기렌트와 리스의 차이점은 무엇인가요?',
    answer: '장기렌트는 렌트사 소유 차량을 빌려 사용하는 방식으로, 보험료/자동차세/정비비가 모두 월 렌트료에 포함됩니다. 리스는 금융사가 차량을 구매하고 사용자가 이용료를 내는 방식입니다.',
  },
  {
    id: 'default-2',
    question: '초기비용이 정말 0원인가요?',
    answer: '네, 맞습니다. 신차 구매 시 필요한 취득세, 등록세, 공채비용, 번호판 비용 등 초기비용이 전혀 없습니다.',
  },
  {
    id: 'default-3',
    question: '신용등급에 영향이 있나요?',
    answer: '장기렌트는 대출이 아니기 때문에 신용등급에 영향을 주지 않습니다. 할부 구매나 리스와 달리 부채로 잡히지 않습니다.',
  },
];

async function getFaqPreview(): Promise<FAQItem[]> {
  try {
    if (DB_MODE === 'local') {
      const faqs = localDb.faqs?.findMany?.({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }) || [];
      return faqs.slice(0, 3).map((faq: { id: string; question: string; answer: string }) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
      }));
    }

    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 3,
      select: {
        id: true,
        question: true,
        answer: true,
      },
    });

    if (faqs.length === 0) {
      return DEFAULT_FAQ_PREVIEW;
    }

    return faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
    }));
  } catch (error) {
    console.error('Failed to fetch FAQ preview:', error);
    return DEFAULT_FAQ_PREVIEW;
  }
}

export default async function HomePage() {
  const [popularVehicles, companyInfo, faqPreview] = await Promise.all([
    getPopularVehicles(),
    getCompanyInfo(),
    getFaqPreview(),
  ]);
  const phoneNumber = companyInfo.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || '1588-0000';
  const kakaoUrl = companyInfo.kakaoChannelUrl || process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || '#';

  return (
    <div className="pt-16 md:pt-20 overflow-hidden">
      {/* Hero Section - 풀스크린 임팩트 */}
      <section className="relative min-h-[90vh] bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 flex items-center">
        {/* 배경 비디오/이미지 자리 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 via-gray-850/95 to-primary/20" />
          {/* 애니메이션 배경 패턴 */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/50 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-400/40 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* 뱃지 */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full mb-6 sm:mb-8 border border-white/20">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">신차 장기렌트 전문</span>
            </div>

            {/* 메인 헤드라인 */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6 leading-[1.15] break-keep">
              새 차, 더 스마트하게
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary-400 to-pink-400 animate-gradient">
                시작하세요
              </span>
            </h1>

            {/* 서브 헤드라인 */}
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed break-keep px-2">
              취등록세, 보험료, 자동차세, 정비비까지
              <br className="hidden sm:block" />
              <strong className="text-white">월 납입금 하나로 모두 해결</strong>됩니다
            </p>

            {/* CTA 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button asChild size="lg" className="bg-primary hover:bg-primary-600 text-white rounded-full px-8 sm:px-10 font-bold text-base sm:text-lg h-12 sm:h-14 shadow-lg shadow-primary/30">
                <Link href="/vehicles" className="flex items-center justify-center gap-2">
                  차량 둘러보기
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 rounded-full px-8 sm:px-10 font-bold text-base sm:text-lg h-12 sm:h-14">
                <a href={`tel:${phoneNumber}`} className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  전화 상담
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-gray-400">스크롤</span>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </section>

      {/* 렌트카 장점 */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">
              렌트카 장점
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              { title: '초기비용 0원', desc: '취등록세/공채 없음' },
              { title: '보험료 포함', desc: '별도 가입 불필요' },
              { title: '빠른 심사', desc: '당일 승인 가능' },
              { title: '정비 포함', desc: '유지비 걱정 없음' },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 md:p-6 text-center shadow-sm"
              >
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 배너 슬라이더 */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <BannerSlider />
        </div>
      </section>


      {/* 인기 차량 섹션 */}
      <section className="py-12 sm:py-16 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8 md:mb-12">
            <div>
              <span className="text-primary font-bold text-xs sm:text-sm tracking-wider">BEST PICKS</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mt-1 sm:mt-2 break-keep">
                가장 많이 찾는 차량
              </h2>
              <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">고객님들이 가장 많이 선택한 인기 차량입니다</p>
            </div>
            <Link
              href="/vehicles"
              className="group inline-flex items-center gap-2 bg-gray-100 hover:bg-primary hover:text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all self-start md:self-auto"
            >
              <span className="font-medium text-sm sm:text-base">전체 차량 보기</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {popularVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularVehicles.map((vehicle, index) => (
                <Link
                  key={vehicle.id}
                  href={`/vehicle/${vehicle.id}`}
                  className="group block"
                >
                  <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-primary/30 hover:shadow-2xl transition-all duration-300">
                    {/* 이미지 */}
                    <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                      {vehicle.thumbnail ? (
                        <Image
                          src={vehicle.thumbnail}
                          alt={vehicle.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-20 h-20 text-gray-200" />
                        </div>
                      )}

                      {/* 뱃지들 */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                          <Star className="w-3 h-3" /> BEST
                        </span>
                        {index === 0 && (
                          <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            TOP 1
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 정보 */}
                    <div className="p-5">
                      <p className="text-primary text-sm font-semibold">{vehicle.brand?.nameKr}</p>
                      <div className="flex items-end justify-between mt-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                          {vehicle.name}
                        </h3>
                        <p className="text-lg font-black text-gray-900">
                          {(vehicle.rentPrice60_0 || (vehicle as unknown as { rentPrice60?: number }).rentPrice60) ? (
                            <>
                              {(vehicle.rentPrice60_0 || (vehicle as unknown as { rentPrice60?: number }).rentPrice60)?.toLocaleString()}
                              <span className="text-sm font-normal text-gray-500">원~</span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-primary">상담문의</span>
                          )}
                        </p>
                      </div>

                      {/* 간단 스펙 */}
                      <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                        {vehicle.fuelTypes && vehicle.fuelTypes.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Battery className="w-4 h-4" />
                            {vehicle.fuelTypes[0] === 'GASOLINE' ? '가솔린' :
                             vehicle.fuelTypes[0] === 'DIESEL' ? '디젤' :
                             vehicle.fuelTypes[0] === 'HYBRID' ? '하이브리드' :
                             vehicle.fuelTypes[0] === 'EV' ? '전기' : vehicle.fuelTypes[0]}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {vehicle.seatingCapacityMin || 5}인승
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl">
              <Car className="w-20 h-20 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">등록된 인기 차량이 없습니다.</p>
              <Button asChild className="mt-6 rounded-full" size="lg">
                <Link href="/vehicles">전체 차량 보기</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* 이용 절차 */}
      <section className="py-12 sm:py-16 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-primary font-bold text-xs sm:text-sm tracking-wider">PROCESS</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mt-1 sm:mt-2 break-keep">
              간단한 4단계로 새 차 받기
            </h2>
            <p className="text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base">복잡한 절차 없이 빠르게 진행됩니다</p>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-4">
              {[
                { title: '차량 선택', desc: '원하는 차량과 옵션 선택', icon: Car },
                { title: '상담 신청', desc: '전화/카카오톡 간편 상담', icon: Phone },
                { title: '심사 진행', desc: '간단한 서류로 당일 심사', icon: TrendingUp },
                { title: '차량 인수', desc: '원하는 장소에서 인수', icon: Award },
              ].map((item, index) => (
                <div key={index}>
                  <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 hover:border-primary hover:shadow-lg transition-all group h-full">
                    <div className="mb-3 sm:mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-primary-600 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 break-keep">{item.title}</h3>
                    <p className="text-gray-600 text-xs sm:text-base break-keep">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-600 text-white rounded-full px-10 font-bold">
              <Link href="/contact" className="flex items-center gap-2">
                상담 신청하기
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 파트너 섹션 */}
      <PartnerSection />

      {/* FAQ 미리보기 */}
      <section className="py-12 sm:py-16 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <span className="text-primary font-bold text-xs sm:text-sm tracking-wider">FAQ</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mt-1 sm:mt-2">
                자주 묻는 질문
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {faqPreview.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base break-keep">{faq.question}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed break-keep">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6 sm:mt-8">
              <Button asChild variant="outline" className="rounded-full px-6 sm:px-8">
                <Link href="/faq" className="flex items-center gap-2 text-sm sm:text-base">
                  더 많은 질문 보기
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 - 하단 고정형 디자인 */}
      <section className="relative py-20 sm:py-24 md:py-32 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-primary/30">
        {/* 배경 효과 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/30 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-blue-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* 상단 뱃지 */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm text-primary-300 text-sm px-5 py-2.5 rounded-full border border-primary/20">
                <Phone className="w-4 h-4" />
                <span className="font-semibold">무료 상담 신청</span>
              </div>
            </div>

            {/* 메인 타이틀 */}
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-6 sm:mb-8 leading-tight break-keep text-center">
              지금 바로 상담받고
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary-400 to-pink-400">
                새 차 시작하세요
              </span>
            </h2>

            <p className="text-base sm:text-xl text-gray-300 mb-10 sm:mb-12 max-w-2xl mx-auto px-2 break-keep text-center leading-relaxed">
              전문 상담원이 고객님께 딱 맞는 렌트 조건을 안내해드립니다.
              <br className="hidden sm:block" />
              부담없이 <strong className="text-white">지금 바로</strong> 문의하세요!
            </p>

            {/* CTA 버튼 그룹 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0 mb-10">
              <Button asChild size="lg" className="group bg-white text-gray-900 hover:bg-gray-100 rounded-full px-10 sm:px-12 font-bold text-base sm:text-xl h-14 sm:h-16 shadow-2xl hover:shadow-white/20 transition-all">
                <a href={`tel:${phoneNumber}`} className="flex items-center justify-center gap-3">
                  <Phone className="w-6 h-6 group-hover:animate-bounce" />
                  <span className="whitespace-nowrap">{phoneNumber}</span>
                </a>
              </Button>
              <Button asChild size="lg" className="group bg-[#FEE500] text-[#3C1E1E] hover:bg-yellow-400 rounded-full px-10 sm:px-12 font-bold text-base sm:text-xl h-14 sm:h-16 shadow-2xl hover:shadow-yellow-500/30 transition-all">
                <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                  <KakaoIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  카카오톡 상담
                </a>
              </Button>
            </div>

            {/* 운영 시간 */}
            <div className="text-center">
              <div className="inline-flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-6 text-gray-400 text-sm bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>평일 09:00 - 18:00</span>
                </div>
                <span className="hidden sm:inline text-gray-600">|</span>
                <span>토요일 09:00 - 13:00</span>
                <span className="hidden sm:inline text-gray-600">|</span>
                <span>일요일/공휴일 휴무</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
