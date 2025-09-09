import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../src/pages/Login";
import { AuthProvider } from "../src/context/AuthContext";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("react-hot-toast", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

test("renders login form and submits", async () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthProvider>
  );

  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const submitButton = screen.getByRole("button", { name: /Sign In/i });

  fireEvent.change(emailInput, {
    target: { value: "2004freelancer@gmail.com" },
  });
  fireEvent.change(passwordInput, { target: { value: "Atha@7138" } });

  fireEvent.click(submitButton);

  await waitFor(() => expect(screen.queryByText(/Sign In/i)).not.toBeDisabled());
});
