export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskFactor {
  id: string;
  name: string;
  level: RiskLevel;
  impactScore: number; // 0 - 100
  explanation: string;
}

export interface MonthlyCommitActivity {
  month: string;
  commits: number;
  bugFixes: number;
}

export interface AnalyzedFile {
  id: string;
  path: string;
  name: string;
  directory: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  linesOfCode: number;
  commits: number;
  contributors: number;
  complexity: number;
  bugFixCommits: number;
  lastModified: string;
  fileAge: string;
  churnRate: 'HIGH' | 'MEDIUM' | 'LOW';
  riskFactors: RiskFactor[];
  commitActivity: MonthlyCommitActivity[];
  whyRiskyReasons: string[];
  recommendations: string[];
}

export interface RepositorySummary {
  name: string;
  owner: string;
  fullName: string;
  url: string;
  branch: string;
  analyzedCommit?: string;
  lastAnalyzed: string;
  totalFiles: number;
  highRiskFilesCount: number;
  mediumRiskFilesCount: number;
  lowRiskFilesCount: number;
  criticalRiskFilesCount: number;
  averageRiskScore: number;
  totalBugFixCommits: number;
  totalCommits: number;
  totalContributors: number;
  languages: { name: string; percentage: number; color: string }[];
}

export interface AnalysisStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  durationMs?: number;
}

export interface AnalysisJob {
  id: string;
  repoUrl: string;
  repoName: string;
  progressPercent: number;
  currentStepId: string;
  steps: AnalysisStep[];
  status: 'queued' | 'processing' | 'completed' | 'failed';
  startedAt: string;
  error?: string;
}
