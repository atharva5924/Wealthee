import React,{ useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { productService } from "../services/api";
import { useQueryClient } from "@tanstack/react-query";
import { investmentService } from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const [filters, setFilters] = useState({
    type: "",
    risk_level: "",
    sort_by: "annual_yield",
    order: "DESC",
  });

  const [investModal, setInvestModal] = useState({
    isOpen: false,
    product: null,
    amount: "",
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getProducts(filters),
  });

  const { data: recommendationsData } = useQuery({
    queryKey: ["recommendations"],
    queryFn: productService.getRecommendations,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "bond":
        return "bg-blue-100 text-blue-800";
      case "fd":
        return "bg-purple-100 text-purple-800";
      case "mf":
        return "bg-indigo-100 text-indigo-800";
      case "etf":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const investMutation = useMutation({
    mutationFn: investmentService.createInvestment,
    onSuccess: () => {
      toast.success("Investment created successfully!");
      setInvestModal({ isOpen: false, product: null, amount: "" });
      queryClient.invalidateQueries(["investments"]);
      if (typeof refetchProfile === "function") {
        try {
          refetchProfile();
        } catch (err) {
          console.error("refetchProfile error:", err);
        }
      }
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || error?.message || "Investment failed";
      toast.error(message);
    },
  });

  const handleInvestNow = (product) => {
    setInvestModal({
      isOpen: true,
      product: product,
      amount: product.min_investment || "",
    });
  };

  const handleInvestSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(investModal.amount);

    if (!amount || amount < parseFloat(investModal.product.min_investment)) {
      toast.error(
        `Minimum investment is $${investModal.product.min_investment}`
      );
      return;
    }

    if (amount > parseFloat(investModal.product.max_investment)) {
      toast.error(
        `Maximum investment is $${investModal.product.max_investment}`
      );
      return;
    }

    investMutation.mutate({
      product_id: investModal.product.id,
      amount: amount,
    });
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
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Investment Products
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Discover and invest in our curated selection of financial products
          </p>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🤖</span>
            <h2 className="text-lg font-medium text-blue-900 text-center">
              AI Recommendations for You
            </h2>
          </div>
        </div>

        {recommendationsData?.data?.recommendations?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendationsData.data.recommendations
              .slice(0, 2)
              .map((rec, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg border shadow text-center flex flex-col items-center justify-center"
                >
                  <h3 className="font-medium text-gray-900 text-lg">
                    {rec.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">{rec.reason}</p>
                  <div className="mt-3">
                    <span className="text-xs font-medium text-blue-600">
                      Score: {rec.recommendationScore}/100
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Filter Products
          </h3>
          <button
            onClick={() => navigate("/admin/products")}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            + Add product
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="bond">Bonds</option>
              <option value="fd">Fixed Deposits</option>
              <option value="mf">Mutual Funds</option>
              <option value="etf">ETFs</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Level
            </label>
            <select
              value={filters.risk_level}
              onChange={(e) => handleFilterChange("risk_level", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange("sort_by", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="annual_yield">Annual Yield</option>
              <option value="min_investment">Min Investment</option>
              <option value="name">Name</option>
              <option value="created_at">Newest</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              value={filters.order}
              onChange={(e) => handleFilterChange("order", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="DESC">High to Low</option>
              <option value="ASC">Low to High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productsData?.data?.products?.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {product.name}
              </h3>
              <div className="flex flex-col space-y-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(
                    product.investment_type
                  )}`}
                >
                  {product.investment_type.toUpperCase()}
                </span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskBadgeColor(
                    product.risk_level
                  )}`}
                >
                  {product.risk_level} risk
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {product.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Annual Yield:</span>
                <span className="font-medium text-green-600">
                  {product.annual_yield}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tenure:</span>
                <span className="font-medium">
                  {product.tenure_months} months
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Min Investment:</span>
                <span className="font-medium">
                  ${product.min_investment.toLocaleString()}
                </span>
              </div>
              {product.max_investment && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Max Investment:</span>
                  <span className="font-medium">
                    ${product.max_investment.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleInvestNow(product)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Invest Now
            </button>
          </div>
        ))}
      </div>

      {investModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              Invest in {investModal.product?.name}
            </h2>

            <form onSubmit={handleInvestSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={investModal.product?.min_investment}
                  max={investModal.product?.max_investment}
                  value={investModal.amount}
                  onChange={(e) =>
                    setInvestModal((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Min: ${investModal.product?.min_investment} - Max: $
                  {investModal.product?.max_investment}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() =>
                    setInvestModal({
                      isOpen: false,
                      product: null,
                      amount: "",
                    })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={investMutation.isLoading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {investMutation.isLoading
                    ? "Processing..."
                    : "Confirm Investment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {productsData?.products?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📈</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters to see more products.
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
