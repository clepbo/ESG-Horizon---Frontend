// import "@testing-library/jest-dom";
// import { render, screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import LoginPage from "../app/login/page";
// import ClientToaster from "@/app/components/ClientToaster";

// // Mock Next.js Image to avoid hydration issues
// jest.mock("next/image", () => (props: any) => (
//   <img {...props} alt={props.alt} />
// ));

// describe("LoginPage", () => {
//   const setup = async () => {
//     render(
//       <>
//         <LoginPage />
//         <ClientToaster />
//       </>
//     );
//   };

//   beforeEach(async () => {
//     await setup();
//   });

//   it("renders the login form", () => {
//     expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
//     expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
//   });

//   it("validates required fields on empty submit", async () => {
//     await userEvent.click(screen.getByRole("button", { name: /login/i }));

//     expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
//     expect(
//       await screen.findByText(/password is required/i)
//     ).toBeInTheDocument();
//   });

//   it("shows error on invalid email format", async () => {
//     await userEvent.type(screen.getByLabelText(/email/i), "invalid-email");
//     await userEvent.click(screen.getByRole("button", { name: /login/i }));

//     expect(
//       await screen.findByText(/invalid email format/i)
//     ).toBeInTheDocument();
//   });

//   it("shows error if password is too short", async () => {
//     await userEvent.type(screen.getByLabelText(/password/i), "short");
//     await userEvent.click(screen.getByRole("button", { name: /login/i }));

//     expect(
//       await screen.findByText(/password must be at least 8 characters/i)
//     ).toBeInTheDocument();
//   });

//   it("submits form successfully and shows toast", async () => {
//     await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
//     await userEvent.type(screen.getByLabelText(/password/i), "password123");
//     await userEvent.click(screen.getByRole("button", { name: /login/i }));

//     await waitFor(() => {
//       const toast = document.body.querySelector(".Toastify__toast");
//       expect(toast).toBeInTheDocument();
//       expect(toast).toHaveTextContent(/login successful!/i);
//     });
//   });

//   it("disables and re-enables button during submission", async () => {
//     const emailInput = screen.getByLabelText(/email/i);
//     const passwordInput = screen.getByLabelText(/password/i);
//     const submitButton = screen.getByRole("button", { name: /login/i });

//     await userEvent.type(emailInput, "user@example.com");
//     await userEvent.type(passwordInput, "password123");
//     await userEvent.click(submitButton);

//     await waitFor(() => {
//       expect(submitButton).toBeDisabled();
//       expect(submitButton).toHaveTextContent(/loading/i);
//     });

//     await waitFor(() => {
//       expect(submitButton).not.toBeDisabled();
//       expect(submitButton).toHaveTextContent(/login/i);
//     });
//   });
// });
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../app/login/page";
import ClientToaster from "@/app/components/ClientToaster";

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
