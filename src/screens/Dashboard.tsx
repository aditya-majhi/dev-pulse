import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import type { Analysis, GitHubRepo } from "../types";
import { AnalysisCard } from "../components/analysisCard";
import { Loader } from "../components/loader";
import { isAuthenticated, logout } from "../utils/utils";

const AnalysesList: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [analyzingRepo, setAnalyzingRepo] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchAnalyses();
  }, [navigate]);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllAnalyses({ limit: 50 });
      setAnalyses(response.analyses);
    } catch (error) {
      console.error("Failed to fetch analyses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepos = async () => {
    try {
      setLoadingRepos(true);
      const response = await apiService.getGitHubRepos();
      setRepos(response.repos);
      setShowRepoModal(true);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to fetch repositories");
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleAnalyzeRepo = async () => {
    if (!selectedRepo) return;

    try {
      setAnalyzingRepo(true);
      await apiService.analyzeRepository({
        repoUrl: selectedRepo.cloneUrl,
        repoName: selectedRepo.name,
        owner: selectedRepo.owner.login,
      });
      setShowRepoModal(false);
      setSelectedRepo(null);
      // Refresh analyses list
      setTimeout(fetchAnalyses, 2000);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to start analysis");
    } finally {
      setAnalyzingRepo(false);
    }
  };

  const handleRaisePR = async (analysisId: string) => {
    if (!confirm("Are you sure you want to raise a PR for high-risk issues?")) {
      return;
    }

    try {
      await apiService.triggerAutonomousFix(analysisId);
      alert("PR creation started! Check back in a few minutes.");
      fetchAnalyses();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to start PR creation");
    }
  };

  const handleViewDetails = (analysisId: string) => {
    navigate(`/analysis/${analysisId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DevPulse</h1>
              <p className="text-sm text-gray-500">Recent Analyses</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchRepos}
                disabled={loadingRepos}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loadingRepos ? "Loading..." : "New Analysis"}
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Analyses Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analyses.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No analyses yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start by analyzing your first repository
            </p>
            <button
              onClick={fetchRepos}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Analyze Repository
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis) => (
              <AnalysisCard
                key={analysis.analysis_id}
                analysis={analysis}
                onRaisePR={handleRaisePR}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </main>

      {/* Repo Selection Modal */}
      {showRepoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Select Repository</h2>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-6">
              <div className="space-y-3">
                {repos.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => setSelectedRepo(repo)}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      selectedRepo?.id === repo.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {repo.fullName}
                        </h3>
                        {repo.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {repo.language && <span>🔵 {repo.language}</span>}
                          <span>⭐ {repo.stars}</span>
                          <span>🍴 {repo.forks}</span>
                        </div>
                      </div>
                      {selectedRepo?.id === repo.id && (
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowRepoModal(false);
                  setSelectedRepo(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAnalyzeRepo}
                disabled={!selectedRepo || analyzingRepo}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {analyzingRepo ? "Starting..." : "Analyze"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysesList;
