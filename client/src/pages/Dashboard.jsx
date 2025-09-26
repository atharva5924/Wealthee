import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { investmentService, productService } from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: investmentService.getPortfolio,
    refetchInterval: 30000,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: aiInsights } = useQuery({
    queryKey: ["portfolio-insights"],
    queryFn: investmentService.getPortfolioInsights,
    refetchInterval: 300000,
  });
  const inneraiInsights = aiInsights?.data || null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: "Portfolio Value",
      value: portfolioData
        ? `$${portfolioData.data.totalValue?.toLocaleString() || "0"}`
        : "$0",
      change: portfolioData
        ? `+${portfolioData.data.totalGains?.toFixed(2) || "0"}%`
        : "+0%",
      changeType: "positive",
    },
    {
      name: "Active Investments",
      value: portfolioData?.data?.activeInvestments?.toString() || "0",
      change: `${portfolioData?.data?.newThisMonth || 0} this month`,
      changeType: "neutral",
    },
    {
      name: "Expected Returns",
      value: portfolioData
        ? `$${portfolioData.data.expectedReturns?.toLocaleString() || "0"}`
        : "$0",
      change: portfolioData
        ? `${
            Number(portfolioData.data.averageYield)?.toFixed(1) || "0"
          }% avg yield`
        : "0% avg yield",
      changeType: "positive",
    },
    {
      name: "Available Balance",
      value: `$${user?.balance?.toLocaleString() || "0"}`,
      change: "Ready to invest",
      changeType: "neutral",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's an overview of your investment portfolio
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {item.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span
                  className={`font-medium ${
                    item.changeType === "positive"
                      ? "text-green-600"
                      : item.changeType === "negative"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {item.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {portfolioData?.data?.activeInvestments === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            No Investments Yet
          </h3>
          <p className="mb-4 text-gray-600">
            You haven’t made any investments. Start exploring products to build
            your portfolio.
          </p>
          <button
            onClick={() => (window.location.href = "/products")}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Explore Products
          </button>
        </div>
      ) : inneraiInsights ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white">🤖</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                AI Portfolio Insights
              </h3>
              <p className="text-sm text-gray-500">
                Powered by advanced analytics
              </p>
            </div>
          </div>
          {inneraiInsights.riskDistribution && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Risk Distribution
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Low Risk</span>
                  <span className="font-medium">
                    {inneraiInsights.riskDistribution.low}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${inneraiInsights.riskDistribution.low}%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Moderate Risk</span>
                  <span className="font-medium">
                    {inneraiInsights.riskDistribution.moderate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${inneraiInsights.riskDistribution.moderate}%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">High Risk</span>
                  <span className="font-medium">
                    {inneraiInsights.riskDistribution.high}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${inneraiInsights.riskDistribution.high}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {inneraiInsights.insights && inneraiInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Key Insights
              </h4>
              <div className="space-y-2">
                {inneraiInsights.insights.slice(0, 3).map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 p-2 bg-blue-50 rounded"
                  >
                    <span className="text-blue-600 text-xs mt-0.5">
                      {insight.type === "strength"
                        ? "✅"
                        : insight.type === "weakness"
                        ? "⚠️"
                        : insight.type === "opportunity"
                        ? "💡"
                        : "🎯"}
                    </span>
                    <span className="text-sm text-gray-700">
                      {insight.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = "/products")}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Explore Products
          </button>
          <button
            onClick={() => (window.location.href = "/investments")}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Portfolio
          </button>
          <button
            onClick={() => (window.location.href = "/profile")}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
