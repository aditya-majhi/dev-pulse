import React from "react";
import { type Analysis } from "../types";
import { RiskBadge } from "./riskBadge";
import { formatDistanceToNow } from "date-fns";

interface AnalysisCardProps {
  analysis: Analysis;
  onRaisePR: (analysisId: string) => void;
  onViewDetails: (analysisId: string) => void;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  onRaisePR,
  onViewDetails,
}) => {
  // ✅ Check if analysis has code quality score and if it's high risk
  const codeQuality = analysis.code_quality || (analysis as any).codeQuality;
  const isHighRisk = (codeQuality?.score || 0) < 70;

  // ✅ Get all completed PRs
  const completedPRs = analysis.fixes
    ? analysis.fixes.filter((fix) => fix.status === "completed" && fix.pr_url)
    : [];

  // ✅ Get the current active/failed fix (most recent non-completed)
  const currentFix = analysis.fixes
    ? analysis.fixes
        .slice()
        .reverse()
        .find(
          (fix) =>
            fix.status !== "completed" ||
            (fix.status === "completed" && !fix.pr_url)
        )
    : null;

  // ✅ Check if fix is actively in progress
  const isFixInProgress =
    currentFix &&
    [
      "initializing",
      "analyzing",
      "cloning",
      "fixing",
      "committing",
      "pushing",
      "creating_pr",
    ].includes(currentFix.status);

  const canRaisePR =
    analysis.status === "completed" &&
    isHighRisk &&
    !analysis.hasActiveFixes &&
    !isFixInProgress;

  const isInProgress = [
    "pending",
    "cloning",
    "analyzing",
    "ai_analyzing",
  ].includes(analysis.status);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {analysis.repo_name}
          </h3>
          <p className="text-sm text-gray-500">
            {analysis.repo_owner} •{" "}
            {formatDistanceToNow(new Date(analysis.created_at))} ago
          </p>
        </div>
        {analysis.status === "completed" && codeQuality && (
          <RiskBadge score={codeQuality.score} grade={codeQuality.grade} />
        )}
      </div>

      {/* Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
              analysis.status === "completed"
                ? "bg-green-100 text-green-800"
                : analysis.status === "failed"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {isInProgress && (
              <svg
                className="animate-spin h-3 w-3"
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
            )}
            {analysis.status.toUpperCase().replace("_", " ")}
          </span>

          {/* ✅ Active Fix Status */}
          {isFixInProgress && (
            <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800 flex items-center gap-1">
              <svg
                className="animate-spin h-3 w-3"
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
              FIX IN PROGRESS
            </span>
          )}

          {/* ✅ Completed PR Count Badge */}
          {completedPRs.length > 0 && (
            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {completedPRs.length} PR{completedPRs.length > 1 ? "s" : ""}{" "}
              CREATED
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{analysis.message}</p>
      </div>

      {/* ✅ Analysis Progress Bar */}
      {isInProgress && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${analysis.progress || 0}%` }}
            >
              {analysis.progress && analysis.progress > 0 && (
                <div className="w-full h-full bg-blue-400 animate-pulse"></div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {analysis.progress || 0}% complete
          </p>
        </div>
      )}

      {/* ✅ Active PR Creation Progress */}
      {currentFix && isFixInProgress && (
        <div className="mb-4">
          <div className="rounded-lg p-3 border bg-gray-50 border-gray-200">
            {/* Fix Status Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">
                PR Creation
              </span>
              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                {currentFix.status.toUpperCase().replace("_", " ")}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${currentFix.progress || 0}%` }}
                >
                  <div className="w-full h-full bg-purple-400 animate-pulse"></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {currentFix.message || `${currentFix.progress || 0}% complete`}
              </p>
            </div>

            {/* High Impact Issues Count */}
            {currentFix.high_impact_issues &&
              currentFix.high_impact_issues.length > 0 && (
                <p className="text-xs text-gray-500">
                  🔧 Fixing {currentFix.high_impact_issues.length} high-impact
                  issue{currentFix.high_impact_issues.length > 1 ? "s" : ""}
                </p>
              )}
          </div>
        </div>
      )}

      {/* ✅ Show All Successful PRs */}
      {completedPRs.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-semibold text-green-900">
              Successful Pull Requests
            </span>
          </div>

          {completedPRs.map((pr) => (
            <a
              key={pr.job_id}
              href={pr.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition group"
            >
              <svg
                className="w-5 h-5 text-green-600 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 group-hover:text-green-700 truncate">
                  Pull Request #{pr.pr_number}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  {pr.high_impact_issues &&
                    pr.high_impact_issues.length > 0 && (
                      <span>
                        Fixed {pr.high_impact_issues.length} issue
                        {pr.high_impact_issues.length > 1 ? "s" : ""}
                      </span>
                    )}
                  {pr.completed_at && (
                    <>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(pr.completed_at))} ago
                      </span>
                    </>
                  )}
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition shrink-0"
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
          ))}
        </div>
      )}

      {/* ✅ Failed Fix Status */}
      {currentFix && currentFix.status === "failed" && (
        <div className="mb-4">
          <div className="rounded-lg p-3 border bg-red-50 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-red-700">
                PR Creation Failed
              </span>
              <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                FAILED
              </span>
            </div>
            {currentFix.error && (
              <p className="text-xs text-red-600">⚠️ {currentFix.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(analysis.analysis_id)}
          disabled={analysis.status === "pending"}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInProgress ? "View Progress" : "View Details"}
        </button>
        {canRaisePR && (
          <button
            onClick={() => onRaisePR(analysis.analysis_id)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Raise PR
          </button>
        )}
      </div>
    </div>
  );
};
