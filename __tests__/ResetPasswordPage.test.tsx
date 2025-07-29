// import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// import userEvent from "@testing-library/user-event";
// import { toast } from "react-toastify";
// import "@testing-library/jest-dom";
// import ResetPasswordPage from "@/app/reset-password/page";

// // Mock router
// jest.mock("next/navigation", () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//   }),
// }));

// // Mock toast
// jest.mock("react-toastify", () => ({
//   toast: {
//     success: jest.fn(),
//     error: jest.fn(),
//   },
// }));

// describe("ResetPasswordPage", () => {
//   it("renders form fields", () => {
//     render(<ResetPasswordPage />);

//     expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
//     expect(
//       screen.getByRole("button", { name: /Reset Password/i })
//     ).toBeInTheDocument();
//   });

//   it("shows validation errors on empty submit", async () => {
//     render(<ResetPasswordPage />);
//     fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

//     await waitFor(() => {
//       expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
//       expect(
//         screen.getByText(/Please confirm your password/i)
//       ).toBeInTheDocument();
//     });
//   });

//   it("shows error if passwords do not match", async () => {
//     render(<ResetPasswordPage />);

//     fireEvent.input(screen.getByLabelText(/Password/i), {
//       target: { value: "Password123" },
//     });
//     fireEvent.input(screen.getByLabelText(/Confirm Password/i), {
//       target: { value: "DifferentPassword" },
//     });

//     fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

//     await waitFor(() => {
//       expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
//     });
//   });

//   it("submits successfully with valid input", async () => {
//     render(<ResetPasswordPage />);

//     fireEvent.input(screen.getByLabelText(/Password/i), {
//       target: { value: "Password123" },
//     });
//     fireEvent.input(screen.getByLabelText(/Confirm Password/i), {
//       target: { value: "Password123" },
//     });

//     fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

//     await waitFor(() => {
//       expect(toast.success).toHaveBeenCalledWith("Password reset successful!");
//     });
//   });
// });
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ResetPasswordPage from "@/app/reset-password/page";

// Mock toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock useRouter
const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form fields and button", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("shows error if fields are empty", async () => {
    render(<ResetPasswordPage />);

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(await screen.findAllByRole("alert")).toHaveLength(2); // password + confirm password
  });

  it("shows error if passwords do not match", async () => {
    render(<ResetPasswordPage />);

    fireEvent.input(screen.getByLabelText(/password/i), {
      target: { value: "strongpass" },
    });
    fireEvent.input(screen.getByLabelText(/confirm password/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(
      await screen.findByText("Passwords do not match")
    ).toBeInTheDocument();
  });

  it("submits form and redirects on success", async () => {
    render(<ResetPasswordPage />);

    fireEvent.input(screen.getByLabelText(/password/i), {
      target: { value: "strongpass123" },
    });
    fireEvent.input(screen.getByLabelText(/confirm password/i), {
      target: { value: "strongpass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Password reset successful!");
      expect(push).toHaveBeenCalledWith("/login");
    });
  });
});
