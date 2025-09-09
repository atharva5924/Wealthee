import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import Landing from "../src/pages/Landing";
import { MemoryRouter } from "react-router-dom";
import React from "react";

test("renders landing page content", () => {
  render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );
  expect(
    screen.getByText(/Your AI-powered investment platform/i)
  ).toBeInTheDocument();
});
