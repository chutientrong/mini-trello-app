import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {GitHubAPI} from "../services";
import { Button, LoadingSpinner } from "@/components";

export const GitHubCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Try localStorage first, then sessionStorage as fallback
    let savedState = localStorage.getItem("github_oauth_state");
    if (!savedState) {
      savedState = sessionStorage.getItem("github_oauth_state");
    }

    console.log("GitHub Callback Debug:", {
      code: code ? "present" : "missing",
      state: state || "missing",
      savedState: savedState || "missing",
      error: error || "none",
      localStorageKeys: Object.keys(localStorage).filter(
        (key) => key.includes("github") || key.includes("state")
      ),
      url: window.location.href,
    });

    if (error) {
      setError(`GitHub OAuth error: ${error}`);
      return;
    }

    if (!code) {
      setError("No authorization code received from GitHub");
      return;
    }

    if (!state || !savedState || state !== savedState) {
      console.log("State validation failed:", {
        state,
        savedState,
        match: state === savedState,
      });
      setError("Invalid or missing state parameter");
      return;
    }

    if (isProcessing) {
      return;
    }

    const handleOAuthCallback = async () => {
      setIsProcessing(true);
      try {
        // Clear the state from both storage types
        localStorage.removeItem("github_oauth_state");
        sessionStorage.removeItem("github_oauth_state");

        // Link GitHub account
        await GitHubAPI.linkGitHubAccount(code);

        // Redirect back to boards
        navigate("/boards", { replace: true });
      } catch (err) {
        console.error("GitHub OAuth callback error:", err);
        setError("Failed to complete GitHub authentication. Please try again.");
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, isProcessing]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              GitHub Authentication Error
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => navigate("/boards")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Return to Boards
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <LoadingSpinner />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            Connecting to GitHub...
          </h2>
          <p className="text-gray-600">
            Please wait while we complete the authentication process.
          </p>
        </div>
      </div>
    </div>
  );
};
