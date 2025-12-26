'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, Youtube, FileText, Building2, Download } from 'lucide-react';

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
  loanBrokerDocuments?: string | LoanBrokerDocument[];
  loanBrokerImage?: string;
  kakaoChannelUrl?: string;
  youtubeUrl?: string;
}

export function Footer() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({});
  const [loanBrokerDocuments, setLoanBrokerDocuments] = useState<LoanBrokerDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const phoneNumber = companyInfo.phone || '';
  const kakaoUrl = companyInfo.kakaoChannelUrl || '#';
  const youtubeUrl = companyInfo.youtubeUrl || '#';

  useEffect(() => {
    async function fetchCompanyInfo() {
      try {
        const res = await fetch('/api/company-info');
        if (res.ok) {
          const data = await res.json();
          setCompanyInfo(data);

          // 다중 등록증 파싱
          let documents: LoanBrokerDocument[] = [];
          if (data.loanBrokerDocuments) {
            try {
              documents = typeof data.loanBrokerDocuments === 'string'
                ? JSON.parse(data.loanBrokerDocuments)
                : data.loanBrokerDocuments;
            } catch {
              documents = [];
            }
          }
          // 기존 loanBrokerPdf가 있고 documents가 비어있으면 마이그레이션
          if (data.loanBrokerPdf && documents.length === 0) {
            documents = [{ name: '대출모집법인 등록증', file: data.loanBrokerPdf }];
          }
          setLoanBrokerDocuments(documents);
        }
      } catch (error) {
        console.error('Failed to fetch company info:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCompanyInfo();
  }, []);

  const handleDocumentDownload = (doc: LoanBrokerDocument) => {
    const link = document.createElement('a');
    link.href = doc.file;
    link.download = `${doc.name || '등록증'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
              {companyInfo.companyName || '신차앤렌트'}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed mb-4 break-keep">
              신차 장기렌트 전문 서비스
              <br />
              합리적인 가격으로 새 차를 만나보세요.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a
                href={`tel:${phoneNumber}`}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="전화 상담"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href={kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-gray-900 transition-colors"
                aria-label="카카오톡 상담"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="유튜브 채널"
              >
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">바로가기</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/vehicles" className="hover:text-white transition-colors">
                  차량 보기
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  회사소개
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  상담안내
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">상담 안내</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <span className="text-gray-400">전화: </span>
                {isLoading ? (
                  <span className="text-gray-500">로딩 중...</span>
                ) : phoneNumber ? (
                  <a href={`tel:${phoneNumber}`} className="hover:text-white transition-colors">
                    {phoneNumber}
                  </a>
                ) : (
                  <span className="text-gray-500">정보 없음</span>
                )}
              </li>
              <li>
                <span className="text-gray-400">상담: </span>
                <span>평일 09:00-18:00</span>
              </li>
              <li>
                <span className="text-gray-400">점심: </span>
                <span>12:00-13:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Business Info Section */}
        <div className="border-t border-gray-800 mt-6 pt-6 sm:mt-8 sm:pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* 사업자 정보 */}
            <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs text-gray-400">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                <span className="text-xs sm:text-sm text-gray-300 font-medium">사업자 정보</span>
              </div>
              {companyInfo.companyName && (
                <p>
                  <span className="text-gray-500">상호: </span>
                  {companyInfo.companyName}
                  {companyInfo.ceoName && <span> | 대표: {companyInfo.ceoName}</span>}
                </p>
              )}
              {companyInfo.businessNumber && (
                <p>
                  <span className="text-gray-500">사업자등록번호: </span>
                  {companyInfo.businessNumber}
                </p>
              )}
              {companyInfo.address && (
                <p>
                  <span className="text-gray-500">주소: </span>
                  {companyInfo.address}
                </p>
              )}
              <p>
                {companyInfo.phone && (
                  <>
                    <span className="text-gray-500">TEL: </span>
                    {companyInfo.phone}
                  </>
                )}
                {companyInfo.faxNumber && (
                  <>
                    <span className="mx-2">|</span>
                    <span className="text-gray-500">FAX: </span>
                    {companyInfo.faxNumber}
                  </>
                )}
                {companyInfo.email && (
                  <>
                    <span className="mx-2">|</span>
                    <span className="text-gray-500">E-mail: </span>
                    {companyInfo.email}
                  </>
                )}
              </p>
              {companyInfo.privacyOfficer && (
                <p>
                  <span className="text-gray-500">개인정보보호책임자: </span>
                  {companyInfo.privacyOfficer}
                </p>
              )}
            </div>

            {/* 대출모집법인 정보 */}
            {companyInfo.loanBrokerNumber && (
              <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs text-gray-400">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                  <span className="text-xs sm:text-sm text-gray-300 font-medium">대출모집법인 정보</span>
                </div>
                <p>
                  <span className="text-gray-500">여신금융협회 등록번호: </span>
                  {companyInfo.loanBrokerNumber}
                </p>
                <p className="text-gray-500">
                  본 업체는 여신금융협회에 등록된 대출모집법인입니다.
                </p>
                {loanBrokerDocuments.length > 0 && (
                  <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                    {loanBrokerDocuments.map((doc, index) => (
                      doc.file && (
                        <button
                          key={index}
                          onClick={() => handleDocumentDownload(doc)}
                          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:text-white rounded-md transition-colors font-medium text-[11px] sm:text-sm"
                        >
                          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="break-keep">{doc.name || `등록증 ${index + 1}`} 다운로드</span>
                        </button>
                      )
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 pt-6 sm:mt-8 sm:pt-8 text-[11px] sm:text-sm text-center">
          <p className="break-keep">
            &copy; {new Date().getFullYear()}{' '}
            <Link href="/admin" className="hover:text-white">
              {companyInfo.companyName || '신차앤렌트'}
            </Link>
            . All rights reserved.
            <span className="hidden sm:inline"> | </span>
            <br className="sm:hidden" />
            NQsolution Design &amp; Develop
          </p>
        </div>
      </div>
    </footer>
  );
}
