'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save, Building2, FileText, Phone, Globe, AlertCircle, Plus, Trash2, Search } from 'lucide-react';
import Image from 'next/image';

interface LoanBrokerDocument {
  name: string;
  file: string; // base64 PDF
}

interface SiteSettings {
  // 기본 정보
  companyName: string;
  ceoName: string;
  businessNumber: string;
  address: string;

  // 연락처
  phone: string;
  email: string;
  faxNumber: string;

  // SNS
  kakaoChannelUrl: string;
  youtubeUrl: string;

  // 대출모집법인
  loanBrokerNumber: string;
  loanBrokerPdf: string; // 기존 호환용
  loanBrokerDocuments: LoanBrokerDocument[]; // 다중 등록증
  loanBrokerImage: string;

  // 기타
  privacyOfficer: string;

  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

const defaultSettings: SiteSettings = {
  companyName: '',
  ceoName: '',
  businessNumber: '',
  address: '',
  phone: '',
  email: '',
  faxNumber: '',
  kakaoChannelUrl: '',
  youtubeUrl: '',
  loanBrokerNumber: '',
  loanBrokerPdf: '',
  loanBrokerDocuments: [],
  loanBrokerImage: '',
  privacyOfficer: '',
  seoTitle: '신차앤렌트 - 천안 신차 장기렌트 전문',
  seoDescription: '천안 지역 신차 장기렌트 전문. 합리적인 가격의 장기렌트 견적/상담 플랫폼',
  seoKeywords: '천안장기렌트, 천안신차장기렌트, 천안렌트카, 천안자동차렌트, 아산장기렌트, 충남장기렌트, 장기렌트, 신차장기렌트, 법인장기렌트, 개인장기렌트',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          // loanBrokerDocuments가 문자열이면 파싱
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
          setSettings({ ...defaultSettings, ...data, loanBrokerDocuments: documents });
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // 다중 등록증 관리
  const addDocument = () => {
    setSettings(prev => ({
      ...prev,
      loanBrokerDocuments: [...prev.loanBrokerDocuments, { name: '', file: '' }]
    }));
  };

  const updateDocumentName = (index: number, name: string) => {
    const updated = [...settings.loanBrokerDocuments];
    updated[index] = { ...updated[index], name };
    setSettings(prev => ({ ...prev, loanBrokerDocuments: updated }));
  };

  const handleDocumentUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setMessage({
        type: 'error',
        text: `파일 크기가 너무 큽니다. (최대 10MB, 현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const updated = [...settings.loanBrokerDocuments];
      updated[index] = { ...updated[index], file: reader.result as string };
      setSettings(prev => ({ ...prev, loanBrokerDocuments: updated }));
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'PDF 파일을 읽는 중 오류가 발생했습니다.' });
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (index: number) => {
    setSettings(prev => ({
      ...prev,
      loanBrokerDocuments: prev.loanBrokerDocuments.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({
        type: 'error',
        text: `이미지 크기가 너무 큽니다. (최대 5MB, 현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSettings(prev => ({ ...prev, loanBrokerImage: reader.result as string }));
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: '이미지 파일을 읽는 중 오류가 발생했습니다.' });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // loanBrokerDocuments를 JSON 문자열로 변환
      const dataToSave = {
        ...settings,
        loanBrokerDocuments: JSON.stringify(settings.loanBrokerDocuments),
      };

      // 페이로드 크기 체크
      const payload = JSON.stringify(dataToSave);
      const payloadSize = new Blob([payload]).size;
      const payloadMB = (payloadSize / 1024 / 1024).toFixed(2);

      console.log(`Payload size: ${payloadMB}MB`);

      if (payloadSize > 40 * 1024 * 1024) { // 40MB 경고
        setMessage({
          type: 'error',
          text: `데이터 크기가 너무 큽니다 (${payloadMB}MB). PDF 파일 크기를 줄여주세요.`
        });
        setSaving(false);
        return;
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '설정이 저장되었습니다.' });
      } else {
        const errorData = await res.json().catch(() => ({ error: '알 수 없는 오류' }));
        setMessage({
          type: 'error',
          text: `저장에 실패했습니다: ${errorData.error || res.statusText}`
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setMessage({
        type: 'error',
        text: `오류가 발생했습니다: ${errorMessage}`
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">사이트 설정</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          웹사이트에 표시될 모든 정보를 한 곳에서 관리합니다.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 기본 정보 */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-gray-900">기본 정보</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    회사명
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: (주)신차앤렌트"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    대표자명
                  </label>
                  <input
                    type="text"
                    value={settings.ceoName}
                    onChange={(e) => setSettings(prev => ({ ...prev, ceoName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: 홍길동"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사업자등록번호
                  </label>
                  <input
                    type="text"
                    value={settings.businessNumber}
                    onChange={(e) => setSettings(prev => ({ ...prev, businessNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: 123-45-67890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사업장 주소
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: 서울특별시 강남구 테헤란로 123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    개인정보보호책임자
                  </label>
                  <input
                    type="text"
                    value={settings.privacyOfficer}
                    onChange={(e) => setSettings(prev => ({ ...prev, privacyOfficer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: 홍길동 (개인정보보호팀)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 연락처 정보 */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-gray-900">연락처 정보</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    대표 전화번호
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: 1588-0000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    홈페이지와 상담 페이지에 표시됩니다.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: info@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    팩스번호
                  </label>
                  <input
                    type="text"
                    value={settings.faxNumber}
                    onChange={(e) => setSettings(prev => ({ ...prev, faxNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: 02-1234-5678"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SNS 정보 */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-gray-900">SNS 및 외부 링크</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카카오톡 채널 URL
                  </label>
                  <input
                    type="url"
                    value={settings.kakaoChannelUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, kakaoChannelUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: https://pf.kakao.com/_your_channel"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    카카오톡 상담 버튼에 사용됩니다.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    유튜브 채널 URL
                  </label>
                  <input
                    type="url"
                    value={settings.youtubeUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: https://www.youtube.com/@your_channel"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    푸터 및 상담 페이지에 표시됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 대출모집법인 정보 */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-gray-900">대출모집법인 정보</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    여신협회 등록번호
                  </label>
                  <input
                    type="text"
                    value={settings.loanBrokerNumber}
                    onChange={(e) => setSettings(prev => ({ ...prev, loanBrokerNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: 2023-0000-000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    여신금융협회에 등록된 대출모집법인 등록번호입니다.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    대출모집법인 등록증 이미지
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    {settings.loanBrokerImage && (
                      <div className="space-y-2">
                        <div className="relative w-full max-w-md">
                          <Image
                            src={settings.loanBrokerImage}
                            alt="등록증 미리보기"
                            width={400}
                            height={300}
                            className="w-full h-auto rounded-lg border border-gray-200"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, loanBrokerImage: '' }))}
                          className="text-red-500 text-sm hover:underline"
                        >
                          이미지 삭제
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      상담안내 페이지와 푸터에 표시될 등록증 이미지입니다.
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      대출모집법인 등록증 (PDF) - 여러 개 등록 가능
                    </label>
                    <button
                      type="button"
                      onClick={addDocument}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4" />
                      등록증 추가
                    </button>
                  </div>
                  <div className="space-y-3">
                    {settings.loanBrokerDocuments.length === 0 ? (
                      <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                        등록된 등록증이 없습니다. &quot;등록증 추가&quot; 버튼을 클릭하여 추가하세요.
                      </p>
                    ) : (
                      settings.loanBrokerDocuments.map((doc, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={doc.name}
                              onChange={(e) => updateDocumentName(index, e.target.value)}
                              placeholder="등록증 이름 (예: KB캐피탈 대출모집법인 등록증)"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleDocumentUpload(index, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            {doc.file && (
                              <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded-lg">
                                <FileText className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-700">PDF 업로드 완료</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      고객이 다운로드할 수 있는 등록증 PDF입니다. 여러 캐피탈사의 등록증을 등록할 수 있습니다.
                    </p>
                    <p className="text-xs text-amber-600 font-medium">
                      ⚠️ 각 PDF 파일은 10MB 이하로 업로드해주세요. 파일이 크면 저장 시 오류가 발생할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>안내:</strong> 대출모집법인은 여신금융협회에 등록되어야 합니다.
                    등록번호와 등록증을 푸터에 표시하여 고객에게 신뢰를 제공하세요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEO 설정 - 전체 너비 */}
        <div className="mt-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-gray-900">SEO 설정 (검색엔진 최적화)</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사이트 제목 (Title)
                  </label>
                  <input
                    type="text"
                    value={settings.seoTitle}
                    onChange={(e) => setSettings(prev => ({ ...prev, seoTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: 신차앤렌트 - 천안 신차 장기렌트 전문"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    검색 결과에 표시되는 사이트 제목입니다. (권장: 50-60자)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사이트 설명 (Description)
                  </label>
                  <textarea
                    value={settings.seoDescription}
                    onChange={(e) => setSettings(prev => ({ ...prev, seoDescription: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: 천안 지역 신차 장기렌트 전문. 합리적인 가격의 장기렌트 견적/상담 플랫폼"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    검색 결과에 표시되는 사이트 설명입니다. (권장: 150-160자)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    키워드 (Keywords)
                  </label>
                  <textarea
                    value={settings.seoKeywords}
                    onChange={(e) => setSettings(prev => ({ ...prev, seoKeywords: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="예: 천안장기렌트, 천안신차장기렌트, 천안렌트카"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    쉼표(,)로 구분하여 입력하세요. 네이버/구글 검색에 사용됩니다.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>현재 설정된 키워드:</strong>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {settings.seoKeywords.split(',').map((keyword, index) => (
                      keyword.trim() && (
                        <span
                          key={index}
                          className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full"
                        >
                          {keyword.trim()}
                        </span>
                      )
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>안내:</strong> SEO 설정 변경 후 네이버 서치 어드바이저와 구글 서치 콘솔에서
                    사이트를 재색인 요청하면 검색 결과에 빠르게 반영됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={saving} className="min-w-32">
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
