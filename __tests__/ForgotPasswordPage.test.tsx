import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";
import { useRouter } from "next/navigation";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Image (if used)
// jest.mock("next/image", () => (props: any) => (
//   <img {...props} alt={props.alt || "mocked-image"} />
// ));

describe("ForgotPasswordPage", () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    render(
      <>
        <ForgotPasswordPage />
      </>
    );
  });

  it("renders the forgot password form", () => {
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sent otp/i })).toBeInTheDocument();
  });

  it("validates required email field on submit", async () => {
    await userEvent.click(screen.getByRole("button", { name: /sent otp/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it("shows error on invalid email format", async () => {
    await userEvent.type(screen.getByLabelText(/email/i), "invalid-email");
    await userEvent.click(screen.getByRole("button", { name: /sent otp/i }));

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it("shows success toast and redirects on valid submit", async () => {
    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.click(screen.getByRole("button", { name: /sent otp/i }));

    await waitFor(() => {
      const toast = document.body.querySelector(".Toastify__toast");
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent(/otp sent to your email/i);
      expect(push).toHaveBeenCalledWith("/verify-email");
    });
  });

  it("disables and re-enables the button during submission", async () => {
    const button = screen.getByRole("button", { name: /sent otp/i });

    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent(/sending/i);
    });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent(/sent otp/i);
    });
  });
});
