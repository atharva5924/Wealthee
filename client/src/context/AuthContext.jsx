import React from "react";
import { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const tokenPayload = JSON.parse(atob(token.split(".")[1]));
          const isExpired = tokenPayload.exp * 1000 < Date.now();
          if (!isExpired) {
            const response = await authService.getProfile();
            if (response.success) {
              dispatch({
                type: "LOGIN_SUCCESS",
                payload: { user: response.data.user, token },
              });
            } else {
              localStorage.removeItem("token");
              dispatch({ type: "LOGOUT" });
            }
          } else {
            localStorage.removeItem("token");
            dispatch({ type: "LOGOUT" });
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          dispatch({ type: "LOGOUT" });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        const { token } = response.data;
        localStorage.setItem("token", token);

        const profileResponse = await authService.getProfile();
        if (profileResponse.success) {
          const user = profileResponse.data.user;
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user, token },
          });
          toast.success(`Welcome back, ${user.first_name}!`);
          return { success: true };
        } else {
          throw new Error(profileResponse.message || "Failed to fetch profile");
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await authService.register(userData);
      if (response.success) {
        const { token, passwordAnalysis } = response.data;
        localStorage.setItem("token", token);

        const profileResponse = await authService.getProfile();
        if (profileResponse.success) {
          const user = profileResponse.data.user;
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user, token },
          });
          toast.success(`Welcome to Wealthee, ${user.first_name}!`);
          return { success: true, passwordAnalysis };
        } else {
          throw new Error(profileResponse.message || "Failed to fetch profile");
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      const passwordAnalysis = error.response?.data?.passwordAnalysis;
      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage,
      });
      if (passwordAnalysis) {
        return { success: false, error: errorMessage, passwordAnalysis };
      } else {
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
  };

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const refetchProfile = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success) {
        dispatch({ type: "UPDATE_USER", payload: response.data.user });
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateUser,
    clearError,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
