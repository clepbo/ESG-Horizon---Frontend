import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/app/(esg-sign-up)/components/ui/button";
import { Input } from "@/app/(esg-sign-up)/components/ui/input";
import { Label } from "@/app/(esg-sign-up)/components/ui/label";
import { Textarea } from "@/app/(esg-sign-up)/components/ui/textarea";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";

const organizationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(2, "Please specify your industry"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  website: z
    .string()
    .url("Please enter a valid website URL")
    .or(z.string().min(0)),
  registrationNumber: z.string().min(1, "Registration number is required"),
  address: z.string().min(10, "Please enter a complete address"),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationDetailsProps {
  onBack: () => void;
  onNext: () => void;
}

export const OrganizationDetails = ({
  onBack,
  onNext,
}: OrganizationDetailsProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  });

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Organization details saved successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Proceed to next step
      onNext();
    } catch (error) {
      toast.error("Something went wrong. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-3 h-3 rounded-full bg-primary"></div>
        <div className="flex-1 h-1 bg-gray-200 rounded-full">
          <div className="w-2/4 h-full bg-primary rounded-full"></div>
        </div>
        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
      </div>

      {/* Back Button */}
      <Button onClick={onBack} className="flex items-center space-x-2 mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Button>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Organization Details
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyName"
              placeholder="Enter your company name"
              {...register("companyName")}
              className={errors.companyName ? "border-red-500" : ""}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">
              Industry <span className="text-red-500">*</span>
            </Label>
            <Input
              id="industry"
              placeholder="Industry your company belongs to"
              {...register("industry")}
              className={errors.industry ? "border-red-500" : ""}
            />
            {errors.industry && (
              <p className="text-sm text-red-500">{errors.industry.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">
              Contact Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="info@company.com"
              {...register("contactEmail")}
              className={errors.contactEmail ? "border-red-500" : ""}
            />
            {errors.contactEmail && (
              <p className="text-sm text-red-500">
                {errors.contactEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">
              Contact Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactPhone"
              placeholder="0812345789"
              {...register("contactPhone")}
              className={errors.contactPhone ? "border-red-500" : ""}
            />
            {errors.contactPhone && (
              <p className="text-sm text-red-500">
                {errors.contactPhone.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">
              Website <span className="text-red-500">*</span>
            </Label>
            <Input
              id="website"
              placeholder="www.company.com"
              {...register("website")}
              className={errors.website ? "border-red-500" : ""}
            />
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">
              Registration Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="registrationNumber"
              placeholder="CAC Registration Number"
              {...register("registrationNumber")}
              className={errors.registrationNumber ? "border-red-500" : ""}
            />
            {errors.registrationNumber && (
              <p className="text-sm text-red-500">
                {errors.registrationNumber.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">
            Address <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="address"
            placeholder="Please enter your company's address"
            rows={3}
            {...register("address")}
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium cursor pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
};
