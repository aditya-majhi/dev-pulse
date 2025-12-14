import React from "react";

interface RiskBadgeProps {
  score?: number;
  grade?: string;
  size?: "sm" | "md" | "lg";
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score,
  //   grade,
  size = "md",
}) => {
  const getRiskLevel: () => { label: string; color: string } = () => {
    if (!score) return { label: "N/A", color: "gray" };
    if (score >= 90) return { label: "LOW", color: "green" };
    if (score >= 70) return { label: "MEDIUM", color: "yellow" };
    return { label: "HIGH", color: "red" };
  };

  const risk = getRiskLevel();

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const colorClasses = {
    green: "bg-green-100 text-green-800 border-green-300",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
    red: "bg-red-100 text-red-800 border-red-300",
    gray: "bg-gray-100 text-gray-800 border-gray-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold border rounded ${
        sizeClasses[size]
      } ${colorClasses[risk.color as keyof typeof colorClasses]}`}
    >
      <span className={`w-2 h-2 rounded-full bg-${risk.color}-600`}></span>
      {risk.label}
      {score && <span className="ml-1 opacity-75">({score})</span>}
    </span>
  );
};
