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
  const isHighRisk = (analysis.code_quality?.score || 0) < 70;
  const canRaisePR =
    analysis.status === "completed" && isHighRisk && !analysis.hasActiveFixes;

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
        <RiskBadge
          score={analysis.code_quality?.score}
          grade={analysis.code_quality?.grade}
        />
      </div>

      {/* Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs rounded ${
              analysis.status === "completed"
                ? "bg-green-100 text-green-800"
                : analysis.status === "failed"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {analysis.status.toUpperCase()}
          </span>
          {analysis.hasActiveFixes && (
            <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
              FIX IN PROGRESS
            </span>
          )}
          {analysis.hasCompletedFixes && (
            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
              PR CREATED
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">{analysis.message}</p>
      </div>

      {/* Progress Bar */}
      {analysis.status !== "completed" && analysis.status !== "failed" && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${analysis.progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {analysis.progress}% complete
          </p>
        </div>
      )}

      {/* PR Links */}
      {analysis.fixes && analysis.fixes.length > 0 && (
        <div className="mb-4 bg-gray-50 rounded p-3">
          {analysis.fixes.map((fix) => (
            <div key={fix.job_id} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Fix Job: {fix.job_id.slice(0, 12)}...
              </span>
              {fix.pr_url && (
                <a
                  href={fix.pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View PR #{fix.pr_number}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(analysis.analysis_id)}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
        >
          View Details
        </button>
        {canRaisePR && (
          <button
            onClick={() => onRaisePR(analysis.analysis_id)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Raise PR
          </button>
        )}
      </div>
    </div>
  );
};
