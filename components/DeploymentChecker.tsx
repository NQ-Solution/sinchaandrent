'use client';

import { useEffect } from 'react';

/**
 * 배포 버전 불일치 감지 및 자동 새로고침 컴포넌트
 * - Server Action 에러 발생 시 자동 새로고침
 * - 배포 버전 불일치 시 알림 및 새로고침
 */
export function DeploymentChecker() {
  useEffect(() => {
    // 현재 배포 ID 저장
    const currentDeploymentId = process.env.NEXT_PUBLIC_DEPLOYMENT_ID;

    // 전역 에러 핸들러 - Server Action 에러 감지
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';

      // Server Action 관련 에러 감지
      if (
        errorMessage.includes('Failed to find Server Action') ||
        errorMessage.includes('older or newer deployment') ||
        errorMessage.includes('Invariant: Expected RSC response')
      ) {
        console.warn('[DeploymentChecker] 배포 버전 불일치 감지, 페이지 새로고침...');

        // 사용자에게 알림 후 새로고침
        if (typeof window !== 'undefined') {
          // 무한 새로고침 방지 - 세션 스토리지로 체크
          const reloadKey = 'deployment_reload_' + currentDeploymentId;
          const lastReload = sessionStorage.getItem(reloadKey);
          const now = Date.now();

          if (!lastReload || now - parseInt(lastReload) > 10000) { // 10초 이내 중복 새로고침 방지
            sessionStorage.setItem(reloadKey, now.toString());
            window.location.reload();
          }
        }
      }
    };

    // unhandled rejection 핸들러 (Promise 에러)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason?.toString() || '';

      if (
        reason.includes('Failed to find Server Action') ||
        reason.includes('older or newer deployment') ||
        reason.includes('Invariant: Expected RSC response')
      ) {
        console.warn('[DeploymentChecker] Promise 에러로 배포 버전 불일치 감지, 페이지 새로고침...');

        if (typeof window !== 'undefined') {
          const reloadKey = 'deployment_reload_promise_' + currentDeploymentId;
          const lastReload = sessionStorage.getItem(reloadKey);
          const now = Date.now();

          if (!lastReload || now - parseInt(lastReload) > 10000) {
            sessionStorage.setItem(reloadKey, now.toString());
            window.location.reload();
          }
        }
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // 렌더링 없음
}
