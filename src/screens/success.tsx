import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Loader } from "../components/loader";
import { saveToken } from "../utils/utils";

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Save token to localStorage
      saveToken(token);

      // Wait a moment to show success message
      setTimeout(() => {
        setIsProcessing(false);

        // Redirect to analyses after 1.5 seconds
        setTimeout(() => {
          navigate("/analyses");
        }, 1500);
      }, 1000);
    } else {
      // No token found, redirect to login
      navigate("/login");
    }
  }, [searchParams, navigate]);

  if (isProcessing) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6 animate-bounce" />
        <h1 className="text-5xl font-bold text-green-600 mb-4">Success!</h1>
        <p className="text-xl text-gray-700 mb-2">
          Your account has been authenticated successfully
        </p>
        <p className="text-gray-500">Redirecting to your analyses...</p>
      </div>
    </div>
  );
};

export default Success;
