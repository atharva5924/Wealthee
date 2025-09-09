// Profile Page - frontend/src/pages/Profile.js
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: authService.getProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      updateUser(data.data.user);
      queryClient.invalidateQueries(["profile"]);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      risk_appetite: user?.risk_appetite || "moderate",
    },
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      risk_appetite: user?.risk_appetite || "moderate",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account information and investment preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Personal Information
            </h2>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              {isEditing ? (
                <input
                  {...register("first_name", {
                    required: "First name is required",
                    minLength: {
                      value: 2,
                      message: "First name must be at least 2 characters",
                    },
                  })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="px-3 py-2 text-gray-900">{user?.first_name}</p>
              )}
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              {isEditing ? (
                <input
                  {...register("last_name")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="px-3 py-2 text-gray-900">
                  {user?.last_name || "Not provided"}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-md">
              {user?.email}
              <span className="ml-2 text-xs text-gray-500">
                (Cannot be changed)
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investment Risk Appetite
            </label>
            {isEditing ? (
              <select
                {...register("risk_appetite", {
                  required: "Please select your risk appetite",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Conservative (Low Risk)</option>
                <option value="moderate">Balanced (Moderate Risk)</option>
                <option value="high">Aggressive (High Risk)</option>
              </select>
            ) : (
              <div className="px-3 py-2">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    user?.risk_appetite === "low"
                      ? "bg-green-100 text-green-800"
                      : user?.risk_appetite === "moderate"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user?.risk_appetite === "low"
                    ? "Conservative (Low Risk)"
                    : user?.risk_appetite === "moderate"
                    ? "Balanced (Moderate Risk)"
                    : "Aggressive (High Risk)"}
                </span>
              </div>
            )}
            {errors.risk_appetite && (
              <p className="mt-1 text-sm text-red-600">
                {errors.risk_appetite.message}
              </p>
            )}
            {isEditing && (
              <p className="mt-1 text-sm text-gray-500">
                This helps us recommend suitable investment products for you
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Balance
            </label>
            <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-md">
              ${user?.balance?.toLocaleString() || "0"}
              <span className="ml-2 text-xs text-gray-500">
                (Available for investment)
              </span>
            </p>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProfileMutation.isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateProfileMutation.isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Account Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {new Date(user?.created_at).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-500">Member Since</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {user?.balance ? `$${user.balance.toLocaleString()}` : "$0"}
            </div>
            <div className="text-sm text-gray-500">Available Balance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900 capitalize">
              {user?.risk_appetite || "moderate"}
            </div>
            <div className="text-sm text-gray-500">Risk Profile</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
