import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Car, Plus, List, Star, HelpCircle, Database } from 'lucide-react';
import prisma from '@/lib/prisma';
import { localDb, DB_MODE } from '@/lib/db';

async function getStats() {
  try {
    if (DB_MODE === 'local') {
      return {
        vehicleCount: localDb.vehicles.count({ where: { isActive: true } }),
        brandCount: localDb.brands.count({ where: { isActive: true } }),
        popularCount: localDb.vehicles.count({ where: { isActive: true, isPopular: true } }),
        faqCount: localDb.faqs.count({ where: { isActive: true } }),
        dbMode: 'local',
      };
    }

    const [vehicleCount, brandCount, popularCount, faqCount] = await Promise.all([
      prisma.vehicle.count({ where: { isActive: true } }),
      prisma.brand.count({ where: { isActive: true } }),
      prisma.vehicle.count({ where: { isActive: true, isPopular: true } }),
      prisma.fAQ.count({ where: { isActive: true } }),
    ]);

    return { vehicleCount, brandCount, popularCount, faqCount, dbMode: 'postgres' };
  } catch (error) {
    console.error('DB connection failed:', error);
    // 에러 시 로컬 데이터 사용
    return {
      vehicleCount: localDb.vehicles.count({ where: { isActive: true } }),
      brandCount: localDb.brands.count({ where: { isActive: true } }),
      popularCount: localDb.vehicles.count({ where: { isActive: true, isPopular: true } }),
      faqCount: localDb.faqs.count({ where: { isActive: true } }),
      dbMode: 'local',
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-8">대시보드</h1>

      {/* DB 모드 표시 */}
      <div className={`mb-4 md:mb-8 p-3 md:p-4 rounded-lg flex items-start gap-3 ${
        stats.dbMode === 'local'
          ? 'bg-blue-50 border border-blue-200'
          : 'bg-green-50 border border-green-200'
      }`}>
        <Database className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          stats.dbMode === 'local' ? 'text-blue-600' : 'text-green-600'
        }`} />
        <div>
          <p className={`text-sm md:text-base font-medium ${
            stats.dbMode === 'local' ? 'text-blue-800' : 'text-green-800'
          }`}>
            {stats.dbMode === 'local' ? '로컬 모드 (JSON 파일)' : 'PostgreSQL 연결됨'}
          </p>
          <p className={`text-xs md:text-sm mt-1 ${
            stats.dbMode === 'local' ? 'text-blue-700' : 'text-green-700'
          }`}>
            {stats.dbMode === 'local'
              ? '데이터가 data/ 폴더의 JSON 파일에 저장됩니다.'
              : '외부 PostgreSQL 데이터베이스에 연결되어 있습니다.'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">차량 등록</h3>
                  <p className="text-xs md:text-sm text-gray-500 truncate">새 차량을 추가합니다</p>
                </div>
              </div>
              <Button asChild size="sm" className="flex-shrink-0">
                <Link href="/admin/vehicles/new">등록</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <List className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">차량 목록</h3>
                  <p className="text-xs md:text-sm text-gray-500 truncate">등록된 차량을 관리합니다</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="flex-shrink-0">
                <Link href="/admin/vehicles">보기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <Car className="w-6 h-6 md:w-8 md:h-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">등록 차량</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.vehicleCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">인기 차량</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.popularCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <Car className="w-6 h-6 md:w-8 md:h-8 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">브랜드</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.brandCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <HelpCircle className="w-6 h-6 md:w-8 md:h-8 text-purple-500 flex-shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-gray-500">FAQ</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.faqCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
