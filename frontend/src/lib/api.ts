import {
  RepositorySummary,
  AnalyzedFile,
  AnalysisJob,
  AnalysisStep,
  RiskLevel,
  MonthlyCommitActivity,
  RiskFactor,
} from '@/types';

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const DEFAULT_STEPS: AnalysisStep[] = [
  { id: 'clone', label: 'Clone repository', description: 'Acquire a temporary public GitHub clone', status: 'pending' },
  { id: 'history', label: 'Read Git history', description: 'Mine commits, authors, churn and bug-fix signals', status: 'pending' },
  { id: 'features', label: 'Extract file features', description: 'Calculate source-code and historical metrics', status: 'pending' },
  { id: 'predict', label: 'Predict risk', description: 'Apply the saved machine-learning model', status: 'pending' },
  { id: 'complete', label: 'Prepare results', description: 'Store and expose file-level risk results', status: 'pending' },
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body?.detail || message;
    } catch {
      // Keep the generic HTTP error.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

function riskLevel(category: string): RiskLevel {
  return category.toUpperCase() as RiskLevel;
}

function humanDays(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 365) return `${days} days ago`;
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

function humanAge(days: number): string {
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'}`;
}

function factorName(feature: string): string {
  const labels: Record<string, string> = {
    commit_count: 'Commit Activity',
    author_count: 'Contributor Density',
    lines_added: 'Lines Added',
    lines_deleted: 'Lines Deleted',
    total_churn: 'Code Churn',
    loc: 'Code Size',
    complexity: 'Cyclomatic Complexity',
    file_age_days: 'File Age',
    days_since_last_change: 'Recent Change Timing',
    recent_commit_count: 'Recent Commit Activity',
    bug_fix_count: 'Bug-Fix History',
  };
  return labels[feature] || feature;
}

function mapFactors(raw: any[]): RiskFactor[] {
  const positive = raw.filter((f) => Number(f.contribution) > 0);
  const max = Math.max(...positive.map((f) => Number(f.contribution)), 1);
  return positive.map((f) => {
    const impactScore = Math.round((Number(f.contribution) / max) * 100);
    const level: RiskLevel = impactScore >= 75 ? 'HIGH' : impactScore >= 40 ? 'MEDIUM' : 'LOW';
    return {
      id: f.feature,
      name: factorName(f.feature),
      level,
      impactScore,
      explanation: f.text,
    };
  });
}

function recommendations(metrics: Record<string, number>, riskScore: number): string[] {
  const items: string[] = [];
  if (metrics.complexity >= 15) items.push('Review high-complexity functions and consider targeted refactoring.');
  if (metrics.total_churn >= 500) items.push('Prioritize regression tests around frequently changed code paths.');
  if (metrics.bug_fix_count > 0) items.push('Review previous fix-related changes and strengthen regression coverage.');
  if (metrics.recent_commit_count > 0) items.push('Include this file in the next focused code-review or test pass.');
  if (riskScore >= 70) items.push('Treat the file as a high-priority review and testing hotspot.');
  return items.slice(0, 4);
}

function mapFile(raw: any): AnalyzedFile {
  const metrics = raw.metrics || {};
  const riskScore = Number(raw.riskScore || 0);
  const path = String(raw.filePath || '');
  const name = path.split('/').pop() || path;
  const slash = path.lastIndexOf('/');
  const directory = slash >= 0 ? path.slice(0, slash) : '.';
  return {
    id: path,
    path,
    name,
    directory,
    riskScore,
    riskLevel: riskLevel(raw.riskCategory || 'LOW'),
    linesOfCode: Number(metrics.loc || 0),
    commits: Number(metrics.commit_count || 0),
    contributors: Number(metrics.author_count || 0),
    complexity: Number(metrics.complexity || 0),
    bugFixCommits: Number(metrics.bug_fix_count || 0),
    lastModified: humanDays(Number(metrics.days_since_last_change || 0)),
    fileAge: humanAge(Number(metrics.file_age_days || 0)),
    churnRate: metrics.total_churn >= 1000 ? 'HIGH' : metrics.total_churn >= 300 ? 'MEDIUM' : 'LOW',
    riskFactors: mapFactors(raw.topFactors || []),
    commitActivity: (raw.commitActivity || []) as MonthlyCommitActivity[],
    whyRiskyReasons: (raw.topFactors || []).filter((f: any) => Number(f.contribution) > 0).map((f: any) => f.text),
    recommendations: recommendations(metrics, riskScore),
  };
}

export async function startAnalysis(repoUrl: string): Promise<{ jobId: string; repoName: string; status: string }> {
  return request('/api/v1/analyze', { method: 'POST', body: JSON.stringify({ repoUrl }) });
}

export async function getAnalysisJob(jobId: string, repoUrl = ''): Promise<AnalysisJob> {
  const raw = await request<any>(`/api/v1/jobs/${encodeURIComponent(jobId)}`);
  const stage = String(raw.stage || 'queued');
  const progress = Number(raw.progress || 0);
  const status = raw.status === 'completed' ? 'completed' : raw.status === 'failed' ? 'failed' : raw.status === 'queued' ? 'queued' : 'processing';
  const stageIndex = stage.includes('clone') ? 0 : stage.includes('history') ? 1 : stage.includes('feature') ? 2 : stage.includes('predict') ? 3 : status === 'completed' ? 4 : 0;
  const steps = DEFAULT_STEPS.map((step, index) => ({
    ...step,
    status: index < stageIndex || status === 'completed' ? 'completed' : index === stageIndex && status !== 'completed' && status !== 'failed' ? 'in_progress' : status === 'failed' && index === stageIndex ? 'error' : 'pending',
  } as AnalysisStep));
  return {
    id: raw.jobId,
    repoUrl,
    repoName: raw.repoName,
    progressPercent: progress,
    currentStepId: DEFAULT_STEPS[stageIndex]?.id || DEFAULT_STEPS[0].id,
    steps,
    status,
    startedAt: new Date().toISOString(),
    error: raw.error || undefined,
  };
}

export async function getRepositorySummary(jobId: string): Promise<RepositorySummary> {
  const raw = await request<any>(`/api/v1/repositories/summary?jobId=${encodeURIComponent(jobId)}`);
  const repo = raw.repository || {};
  const summary = raw.summary || {};
  const nameParts = String(repo.name || '').split('/');
  const owner = nameParts[0] || '';
  const name = nameParts[1] || nameParts[0] || '';
  const counts = summary.categoryCounts || {};
  return {
    name,
    owner,
    fullName: repo.name || '',
    url: repo.url || '',
    branch: repo.branch || 'HEAD',
    lastAnalyzed: raw.analyzedAt || '',
    analyzedCommit: repo.analyzedCommit,
    totalFiles: Number(summary.totalFiles || 0),
    highRiskFilesCount: Number(counts.High || 0),
    mediumRiskFilesCount: Number(counts.Medium || 0),
    lowRiskFilesCount: Number(counts.Low || 0),
    criticalRiskFilesCount: Number(counts.Critical || 0),
    averageRiskScore: Number(summary.averageRiskScore || 0),
    totalBugFixCommits: Number(summary.totalBugFixCommits || 0),
    totalCommits: Number(summary.totalCommits || 0),
    totalContributors: Number(summary.totalContributors || 0),
    languages: (summary.languages || [{ name: 'Python', percentage: 100 }]).map((l: any) => ({ ...l, color: l.color || '#3572A5' })),
  };
}

export async function getAnalyzedFiles(jobId: string): Promise<AnalyzedFile[]> {
  const raw = await request<any>(`/api/v1/repositories/files?jobId=${encodeURIComponent(jobId)}&limit=2000`);
  return (raw.files || []).map(mapFile);
}

export async function getFileDetails(jobId: string, filePath: string): Promise<{ file: AnalyzedFile; repositoryUrl: string } | null> {
  const raw = await request<any>(`/api/v1/files/detail?jobId=${encodeURIComponent(jobId)}&path=${encodeURIComponent(filePath)}`);
  if (!raw) return null;
  return { file: mapFile(raw), repositoryUrl: raw.repository?.url || '' };
}
