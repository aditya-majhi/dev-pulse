import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { savePAT, hasPAT } from "../utils/crypto";
import { isAuthenticated } from "../utils/utils";

const PATSetup: React.FC = () => {
  const navigate = useNavigate();
  const [patInput, setPATInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    // Redirect if PAT already exists
    if (hasPAT()) {
      navigate("/analyses");
    }
  }, [navigate]);

  const validatePAT = (pat: string): boolean => {
    // GitHub PAT format validation
    const githubPATRegex = /^gh[ps]_[a-zA-Z0-9]{36,255}$/;
    return githubPATRegex.test(pat);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!patInput.trim()) {
      setError("Please enter your GitHub Personal Access Token");
      return;
    }

    if (!validatePAT(patInput)) {
      setError("Invalid PAT format. Must start with 'ghp_' or 'ghs_'");
      return;
    }

    setLoading(true);

    try {
      // Save encrypted PAT to localStorage
      savePAT(patInput);

      // Verify PAT by fetching repos (optional validation)
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${patInput}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        setError("Invalid GitHub PAT. Please check your token.");
        return;
      }

      // Success - redirect to analyses
      navigate("/analyses");
    } catch (err: any) {
      setError("Failed to verify PAT. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow skip for now, but user won't be able to raise PRs
    navigate("/analyses");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-600 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Setup GitHub Access
          </h1>
          <p className="text-gray-300">
            Connect your GitHub account to enable autonomous PR creation
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Personal Access Token Required
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            DevPulse needs a GitHub PAT with{" "}
            <code className="bg-gray-100 px-1 rounded">repo</code> scope to
            create pull requests with automated fixes.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-start gap-2">
              <svg
                className="w-5 h-5 mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              How to generate a PAT:
            </h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>
                Go to{" "}
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  GitHub Settings → Tokens
                </a>
              </li>
              <li>Click "Generate new token (classic)"</li>
              <li>
                Select scope: <strong>repo</strong> (full control of private
                repositories)
              </li>
              <li>Set expiration (recommended: 90 days)</li>
              <li>Click "Generate token" and copy it</li>
            </ol>
          </div>

          {/* PAT Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="pat"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                GitHub Personal Access Token *
              </label>
              <input
                type="password"
                id="pat"
                value={patInput}
                onChange={(e) => setPATInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                autoComplete="off"
              />
              <p className="mt-2 text-xs text-gray-500">
                🔒 Your token is encrypted and stored locally. We never send it
                to our servers.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Save & Continue"}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Why do we need this?
                </h4>
                <p className="text-xs text-gray-600">
                  DevPulse analyzes your code and automatically creates pull
                  requests with fixes for high-risk issues. The PAT allows us to
                  interact with your repositories on your behalf.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          You can update or remove your PAT anytime from settings
        </p>
      </div>
    </div>
  );
};

export default PATSetup;
