import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../app/(auth)/login/page";
import ClientToaster from "@/app/components/ui/reusables/ClientToaster";

// 🧠 Step 1: Mock next/navigation
const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

// 🧪 Tests
describe("LoginPage", () => {
  const setup = async () => {
    render(
      <>
        <LoginPage />
        <ClientToaster />
      </>
    );
  };

  beforeEach(() => {
    push.mockClear(); // Reset mock
  });

  it("redirects to /dashboard after successful login", async () => {
    await setup();

    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      // ✅ Check toast shows success
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();

      // ✅ Check redirect called
      expect(push).toHaveBeenCalledWith("/dashboard");
    });
  });
});
