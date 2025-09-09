import React, { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { transactionService } from "../services/api";

const TransactionLogs = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [debouncedEmail] = useDebounce(emailFilter, 1000);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [debouncedUserId] = useDebounce(userIdFilter, 1000);

  const { data: logsData, isLoading } = useQuery({
    queryKey: [
      "transaction-logs",
      {
        status_code: statusFilter || undefined,
        userId: debouncedUserId || undefined,
        email: debouncedEmail || undefined,
      },
    ],
    queryFn: () => {
      return transactionService.getTransactionLogs({
        status_code: statusFilter || undefined,
        userId: debouncedUserId || undefined,
        email: debouncedEmail || undefined,
      });
    },
  });
  const logs = logsData?.data?.logs || [];
  const pagination = logsData?.data?.pagination || {};

  const { data: errorSummary } = useQuery({
    queryKey: ["error-summary"],
    queryFn: transactionService.getErrorSummary,
  });
  const errorSummaryInsights = errorSummary?.data || null;

  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300)
      return "text-green-600 bg-green-50";
    if (statusCode >= 300 && statusCode < 400)
      return "text-blue-600 bg-blue-50";
    if (statusCode >= 400 && statusCode < 500)
      return "text-yellow-600 bg-yellow-50";
    if (statusCode >= 500) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "text-green-700 bg-green-100";
      case "POST":
        return "text-blue-700 bg-blue-100";
      case "PUT":
        return "text-yellow-700 bg-yellow-100";
      case "DELETE":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction Logs</h1>
        <p className="mt-1 text-sm text-gray-600">
          View your API activity and system interactions
        </p>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center justify-center mb-4">
          <span className="text-2xl mr-2">🤖</span>
          <h2 className="text-lg font-medium text-yellow-900">
            AI Error Analysis
          </h2>
        </div>
        {errorSummaryInsights ? (
          errorSummaryInsights.errorCount > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Summary
                </h3>
                <p className="text-sm text-yellow-700">
                  {errorSummaryInsights.summary}
                </p>

                {errorSummaryInsights.mostCommonError && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-yellow-600">
                      Most Common Error:
                    </span>
                    <p className="text-xs text-yellow-700 mt-1">
                      {errorSummaryInsights.mostCommonError}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Error Patterns ({errorSummaryInsights.errorCount} errors)
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {errorSummaryInsights.patterns
                    ?.slice(0, 3)
                    .map((pattern, index) => (
                      <li key={index}>• {pattern}</li>
                    ))}
                </ul>

                {errorSummaryInsights.recommendations && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-yellow-600">
                      Recommendations:
                    </span>
                    <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                      {errorSummaryInsights.recommendations
                        .slice(0, 2)
                        .map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      <div className="bg-white  p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Logs</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Code
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status Codes</option>
              <option value="200">200 (Success)</option>
              <option value="201">201 (Created)</option>
              <option value="400">400 (Bad Request)</option>
              <option value="401">401 (Unauthorized)</option>
              <option value="404">404 (Not Found)</option>
              <option value="500">500 (Server Error)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              placeholder="Filter by Email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              placeholder="Filter User ID"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logsData?.data?.logs?.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {log.endpoint}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(
                        log.http_method
                      )}`}
                    >
                      {log.http_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        log.status_code
                      )}`}
                    >
                      {log.status_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.response_time || "N/A"}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.created_at)
                      .toLocaleString("en-GB", {
                        hour12: true,
                        timeZone: "UTC",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                      .replace(",", "")
                      .toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {log.error_message ? (
                      <span
                        title={log.error_message}
                        className="truncate max-w-xs block"
                      >
                        {log.error_message.length > 50
                          ? `${log.error_message.substring(0, 50)}...`
                          : log.error_message}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logsData?.data?.logs?.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transaction logs found
              </h3>
              <p className="text-gray-500">
                Start using the application to see your activity logs here.
              </p>
            </div>
          )}
        </div>

        {logsData?.pagination && logsData.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing{" "}
              {(logsData.pagination.currentPage - 1) *
                logsData.pagination.itemsPerPage +
                1}{" "}
              to{" "}
              {Math.min(
                logsData.pagination.currentPage *
                  logsData.pagination.itemsPerPage,
                logsData.pagination.totalItems
              )}{" "}
              of {logsData.pagination.totalItems} results
            </div>
            <div className="flex space-x-2">
              <button
                disabled={logsData.pagination.currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={
                  logsData.pagination.currentPage ===
                  logsData.pagination.totalPages
                }
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionLogs;
