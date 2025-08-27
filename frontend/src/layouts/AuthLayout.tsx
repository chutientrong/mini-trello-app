import React from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-8 sm:px-10 sm:py-10">{children}</div>
          <div className="bg-gray-50 px-6 py-4 sm:px-10">
            <div className="flex flex-col gap-3 text-center">
              {/* <span className="text-sm text-gray-500">Privacy Policy</span> */}
              <p className="text-xs text-gray-500 leading-relaxed">
                This site is protected by reCAPTCHA and the Google{" "}
                <Link to="#" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link to="#" className="text-blue-600 hover:text-blue-700">
                  Terms of Service
                </Link>{" "}
                apply.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
