import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Products from "../src/pages/Products";
import { MemoryRouter } from "react-router-dom";
import '@testing-library/jest-dom';


import React from "react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

test("renders products header", async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    </QueryClientProvider>
  );
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).toBeInTheDocument();
});
