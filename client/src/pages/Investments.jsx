import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { investmentService } from "../services/api";

const Investments = () => {
  const [activeTab, setActiveTab] = useState("portfolio");

  const { data: portfolioData } = useQuery({
    queryKey: ["portfolio"],
    queryFn: investmentService.getPortfolio,
  });

  const { data: investmentsData } = useQuery({
    queryKey: ["investments"],
    queryFn: investmentService.getInvestments,
  });

  const { data: insightsData } = useQuery({
    queryKey: ["portfolio-insights"],
    queryFn: investmentService.getPortfolioInsights,
  });
  const innerInsights = insightsData?.data || null;

  const tabs = [
    { id: "portfolio", name: "Portfolio Overview", icon: "📊" },
    { id: "investments", name: "My Investments", icon: "💼" },
    { id: "insights", name: "AI Insights", icon: "🤖" },
  ];

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "matured":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Investment Portfolio
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Track and manage your investment portfolio
        </p>
      </div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>
      {activeTab === "portfolio" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Value
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${portfolioData?.data?.totalValue?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">📈</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Expected Returns
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    $
                    {portfolioData?.data?.expectedReturns?.toLocaleString() ||
                      "0"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">🎯</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Active Investments
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {portfolioData?.data?.activeInvestments || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Yield</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Number(portfolioData?.data?.averageYield ?? 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === "investments" && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Investment History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Return
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {investmentsData?.data?.investments?.map((investment) => (
                    <tr key={investment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {investment.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {investment.investment_type} •{" "}
                            {investment.risk_level} risk
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${investment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        ${investment.expected_return?.toLocaleString() || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                            investment.status
                          )}`}
                        >
                          {investment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(investment.invested_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {investmentsData?.data?.investments?.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">💼</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No investments yet
                  </h3>
                  <p className="text-gray-500">
                    Start investing to see your portfolio here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        <div className="space-y-6">
          {innerInsights ? (
            <>
              {innerInsights.riskDistribution && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Risk Distribution
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Low Risk</span>
                      <span className="text-sm font-medium">
                        {innerInsights.riskDistribution.low}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${innerInsights.riskDistribution.low}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Moderate Risk
                      </span>
                      <span className="text-sm font-medium">
                        {innerInsights.riskDistribution.moderate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${innerInsights.riskDistribution.moderate}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">High Risk</span>
                      <span className="text-sm font-medium">
                        {innerInsights.riskDistribution.high}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${innerInsights.riskDistribution.high}%`,
                        }}
                      ></div>
                    </div>

                    {typeof innerInsights.diversificationScore === "number" && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Diversification Score
                          </span>
                          <span className="text-sm font-semibold text-blue-600">
                            {innerInsights.diversificationScore}/100
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {innerInsights.insights && innerInsights.insights.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Key Insights
                  </h3>
                  <div className="space-y-3">
                    {innerInsights.insights.map((insight, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <span className="text-blue-600 text-sm mt-0.5">
                          {insight.type === "strength"
                            ? "✅"
                            : insight.type === "weakness"
                            ? "⚠️"
                            : insight.type === "opportunity"
                            ? "💡"
                            : "🎯"}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            {insight.message}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                              insight.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : insight.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {insight.priority} priority
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {innerInsights.recommendations &&
                innerInsights.recommendations.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      AI Recommendations
                    </h3>
                    <div className="space-y-3">
                      {innerInsights.recommendations.map(
                        (recommendation, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              recommendation.urgency === "high"
                                ? "bg-red-50 border-red-200"
                                : recommendation.urgency === "medium"
                                ? "bg-yellow-50 border-yellow-200"
                                : "bg-green-50 border-green-200"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm capitalize">
                                  {recommendation.action} {recommendation.asset}
                                </p>
                                <p className="text-sm mt-1 text-gray-600">
                                  {recommendation.reason}
                                </p>
                              </div>
                              <span
                                className={`text-xs font-medium uppercase tracking-wider ${
                                  recommendation.urgency === "high"
                                    ? "text-red-600"
                                    : recommendation.urgency === "medium"
                                    ? "text-yellow-600"
                                    : "text-green-600"
                                }`}
                              >
                                {recommendation.urgency}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </>
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Investments;
