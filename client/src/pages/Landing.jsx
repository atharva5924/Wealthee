import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative bg-blue-600">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-blue-600 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              GripInvest
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              Your AI-powered investment platform. Start building your portfolio
              with intelligent recommendations and comprehensive portfolio
              analysis.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-3 text-lg font-medium rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-blue-500 text-white px-8 py-3 text-lg font-medium rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Why Choose GripInvest?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Advanced features powered by AI to help you make smarter
              investment decisions
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  🤖
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                AI-Powered Recommendations
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Get personalized investment recommendations based on your risk
                appetite and financial goals.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  📊
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Portfolio Analytics
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Real-time portfolio insights with risk analysis and performance
                tracking.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  🔒
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Secure & Reliable
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Bank-level security with comprehensive transaction logging and
                monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start investing?</span>
            <span className="block text-blue-200">
              Create your account today.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
