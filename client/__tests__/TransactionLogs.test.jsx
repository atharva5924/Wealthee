import React from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TransactionLogs from "../src/pages/TransactionLogs";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

test("renders transaction logs heading", () => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TransactionLogs />
      </MemoryRouter>
    </QueryClientProvider>
  );
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).toBeInTheDocument();
});
