import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VerifyEmailPage from "@/app/(auth)/verify-email/page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("VerifyEmailPage", () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });

    render(
      <>
        <VerifyEmailPage />
      </>
    );
  });

  it("renders all six OTP inputs", () => {
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(6);
  });

  it("displays error if code is incomplete", async () => {
    await userEvent.click(
      screen.getByRole("button", { name: /verify email/i })
    );
    const toast = await screen.findByText(/please enter the 6-digit code/i);
    expect(toast).toBeInTheDocument();
  });

  it("enters digits and moves focus correctly", async () => {
    const inputs = screen.getAllByRole("textbox");

    await userEvent.type(inputs[0], "1");
    expect(inputs[0]).toHaveValue("1");

    await userEvent.type(inputs[1], "2");
    expect(inputs[1]).toHaveValue("2");

    await userEvent.type(inputs[2], "3");
    expect(inputs[2]).toHaveValue("3");
  });

  it("submits full OTP, shows success toast, and navigates", async () => {
    const inputs = screen.getAllByRole("textbox");

    for (let i = 0; i < 6; i++) {
      await userEvent.type(inputs[i], `${i + 1}`);
    }

    await userEvent.click(
      screen.getByRole("button", { name: /verify email/i })
    );

    await waitFor(() => {
      const toast = document.body.querySelector(".Toastify__toast");
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent(/email verified/i);
      expect(push).toHaveBeenCalledWith("/reset-password");
    });
  });

  it("shows toast on resend code", async () => {
    const resendButton = screen.getByRole("button", { name: /resend code/i });
    await userEvent.click(resendButton);

    await waitFor(() => {
      const toast = document.body.querySelector(".Toastify__toast");
      expect(toast).toHaveTextContent(/verification code resent/i);
    });
  });
});
