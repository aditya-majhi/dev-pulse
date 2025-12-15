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
      console.log("📊 Analysis Response:", response.analysis); // Debug log
      setAnalysis(response.analysis);
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRaisePR = async () => {
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

  // ✅ Handle both camelCase and snake_case
  const codeQuality = analysis.code_quality || (analysis as any).codeQuality;
  const aiAnalysis = analysis.ai_analysis || (analysis as any).aiAnalysis;
  const structure = analysis.structure;
  const status = analysis.status;
  const progress = analysis.progress || 0;

  const isHighRisk = (codeQuality?.score || 0) < 70;
  const canRaisePR =
    status === "completed" &&
    isHighRisk &&
    !analysis.hasActiveFixes &&
    !(analysis as any).has_active_fixes;

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
            {status === "completed" && codeQuality && (
              <RiskBadge score={codeQuality.score} size="lg" />
            )}
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
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {raisingPR ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating PR...
                  </>
                ) : (
                  <>
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Raise PR for High Risks
                  </>
                )}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-semibold capitalize">
                {status.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-lg font-semibold">{progress}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Files Analyzed</p>
              <p className="text-lg font-semibold">
                {structure?.totalFiles || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quality Score</p>
              <p className="text-lg font-semibold">
                {codeQuality?.score || "N/A"}
                {codeQuality?.score && " / 100"}
              </p>
            </div>
          </div>

          {/* Message */}
          {analysis.message && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{analysis.message}</p>
            </div>
          )}

          {/* Error */}
          {analysis.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{analysis.error}</p>
            </div>
          )}
        </div>

        {/* AI Analysis Results */}
        {aiAnalysis && (
          <>
            {/* Architecture */}
            {aiAnalysis.architecture && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>🏗️</span> Architecture
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Pattern</p>
                    <p className="text-lg font-semibold">
                      {aiAnalysis.architecture.pattern || "Unknown"}
                    </p>
                  </div>
                  {aiAnalysis.architecture.strengths &&
                    aiAnalysis.architecture.strengths.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">
                          ✅ Strengths
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {aiAnalysis.architecture.strengths.map(
                            (strength: string, i: number) => (
                              <li key={i} className="text-gray-700">
                                {strength}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  {aiAnalysis.architecture.weaknesses &&
                    aiAnalysis.architecture.weaknesses.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">
                          ⚠️ Weaknesses
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {aiAnalysis.architecture.weaknesses.map(
                            (weakness: string, i: number) => (
                              <li key={i} className="text-gray-700">
                                {weakness}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Security Issues */}
            {aiAnalysis.security && aiAnalysis.security.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-red-600">🔒</span> Security Issues (
                  {aiAnalysis.security.length})
                </h2>
                <div className="space-y-3">
                  {aiAnalysis.security.map((issue: any, i: number) => (
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
                            {issue.type || "Security Issue"}
                          </h3>
                          <p className="text-sm text-gray-700 mt-1">
                            {issue.description ||
                              "Security vulnerability detected"}
                          </p>
                          {issue.file && (
                            <p className="text-xs text-gray-500 mt-2 font-mono">
                              📄 {issue.file}
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
                          {(issue.severity || "medium").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bugs */}
            {aiAnalysis.bugs && aiAnalysis.bugs.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>🐛</span> Bugs ({aiAnalysis.bugs.length})
                </h2>
                <div className="space-y-3">
                  {aiAnalysis.bugs.map((bug: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900">
                            {bug.description || "Bug detected"}
                          </p>
                          {bug.file && (
                            <p className="text-xs text-gray-500 mt-2 font-mono">
                              📄 {bug.file}
                            </p>
                          )}
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-800">
                          {(bug.severity || "medium").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Code Quality Issues */}
            {aiAnalysis.codeQuality?.issues &&
              aiAnalysis.codeQuality.issues.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span>📊</span> Code Quality Issues
                  </h2>
                  <div className="space-y-2">
                    {aiAnalysis.codeQuality.issues.map(
                      (issue: string, i: number) => (
                        <div
                          key={i}
                          className="p-3 rounded border border-gray-200 bg-gray-50 text-sm text-gray-700"
                        >
                          • {issue}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Recommendations */}
            {aiAnalysis.recommendations &&
              aiAnalysis.recommendations.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span>💡</span> Recommendations
                  </h2>
                  <div className="space-y-4">
                    {aiAnalysis.recommendations.map((rec: any, i: number) => (
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
                            {(rec.priority || "low").toUpperCase()}
                          </span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {rec.title || "Recommendation"}
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

        {/* No AI Analysis Yet */}
        {status === "completed" && !aiAnalysis && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <svg
              className="w-12 h-12 text-yellow-600 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analysis Incomplete
            </h3>
            <p className="text-gray-600">
              AI analysis data is not available. The analysis may have completed
              with errors.
            </p>
          </div>
        )}

        {/* PR Status */}
        {(analysis.fixes || (analysis as any).fix_jobs) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🔧</span> Pull Requests
            </h2>
            <div className="space-y-3">
              {(analysis.fixes || (analysis as any).fix_jobs || []).map(
                (fix: any) => (
                  <div
                    key={fix.job_id}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold font-mono text-sm">
                        {fix.job_id.substring(0, 20)}...
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
                    {fix.message && (
                      <p className="text-sm text-gray-600 mb-2">
                        {fix.message}
                      </p>
                    )}
                    {fix.pr_url && (
                      <a
                        href={fix.pr_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 text-sm"
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
                    {fix.high_impact_issues && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">
                          Fixed {fix.high_impact_issues.length} high-impact
                          issues
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RepoDetails;
