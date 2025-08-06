import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { toast } from "react-toastify";
import Link from "next/link";

const signupSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    workEmail: z.string().email("Please enter a valid email address"),
    phoneNumber: z.string().min(10, "Please enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onNext: () => void;
}

export const SignupForm = ({ onNext }: SignupFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      console.log("Signup data:", data); // 👈 This now uses it
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Account created successfully! Welcome to ESG Horizon.", {
        position: "top-right",
        autoClose: 3000,
      });
      onNext();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6 ">
      {/* Progress Indicator */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-3 h-3 rounded-full bg-primary"></div>
        <div className="flex-1 h-1 bg-gray-200 rounded-full">
          <div className="w-1/4 h-full bg-primary rounded-full"></div>
        </div>
        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Let&apos;s get started
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-neutral-1000">*</span>
            </Label>
            <Input
              id="firstName"
              placeholder="Enter your first name"
              {...register("firstName")}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name <span className="text-neutral-1000">*</span>
            </Label>
            <Input
              id="lastName"
              placeholder="Enter your last name"
              {...register("lastName")}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="workEmail">
              Work Email <span className="text-neutral-1000">*</span>
            </Label>
            <Input
              id="workEmail"
              type="email"
              placeholder="email.example@company.com"
              {...register("workEmail")}
              className={errors.workEmail ? "border-red-500" : ""}
            />
            {errors.workEmail && (
              <p className="text-sm text-red-500">{errors.workEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              Phone Number <span className="text-neutral-1000">*</span>
            </Label>
            <Input
              id="phoneNumber"
              placeholder="0812345678"
              {...register("phoneNumber")}
              className={errors.phoneNumber ? "border-red-500" : ""}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              Create Password <span className="text-neutral-1000">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter a strong password"
              {...register("password")}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-neutral-1000">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Continue"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-600">
        <p>
          Don’t have an account?{"  "}
          <Link
            href="/login"
            className="text-neutral-900 font-medium hover:underline  "
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};
