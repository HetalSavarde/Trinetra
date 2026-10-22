/**
 * Canonical FastAPI contract used by the Next.js frontend.
 * This file is documentation-only; the active implementation lives in frontend/src/lib/api.ts.
 */
export const ENDPOINTS = {
  health: '/health',
  analyze: '/api/v1/analyze',
  job: (jobId: string) => `/api/v1/jobs/${jobId}`,
  summary: (jobId: string) => `/api/v1/repositories/summary?jobId=${encodeURIComponent(jobId)}`,
  files: (jobId: string) => `/api/v1/repositories/files?jobId=${encodeURIComponent(jobId)}`,
  fileDetail: (jobId: string, path: string) => `/api/v1/files/detail?jobId=${encodeURIComponent(jobId)}&path=${encodeURIComponent(path)}`,
};
