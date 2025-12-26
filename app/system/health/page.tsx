'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Server, HardDrive, Clock } from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: Record<string, string | number | boolean | Record<string, string>>;
}

interface SystemHealth {
  database: HealthStatus;
  api: HealthStatus;
  storage: HealthStatus;
  timestamp: string;
}

export default function HealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusIcon = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getStatusColor = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Server className="w-7 h-7 text-primary" />
                시스템 헬스 체크
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                전체 시스템 상태를 실시간으로 모니터링합니다
              </p>
            </div>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            마지막 체크: {lastCheck.toLocaleString('ko-KR')}
          </div>
        </div>

        {loading && !health ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : health ? (
          <div className="space-y-4">
            {/* Database Status */}
            <div className={`bg-white rounded-lg shadow-sm border-2 p-6 ${getStatusColor(health.database.status)}`}>
              <div className="flex items-start gap-4">
                <Database className="w-8 h-8 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">데이터베이스</h2>
                    {getStatusIcon(health.database.status)}
                  </div>
                  <p className="text-gray-700">{health.database.message}</p>
                  {health.database.details && (
                    <div className="mt-3 p-3 bg-white/50 rounded border border-gray-200">
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(health.database.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* API Status */}
            <div className={`bg-white rounded-lg shadow-sm border-2 p-6 ${getStatusColor(health.api.status)}`}>
              <div className="flex items-start gap-4">
                <Server className="w-8 h-8 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">API 엔드포인트</h2>
                    {getStatusIcon(health.api.status)}
                  </div>
                  <p className="text-gray-700">{health.api.message}</p>
                  {health.api.details && (
                    <div className="mt-3 p-3 bg-white/50 rounded border border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(health.api.details).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-gray-600">{key}:</span>
                            <span className={`font-medium ${value === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Storage Status */}
            <div className={`bg-white rounded-lg shadow-sm border-2 p-6 ${getStatusColor(health.storage.status)}`}>
              <div className="flex items-start gap-4">
                <HardDrive className="w-8 h-8 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">스토리지</h2>
                    {getStatusIcon(health.storage.status)}
                  </div>
                  <p className="text-gray-700">{health.storage.message}</p>
                  {health.storage.details && (
                    <div className="mt-3 p-3 bg-white/50 rounded border border-gray-200">
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(health.storage.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Overall Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">전체 상태 요약</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {[health.database, health.api, health.storage].filter(s => s.status === 'healthy').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">정상</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {[health.database, health.api, health.storage].filter(s => s.status === 'warning').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">경고</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {[health.database, health.api, health.storage].filter(s => s.status === 'error').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">오류</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-800 font-medium">헬스 체크를 불러올 수 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
