export interface GitHubRepo {
    id: number;
    name: string;
    fullName: string;
    description: string | null;
    url: string;
    cloneUrl: string;
    language: string;
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
    size: number;
    defaultBranch: string;
    private: boolean;
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
    owner: {
        login: string;
        avatar: string;
    };
}

export interface CodeQuality {
    score: number;
    grade: string;
}

export interface HighImpactIssue {
    id: string;
    type: "SECURITY" | "BUG" | "CODE_QUALITY";
    severity: "critical" | "high" | "medium" | "low";
    title: string;
    description: string;
    file?: string;
    priority: number;
    fixable: boolean;
}

export interface FixJob {
    job_id: string;
    analysis_id: string;
    status: "initializing" | "processing" | "completed" | "failed";
    progress: number;
    pr_url?: string;
    pr_number?: number;
    high_impact_issues?: HighImpactIssue[];
    files_modified?: string[];
    created_at: string;
    completed_at?: string;
}

export interface Analysis {
    analysis_id: string;
    repo_name: string;
    repo_owner: string;
    repo_url: string;
    status: "pending" | "cloning" | "analyzing" | "ai_analyzing" | "completed" | "failed";
    progress: number;
    code_quality?: CodeQuality;
    structure?: {
        totalFiles: number;
    };
    message: string;
    error?: string;
    created_at: string;
    completed_at?: string;
    updated_at: string;
    fixes?: FixJob[];
    hasActiveFixes: boolean;
    hasCompletedFixes: boolean;
    ai_analysis?: {
        architecture?: {
            pattern: string;
            strengths: string[];
            weaknesses: string[];
        };
        codeQuality?: {
            score: number;
            issues: string[];
        };
        bugs?: Array<{
            severity: string;
            description: string;
            file?: string;
        }>;
        security?: Array<{
            type: string;
            severity: string;
            file?: string;
            description?: string;
        }>;
        recommendations?: Array<{
            priority: string;
            title: string;
            description: string;
        }>;
    };
}

export interface AnalysesResponse {
    success: boolean;
    analyses: Analysis[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        page: number;
        totalPages: number;
    };
}

export interface AnalysisDetailResponse {
    success: boolean;
    analysis: Analysis;
}

export interface AutonomousFixResponse {
    success: boolean;
    jobId: string;
    analysisId: string;
    message: string;
    status: string;
    tokenSource?: string;
}

export interface GitHubTokenResponse {
    success: boolean;
    message: string;
    githubUsername: string;
    scopes: string[];
    expiresIn?: string;
}