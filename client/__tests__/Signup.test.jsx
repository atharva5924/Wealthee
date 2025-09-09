import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Signup from "../src/pages/Signup";
import { AuthProvider } from "../src/context/AuthContext";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("react-hot-toast", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

test("renders signup form and submits", async () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    </AuthProvider>
  );

  const emailInput = screen.getByLabelText(/Email/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const submitButton = screen.getByRole("button", { name: /Create Account/i });

  fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  fireEvent.change(passwordInput, { target: { value: "Password123!" } });

  fireEvent.click(submitButton);

  await waitFor(() =>
    expect(screen.queryByText(/Create Account/i)).not.toBeDisabled()
  );
});
