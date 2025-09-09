import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/api";
import toast from "react-hot-toast";

const AdminProducts = () => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    investment_type: "",
    annual_yield: "",
    risk_level: "",
    tenure_months: "",
    min_investment: "",
    max_investment: "",
    description: "",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: productsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getProducts,
  });

  const products = productsData?.data?.products || [];
  const createOrUpdateProduct = useMutation({
    mutationFn: async (product) => {
      if (product.id) {
        return productService.updateProduct(product.id, product);
      } else {
        const { id, ...productWithoutId } = product;
        return productService.createProduct(productWithoutId);
      }
    },
    onSuccess: (response) => {
      toast.success(response.message || "Product saved successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
      setIsFormOpen(false);
      setIsEditing(false);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to save product";
      toast.error(errorMessage);
    },
  });

  const deleteProduct = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: (response) => {
      toast.success(response.message || "Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to delete product";
      toast.error(errorMessage);
    },
  });

  const generateDescriptionMutation = useMutation({
    mutationFn: productService.generateDescription,
    onSuccess: (response) => {
      setFormData((prev) => ({ ...prev, description: response.description }));
      toast.success("Description generated successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to generate description";
      toast.error(errorMessage);
    },
  });

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      investment_type: "",
      annual_yield: "",
      risk_level: "",
      tenure_months: "",
      min_investment: "",
      max_investment: "",
      description: "",
    });
  };

  const openCreateForm = () => {
    resetForm();
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const openEditForm = (product) => {
    setFormData({
      id: product.id,
      name: product.name || "",
      investment_type: product.investment_type || "",
      annual_yield: product.annual_yield || "",
      risk_level: product.risk_level || "",
      tenure_months: product.tenure_months || "",
      min_investment: product.min_investment || "",
      max_investment: product.max_investment || "",
      description: product.description || "",
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.investment_type ||
      !formData.annual_yield ||
      !formData.risk_level ||
      !formData.tenure_months ||
      !formData.min_investment ||
      !formData.max_investment
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    createOrUpdateProduct.mutate(formData);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(id);
    }
  };

  const handleGenerateDescription = () => {
    const {
      name,
      investment_type,
      annual_yield,
      risk_level,
      tenure_months,
      min_investment,
      max_investment,
    } = formData;

    if (
      !name ||
      !investment_type ||
      !annual_yield ||
      !risk_level ||
      !tenure_months ||
      !min_investment ||
      !max_investment
    ) {
      toast.error("Please fill the basic product details first");
      return;
    }

    generateDescriptionMutation.mutate({
      name,
      investment_type,
      annual_yield,
      risk_level,
      tenure_months,
      min_investment,
      max_investment,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error loading products
          </h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
        <button
          onClick={openCreateForm}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Add New Product
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Yield
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenure (Months)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Investment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products?.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.investment_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.annual_yield}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.risk_level === "low"
                          ? "bg-green-100 text-green-800"
                          : product.risk_level === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.tenure_months}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.min_investment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditForm(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={deleteProduct.isPending}
                    >
                      {deleteProduct.isPending ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No products found. Create your first product!
              </p>
            </div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isEditing ? "Edit Product" : "Create New Product"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Investment Type *
                    </label>
                    <select
                      name="investment_type"
                      value={formData.investment_type}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="mf">Mutual Fund</option>
                      <option value="bond">Bond</option>
                      <option value="fd">Fixed Deposit</option>
                      <option value="etf">ETF</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Yield (%) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="annual_yield"
                      value={formData.annual_yield}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Annual Yield"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risk Level *
                    </label>
                    <select
                      name="risk_level"
                      value={formData.risk_level}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Risk Level</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tenure (Months) *
                    </label>
                    <input
                      type="number"
                      name="tenure_months"
                      value={formData.tenure_months}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Tenure"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Investment ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="min_investment"
                      value={formData.min_investment}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter min investment"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Investment
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="max_investment"
                      value={formData.max_investment}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter max investment (> min investment)"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={generateDescriptionMutation.isPending}
                      className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition duration-200"
                    >
                      {generateDescriptionMutation.isPending
                        ? "Generating..."
                        : "AI Generate"}
                    </button>
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Product description..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createOrUpdateProduct.isPending}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
                  >
                    {createOrUpdateProduct.isPending
                      ? isEditing
                        ? "Updating..."
                        : "Creating..."
                      : isEditing
                      ? "Update Product"
                      : "Create Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
