import { render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/context/AuthContext";
import Dashboard from "../src/pages/Dashboard";
import { MemoryRouter } from "react-router-dom";
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

test("renders dashboard loading state", async () => {
  render(
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).toBeInTheDocument();
});
