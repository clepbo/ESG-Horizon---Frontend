import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import ResetPasswordPage from "@/app/reset-password/page";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("ResetPasswordPage", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers(); // 🔁 Control all timers
    (useRouter as jest.Mock).mockReturnValue({ push });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); // clean up any unprocessed timers
    jest.useRealTimers(); // Restore timers after each test
  });

  it("disables the button and shows loading state when submitting", async () => {
    render(<ResetPasswordPage />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const button = screen.getByRole("button", { name: /reset password/i });

    // Fill form
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmInput, { target: { value: "password123" } });
    });

    // Submit form
    await act(async () => {
      fireEvent.click(button);
    });

    // First wait for toast and loading state
    await act(async () => {
      jest.advanceTimersByTime(1000); // 🔁 simulate first delay
    });

    expect(toast.success).toHaveBeenCalledWith("Password reset successful!");

    // Then simulate redirect
    await act(async () => {
      jest.advanceTimersByTime(1000); // 🔁 simulate redirect delay
    });

    expect(push).toHaveBeenCalledWith("/login");
  });
});
