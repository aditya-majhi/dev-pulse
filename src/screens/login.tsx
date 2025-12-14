import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveToken, isAuthenticated } from "../utils/utils";
import apiService from "../services/api";

const GitHubLogin: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [patInput, setPATInput] = useState("");

  useEffect(() => {
    // Check if already authenticated
    if (isAuthenticated()) {
      navigate("/analyses");
      return;
    }

    // Handle OAuth callback with JWT token
    const token = searchParams.get("token");
    if (token) {
      saveToken(token);
      navigate("/analyses");
    }
  }, [searchParams, navigate]);

  const handleGitHubLogin = () => {
    // Redirect to backend OAuth endpoint
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.location.href = `${backendUrl}/api/v1/auth/github`;
  };

  const handlePATSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patInput.trim()) {
      setError("Please enter a valid GitHub Personal Access Token");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiService.saveGitHubToken(patInput);
      navigate("/analyses");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">DevPulse</h1>
          <p className="text-gray-300">AI-Powered Code Analysis & Auto-Fix</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Connect GitHub
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* OAuth Button */}
          <button
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition mb-6"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                or use Personal Access Token
              </span>
            </div>
          </div>

          {/* PAT Form */}
          <form onSubmit={handlePATSubmit}>
            <div className="mb-4">
              <label
                htmlFor="pat"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                GitHub Personal Access Token
              </label>
              <input
                type="password"
                id="pat"
                value={patInput}
                onChange={(e) => setPATInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Generate at{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  github.com/settings/tokens
                </a>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Token & Continue"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          By connecting, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default GitHubLogin;
