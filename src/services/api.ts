import axios, { type AxiosInstance } from "axios";
import type {
  GitHubRepo,
  AnalysesResponse,
  AnalysisDetailResponse,
  AutonomousFixResponse,
  GitHubTokenResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // For session cookies
    });

    // Add auth token to all requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("devpulse_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle 401 errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("devpulse_token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // =============================
  // AUTH
  // =============================

  async saveGitHubToken(accessToken: string): Promise<GitHubTokenResponse> {
    const response = await this.api.post("/github/token", { accessToken });
    return response.data;
  }

  async getTokenStatus() {
    const response = await this.api.get("/github/token/status");
    return response.data;
  }

  async deleteGitHubToken() {
    const response = await this.api.delete("/github/token");
    return response.data;
  }

  // =============================
  // GITHUB REPOS
  // =============================

  async getGitHubRepos(): Promise<{ repos: GitHubRepo[] }> {
    const response = await this.api.get("/github/repos");
    return response.data;
  }

  // =============================
  // ANALYSES
  // =============================

  async getAllAnalyses(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    sortBy?: string;
    order?: string;
  }): Promise<AnalysesResponse> {
    const response = await this.api.get("/cline/all-analysis", { params });
    return response.data;
  }

  async getAnalysis(analysisId: string): Promise<AnalysisDetailResponse> {
    const response = await this.api.get(`/cline/analysis/${analysisId}`);
    return response.data;
  }

  async analyzeRepository(data: {
    repoUrl: string;
    repoName: string;
    owner: string;
  }) {
    const response = await this.api.post("/cline/analyze", data);
    return response.data;
  }

  // =============================
  // AUTONOMOUS FIX
  // =============================

  async triggerAutonomousFix(
    analysisId: string,
    accessToken?: string
  ): Promise<AutonomousFixResponse> {
    const response = await this.api.post("/cline/autonomous-fix", {
      analysisId,
      accessToken, // Optional if saved in session
    });
    return response.data;
  }

  async getFixJobStatus(jobId: string) {
    const response = await this.api.get(`/cline/autonomous-fix/${jobId}`);
    return response.data;
  }

  // =============================
  // ANALYSIS PROGRESS
  // =============================

  async getAnalysisProgress(analysisId: string) {
    const response = await this.api.get(`/cline/analysis/${analysisId}/progress`);
    return response.data;
  }
}

export default new ApiService();