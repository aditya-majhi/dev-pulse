import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GitHubLogin from "./screens/login";
import PATSetup from "./screens/SetPat";
import AnalysesList from "./screens/Dashboard";
import RepoDetails from "./screens/RepoDetails";
import { isAuthenticated } from "./utils/utils";
import Success from "./screens/success";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GitHubLogin />} />
        <Route path="/auth/success" element={<GitHubLogin />} />

        {/* ✅ PAT Setup Route */}
        <Route
          path="/setup-pat"
          element={
            <ProtectedRoute>
              <PATSetup />
            </ProtectedRoute>
          }
        />

        <Route path="/auth/success" element={<Success />} />

        <Route
          path="/analyses"
          element={
            <ProtectedRoute>
              <AnalysesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis/:analysisId"
          element={
            <ProtectedRoute>
              <RepoDetails />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/analyses" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
