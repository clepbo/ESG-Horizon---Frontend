"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

export default function InviteUserPage() {
  const { inviteUser, validateInviteToken } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Check token validity on load
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenValid(false);
        return;
      }
      try {
        const valid = await validateInviteToken(token); // backend returns true/false
        setTokenValid(valid);
      } catch {
        setTokenValid(false);
      }
    };
    checkToken();
  }, [token, validateInviteToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { firstName, lastName, password, confirmPassword } = formData;

    if (!firstName || !lastName || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!token) {
      toast.error("Invalid or missing invitation token");
      return;
    }

    setLoading(true);
    try {
      await inviteUser({
        first_name: firstName,
        last_name: lastName,
        password,
        token,
      });
      toast.success("Profile created successfully!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create profile");
      }
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return <p className="text-center py-10">Checking invitation link...</p>;
  }

  if (tokenValid === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Invitation Link Expired</h2>
        <p className="text-gray-600 mb-6">
          This invitation token is invalid or has expired. Please request a new
          invite from your administrator.
        </p>
        <a href="/login" className="text-green-600 font-medium underline">
          Back to Login
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white">
      <div className="w-full space-y-6">
        <h2 className="text-2xl font-semibold text-center">
          Create your profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Create Password *
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter a strong password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-md transition"
          >
            {loading ? "Processing..." : "Continue"}
          </button>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-green-600 font-medium">
              Login here
            </a>
          </p>
        </form>
      </div>
      <ToastContainer theme="light" position="top-right" autoClose={3000} />
    </div>
  );
}
