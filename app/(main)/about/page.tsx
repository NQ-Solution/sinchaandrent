import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Target, Eye, Heart, Shield, Clock, Award, Phone, Car, TrendingUp, CheckCircle, ArrowRight, Users, Wallet, FileCheck, Wrench, BadgeCheck, Handshake, Check, Building2 } from 'lucide-react';
import { KakaoIcon } from '@/components/icons/KakaoIcon';
import PartnerSectionByCategory from '@/components/PartnerSectionByCategory';
import FAQSection from '@/components/FAQSection';
import { PdfViewer } from '@/components/PdfViewer';
import prisma from '@/lib/prisma';
import { DB_MODE } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface LoanBrokerDocument {
  name: string;
  file: string;
}

interface CompanyInfo {
  companyName?: string;
  ceoName?: string;
  businessNumber?: string;
  loanBrokerNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  faxNumber?: string;
  privacyOfficer?: string;
  loanBrokerPdf?: string;
  loanBrokerDocuments?: string;
  loanBrokerImage?: string;
  kakaoChannelUrl?: string;
  youtubeUrl?: string;
}

function parseLoanBrokerDocuments(companyInfo: CompanyInfo): LoanBrokerDocument[] {
  let documents: LoanBrokerDocument[] = [];

  if (companyInfo.loanBrokerDocuments) {
    try {
      documents = JSON.parse(companyInfo.loanBrokerDocuments);
    } catch {
      documents = [];
    }
  }

  // 기존 loanBrokerPdf가 있고 documents가 비어있으면 마이그레이션
  if (companyInfo.loanBrokerPdf && documents.length === 0) {
    documents = [{ name: '대출모집법인 등록증', file: companyInfo.loanBrokerPdf }];
  }

  return documents;
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
      (result as Record<string, string>)[info.key] = info.value;
    });
    return result;
  } catch (error) {
    console.error('Failed to fetch company info:', error);
    // fallback to local
    return readCompanyInfoJson();
  }
}

export default async function AboutPage() {
  const companyInfo = await getCompanyInfo();
  const phoneNumber = companyInfo.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || '1588-0000';
  const kakaoUrl = companyInfo.kakaoChannelUrl || process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || '#';

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] bg-gradient-to-br from-gray-900 via-gray-800 to-primary flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <p className="text-primary-300 font-bold text-sm tracking-wider mb-4">SINCE 2014</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              합리적인 차량 이용의
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-blue-400">
                새로운 기준
              </span>
            </h1>
            <p className="text-lg text-gray-300 mb-10 max-w-xl leading-relaxed">
              투명한 가격과 전문적인 상담으로 10년간 고객의 신뢰를 쌓아온 신차앤렌트입니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 font-bold">
                <Link href="/vehicles" className="flex items-center gap-2">
                  차량 둘러보기
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 rounded-full px-8">
                <Link href="/contact">
                  상담 문의
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* 장기렌트 장점 상세 */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-sm tracking-wider">WHY LONG-TERM RENTAL</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
              장기렌트, 이래서 좋습니다
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              신차 구매와 비교해보세요. 장기렌트가 왜 더 합리적인지 한눈에 알 수 있습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Wallet,
                title: '초기비용 0원',
                description: '취등록세, 공채, 번호판 비용 등 차량 구매 시 발생하는 초기비용이 전혀 없습니다. 목돈 부담 없이 새 차를 이용하세요.',
                highlight: '평균 500~1,000만원 절약',
              },
              {
                icon: Shield,
                title: '보험료 포함',
                description: '월 렌트료에 자동차보험료가 이미 포함되어 있습니다. 운전경력, 나이에 관계없이 동일한 혜택을 받으세요.',
                highlight: '연간 100~200만원 절약',
              },
              {
                icon: FileCheck,
                title: '세금 포함',
                description: '자동차세, 환경부담금 등 각종 세금이 모두 렌트료에 포함됩니다. 세금 고지서 걱정이 없습니다.',
                highlight: '연간 30~80만원 절약',
              },
              {
                icon: Wrench,
                title: '정비/소모품 포함',
                description: '엔진오일, 타이어, 브레이크패드 등 소모품 교체 비용이 포함됩니다. 예상치 못한 정비 비용 걱정이 없습니다.',
                highlight: '연간 50~100만원 절약',
              },
              {
                icon: Clock,
                title: '빠른 심사',
                description: '간단한 서류만으로 당일 심사가 가능합니다. 복잡한 대출 심사 없이 빠르게 차량을 이용할 수 있습니다.',
                highlight: '당일 승인 가능',
              },
              {
                icon: BadgeCheck,
                title: '신용등급 영향 없음',
                description: '렌트는 대출이 아니므로 신용등급에 영향을 주지 않습니다. 추후 주택담보대출 등에 영향이 없습니다.',
                highlight: '신용점수 유지',
              },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.description}</p>
                <div className="inline-block bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
                  {item.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 비전 & 미션 */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary font-bold text-sm tracking-wider">OUR VISION</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-6">
                모든 분들이 합리적인 가격으로
                <br />
                새 차를 경험할 수 있도록
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                복잡한 자동차 금융 시장에서 고객님께 가장 합리적인 선택을 제공합니다.
                투명한 가격 정책과 맞춤형 상담을 통해 모든 분들이 부담 없이 신차를 이용할 수 있도록 돕겠습니다.
              </p>

              <div className="space-y-4">
                {[
                  '숨겨진 비용 없는 투명한 가격',
                  '고객 상황에 맞는 맞춤 상담',
                  '빠르고 간편한 계약 절차',
                  '계약 후에도 지속되는 고객 케어',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gray-900 text-white rounded-2xl p-6">
                  <Eye className="w-10 h-10 mb-4 text-primary-300" />
                  <h3 className="text-lg font-bold mb-2">비전</h3>
                  <p className="text-gray-400 text-sm">
                    누구나 합리적인 가격으로 새 차를 경험할 수 있는 세상
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <Heart className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">가치</h3>
                  <p className="text-gray-600 text-sm">
                    고객 중심의 서비스로 신뢰를 쌓아갑니다
                  </p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-primary text-white rounded-2xl p-6">
                  <Target className="w-10 h-10 mb-4 text-white/80" />
                  <h3 className="text-lg font-bold mb-2">미션</h3>
                  <p className="text-white/80 text-sm">
                    투명한 가격과 친절한 상담으로 고객 만족 실현
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <TrendingUp className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">혁신</h3>
                  <p className="text-gray-600 text-sm">
                    더 나은 서비스를 위해 끊임없이 발전합니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 비교 테이블 섹션 */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-sm tracking-wider">COMPARISON</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
              장기렌트 vs 신차구매 vs 리스
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              각 방식의 차이점을 한눈에 비교해보세요. 장기렌트가 왜 합리적인 선택인지 확인하실 수 있습니다.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* 데스크톱 비교 테이블 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="py-5 px-6 text-left font-bold">비교 항목</th>
                    <th className="py-5 px-6 text-center font-bold bg-primary">
                      <div className="flex items-center justify-center gap-2">
                        <span className="bg-white/20 text-xs px-2 py-1 rounded-full">추천</span>
                        장기렌트
                      </div>
                    </th>
                    <th className="py-5 px-6 text-center font-bold">신차구매</th>
                    <th className="py-5 px-6 text-center font-bold">리스</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { item: '초기비용', rent: '0원', buy: '500~1,000만원', lease: '선납금 필요', rentBest: true },
                    { item: '보험료', rent: '월 렌트료 포함', buy: '별도 납부 (연 100~200만원)', lease: '별도 납부', rentBest: true },
                    { item: '자동차세', rent: '월 렌트료 포함', buy: '별도 납부 (연 30~80만원)', lease: '월 납입금 포함', rentBest: true },
                    { item: '정비/소모품', rent: '월 렌트료 포함', buy: '별도 부담', lease: '별도 부담', rentBest: true },
                    { item: '차량 소유권', rent: '렌트사', buy: '본인', lease: '리스사', rentBest: false },
                    { item: '번호판', rent: '허, 하, 호', buy: '일반 번호판', lease: '일반 번호판', rentBest: false },
                    { item: '사고 시 대응', rent: '렌트사 지원', buy: '본인 직접 처리', lease: '본인 처리', rentBest: true },
                    { item: '신용등급 영향', rent: '영향 없음', buy: '할부 시 영향', lease: '영향 있음', rentBest: true },
                    { item: '중도해지', rent: '위약금 있음', buy: '중고차 매각', lease: '위약금 있음', rentBest: false },
                    { item: '계약 종료 후', rent: '반납/인수/재렌트', buy: '계속 소유', lease: '반납/인수', rentBest: false },
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-900">{row.item}</td>
                      <td className={`py-4 px-6 text-center ${row.rentBest ? 'bg-primary/5' : ''}`}>
                        <div className="flex items-center justify-center gap-2">
                          {row.rentBest && <Check className="w-4 h-4 text-primary" />}
                          <span className={row.rentBest ? 'text-primary font-semibold' : 'text-gray-700'}>{row.rent}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center text-gray-600">{row.buy}</td>
                      <td className="py-4 px-6 text-center text-gray-600">{row.lease}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 비교 카드 */}
            <div className="md:hidden space-y-4">
              {[
                { item: '초기비용', rent: '0원', buy: '500~1,000만원', lease: '선납금 필요', rentBest: true },
                { item: '보험료', rent: '포함', buy: '별도 (연 100~200만원)', lease: '별도', rentBest: true },
                { item: '자동차세', rent: '포함', buy: '별도 (연 30~80만원)', lease: '포함', rentBest: true },
                { item: '정비/소모품', rent: '포함', buy: '별도', lease: '별도', rentBest: true },
                { item: '신용등급', rent: '영향 없음', buy: '할부 시 영향', lease: '영향 있음', rentBest: true },
                { item: '사고 시', rent: '렌트사 지원', buy: '본인 처리', lease: '본인 처리', rentBest: true },
              ].map((row, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-3 pb-2 border-b">{row.item}</h4>
                  <div className="space-y-2">
                    <div className={`flex justify-between items-center p-2 rounded-lg ${row.rentBest ? 'bg-primary/10' : ''}`}>
                      <span className="text-sm font-medium text-primary">장기렌트</span>
                      <span className={`text-sm ${row.rentBest ? 'text-primary font-semibold' : 'text-gray-700'}`}>{row.rent}</span>
                    </div>
                    <div className="flex justify-between items-center p-2">
                      <span className="text-sm text-gray-500">신차구매</span>
                      <span className="text-sm text-gray-600">{row.buy}</span>
                    </div>
                    <div className="flex justify-between items-center p-2">
                      <span className="text-sm text-gray-500">리스</span>
                      <span className="text-sm text-gray-600">{row.lease}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 비용 절감 요약 */}
            <div className="mt-12 bg-primary text-white rounded-2xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">장기렌트 선택 시 연간 예상 절감액</h3>
                <p className="text-primary-200">신차구매 대비 절감되는 비용을 확인해보세요</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '초기비용', value: '500~1,000만원' },
                  { label: '보험료', value: '연 100~200만원' },
                  { label: '자동차세', value: '연 30~80만원' },
                  { label: '정비비용', value: '연 50~100만원' },
                ].map((item, index) => (
                  <div key={index} className="text-center p-4 bg-white/10 rounded-xl">
                    <p className="text-primary-200 text-sm mb-1">{item.label}</p>
                    <p className="text-xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 제휴 금융사/보험사 - API 기반 */}
      <PartnerSectionByCategory />

      {/* 왜 신차앤렌트인가 */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-sm tracking-wider">WHY CHOOSE US</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
              신차앤렌트를 선택하는 이유
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Shield,
                title: '투명한 가격',
                description: '숨겨진 비용 없이 정확한 견적을 제공합니다. 광고 미끼 가격이 아닌 실제 이용 가능한 가격입니다.',
              },
              {
                icon: Handshake,
                title: '맞춤 상담',
                description: '고객님의 신용, 예산, 필요에 맞는 최적의 조건을 찾아드립니다. 무리한 조건은 권하지 않습니다.',
              },
              {
                icon: Clock,
                title: '빠른 처리',
                description: '신속한 심사와 빠른 차량 인수가 가능합니다. 급하게 차량이 필요하신 분도 걱정하지 마세요.',
              },
              {
                icon: Users,
                title: '전문 상담',
                description: '10년 이상 경력의 전문 상담원이 처음부터 끝까지 책임지고 안내해드립니다.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 이용 절차 */}
      <section className="py-20 md:py-28 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="text-primary-300 font-bold text-sm tracking-wider">PROCESS</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2">
              간편한 이용 절차
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { step: '01', title: '상담 신청', desc: '전화 또는 카카오톡', icon: Phone },
                { step: '02', title: '조건 상담', desc: '맞춤 견적 안내', icon: Car },
                { step: '03', title: '심사 진행', desc: '빠른 심사 승인', icon: TrendingUp },
                { step: '04', title: '차량 인수', desc: '원하는 곳 배송', icon: Award },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-primary-400 text-xs font-bold">STEP {item.step}</span>
                  <h3 className="font-bold text-white text-lg mt-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 대출모집법인 정보 섹션 */}
      {companyInfo.loanBrokerNumber && (() => {
        const documents = parseLoanBrokerDocuments(companyInfo);
        return (
          <section className="py-20 md:py-28 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <span className="text-primary font-bold text-sm tracking-wider">CERTIFICATION</span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
                  대출모집법인 등록 정보
                </h2>
                <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                  신차앤렌트는 여신금융협회에 정식 등록된 대출모집법인입니다.
                  <br />
                  안전하고 투명한 금융 서비스를 제공합니다.
                </p>
              </div>

              <div className="max-w-5xl mx-auto">
                {/* 회사 정보 카드 */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12 mb-8">
                  <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{companyInfo.companyName || '신차앤렌트'}</h3>
                      <p className="text-gray-500 text-lg">정식 등록 대출모집법인</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-5 shadow-sm">
                      <p className="text-gray-500 text-sm mb-1">여신금융협회 등록번호</p>
                      <p className="text-primary font-bold text-lg">{companyInfo.loanBrokerNumber}</p>
                    </div>
                    {companyInfo.businessNumber && (
                      <div className="bg-white rounded-xl p-5 shadow-sm">
                        <p className="text-gray-500 text-sm mb-1">사업자등록번호</p>
                        <p className="text-gray-900 font-semibold">{companyInfo.businessNumber}</p>
                      </div>
                    )}
                    {companyInfo.ceoName && (
                      <div className="bg-white rounded-xl p-5 shadow-sm">
                        <p className="text-gray-500 text-sm mb-1">대표자</p>
                        <p className="text-gray-900 font-semibold">{companyInfo.ceoName}</p>
                      </div>
                    )}
                    {companyInfo.address && (
                      <div className="bg-white rounded-xl p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                        <p className="text-gray-500 text-sm mb-1">소재지</p>
                        <p className="text-gray-900 font-semibold text-sm">{companyInfo.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 등록증 문서 목록 */}
                {documents.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      등록 서류
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {documents.map((doc, index) => (
                        <PdfViewer
                          key={index}
                          name={doc.name}
                          file={doc.file}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 안내 문구 */}
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
                  <div className="flex items-start gap-4">
                    <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">안전한 금융 서비스</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        신차앤렌트는 여신금융협회에 정식 등록된 대출모집법인으로서, 금융소비자 보호에 관한 법률을 준수하며
                        투명하고 공정한 금융 서비스를 제공합니다. 고객님의 개인정보는 철저히 보호됩니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA */}
      <section className="relative py-24 md:py-32 bg-primary overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-300/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              지금 바로
              <br />
              <span className="text-primary-200">상담받아 보세요</span>
            </h2>
            <p className="text-lg text-white/70 mb-10">
              전문 상담원이 고객님께 최적의 렌트 조건을 안내해드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 rounded-full px-10 font-bold text-lg h-14">
                <a href={`tel:${phoneNumber}`} className="flex items-center gap-3">
                  <Phone className="w-6 h-6" />
                  {phoneNumber}
                </a>
              </Button>
              <Button asChild size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 rounded-full px-10 font-bold text-lg h-14">
                <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  <KakaoIcon className="w-6 h-6" />
                  카카오톡 상담
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
