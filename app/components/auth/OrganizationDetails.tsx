// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@/app/components/ui/button";
// import { Input } from "@/app/components/ui/input";
// import { Label } from "@/app/components/ui/label";
// import { Textarea } from "@/app/components/ui/textarea";
// import { toast } from "react-toastify";
// import { ArrowLeft } from "lucide-react";
// import { useState } from "react";

// const organizationSchema = z.object({
//   companyName: z.string().min(2, "Company name must be at least 2 characters"),
//   industry: z.string().min(2, "Please specify your industry"),
//   contactEmail: z.string().email("Please enter a valid email address"),
//   contactPhone: z.string().min(10, "Please enter a valid phone number"),
//   website: z
//     .string()
//     .url("Please enter a valid website URL")
//     .or(z.string().min(0)),
//   registrationNumber: z.string().min(1, "Registration number is required"),
//   country: z.string().min(2, "Country is required"),
//   address: z.string().min(10, "Please enter a complete address"),
// });

// type OrganizationFormData = z.infer<typeof organizationSchema>;

// interface OrganizationDetailsProps {
//   onBack: () => void;
//   onNext: () => void;
// }

// export const OrganizationDetails = ({
//   onBack,
//   onNext,
// }: OrganizationDetailsProps) => {
//   const {
//     register,
//     handleSubmit,
//     setError,
//     formState: { errors, isSubmitting },
//   } = useForm<OrganizationFormData>({
//     resolver: zodResolver(organizationSchema),
//   });
//   const [loading, setLoading] = useState(false);
//   const [isTransitioning, setIsTransitioning] = useState(false);

//   // const onSubmit = async (data: OrganizationFormData) => {
//   //   try {
//   //     console.log("Form submitted with:", data);
//   //     await new Promise((resolve) => setTimeout(resolve, 1000));

//   //     toast.success("Organization details saved successfully!", {
//   //       position: "top-right",
//   //       autoClose: 3000,
//   //     });

//   //     onNext();
//   //   } catch (error) {
//   //     console.error("Error saving organization details:", error);
//   //     toast.error("Something went wrong. Please try again.", {
//   //       position: "top-right",
//   //       autoClose: 3000,
//   //     });
//   //   }
//   // };
//   const onSubmit = async (data: OrganizationFormData) => {
//     setLoading(true);
//     setIsTransitioning(true);

//     try {
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       toast.success("Organization details saved successfully!");

//       setTimeout(() => {
//         onNext();
//       }, 700);
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Submission failed";

//       toast.error(errorMessage);
//       setError("root", { message: errorMessage });
//       setIsTransitioning(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-2xl space-y-6">
//       {/* Progress Indicator */}
//       <div className="flex items-center space-x-2 mb-8">
//         <div className="w-3 h-3 rounded-full bg-green-600" />
//         <div className="flex-1 h-1 bg-green-600 rounded-full" />
//         <div className="w-3 h-3 rounded-full bg-green-600" />
//       </div>

//       {/* Back Button */}
//       <Button
//         onClick={onBack}
//         className="bg-white border border-gray-300 text-gray-800 hover:shadow-sm hover:bg-gray-100 flex items-center space-x-2 mb-6"
//       >
//         <ArrowLeft className="w-4 h-4" />
//         <span>Back</span>
//       </Button>

//       <h2 className="text-2xl font-bold text-gray-900">Organization Details</h2>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="companyName">
//               Company Name <span className="text-neutral-1000">*</span>
//             </Label>
//             <Input
//               id="companyName"
//               placeholder="Enter your company name"
//               {...register("companyName")}
//               className={`h-12 px-4 text-sm rounded-md border hover:shadow-sm ${
//                 errors.companyName ? "border-red-500" : ""
//               }`}
//             />
//             {errors.companyName && (
//               <p className="text-sm text-neutral-1000">
//                 {errors.companyName.message}
//               </p>
//             )}
//           </div>

//           <div className="space-y-2 ">
//             <Label htmlFor="industry">
//               Industry <span className="text-neutral-1000">*</span>
//             </Label>
//             <select
//               id="industry"
//               {...register("industry")}
//               className={`h-12 w-full px-4 text-sm rounded-md border hover:shadow-sm ${
//                 errors.industry ? "border-red-500" : "border-gray-300"
//               }`}
//             >
//               <option value="">Select Industry</option>
//               <option value="Technology">Technology</option>
//               <option value="Finance">Finance</option>
//               <option value="Healthcare">Healthcare</option>
//               <option value="Education">Education</option>
//             </select>
//             {errors.industry && (
//               <p className="text-sm text-neutral-1000">
//                 {errors.industry.message}
//               </p>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="contactEmail">
//               Contact Email <span className="text-neutral-1000">*</span>
//             </Label>
//             <Input
//               id="contactEmail"
//               type="email"
//               placeholder="info@company.com"
//               {...register("contactEmail")}
//               className={`h-12 px-4 text-sm rounded-md border hover:shadow-sm ${
//                 errors.contactEmail ? "border-red-500" : ""
//               }`}
//             />
//             {errors.contactEmail && (
//               <p className="text-sm text-neutral-1000">
//                 {errors.contactEmail.message}
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="contactPhone">
//               Contact Phone Number <span className="text-neutral-1000">*</span>
//             </Label>
//             <Input
//               id="contactPhone"
//               placeholder="08123456789"
//               {...register("contactPhone")}
//               className={`h-12 px-4 text-sm rounded-md border hover:shadow-sm ${
//                 errors.contactPhone ? "border-red-500" : ""
//               }`}
//             />
//             {errors.contactPhone && (
//               <p className="text-sm text-neutral-1000">
//                 {errors.contactPhone.message}
//               </p>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="website">
//               Website <span className="text-neutral-1000">*</span>
//             </Label>
//             <Input
//               id="website"
//               placeholder="www.company.com"
//               {...register("website")}
//               className={`h-12 px-4 text-sm rounded-md border hover:shadow-sm ${
//                 errors.website ? "border-red-500" : ""
//               }`}
//             />
//             {errors.website && (
//               <p className="text-sm text-neutral-1000">
//                 {errors.website.message}
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="registrationNumber">
//               Registration Number <span className="text-neutral-1000">*</span>
//             </Label>
//             <Input
//               id="registrationNumber"
//               placeholder="CAC Registration Number"
//               {...register("registrationNumber")}
//               className={`h-12 px-4 text-sm rounded-md border hover:shadow-sm ${
//                 errors.registrationNumber ? "border-red-500" : ""
//               }`}
//             />
//             {errors.registrationNumber && (
//               <p className="text-sm text-neutral-1000">
//                 {errors.registrationNumber.message}
//               </p>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="country">
//               Country <span className="text-neutral-1000">*</span>
//             </Label>
//             <select
//               id="country"
//               {...register("country")}
//               className={`h-12 w-full px-4 text-sm rounded-md border hover:shadow-sm ${
//                 errors.country ? "border-red-500" : "border-gray-300"
//               }`}
//             >
//               <option value="">Select Country</option>
//               <option value="Nigeria">Nigeria</option>
//               <option value="Ghana">Ghana</option>
//               <option value="Kenya">Kenya</option>
//             </select>
//             {errors.country && (
//               <p className="text-sm text-neutral-1000">
//                 {errors.country.message}
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="address">
//               Address <span className="text-neutral-1000">*</span>
//             </Label>
//             <Textarea
//               id="address"
//               placeholder="Please enter your company's address"
//               rows={3}
//               {...register("address")}
//               className={`px-4 text-sm rounded-md border hover:shadow-sm ${
//                 errors.address ? "border-red-500" : ""
//               }`}
//             />
//             {errors.address && (
//               <p className="text-sm text-neutral-1000">
//                 {errors.address.message}
//               </p>
//             )}
//           </div>
//         </div>

//         <Button
//           type="submit"
//           className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium cursor-pointer"
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? "Submitting..." : "Submit"}
//         </Button>
//       </form>
//     </div>
//   );
// };
// "use client";

// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@/app/components/ui/button";
// import { toast } from "react-toastify";
// import { ArrowLeft } from "lucide-react";
// import { useState } from "react";
// import { FormField } from "@/app/components/FormFields";

// const organizationSchema = z.object({
//   companyName: z.string().min(2, "Company name must be at least 2 characters"),
//   industry: z.string().min(2, "Please specify your industry"),
//   contactEmail: z.string().email("Please enter a valid email address"),
//   contactPhone: z.string().min(10, "Please enter a valid phone number"),
//   website: z
//     .string()
//     .url("Please enter a valid website URL")
//     .or(z.string().min(0)),
//   registrationNumber: z.string().min(1, "Registration number is required"),
//   country: z.string().min(2, "Country is required"),
//   address: z.string().min(10, "Please enter a complete address"),
// });

// export type OrganizationFormData = z.infer<typeof organizationSchema>;

// export const OrganizationDetails = ({
//   onBack,
//   onNext,
// }: {
//   onBack: () => void;
//   onNext: () => void;
// }) => {
//   const {
//     register,
//     handleSubmit,
//     setError,
//     formState: { errors, isSubmitting },
//   } = useForm<OrganizationFormData>({
//     resolver: zodResolver(organizationSchema),
//   });

//   const [loading, setLoading] = useState(false);

//   const onSubmit = async (data: OrganizationFormData) => {
//     setLoading(true);
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       toast.success("Organization details saved successfully!");
//       onNext();
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Submission failed";
//       toast.error(errorMessage);
//       setError("root", { message: errorMessage });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-2xl space-y-6">
//       {/* Progress Indicator */}
//       <div className="flex items-center space-x-2 mb-8">
//         <div className="w-3 h-3 rounded-full bg-green-600" />
//         <div className="flex-1 h-1 bg-green-600 rounded-full" />
//         <div className="w-3 h-3 rounded-full bg-green-600" />
//       </div>

//       {/* Back Button */}
//       <Button
//         onClick={onBack}
//         className="bg-white border border-gray-300 text-gray-800 hover:shadow-sm hover:bg-gray-100 flex items-center space-x-2 mb-6"
//       >
//         <ArrowLeft className="w-4 h-4" />
//         <span>Back</span>
//       </Button>

//       <h2 className="text-2xl font-bold text-gray-900">Organization Details</h2>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <FormField
//             label="Company Name"
//             required
//             {...register("companyName")}
//             error={errors.companyName}
//             placeholder="Enter your company name"
//           />
//           <FormField
//             label="Industry"
//             required
//             as="select"
//             {...register("industry")}
//             error={errors.industry}
//             options={[
//               { label: "Technology", value: "Technology" },
//               { label: "Finance", value: "Finance" },
//               { label: "Healthcare", value: "Healthcare" },
//               { label: "Education", value: "Education" },
//             ]}
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <FormField
//             label="Contact Email"
//             required
//             type="email"
//             {...register("contactEmail")}
//             error={errors.contactEmail}
//             placeholder="info@company.com"
//           />
//           <FormField
//             label="Contact Phone"
//             required
//             {...register("contactPhone")}
//             error={errors.contactPhone}
//             placeholder="08123456789"
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <FormField
//             label="Website"
//             required
//             {...register("website")}
//             error={errors.website}
//             placeholder="www.company.com"
//           />
//           <FormField
//             label="Registration Number"
//             required
//             {...register("registrationNumber")}
//             error={errors.registrationNumber}
//             placeholder="CAC Registration Number"
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <FormField
//             label="Country"
//             required
//             as="select"
//             {...register("country")}
//             error={errors.country}
//             options={[
//               { label: "Nigeria", value: "Nigeria" },
//               { label: "Ghana", value: "Ghana" },
//               { label: "Kenya", value: "Kenya" },
//             ]}
//           />
//           <FormField
//             label="Address"
//             required
//             as="textarea"
//             {...register("address")}
//             error={errors.address}
//             placeholder="Please enter your company's address"
//           />
//         </div>

//         <Button
//           type="submit"
//           className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
//           disabled={isSubmitting || loading}
//         >
//           {loading ? "Submitting..." : "Submit"}
//         </Button>
//       </form>
//     </div>
//   );
// };
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/app/components/ui/button";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { FormField } from "@/app/components/FormFields";

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
  country: z.string().min(2, "Country is required"),
  address: z.string().min(10, "Please enter a complete address"),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;

export const OrganizationDetails = ({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (data: OrganizationFormData) => void;
}) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: OrganizationFormData) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Organization details saved successfully!");
      onNext(data); // ✅ Pass collected data to parent
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Submission failed";
      toast.error(errorMessage);
      setError("root", { message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-3 h-3 rounded-full bg-green-600" />
        <div className="flex-1 h-1 bg-green-600 rounded-full" />
        <div className="w-3 h-3 rounded-full bg-green-600" />
      </div>

      {/* Back Button */}
      <Button
        onClick={onBack}
        type="button"
        className="bg-white border border-gray-300 text-gray-800 hover:shadow-sm hover:bg-gray-100 flex items-center space-x-2 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Button>

      <h2 className="text-2xl font-bold text-gray-900">Organization Details</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Company Name"
            required
            {...register("companyName")}
            error={errors.companyName}
            placeholder="Enter your company name"
          />
          <FormField
            label="Industry"
            required
            as="select"
            {...register("industry")}
            error={errors.industry}
            options={[
              { label: "Technology", value: "Technology" },
              { label: "Finance", value: "Finance" },
              { label: "Healthcare", value: "Healthcare" },
              { label: "Education", value: "Education" },
            ]}
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Contact Email"
            required
            type="email"
            {...register("contactEmail")}
            error={errors.contactEmail}
            placeholder="info@company.com"
          />
          <FormField
            label="Contact Phone"
            required
            {...register("contactPhone")}
            error={errors.contactPhone}
            placeholder="08123456789"
          />
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Website"
            required
            {...register("website")}
            error={errors.website}
            placeholder="www.company.com"
          />
          <FormField
            label="Registration Number"
            required
            {...register("registrationNumber")}
            error={errors.registrationNumber}
            placeholder="CAC Registration Number"
          />
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Country"
            required
            as="select"
            {...register("country")}
            error={errors.country}
            options={[
              { label: "Nigeria", value: "Nigeria" },
              { label: "Ghana", value: "Ghana" },
              { label: "Kenya", value: "Kenya" },
            ]}
          />
          <FormField
            label="Address"
            required
            as="textarea"
            {...register("address")}
            error={errors.address}
            placeholder="Please enter your company's address"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          disabled={isSubmitting || loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
};
