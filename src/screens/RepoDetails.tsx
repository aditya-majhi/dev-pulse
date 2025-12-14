import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../services/api";
import type { Analysis } from "../types";
import { RiskBadge } from "../components/riskBadge";
import { Loader } from "../components/loader";
import { hasPAT } from "../utils/crypto";

const RepoDetails: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [raisingPR, setRaisingPR] = useState(false);

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisDetails();
    }
  }, [analysisId]);

  const fetchAnalysisDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnalysis(analysisId!);
      setAnalysis(response.analysis);
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRaisePR = async () => {
    // ✅ Check if PAT is available
    if (!hasPAT()) {
      if (confirm("GitHub PAT required to create PRs. Set it up now?")) {
        navigate("/setup-pat");
      }
      return;
    }

    if (!confirm("Raise PR for high-risk issues?")) return;

    try {
      setRaisingPR(true);
      await apiService.triggerAutonomousFix(analysisId!);
      alert("PR creation started! Check back in a few minutes.");
      fetchAnalysisDetails();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to start PR");
    } finally {
      setRaisingPR(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Analysis not found
          </h2>
          <button
            onClick={() => navigate("/analyses")}
            className="text-blue-600 hover:underline"
          >
            Back to Analyses
          </button>
        </div>
      </div>
    );
  }

  const isHighRisk = (analysis.code_quality?.score || 0) < 70;
  const canRaisePR =
    analysis.status === "completed" && isHighRisk && !analysis.hasActiveFixes;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/analyses")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Analyses
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {analysis.repo_name}
              </h1>
              <p className="text-gray-500">{analysis.repo_owner}</p>
            </div>
            <RiskBadge score={analysis.code_quality?.score} size="lg" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Analysis Status</h2>
            {canRaisePR && (
              <button
                onClick={handleRaisePR}
                disabled={raisingPR}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {raisingPR ? "Creating PR..." : "Raise PR for High Risks"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-semibold capitalize">
                {analysis.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-lg font-semibold">{analysis.progress}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Files Analyzed</p>
              <p className="text-lg font-semibold">
                {analysis.structure?.totalFiles || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quality Score</p>
              <p className="text-lg font-semibold">
                {analysis.code_quality?.score || "N/A"} / 100
              </p>
            </div>
          </div>
        </div>

        {/* AI Analysis Results */}
        {analysis.ai_analysis && (
          <>
            {/* Architecture */}
            {analysis.ai_analysis.architecture && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Architecture</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Pattern</p>
                    <p className="text-lg font-semibold">
                      {analysis.ai_analysis.architecture.pattern}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Strengths</p>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.ai_analysis.architecture.strengths.map(
                        (strength, i) => (
                          <li key={i} className="text-gray-700">
                            {strength}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Weaknesses</p>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.ai_analysis.architecture.weaknesses.map(
                        (weakness, i) => (
                          <li key={i} className="text-gray-700">
                            {weakness}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Security Issues */}
            {analysis.ai_analysis.security &&
              analysis.ai_analysis.security.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-red-600">🔒</span> Security Issues (
                    {analysis.ai_analysis.security.length})
                  </h2>
                  <div className="space-y-3">
                    {analysis.ai_analysis.security.map((issue, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border ${
                          issue.severity === "critical"
                            ? "bg-red-50 border-red-200"
                            : issue.severity === "high"
                            ? "bg-orange-50 border-orange-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {issue.type}
                            </h3>
                            <p className="text-sm text-gray-700 mt-1">
                              {issue.description ||
                                "Security vulnerability detected"}
                            </p>
                            {issue.file && (
                              <p className="text-xs text-gray-500 mt-2">
                                File: {issue.file}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              issue.severity === "critical"
                                ? "bg-red-200 text-red-800"
                                : issue.severity === "high"
                                ? "bg-orange-200 text-orange-800"
                                : "bg-yellow-200 text-yellow-800"
                            }`}
                          >
                            {issue.severity?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Bugs */}
            {analysis.ai_analysis.bugs &&
              analysis.ai_analysis.bugs.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span>🐛</span> Bugs ({analysis.ai_analysis.bugs.length})
                  </h2>
                  <div className="space-y-3">
                    {analysis.ai_analysis.bugs.map((bug, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-gray-900">{bug.description}</p>
                            {bug.file && (
                              <p className="text-xs text-gray-500 mt-2">
                                File: {bug.file}
                              </p>
                            )}
                          </div>
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-800">
                            {bug.severity?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Recommendations */}
            {analysis.ai_analysis.recommendations &&
              analysis.ai_analysis.recommendations.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span>💡</span> Recommendations
                  </h2>
                  <div className="space-y-4">
                    {analysis.ai_analysis.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg border border-blue-200 bg-blue-50"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              rec.priority === "high"
                                ? "bg-red-200 text-red-800"
                                : rec.priority === "medium"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-green-200 text-green-800"
                            }`}
                          >
                            {rec.priority?.toUpperCase()}
                          </span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {rec.title}
                            </h3>
                            <p className="text-sm text-gray-700 mt-1">
                              {rec.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </>
        )}

        {/* PR Status */}
        {analysis.fixes && analysis.fixes.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pull Requests</h2>
            <div className="space-y-3">
              {analysis.fixes.map((fix) => (
                <div
                  key={fix.job_id}
                  className="p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">
                      Fix Job: {fix.job_id.substring(0, 20)}...
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        fix.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : fix.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {fix.status.toUpperCase()}
                    </span>
                  </div>
                  {fix.pr_url && (
                    <a
                      href={fix.pr_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      View Pull Request #{fix.pr_number}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RepoDetails;
