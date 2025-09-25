"use client";
import { useState } from "react";
import { CircleX, Camera } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { uploadService } from "@/services/upload.service";
import { useUpdateCompanyDetails } from "@/services/hooks/company.hooks";
import Select from "react-select";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import ReactFlagsSelect from "react-flags-select";
import en from "react-phone-number-input/locale/en.json";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CountryCode, parsePhoneNumberWithError } from "libphonenumber-js";
import { Company } from "@/services/company.service";
import { Industry } from "@/services/industries.services";
import { FormField } from "../reusables/FormFields";
import { countries } from "countries-list";

const editCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  industryId: z.number().min(1, "Please select an industry"),
  contact_email: z.string().email("Please enter a valid email address"),
  contact_phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => {
        try {
          const phone = parsePhoneNumberWithError(val);
          return phone.isValid();
        } catch {
          return false;
        }
      },
      {
        message: "Please enter a valid phone number for the selected country",
      }
    ),
  website: z
    .string()
    .min(1, "Website is required")
    .refine(
      (val) => {
        const websiteRegex =
          /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\.[a-zA-Z]{2,}(\/\S*)?$/;

        return websiteRegex.test(val);
      },
      {
        message: "Please enter a valid website URL (e.g., www.example.com)",
      }
    ),
  isoCountryCode: z.string().min(2, "Country is required"),
  address: z.string().min(10, "Please enter a complete address"),
  company_logo_url: z.string().url().optional().or(z.literal("")),
});
export type EditCompanyFormData = z.infer<typeof editCompanySchema>;

export default function EditCompanyModal({
  company,
  onClose,
  onUpdate,
  industryOptions,
  companyUsersCount,
}: {
  company: Company;
  onClose: () => void;
  onUpdate: (updatedCompany: Company) => void;
  industryOptions: Industry[];
  companyUsersCount: number;
}) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EditCompanyFormData>({
    resolver: zodResolver(editCompanySchema),
    defaultValues: {
      name: company.name ?? "",
      industryId: company.industry?.id ?? 0,
      contact_email: company.contact_email ?? "",
      contact_phone: company.contact_phone ?? "",
      website: company.website ?? "",
      isoCountryCode: company.isoCountryCode ?? "",
      address: company.address ?? "",
      company_logo_url: company.company_logo_url ?? "",
    },
  });

  const { mutate: updateCompany, isPending: isUpdating } =
    useUpdateCompanyDetails();
  const [companyLogo, setCompanyLogo] = useState(
    company.company_logo_url || null
  );

  const onSubmit = (data: EditCompanyFormData) => {
    const countryData =
      countries[data.isoCountryCode as keyof typeof countries];
    const countryName = countryData?.name || data.isoCountryCode;

    const payload = {
      ...data,
      company_logo_url: companyLogo ?? data.company_logo_url,
      id: company.id,
      country: countryName,
    };

    updateCompany(
      { id: company.id, payload },
      {
        onSuccess: () => {
          toast.info("Company profile updated successfully!");
          onClose();
          onUpdate({
            ...company,
            ...data,
            company_logo_url: companyLogo || data.company_logo_url,
            country: countryName,
          });
        },
        onError: (error) => {
          console.error("Error updating company profile:", error);
          toast.error("Error updating company profile. Please try again.");
        },
      }
    );
  };

  const handleLogoUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const uploaded = await uploadService.uploadImage(file);
      if (uploaded) {
        setCompanyLogo(uploaded.url);
        setValue("company_logo_url", uploaded.url);
        toast.success("Logo uploaded successfully!");
      } else {
        toast.error("Failed to upload logo: Upload returned no data.");
      }
    } catch (err) {
      toast.error("Failed to upload logo");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-4xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition cursor-pointer"
        >
          <CircleX size={28} />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Edit Company Information
        </h2>

        <div className="flex items-center gap-4 mb-8">
          <div className="relative w-20 h-20">
            <Image
              src={companyLogo || company.company_logo_url || "/iconlogo.png"}
              alt="Company Logo"
              width={80}
              height={80}
              className="rounded-full object-cover border border-gray-200"
            />
            <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 border cursor-pointer hover:bg-gray-50">
              <Camera className="w-4 h-4 text-gray-600" />
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleLogoUpload(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <FormField
            label="Company Name"
            {...register("name")}
            error={errors.name}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <Controller
              name="industryId"
              control={control}
              render={({ field }) => {
                const selectedOption =
                  industryOptions.find((opt) => opt.id === field.value) || null;
                return (
                  <Select
                    placeholder="Select an industry"
                    options={industryOptions.map((i) => ({
                      value: i.id,
                      label: `${i.industry} (${i.sector})`,
                    }))}
                    value={
                      selectedOption
                        ? {
                            value: selectedOption.id,
                            label: `${selectedOption.industry} (${selectedOption.sector})`,
                          }
                        : null
                    }
                    onChange={(option) => field.onChange(option?.value || 0)}
                    isClearable
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderColor: errors.industryId ? "#ef4444" : "#d1d5db",
                        boxShadow: "none",
                        "&:hover": { borderColor: "#9ca3af" },
                        borderRadius: "0.375rem",
                        minHeight: "3rem",
                      }),
                      menu: (provided) => ({ ...provided, zIndex: 9999 }),
                    }}
                  />
                );
              }}
            />
            {errors.industryId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.industryId.message}
              </p>
            )}
          </div>

          <FormField
            label="Email"
            type="email"
            {...register("contact_email")}
            error={errors.contact_email}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <Controller
              name="contact_phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  {...field}
                  defaultCountry={watch("isoCountryCode") as CountryCode}
                  className={`rounded-md border px-3 py-2 w-full focus:outline-none focus:ring-2 ${
                    errors.contact_phone
                      ? "border-red-500"
                      : "border-gray-300 focus:ring-green-500"
                  }`}
                  labels={en}
                />
              )}
            />
            {errors.contact_phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.contact_phone.message}
              </p>
            )}
          </div>

          <FormField
            label="Website"
            {...register("website")}
            error={errors.website}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <Controller
              name="isoCountryCode"
              control={control}
              render={({ field }) => {
                const selectedCountry = watch("isoCountryCode") || "";
                return (
                  <ReactFlagsSelect
                    selected={selectedCountry}
                    onSelect={(code) => {
                      field.onChange(code);
                      setValue("contact_phone", "");
                    }}
                    searchable
                    placeholder="Select your country"
                    fullWidth
                    showSelectedLabel
                    showOptionLabel
                    className="w-full"
                    selectButtonClassName={`w-full h-12 rounded-lg border px-3 text-left ${
                      errors.isoCountryCode
                        ? "border-red-500"
                        : "border-neutral-200"
                    }`}
                  />
                );
              }}
            />

            {errors.isoCountryCode && (
              <p className="text-red-500 text-sm mt-1">
                {errors.isoCountryCode.message}
              </p>
            )}
          </div>

          <FormField
            label="Staff Strength"
            value={companyUsersCount}
            disabled
          />

          <FormField
            label="Address"
            as="textarea"
            {...register("address")}
            error={errors.address}
          />

          <div className="flex justify-end gap-4 mt-10 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-green-500 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50 cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="bg-green-500 text-white px-6 py-2 rounded-md text-sm hover:bg-green-600 cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? "Please wait..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// "use client";
// import { useState, useEffect } from "react";
// import { CircleX, Camera } from "lucide-react";
// import Image from "next/image";
// import { InputField } from "@/app/components/common/forms/FormField";
// import { Company, companyService } from "@/services/company.service";
// import { toast } from "react-toastify";
// import { uploadService } from "@/services/upload.service";
// import { industriesService } from "@/services/industries.services";
// import {
//     Select,
//     SelectTrigger,
//     SelectValue,
//     SelectContent,
//     SelectItem,
// } from "@/app/components/ui/select";
// import { useAuth } from "@/context/AuthContext";
// export default function EditCompanyModal({
//     company,
//     onClose,
//     onUpdate,
// }: {
//     company: Company;
//     onClose: () => void;
//     onUpdate: (updatedCompany: Company) => void;
// }) {
//     const [formData, setFormData] = useState<Company>(company);
//     const [companyLogo, setCompanyLogo] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [industryOptions, setIndustryOptions] = useState<
//         { id: number; sector: string; industry: string }[]
//     >([]);
//     const { fetchUserProfile, setUser } = useAuth();
//     const [companyUsersCount, setCompanyUsersCount] = useState<number>(0);

//     useEffect(() => {
//         const fetchIndustries = async () => {
//             try {
//                 const data = await industriesService.getIndustries();
//                 setIndustryOptions(data);
//             } catch (err) {
//                 console.error("Failed to load industries:", err);
//                 toast.error("Failed to load industry options.");
//             }
//         };
//         fetchIndustries();
//     }, []);

//     useEffect(() => {
//         const fetchCompanyUsers = async () => {
//             if (!company || !company.id) {
//                 return;
//             }
//             const company_users = await companyService.getUsers(company.id);
//             setCompanyUsersCount(company_users.length);
//         };
//         fetchCompanyUsers();
//     }, [company]);

//     const handleIndustryChange = (id: string) => {
//         const selectedIndustry = industryOptions.find(
//             (opt) => String(opt.id) === id
//         );
//         if (selectedIndustry) {
//             setFormData((prev) => ({
//                 ...prev,
//                 industry: selectedIndustry,
//             }));
//         }
//     };

//     const handleChange = (field: keyof Company, value: string) => {
//         setFormData((prev) => ({ ...prev, [field]: value }));
//     };

//     const handleUpdate = async () => {
//         try {
//             setLoading(true);
//             const payload = {
//                 ...formData,
//                 company_logo_url: companyLogo || formData.company_logo_url,
//                 industryId: formData.industry?.id,
//             };

//             await companyService.updateDetails(company.id, payload);
//             const freshUser = await fetchUserProfile();
//             if (freshUser) {
//                 setUser(freshUser);
//                 onUpdate(freshUser.company as Company);
//             }
//             toast.info("Company profile updated successfully!");
//         } catch (error) {
//             console.error("Error updating company profile:", error);
//             toast.error("Error updating company profile. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
//             <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-4xl">
//                 {/* Close Icon */}
//                 <button
//                     onClick={onClose}
//                     className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition cursor-pointer"
//                 >
//                     <CircleX size={28} />
//                 </button>

//                 <h2 className="text-xl font-semibold text-gray-900 mb-6">
//                     Edit Company Information
//                 </h2>

//                 {/* Logo Upload */}
//                 <div className="flex items-center gap-4 mb-8">
//                     <div className="relative w-20 h-20">
//                         <Image
//                             src={
//                                 companyLogo ||
//                                 formData.company_logo_url ||
//                                 "/iconlogo.png"
//                             }
//                             alt="Company Logo"
//                             width={80}
//                             height={80}
//                             className={
//                                 companyLogo || formData.company_logo_url
//                                     ? "rounded-full object-cover border border-gray-200"
//                                     : "rounded-full object-cover border border-gray-200 opacity-50 blur-[2px]"
//                             }
//                         />
//                         <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 border cursor-pointer hover:bg-gray-50">
//                             <Camera className="w-4 h-4 text-gray-600" />
//                             <input
//                                 type="file"
//                                 className="hidden"
//                                 onChange={async (e) => {
//                                     const file = e.target.files?.[0];
//                                     if (file) {
//                                         try {
//                                             setLoading(true); // Upload to backend → Cloudinary

//                                             const uploaded =
//                                                 await uploadService.uploadImage(
//                                                     file
//                                                 ); // Check if uploaded is defined before proceeding

//                                             if (uploaded) {
//                                                 // Save the Cloudinary URL into state
//                                                 setCompanyLogo(uploaded.url); // Also update formData so payload has it

//                                                 setFormData((prev) => ({
//                                                     ...prev,
//                                                     company_logo_url:
//                                                         uploaded.url,
//                                                 }));

//                                                 toast.success(
//                                                     "Logo uploaded successfully!"
//                                                 );
//                                             } else {
//                                                 // Handle the case where the upload failed but no exception was thrown
//                                                 toast.error(
//                                                     "Failed to upload logo: Upload returned no data."
//                                                 );
//                                             }
//                                         } catch (err) {
//                                             toast.error(
//                                                 "Failed to upload logo"
//                                             );
//                                             console.error(err);
//                                         } finally {
//                                             setLoading(false);
//                                         }
//                                     }
//                                 }}
//                             />
//                         </label>
//                     </div>
//                 </div>

//                 {/* Form */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <InputField
//                         label="Company Name"
//                         value={formData.name}
//                         onChange={(v) => handleChange("name", v)}
//                     />
//                     <div>
//                         <label
//                             htmlFor="industry-select"
//                             className="block text-sm font-medium text-gray-700 mb-1"
//                         >
//                             Industry
//                         </label>
//                         <Select
//                             value={String(formData.industry?.id)}
//                             onValueChange={handleIndustryChange}
//                         >
//                             <SelectTrigger className="w-full">
//                                 <SelectValue placeholder="Select Industry" />
//                             </SelectTrigger>
//                             <SelectContent className="max-h-[200px] overflow-y-auto">
//                                 {industryOptions.map((opt) => (
//                                     <SelectItem
//                                         key={opt.id}
//                                         value={String(opt.id)}
//                                     >
//                                         {opt.industry} ({opt.sector})
//                                     </SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>
//                     {/* <InputField
//                         label="Industry"
//                         value={String(formData.industry)}
//                         onChange={(v) => handleChange("industry", v)}
//                     /> */}
//                     <InputField
//                         label="Email"
//                         value={formData.contact_email}
//                         onChange={(v) => handleChange("contact_email", v)}
//                     />
//                     <InputField
//                         label="Phone Number"
//                         value={formData.contact_phone}
//                         onChange={(v) => handleChange("contact_phone", v)}
//                     />
//                     <InputField
//                         label="Website"
//                         value={formData.website || ""}
//                         onChange={(v) => handleChange("website", v)}
//                     />
//                     <InputField
//                         label="Country"
//                         value={formData.isoCountryCode}
//                         onChange={(v) => handleChange("isoCountryCode", v)}
//                     />
//                     <InputField
//                         label="Staff Strength"
//                         value={
//                             formData.staff_strength ||
//                             companyUsersCount.toString() ||
//                             ""
//                         }
//                         onChange={(v) => handleChange("staff_strength", v)}
//                     />
//                     <InputField
//                         label="Company Address"
//                         value={formData.address}
//                         onChange={(v) => handleChange("address", v)}
//                     />
//                 </div>

//                 {/* Footer */}
//                 <div className="flex justify-end gap-4 mt-10">
//                     <button
//                         onClick={onClose}
//                         className="border border-green-500 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50 cursor-pointer"
//                     >
//                         Close
//                     </button>
//                     <button
//                         onClick={handleUpdate}
//                         disabled={loading}
//                         className="bg-green-500 text-white px-6 py-2 rounded-md text-sm hover:bg-green-600 cursor-pointer disabled:opacity-50"
//                     >
//                         {loading ? "Please wait..." : "Update"}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }
