[33mcommit 3e44dc80963bb3c60fa9b4192f16d5b76e2ce575[m
Merge: 51a1e53 6784176
Author: Aghahowa Favour AIGBEKAEN <aigbekaenfavour@gmail.com>
Date:   Tue Jul 29 09:57:46 2025 +0100

    WIP on dashboard: 51a1e53 Merge pull request #3 from Teasoo-Holding/LoginPage

[1mdiff --cc __tests__/LoginPage.test.tsx[m
[1mindex d3a65d3,d3a65d3..05d411a[m
[1m--- a/__tests__/LoginPage.test.tsx[m
[1m+++ b/__tests__/LoginPage.test.tsx[m
[36m@@@ -1,14 -1,14 +1,109 @@@[m
[32m++// import "@testing-library/jest-dom";[m
[32m++// import { render, screen, waitFor } from "@testing-library/react";[m
[32m++// import userEvent from "@testing-library/user-event";[m
[32m++// import LoginPage from "../app/login/page";[m
[32m++// import ClientToaster from "@/app/components/ClientToaster";[m
[32m++[m
[32m++// // Mock Next.js Image to avoid hydration issues[m
[32m++// jest.mock("next/image", () => (props: any) => ([m
[32m++//   <img {...props} alt={props.alt} />[m
[32m++// ));[m
[32m++[m
[32m++// describe("LoginPage", () => {[m
[32m++//   const setup = async () => {[m
[32m++//     render([m
[32m++//       <>[m
[32m++//         <LoginPage />[m
[32m++//         <ClientToaster />[m
[32m++//       </>[m
[32m++//     );[m
[32m++//   };[m
[32m++[m
[32m++//   beforeEach(async () => {[m
[32m++//     await setup();[m
[32m++//   });[m
[32m++[m
[32m++//   it("renders the login form", () => {[m
[32m++//     expect(screen.getByLabelText(/email/i)).toBeInTheDocument();[m
[32m++//     expect(screen.getByLabelText(/password/i)).toBeInTheDocument();[m
[32m++//     expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();[m
[32m++//   });[m
[32m++[m
[32m++//   it("validates required fields on empty submit", async () => {[m
[32m++//     await userEvent.click(screen.getByRole("button", { name: /login/i }));[m
[32m++[m
[32m++//     expect(await screen.findByText(/email is required/i)).toBeInTheDocument();[m
[32m++//     expect([m
[32m++//       await screen.findByText(/password is required/i)[m
[32m++//     ).toBeInTheDocument();[m
[32m++//   });[m
[32m++[m
[32m++//   it("shows error on invalid email format", async () => {[m
[32m++//     await userEvent.type(screen.getByLabelText(/email/i), "invalid-email");[m
[32m++//     await userEvent.click(screen.getByRole("button", { name: /login/i }));[m
[32m++[m
[32m++//     expect([m
[32m++//       await screen.findByText(/invalid email format/i)[m
[32m++//     ).toBeInTheDocument();[m
[32m++//   });[m
[32m++[m
[32m++//   it("shows error if password is too short", async () => {[m
[32m++//     await userEvent.type(screen.getByLabelText(/password/i), "short");[m
[32m++//     await userEvent.click(screen.getByRole("button", { name: /login/i }));[m
[32m++[m
[32m++//     expect([m
[32m++//       await screen.findByText(/password must be at least 8 characters/i)[m
[32m++//     ).toBeInTheDocument();[m
[32m++//   });[m
[32m++[m
[32m++//   it("submits form successfully and shows toast", async () => {[m
[32m++//     await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");[m
[32m++//     await userEvent.type(screen.getByLabelText(/password/i), "password123");[m
[32m++//     await userEvent.click(screen.getByRole("button", { name: /login/i }));[m
[32m++[m
[32m++//     await waitFor(() => {[m
[32m++//       const toast = document.body.querySelector(".Toastify__toast");[m
[32m++//       expect(toast).toBeInTheDocument();[m
[32m++//       expect(toast).toHaveTextContent(/login successful!/i);[m
[32m++//     });[m
[32m++//   });[m
[32m++[m
[32m++//   it("disables and re-enables button during submission", async () => {[m
[32m++//     const emailInput = screen.getByLabelText(/email/i);[m
[32m++//     const passwordInput = screen.getByLabelText(/password/i);[m
[32m++//     const submitButton = screen.getByRole("button", { name: /login/i });[m
[32m++[m
[32m++//     await userEvent.type(emailInput, "user@example.com");[m
[32m++//     await userEvent.type(passwordInput, "password123");[m
[32m++//     await userEvent.click(submitButton);[m
[32m++[m
[32m++//     await waitFor(() => {[m
[32m++//       expect(submitButton).toBeDisabled();[m
[32m++//       expect(submitButton).toHaveTextContent(/loading/i);[m
[32m++//     });[m
[32m++[m
[32m++//     await waitFor(() => {[m
[32m++//       expect(submitButton).not.toBeDisabled();[m
[32m++//       expect(submitButton).toHaveTextContent(/login/i);[m
[32m++//     });[m
[32m++//   });[m
[32m++// });[m
  import "@testing-library/jest-dom";[m
  import { render, screen, waitFor } from "@testing-library/react";[m
  import userEvent from "@testing-library/user-event";[m
  import LoginPage from "../app/login/page";[m
  import ClientToaster from "@/app/components/ClientToaster";[m
  [m
[31m--// Mock Next.js Image to avoid hydration issues[m
[31m--jest.mock("next/image", () => (props: any) => ([m
[31m--  <img {...props} alt={props.alt} />[m
[31m--));[m
[32m++// 🧠 Step 1: Mock next/navigation[m
[32m++const push = jest.fn();[m
  [m
[32m++jest.mock("next/navigation", () => ({[m
[32m++  useRouter: () => ({[m
[32m++    push,[m
[32m++  }),[m
[32m++}));[m
[32m++[m
[32m++// 🧪 Tests[m
  describe("LoginPage", () => {[m
    const setup = async () => {[m
      render([m
[36m@@@ -19,72 -19,72 +114,23 @@@[m
      );[m
    };[m
  [m
[31m--  beforeEach(async () => {[m
[31m--    await setup();[m
[31m--  });[m
[31m--[m
[31m--  it("renders the login form", () => {[m
[31m--    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();[m
[31m--    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();[m
[31m--    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();[m
[31m--  });[m
[31m--[m
[31m--  it("validates required fields on empty submit", async () => {[m
[31m--    await userEvent.click(screen.getByRole("button", { name: /login/i }));[m
[31m--[m
[31m--    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();[m
[31m--    expect([m
[31m--      await screen.findByText(/password is required/i)[m
[31m--    ).toBeInTheDocument();[m
[31m--  });[m
[31m--[m
[31m--  it("shows error on invalid email format", async () => {[m
[31m--    await userEvent.type(screen.getByLabelText(/email/i), "invalid-email");[m
[31m--    await userEvent.click(screen.getByRole("button", { name: /login/i }));[m
[31m--[m
[31m--    expect([m
[31m--      await screen.findByText(/invalid email format/i)[m
[31m--    ).toBeInTheDocument();[m
[32m++  beforeEach(() => {[m
[32m++    push.mockClear(); // Reset mock[m
    });[m
  [m
[31m--  it("shows error if password is too short", async () => {[m
[31m--    await userEvent.type(screen.getByLabelText(/password/i), "short");[m
[31m--    await userEvent.click(screen.getByRole("button", { name: /login/i }));[m
[31m--[m
[31m--    expect([m
[31m--      await screen.findByText(/password must be at least 8 characters/i)[m
[31m--    ).toBeInTheDocument();[m
[31m--  });[m
[32m++  it("redirects to /dashboard after successful login", async () => {[m
[32m++    await setup();[m
  [m
[31m--  it("submits form successfully and shows toast", async () => {[m
      await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");[m
      await userEvent.type(screen.getByLabelText(/password/i), "password123");[m
      await userEvent.click(screen.getByRole("button", { name: /login/i }));[m
  [m
      await waitFor(() => {[m
[31m--      const toast = document.body.querySelector(".Toastify__toast");[m
[31m--      expect(toast).toBeInTheDocument();[m
[31m--      expect(toast).toHaveTextContent(/login successful!/i);[m
[31m--    });[m
[31m--  });[m
[31m--[m
[31m--  it("disables and re-enables button during submission", async () => {[m
[31m--    const emailInput = screen.getByLabelText(/email/i);[m
[31m--    const passwordInput = screen.getByLabelText(/password/i);[m
[31m--    const submitButton = screen.getByRole("button", { name: /login/i });[m
[31m--[m
[31m--    await userEvent.type(emailInput, "user@example.com");[m
[31m--    await userEvent.type(passwordInput, "password123");[m
[31m--    await userEvent.click(submitButton);[m
[31m--[m
[31m--    await waitFor(() => {[m
[31m--      expect(submitButton).toBeDisabled();[m
[31m--      expect(submitButton).toHaveTextContent(/loading/i);[m
[31m--    });[m
[32m++      // ✅ Check toast shows success[m
[32m++      expect(screen.getByText(/login successful/i)).toBeInTheDocument();[m
  [m
[31m--    await waitFor(() => {[m
[31m--      expect(submitButton).not.toBeDisabled();[m
[31m--      expect(submitButton).toHaveTextContent(/login/i);[m
[32m++      // ✅ Check redirect called[m
[32m++      expect(push).toHaveBeenCalledWith("/dashboard");[m
      });[m
    });[m
  });[m
[1mdiff --cc app/components/auth/LoginForm.tsx[m
[1mindex 5a2aa86,5a2aa86..3b361d4[m
[1m--- a/app/components/auth/LoginForm.tsx[m
[1m+++ b/app/components/auth/LoginForm.tsx[m
[36m@@@ -3,6 -3,6 +3,8 @@@[m
  import { useForm, SubmitHandler } from "react-hook-form";[m
  import { useState } from "react";[m
  import { toast } from "react-toastify";[m
[32m++import { useRouter } from "next/navigation"; // ← Import router[m
[32m++import Link from "next/link";[m
  [m
  type FormFields = {[m
    email: string;[m
[36m@@@ -11,6 -11,6 +13,8 @@@[m
  [m
  export default function LoginForm() {[m
    const [loading, setLoading] = useState(false);[m
[32m++  const router = useRouter(); // ← Initialize router[m
[32m++[m
    const {[m
      register,[m
      handleSubmit,[m
[36m@@@ -27,10 -27,10 +31,13 @@@[m
    const onSubmit: SubmitHandler<FormFields> = async (data) => {[m
      setLoading(true);[m
      try {[m
[31m--      await new Promise((res) => setTimeout(res, 1000));[m
[32m++      await new Promise((res) => setTimeout(res, 1000)); // mock login[m
        console.log(data);[m
        toast.success("Login successful!");[m
        reset();[m
[32m++[m
[32m++      // ✅ Redirect after success[m
[32m++      router.push("/dashboard");[m
      } catch (error) {[m
        toast.error("Something went wrong");[m
        setError("root", { message: "An unexpected error occurred" });[m
[36m@@@ -107,16 -107,16 +114,19 @@@[m
  [m
        {/* Forgot password */}[m
        <div className="text-right">[m
[31m--        <a href="#" className="text-sm text-neutral-1000 hover:underline">[m
[32m++        <Link[m
[32m++          href="/forgot-password"[m
[32m++          className="text-sm text-neutral-1000 hover:underline"[m
[32m++        >[m
            Forgot Password?[m
[31m--        </a>[m
[32m++        </Link>[m
        </div>[m
  [m
        {/* Submit Button */}[m
        <button[m
          type="submit"[m
          disabled={loading}[m
[31m--        className={`w-full py-2 px-4 rounded text-sm font-semibold transition ${[m
[32m++        className={`w-full py-2 px-4 rounded text-sm font-semibold transition cursor-pointer ${[m
            loading[m
              ? "bg-gray-400 cursor-not-allowed"[m
              : "bg-green-500 hover:bg-green-600 text-neutral-50"[m
[1mdiff --cc app/login/page.tsx[m
[1mindex 74249b7,74249b7..a39d572[m
[1m--- a/app/login/page.tsx[m
[1m+++ b/app/login/page.tsx[m
[36m@@@ -35,7 -35,7 +35,7 @@@[m [mexport default function LoginPage() [m
                />[m
              </div>[m
  [m
[31m--            <div className="rounded-xl border border-gray-200 shadow-lg bg-white p-8">[m
[32m++            <div className=" bg-white p-8">[m
                <div className="space-y-6">[m
                  <h2 className="text-center text-2xl md:text-3xl font-semibold text-neutral-1000">[m
                    Login to your account[m
[1mdiff --cc jest.config.ts[m
[1mindex 6c30b76,6c30b76..1e56de5[m
[1m--- a/jest.config.ts[m
[1m+++ b/jest.config.ts[m
[36m@@@ -11,7 -11,7 +11,7 @@@[m [mconst config: Config = [m
    coverageProvider: "v8",[m
    testEnvironment: "jsdom",[m
    // Add more setup options before each test is run[m
[31m--  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],[m
[32m++  // setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],[m
  };[m
  [m
  // createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async[m
[1mdiff --cc package-lock.json[m
[1mindex 8e8821b,8e8821b..ccd2a26[m
[1m--- a/package-lock.json[m
[1m+++ b/package-lock.json[m
[36m@@@ -8,19 -8,19 +8,23 @@@[m
        "name": "horizon-frontend",[m
        "version": "0.1.0",[m
        "dependencies": {[m
[32m++        "@tanstack/react-query": "^5.83.0",[m
[32m++        "lucide-react": "^0.532.0",[m
          "next": "15.4.2",[m
          "postcss": "^8.5.6",[m
          "react": "19.1.0",[m
          "react-dom": "19.1.0",[m
          "react-hook-form": "^7.61.1",[m
          "react-toastify": "^11.0.5",[m
[31m--        "tw-animate-css": "^1.3.6"[m
[32m++        "recharts": "^3.1.0",[m
[32m++        "tw-animate-css": "^1.3.6",[m
[32m++        "use-debounce": "^10.0.5"[m
        },[m
        "devDependencies": {[m
          "@eslint/eslintrc": "^3",[m
          "@tailwindcss/postcss": "^4.1.11",[m
          "@testing-library/dom": "^10.4.0",[m
[31m--        "@testing-library/jest-dom": "^6.6.3",[m
[32m++        "@testing-library/jest-dom": "^6.6.4",[m
          "@testing-library/react": "^16.3.0",[m
          "@testing-library/user-event": "^14.6.1",[m
          "@types/jest": "^30.0.0",[m
[36m@@@ -2235,6 -2235,6 +2239,32 @@@[m
          "url": "https://opencollective.com/pkgr"[m
        }[m
      },[m
[32m++    "node_modules/@reduxjs/toolkit": {[m
[32m++      "version": "2.8.2",[m
[32m++      "resolved": "https://registry.npmjs.org/@reduxjs/toolkit/-/toolkit-2.8.2.tgz",[m
[32m++      "integrity": "sha512-MYlOhQ0sLdw4ud48FoC5w0dH9VfWQjtCjreKwYTT3l+r427qYC5Y8PihNutepr8XrNaBUDQo9khWUwQxZaqt5A==",[m
[32m++      "license": "MIT",[m
[32m++      "dependencies": {[m
[32m++        "@standard-schema/spec": "^1.0.0",[m
[32m++        "@standard-schema/utils": "^0.3.0",[m
[32m++        "immer": "^10.0.3",[m
[32m++        "redux": "^5.0.1",[m
[32m++        "redux-thunk": "^3.1.0",[m
[32m++        "reselect": "^5.1.0"[m
[32m++      },[m
[32m++      "peerDependencies": {[m
[32m++        "react": "^16.9.0 || ^17.0.0 || ^18 || ^19",[m
[32m++        "react-redux": "^7.2.1 || ^8.1.3 || ^9.0.0"[m
[32m++      },[m
[32m++      "peerDependenciesMeta": {[m
[32m++        "react": {[m
[32m++          "optional": true[m
[32m++        },[m
[32m++        "react-redux": {[m
[32m++          "optional": true[m
[32m++        }[m
[32m++      }[m
[32m++    },[m
      "node_modules/@rtsao/scc": {[m
        "version": "1.1.0",[m
        "resolved": "https://registry.npmjs.org/@rtsao/scc/-/scc-1.1.0.tgz",[m
[36m@@@ -2276,6 -2276,6 +2306,18 @@@[m
          "@sinonjs/commons": "^3.0.1"[m
        }[m
      },[m
[32m++    "node_modules/@standard-schema/spec": {[m
[32m++      "version": "1.0.0",[m
[32m++      "resolved": "https://registry.npmjs.org/@standard-schema/spec/-/spec-1.0.0.tgz",[m
[32m++      "integrity": "sha512-m2bOd0f2RT9k8QJx1JN85cZYyH1RqFBdlwtkSlf4tBDYLCiiZnv1fIIwacK6cqwXavOydf0NPToMQgpKq+dVlA==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
[32m++    "node_modules/@standard-schema/utils": {[m
[32m++      "version": "0.3.0",[m
[32m++      "resolved": "https://registry.npmjs.org/@standard-schema/utils/-/utils-0.3.0.tgz",[m
[32m++      "integrity": "sha512-e7Mew686owMaPJVNNLs55PUvgz371nKgwsc4vxE49zsODpJEnxgxRo2y/OKrqueavXgZNMDVj3DdHFlaSAeU8g==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
      "node_modules/@swc/helpers": {[m
        "version": "0.5.15",[m
        "resolved": "https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.15.tgz",[m
[36m@@@ -2561,6 -2561,6 +2603,32 @@@[m
          "tailwindcss": "4.1.11"[m
        }[m
      },[m
[32m++    "node_modules/@tanstack/query-core": {[m
[32m++      "version": "5.83.0",[m
[32m++      "resolved": "https://registry.npmjs.org/@tanstack/query-core/-/query-core-5.83.0.tgz",[m
[32m++      "integrity": "sha512-0M8dA+amXUkyz5cVUm/B+zSk3xkQAcuXuz5/Q/LveT4ots2rBpPTZOzd7yJa2Utsf8D2Upl5KyjhHRY+9lB/XA==",[m
[32m++      "license": "MIT",[m
[32m++      "funding": {[m
[32m++        "type": "github",[m
[32m++        "url": "https://github.com/sponsors/tannerlinsley"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/@tanstack/react-query": {[m
[32m++      "version": "5.83.0",[m
[32m++      "resolved": "https://registry.npmjs.org/@tanstack/react-query/-/react-query-5.83.0.tgz",[m
[32m++      "integrity": "sha512-/XGYhZ3foc5H0VM2jLSD/NyBRIOK4q9kfeml4+0x2DlL6xVuAcVEW+hTlTapAmejObg0i3eNqhkr2dT+eciwoQ==",[m
[32m++      "license": "MIT",[m
[32m++      "dependencies": {[m
[32m++        "@tanstack/query-core": "5.83.0"[m
[32m++      },[m
[32m++      "funding": {[m
[32m++        "type": "github",[m
[32m++        "url": "https://github.com/sponsors/tannerlinsley"[m
[32m++      },[m
[32m++      "peerDependencies": {[m
[32m++        "react": "^18 || ^19"[m
[32m++      }[m
[32m++    },[m
      "node_modules/@testing-library/dom": {[m
        "version": "10.4.0",[m
        "resolved": "https://registry.npmjs.org/@testing-library/dom/-/dom-10.4.0.tgz",[m
[36m@@@ -2582,18 -2582,18 +2650,18 @@@[m
        }[m
      },[m
      "node_modules/@testing-library/jest-dom": {[m
[31m--      "version": "6.6.3",[m
[31m--      "resolved": "https://registry.npmjs.org/@testing-library/jest-dom/-/jest-dom-6.6.3.tgz",[m
[31m--      "integrity": "sha512-IteBhl4XqYNkM54f4ejhLRJiZNqcSCoXUOG2CPK7qbD322KjQozM4kHQOfkG2oln9b9HTYqs+Sae8vBATubxxA==",[m
[32m++      "version": "6.6.4",[m
[32m++      "resolved": "https://registry.npmjs.org/@testing-library/jest-dom/-/jest-dom-6.6.4.tgz",[m
[32m++      "integrity": "sha512-xDXgLjVunjHqczScfkCJ9iyjdNOVHvvCdqHSSxwM9L0l/wHkTRum67SDc020uAlCoqktJplgO2AAQeLP1wgqDQ==",[m
        "dev": true,[m
        "license": "MIT",[m
        "dependencies": {[m
          "@adobe/css-tools": "^4.4.0",[m
          "aria-query": "^5.0.0",[m
[31m--        "chalk": "^3.0.0",[m
          "css.escape": "^1.5.1",[m
          "dom-accessibility-api": "^0.6.3",[m
          "lodash": "^4.17.21",[m
[32m++        "picocolors": "^1.1.1",[m
          "redent": "^3.0.0"[m
        },[m
        "engines": {[m
[36m@@@ -2602,20 -2602,20 +2670,6 @@@[m
          "yarn": ">=1"[m
        }[m
      },[m
[31m--    "node_modules/@testing-library/jest-dom/node_modules/chalk": {[m
[31m--      "version": "3.0.0",[m
[31m--      "resolved": "https://registry.npmjs.org/chalk/-/chalk-3.0.0.tgz",[m
[31m--      "integrity": "sha512-4D3B6Wf41KOYRFdszmDqMCGq5VV/uMAB273JILmO+3jAlh8X4qDtdtgCR3fxtbLEMzSx22QdhnDcJvu2u1fVwg==",[m
[31m--      "dev": true,[m
[31m--      "license": "MIT",[m
[31m--      "dependencies": {[m
[31m--        "ansi-styles": "^4.1.0",[m
[31m--        "supports-color": "^7.1.0"[m
[31m--      },[m
[31m--      "engines": {[m
[31m--        "node": ">=8"[m
[31m--      }[m
[31m--    },[m
      "node_modules/@testing-library/jest-dom/node_modules/dom-accessibility-api": {[m
        "version": "0.6.3",[m
        "resolved": "https://registry.npmjs.org/dom-accessibility-api/-/dom-accessibility-api-0.6.3.tgz",[m
[36m@@@ -2756,6 -2756,6 +2810,69 @@@[m
          "@babel/types": "^7.20.7"[m
        }[m
      },[m
[32m++    "node_modules/@types/d3-array": {[m
[32m++      "version": "3.2.1",[m
[32m++      "resolved": "https://registry.npmjs.org/@types/d3-array/-/d3-array-3.2.1.tgz",[m
[32m++      "integrity": "sha512-Y2Jn2idRrLzUfAKV2LyRImR+y4oa2AntrgID95SHJxuMUrkNXmanDSed71sRNZysveJVt1hLLemQZIady0FpEg==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
[32m++    "node_modules/@types/d3-color": {[m
[32m++      "version": "3.1.3",[m
[32m++      "resolved": "https://registry.npmjs.org/@types/d3-color/-/d3-color-3.1.3.tgz",[m
[32m++      "integrity": "sha512-iO90scth9WAbmgv7ogoq57O9YpKmFBbmoEoCHDB2xMBY0+/KVrqAaCDyCE16dUspeOvIxFFRI+0sEtqDqy2b4A==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
[32m++    "node_modules/@types/d3-ease": {[m
[32m++      "version": "3.0.2",[m
[32m++      "resolved": "https://registry.npmjs.org/@types/d3-ease/-/d3-ease-3.0.2.tgz",[m
[32m++      "integrity": "sha512-NcV1JjO5oDzoK26oMzbILE6HW7uVXOHLQvHshBUW4UMdZGfiY6v5BeQwh9a9tCzv+CeefZQHJt5SRgK154RtiA==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
[32m++    "node_modules/@types/d3-interpolate": {[m
[32m++      "version": "3.0.4",[m
[32m++      "resolved": "https://registry.npmjs.org/@types/d3-interpolate/-/d3-interpolate-3.0.4.tgz",[m
[32m++      "integrity": "sha512-mgLPETlrpVV1YRJIglr4Ez47g7Yxjl1lj7YKsiMCb27VJH9W8NVM6Bb9d8kkpG/uAQS5AmbA48q2IAolKKo1MA==",[m
[32m++      "license": "MIT",[m
[32m++      "dependencies": {[m
[32m++        "@types/d3-color": "*"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/@types/d3-path": {[m
[32m++      "version": "3.1.1",[m
[32m++      "resolved": "https://registry.npmjs.org/@types/d3-path/-/d3-path-3.1.1.tgz",[m
[32m++      "integrity": "sha512-VMZBYyQvbGmWyWVea0EHs/BwLgxc+MKi1zLDCONksozI4YJMcTt8ZEuIR4Sb1MMTE8MMW49v0IwI5+b7RmfWlg==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
[32m++    "node_modules/@types/d3-scale": {[m
[32m++      "version": "4.0.9",[m
[32m++      "resolved": "https://registry.npmjs.org/@types/d3-scale/-/d3-scale-4.0.9.tgz",[m
[32m++      "integrity": "sha512-dLmtwB8zkAeO/juAMfnV+sItKjlsw2lKdZVVy6LRr0cBmegxSABiLEpGVmSJJ8O08i4+sGR6qQtb6WtuwJdvVw==",[m
[32m++      "license": "MIT",[m
[32m++      "dependencies": {[m
[32m++        "@types/d3-time": "*"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/@types/d3-shape": {[m
[32m++      "version": "3.1.7",[m
[32m++      "resolved": "https://registry.npmjs.org/@types/d3-shape/-/d3-shape-3.1.7.tgz",[m
[32m++      "integrity": "sha512-VLvUQ33C+3J+8p+Daf+nYSOsjB4GXp19/S/aGo60m9h1v6XaxjiT82lKVWJCfzhtuZ3yD7i/TPeC/fuKLLOSmg==",[m
[32m++      "license": "MIT",[m
[32m++      "dependencies": {[m
[32m++        "@types/d3-path": "*"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/@types/d3-time": {[m
[32m++      "version": "3.0.4",[m
[32m++      "resolved": "https://registry.npmjs.org/@types/d3-time/-/d3-time-3.0.4.tgz",[m
[32m++      "integrity": "sha512-yuzZug1nkAAaBlBBikKZTgzCeA+k1uy4ZFwWANOfKw5z5LRhV0gNA7gNkKm7HoK+HRN0wX3EkxGk0fpbWhmB7g==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
[32m++    "node_modules/@types/d3-timer": {[m
[32m++      "version": "3.0.2",[m
[32m++      "resolved": "https://registry.npmjs.org/@types/d3-timer/-/d3-timer-3.0.2.tgz",[m
[32m++      "integrity": "sha512-Ps3T8E8dZDam6fUyNiMkekK3XUsaUEik+idO9/YjPtfj2qruF8tFBXS7XhtE4iIXBLxhmLjP3SXpLhVf21I9Lw==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
      "node_modules/@types/estree": {[m
        "version": "1.0.8",[m
        "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.8.tgz",[m
[36m@@@ -2876,7 -2876,7 +2993,7 @@@[m
        "version": "19.1.8",[m
        "resolved": "https://registry.npmjs.org/@types/react/-/react-19.1.8.tgz",[m
        "integrity": "sha512-AwAfQ2Wa5bCx9WP8nZL2uMZWod7J7/JSplxbTmBQ5ms6QpqNYm672H0Vu9ZVKVngQ+ii4R/byguVEUZQyeg44g==",[m
[31m--      "dev": true,[m
[32m++      "devOptional": true,[m
        "license": "MIT",[m
        "dependencies": {[m
          "csstype": "^3.0.2"[m
[36m@@@ -2906,6 -2906,6 +3023,12 @@@[m
        "dev": true,[m
        "license": "MIT"[m
      },[m
[32m++    "node_modules/@types/use-sync-external-store": {[m
[32m++      "version": "0.0.6",[m
[32m++      "resolved": "https://registry.npmjs.org/@types/use-sync-external-store/-/use-sync-external-store-0.0.6.tgz",[m
[32m++      "integrity": "sha512-zFDAD+tlpf2r4asuHEj0XH6pY6i0g5NeAHPn+15wk3BV6JA69eERFXC1gyGThDkVa1zCyKr5jox1+2LbV/AMLg==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
      "node_modules/@types/yargs": {[m
        "version": "17.0.33",[m
        "resolved": "https://registry.npmjs.org/@types/yargs/-/yargs-17.0.33.tgz",[m
[36m@@@ -4379,9 -4379,9 +4502,130 @@@[m
        "version": "3.1.3",[m
        "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.1.3.tgz",[m
        "integrity": "sha512-M1uQkMl8rQK/szD0LNhtqxIPLpimGm8sOBwU7lLnCpSbTyY3yeU1Vc7l4KT5zT4s/yOxHH5O7tIuuLOCnLADRw==",[m
[31m--      "dev": true,[m
[32m++      "devOptional": true,[m
        "license": "MIT"[m
      },[m
[32m++    "node_modules/d3-array": {[m
[32m++      "version": "3.2.4",[m
[32m++      "resolved": "https://registry.npmjs.org/d3-array/-/d3-array-3.2.4.tgz",[m
[32m++      "integrity": "sha512-tdQAmyA18i4J7wprpYq8ClcxZy3SC31QMeByyCFyRt7BVHdREQZ5lpzoe5mFEYZUWe+oq8HBvk9JjpibyEV4Jg==",[m
[32m++      "license": "ISC",[m
[32m++      "dependencies": {[m
[32m++        "internmap": "1 - 2"[m
[32m++      },[m
[32m++      "engines": {[m
[32m++        "node": ">=12"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/d3-color": {[m
[32m++      "version": "3.1.0",[m
[32m++      "resolved": "https://registry.npmjs.org/d3-color/-/d3-color-3.1.0.tgz",[m
[32m++      "integrity": "sha512-zg/chbXyeBtMQ1LbD/WSoW2DpC3I0mpmPdW+ynRTj/x2DAWYrIY7qeZIHidozwV24m4iavr15lNwIwLxRmOxhA==",[m
[32m++      "license": "ISC",[m
[32m++      "engines": {[m
[32m++        "node": ">=12"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/d3-ease": {[m
[32m++      "version": "3.0.1",[m
[32m++      "resolved": "https://registry.npmjs.org/d3-ease/-/d3-ease-3.0.1.tgz",[m
[32m++      "integrity": "sha512-wR/XK3D3XcLIZwpbvQwQ5fK+8Ykds1ip7A2Txe0yxncXSdq1L9skcG7blcedkOX+ZcgxGAmLX1FrRGbADwzi0w==",[m
[32m++      "license": "BSD-3-Clause",[m
[32m++      "engines": {[m
[32m++        "node": ">=12"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/d3-format": {[m
[32m++      "version": "3.1.0",[m
[32m++      "resolved": "https://registry.npmjs.org/d3-format/-/d3-format-3.1.0.tgz",[m
[32m++      "integrity": "sha512-YyUI6AEuY/Wpt8KWLgZHsIU86atmikuoOmCfommt0LYHiQSPjvX2AcFc38PX0CBpr2RCyZhjex+NS/LPOv6YqA==",[m
[32m++      "license": "ISC",[m
[32m++      "engines": {[m
[32m++        "node": ">=12"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/d3-interpolate": {[m
[32m++      "version": "3.0.1",[m
[32m++      "resolved": "https://registry.npmjs.org/d3-interpolate/-/d3-interpolate-3.0.1.tgz",[m
[32m++      "integrity": "sha512-3bYs1rOD33uo8aqJfKP3JWPAibgw8Zm2+L9vBKEHJ2Rg+viTR7o5Mmv5mZcieN+FRYaAOWX5SJATX6k1PWz72g==",[m
[32m++      "license": "ISC",[m
[32m++      "dependencies": {[m
[32m++        "d3-color": "1 - 3"[m
[32m++      },[m
[32m++      "engines": {[m
[32m++        "node": ">=12"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/d3-path": {[m
[32m++      "version": "3.1.0",[m
[32m++      "resolved": "https://registry.npmjs.org/d3-path/-/d3-path-3.1.0.tgz",[m
[32m++      "integrity": "sha512-p3KP5HCf/bvjBSSKuXid6Zqijx7wIfNW+J/maPs+iwR35at5JCbLUT0LzF1cnjbCHWhqzQTIN2Jpe8pRebIEFQ==",[m
[32m++      "license": "ISC",[m
[32m++      "engines": {[m
[32m++        "node": ">=12"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/d3-scale": {[m
[32m++      "version": "4.0.2",[m
[32m++      "resolved": "https://registry.npmjs.org/d3-scale/-/d3-scale-4.0.2.tgz",[m
[32m++      "integrity": "sha512-GZW464g1SH7ag3Y7hXjf8RoUuAFIqklOAq3MRl4OaWabTFJY9PN/E1YklhXLh+OQ3fM9yS2nOkCoS+WLZ6kvxQ==",[m
[32m++      "license": "ISC",[m
[32m++      "dependencies": {[m
[32m++        "d3-array": "2.10.0 - 3",[m
[32m++        "d3-format": "1 - 3",[m
[32m++        "d3-interpolate": "1.2.0 - 3",[m
[32m++        "d3-time": "2.1.1 - 3",[m
[32m++        "d3-time-format": "2 - 4"[m
[32m++      },[m
[32m++      "engines": {[m
[32m++        "node": ">=12"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/d3-shape": {[m
[32m++      "version": "3.2.0",[m
[32m++      "resolved": "https://registry.npmjs.org/d3-shape/-/d3-shape-3.2.0.tgz",[m
[32m++      "integrity": "sha512-SaLBuwGm3MOViRq2ABk3eLoxwZELpH6zhl3FbAoJ7Vm1gofKx6El1Ib5z23NUEhF9AsGl7y+dzLe5Cw2AArGTA==",[m
[32m++      "license": "ISC",[m
[32m++      "dependencies": {[m
[32m++        "d3-path": "^3.1.0"[m
[32m++      },[m
[32m++      "engines": {[m
[32m++        "node": ">=12"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/d3-time": {[m
[32m++      "version": "3.1.0",[m
[32m++      "resolved": "https://registry.npmjs.org/d3-time/-/d3-time-3.1.0.tgz",[m
[32m++      "integrity": "sha512-VqKjzBLejbSMT4IgbmVgDjpkYrNWUYJnbCGo874u7MMKIWsILRX+OpX/gTk8MqjpT1A/c6HY2dCA77ZN0lkQ2Q==",[m
[32m++      "license": "ISC",[m
[32m++      "dependencies": {[m
[32m++        "d3-array": "2 - 3"[m
[32m++      },[m
[32m++      "engines": {[m
[32m++        "node": ">=12"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/d3-time-format": {[m
[32m++      "version": "4.1.0",[m
[32m++      "resolved": "https://registry.npmjs.org/d3-time-format/-/d3-time-format-4.1.0.tgz",[m
[32m++      "integrity": "sha512-dJxPBlzC7NugB2PDLwo9Q8JiTR3M3e4/XANkreKSUxF8vvXKqm1Yfq4Q5dl8budlunRVlUUaDUgFt7eA8D6NLg==",[m
[32m++      "license": "ISC",[m
[32m++      "dependencies": {[m
[32m++        "d3-time": "1 - 3"[m
[32m++      },[m
[32m++      "engines": {[m
[32m++        "node": ">=12"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/d3-timer": {[m
[32m++      "version": "3.0.1",[m
[32m++      "resolved": "https://registry.npmjs.org/d3-timer/-/d3-timer-3.0.1.tgz",[m
[32m++      "integrity": "sha512-ndfJ/JxxMd3nw31uyKoY2naivF+r29V+Lc0svZxe1JvvIRmi8hUsrMvdOwgS1o6uBHmiz91geQ0ylPP0aj1VUA==",[m
[32m++      "license": "ISC",[m
[32m++      "engines": {[m
[32m++        "node": ">=12"[m
[32m++      }[m
[32m++    },[m
      "node_modules/damerau-levenshtein": {[m
        "version": "1.0.8",[m
        "resolved": "https://registry.npmjs.org/damerau-levenshtein/-/damerau-levenshtein-1.0.8.tgz",[m
[36m@@@ -4482,6 -4482,6 +4726,12 @@@[m
        "dev": true,[m
        "license": "MIT"[m
      },[m
[32m++    "node_modules/decimal.js-light": {[m
[32m++      "version": "2.5.1",[m
[32m++      "resolved": "https://registry.npmjs.org/decimal.js-light/-/decimal.js-light-2.5.1.tgz",[m
[32m++      "integrity": "sha512-qIMFpTMZmny+MMIitAB6D7iVPEorVw6YQRWkvarTkT4tBeSLLiHzcwj6q0MmYSFCiVpiqPJTJEYIrpcPzVEIvg==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
      "node_modules/dedent": {[m
        "version": "1.6.0",[m
        "resolved": "https://registry.npmjs.org/dedent/-/dedent-1.6.0.tgz",[m
[36m@@@ -4873,6 -4873,6 +5123,16 @@@[m
          "url": "https://github.com/sponsors/ljharb"[m
        }[m
      },[m
[32m++    "node_modules/es-toolkit": {[m
[32m++      "version": "1.39.8",[m
[32m++      "resolved": "https://registry.npmjs.org/es-toolkit/-/es-toolkit-1.39.8.tgz",[m
[32m++      "integrity": "sha512-A8QO9TfF+rltS8BXpdu8OS+rpGgEdnRhqIVxO/ZmNvnXBYgOdSsxukT55ELyP94gZIntWJ+Li9QRrT2u1Kitpg==",[m
[32m++      "license": "MIT",[m
[32m++      "workspaces": [[m
[32m++        "docs",[m
[32m++        "benchmarks"[m
[32m++      ][m
[32m++    },[m
      "node_modules/escalade": {[m
        "version": "3.2.0",[m
        "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",[m
[36m@@@ -5346,6 -5346,6 +5606,12 @@@[m
          "node": ">=0.10.0"[m
        }[m
      },[m
[32m++    "node_modules/eventemitter3": {[m
[32m++      "version": "5.0.1",[m
[32m++      "resolved": "https://registry.npmjs.org/eventemitter3/-/eventemitter3-5.0.1.tgz",[m
[32m++      "integrity": "sha512-GWkBvjiSZK87ELrYOSESUYeVIc9mvLLf/nXalMOS5dYrgZq9o5OVkbZAVM06CVxYsCwH9BDZFPlQTlPA1j4ahA==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
      "node_modules/execa": {[m
        "version": "5.1.1",[m
        "resolved": "https://registry.npmjs.org/execa/-/execa-5.1.1.tgz",[m
[36m@@@ -6041,6 -6041,6 +6307,16 @@@[m
          "node": ">= 4"[m
        }[m
      },[m
[32m++    "node_modules/immer": {[m
[32m++      "version": "10.1.1",[m
[32m++      "resolved": "https://registry.npmjs.org/immer/-/immer-10.1.1.tgz",[m
[32m++      "integrity": "sha512-s2MPrmjovJcoMaHtx6K11Ra7oD05NT97w1IC5zpMkT6Atjr7H8LjaDd81iIxUYpMKSRRNMJE703M1Fhr/TctHw==",[m
[32m++      "license": "MIT",[m
[32m++      "funding": {[m
[32m++        "type": "opencollective",[m
[32m++        "url": "https://opencollective.com/immer"[m
[32m++      }[m
[32m++    },[m
      "node_modules/import-fresh": {[m
        "version": "3.3.1",[m
        "resolved": "https://registry.npmjs.org/import-fresh/-/import-fresh-3.3.1.tgz",[m
[36m@@@ -6132,6 -6132,6 +6408,15 @@@[m
          "node": ">= 0.4"[m
        }[m
      },[m
[32m++    "node_modules/internmap": {[m
[32m++      "version": "2.0.3",[m
[32m++      "resolved": "https://registry.npmjs.org/internmap/-/internmap-2.0.3.tgz",[m
[32m++      "integrity": "sha512-5Hh7Y1wQbvY5ooGgPbDaL5iYLAPzMTUrjMulskHLH6wnv/A+1q5rgEaiuqEjB+oxGXIVZs1FF+R/KPN3ZSQYYg==",[m
[32m++      "license": "ISC",[m
[32m++      "engines": {[m
[32m++        "node": ">=12"[m
[32m++      }[m
[32m++    },[m
      "node_modules/is-array-buffer": {[m
        "version": "3.0.5",[m
        "resolved": "https://registry.npmjs.org/is-array-buffer/-/is-array-buffer-3.0.5.tgz",[m
[36m@@@ -8125,6 -8125,6 +8410,15 @@@[m
          "yallist": "^3.0.2"[m
        }[m
      },[m
[32m++    "node_modules/lucide-react": {[m
[32m++      "version": "0.532.0",[m
[32m++      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-0.532.0.tgz",[m
[32m++      "integrity": "sha512-HwmXOIZwuZ21wryFq0ZrwkjAMxI77+jLxLdNzWCiUa/Kf5ozkTFCWT6C1/yapP68uKgj8wlxxqnNCH1xo9NEpg==",[m
[32m++      "license": "ISC",[m
[32m++      "peerDependencies": {[m
[32m++        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0"[m
[32m++      }[m
[32m++    },[m
      "node_modules/lz-string": {[m
        "version": "1.5.0",[m
        "resolved": "https://registry.npmjs.org/lz-string/-/lz-string-1.5.0.tgz",[m
[36m@@@ -9095,9 -9095,9 +9389,31 @@@[m
        "version": "17.0.2",[m
        "resolved": "https://registry.npmjs.org/react-is/-/react-is-17.0.2.tgz",[m
        "integrity": "sha512-w2GsyukL62IJnlaff/nRegPQR94C/XXamvMWmSHRJ4y7Ts/4ocGRmTHvOs8PSE6pB3dWOrD/nueuU5sduBsQ4w==",[m
[31m--      "dev": true,[m
        "license": "MIT"[m
      },[m
[32m++    "node_modules/react-redux": {[m
[32m++      "version": "9.2.0",[m
[32m++      "resolved": "https://registry.npmjs.org/react-redux/-/react-redux-9.2.0.tgz",[m
[32m++      "integrity": "sha512-ROY9fvHhwOD9ySfrF0wmvu//bKCQ6AeZZq1nJNtbDC+kk5DuSuNX/n6YWYF/SYy7bSba4D4FSz8DJeKY/S/r+g==",[m
[32m++      "license": "MIT",[m
[32m++      "dependencies": {[m
[32m++        "@types/use-sync-external-store": "^0.0.6",[m
[32m++        "use-sync-external-store": "^1.4.0"[m
[32m++      },[m
[32m++      "peerDependencies": {[m
[32m++        "@types/react": "^18.2.25 || ^19",[m
[32m++        "react": "^18.0 || ^19",[m
[32m++        "redux": "^5.0.0"[m
[32m++      },[m
[32m++      "peerDependenciesMeta": {[m
[32m++        "@types/react": {[m
[32m++          "optional": true[m
[32m++        },[m
[32m++        "redux": {[m
[32m++          "optional": true[m
[32m++        }[m
[32m++      }[m
[32m++    },[m
      "node_modules/react-toastify": {[m
        "version": "11.0.5",[m
        "resolved": "https://registry.npmjs.org/react-toastify/-/react-toastify-11.0.5.tgz",[m
[36m@@@ -9111,6 -9111,6 +9427,33 @@@[m
          "react-dom": "^18 || ^19"[m
        }[m
      },[m
[32m++    "node_modules/recharts": {[m
[32m++      "version": "3.1.0",[m
[32m++      "resolved": "https://registry.npmjs.org/recharts/-/recharts-3.1.0.tgz",[m
[32m++      "integrity": "sha512-NqAqQcGBmLrfDs2mHX/bz8jJCQtG2FeXfE0GqpZmIuXIjkpIwj8sd9ad0WyvKiBKPd8ZgNG0hL85c8sFDwascw==",[m
[32m++      "license": "MIT",[m
[32m++      "dependencies": {[m
[32m++        "@reduxjs/toolkit": "1.x.x || 2.x.x",[m
[32m++        "clsx": "^2.1.1",[m
[32m++        "decimal.js-light": "^2.5.1",[m
[32m++        "es-toolkit": "^1.39.3",[m
[32m++        "eventemitter3": "^5.0.1",[m
[32m++        "immer": "^10.1.1",[m
[32m++        "react-redux": "8.x.x || 9.x.x",[m
[32m++        "reselect": "5.1.1",[m
[32m++        "tiny-invariant": "^1.3.3",[m
[32m++        "use-sync-external-store": "^1.2.2",[m
[32m++        "victory-vendor": "^37.0.2"[m
[32m++      },[m
[32m++      "engines": {[m
[32m++        "node": ">=18"[m
[32m++      },[m
[32m++      "peerDependencies": {[m
[32m++        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",[m
[32m++        "react-dom": "^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",[m
[32m++        "react-is": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"[m
[32m++      }[m
[32m++    },[m
      "node_modules/redent": {[m
        "version": "3.0.0",[m
        "resolved": "https://registry.npmjs.org/redent/-/redent-3.0.0.tgz",[m
[36m@@@ -9125,6 -9125,6 +9468,21 @@@[m
          "node": ">=8"[m
        }[m
      },[m
[32m++    "node_modules/redux": {[m
[32m++      "version": "5.0.1",[m
[32m++      "resolved": "https://registry.npmjs.org/redux/-/redux-5.0.1.tgz",[m
[32m++      "integrity": "sha512-M9/ELqF6fy8FwmkpnF0S3YKOqMyoWJ4+CS5Efg2ct3oY9daQvd/Pc71FpGZsVsbl3Cpb+IIcjBDUnnyBdQbq4w==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
[32m++    "node_modules/redux-thunk": {[m
[32m++      "version": "3.1.0",[m
[32m++      "resolved": "https://registry.npmjs.org/redux-thunk/-/redux-thunk-3.1.0.tgz",[m
[32m++      "integrity": "sha512-NW2r5T6ksUKXCabzhL9z+h206HQw/NJkcLm1GPImRQ8IzfXwRGqjVhKJGauHirT0DAuyy6hjdnMZaRoAcy0Klw==",[m
[32m++      "license": "MIT",[m
[32m++      "peerDependencies": {[m
[32m++        "redux": "^5.0.0"[m
[32m++      }[m
[32m++    },[m
      "node_modules/reflect.getprototypeof": {[m
        "version": "1.0.10",[m
        "resolved": "https://registry.npmjs.org/reflect.getprototypeof/-/reflect.getprototypeof-1.0.10.tgz",[m
[36m@@@ -9179,6 -9179,6 +9537,12 @@@[m
          "node": ">=0.10.0"[m
        }[m
      },[m
[32m++    "node_modules/reselect": {[m
[32m++      "version": "5.1.1",[m
[32m++      "resolved": "https://registry.npmjs.org/reselect/-/reselect-5.1.1.tgz",[m
[32m++      "integrity": "sha512-K/BG6eIky/SBpzfHZv/dd+9JBFiS4SWV7FIujVyJRux6e45+73RaUHXLmIR1f7WOMaQ0U1km6qwklRQxpJJY0w==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
      "node_modules/resolve": {[m
        "version": "1.22.10",[m
        "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.10.tgz",[m
[36m@@@ -10128,6 -10128,6 +10492,12 @@@[m
          "url": "https://github.com/sponsors/isaacs"[m
        }[m
      },[m
[32m++    "node_modules/tiny-invariant": {[m
[32m++      "version": "1.3.3",[m
[32m++      "resolved": "https://registry.npmjs.org/tiny-invariant/-/tiny-invariant-1.3.3.tgz",[m
[32m++      "integrity": "sha512-+FbBPE1o9QAYvviau/qC5SE3caw21q3xkvWKBtja5vgqOWIHHJ3ioaq1VPfn/Szqctz2bU/oYeKd9/z5BL+PVg==",[m
[32m++      "license": "MIT"[m
[32m++    },[m
      "node_modules/tinyglobby": {[m
        "version": "0.2.14",[m
        "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.14.tgz",[m
[36m@@@ -10577,6 -10577,6 +10947,27 @@@[m
          "punycode": "^2.1.0"[m
        }[m
      },[m
[32m++    "node_modules/use-debounce": {[m
[32m++      "version": "10.0.5",[m
[32m++      "resolved": "https://registry.npmjs.org/use-debounce/-/use-debounce-10.0.5.tgz",[m
[32m++      "integrity": "sha512-Q76E3lnIV+4YT9AHcrHEHYmAd9LKwUAbPXDm7FlqVGDHiSOhX3RDjT8dm0AxbJup6WgOb1YEcKyCr11kBJR5KQ==",[m
[32m++      "license": "MIT",[m
[32m++      "engines": {[m
[32m++        "node": ">= 16.0.0"[m
[32m++      },[m
[32m++      "peerDependencies": {[m
[32m++        "react": "*"[m
[32m++      }[m
[32m++    },[m
[32m++    "node_modules/use-sync-external-store": {[m
[32m++      "version": "1.5.0",[m
[32m++      "resolved": "https://registry.npmjs.org/use-sync-external-store/-/use-sync-external-store-1.5.0.tgz",[m
[32m++      "integrity": "sha512-Rb46I4cGGVBmjamjphe8L/UnvJD+uPPtTkNvX5mZgqdbavhI4EbgIWJiIHXJ8bc/i9EQGPRh4DwEURJ552Do0A==",[m
[32m++      "license": "MIT",[m
[32m++      "peerDependencies": {[m
[32m++        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"[m
[32m++      }[m
[32m++    },[m
      "node_modules/v8-compile-cache-lib": {[m
        "version": "3.0.1",[m
        "resolved": "https://registry.npmjs.org/v8-compile-cache-lib/-/v8-compile-cache-lib-3.0.1.tgz",[m
[36m@@@ -10599,6 -10599,6 +10990,28 @@@[m
          "node": ">=10.12.0"[m
        }[m
      },[m
[32m++    "node_modules/victory-vendor": {[m
[32m++      "version": "37.3.6",[m
[32m++      "resolved": "https://registry.npmjs.org/victory-vendor/-/victory-vendor-37.3.6.tgz",[m
[32m++      "integrity": "sha512-SbPDPdDBYp+5MJHhBCAyI7wKM3d5ivekigc2Dk2s7pgbZ9wIgIBYGVw4zGHBml/qTFbexrofXW6Gu4noGxrOwQ==",[m
[32m++      "license": "MIT AND ISC",[m
[32m++      "dependencies": {[m
[32m++        "@types/d3-array": "^3.0.3",[m
[32m++        "@types/d3-ease": "^3.0.0",[m
[32m++        "@types/d3-interpolate": "^3.0.1",[m
[32m++        "@types/d3-scale": "^4.0.2",[m
[32m++        "@types/d3-shape": "^3.1.0",[m
[32m++        "@types/d3-time": "^3.0.0",[m
[32m++        "@types/d3-timer": "^3.0.0",[m
[32m++        "d3-array": "^3.1.6",[m
[32m++        "d3-ease": "^3.0.1",[m
[32m++        "d3-interpolate": "^3.0.1",[m
[32m++        "d3-scale": "^4.0.2",[m
[32m++        "d3-shape": "^3.1.0",[m
[32m++        "d3-time": "^3.0.0",[m
[32m++        "d3-timer": "^3.0.1"[m
[32m++      }[m
[32m++    },[m
      "node_modules/w3c-xmlserializer": {[m
        "version": "5.0.0",[m
        "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-5.0.0.tgz",[m
[1mdiff --cc package.json[m
[1mindex cc92b96,cc92b96..03dae1a[m
[1m--- a/package.json[m
[1m+++ b/package.json[m
[36m@@@ -10,20 -10,20 +10,23 @@@[m
      "test": "jest"[m
    },[m
    "dependencies": {[m
[32m++    "@tanstack/react-query": "^5.83.0",[m
[32m++    "lucide-react": "^0.532.0",[m
      "next": "15.4.2",[m
      "postcss": "^8.5.6",[m
      "react": "19.1.0",[m
      "react-dom": "19.1.0",[m
      "react-hook-form": "^7.61.1",[m
      "react-toastify": "^11.0.5",[m
[31m-- [m
[31m--    "tw-animate-css": "^1.3.6"[m
[32m++    "recharts": "^3.1.0",[m
[32m++    "tw-animate-css": "^1.3.6",[m
[32m++    "use-debounce": "^10.0.5"[m
    },[m
    "devDependencies": {[m
      "@eslint/eslintrc": "^3",[m
      "@tailwindcss/postcss": "^4.1.11",[m
      "@testing-library/dom": "^10.4.0",[m
[31m--    "@testing-library/jest-dom": "^6.6.3",[m
[32m++    "@testing-library/jest-dom": "^6.6.4",[m
      "@testing-library/react": "^16.3.0",[m
      "@testing-library/user-event": "^14.6.1",[m
      "@types/jest": "^30.0.0",[m
