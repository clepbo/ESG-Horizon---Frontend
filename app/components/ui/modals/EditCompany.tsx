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
import { CountryCode, parsePhoneNumberWithError, parsePhoneNumber } from "libphonenumber-js";
import { Company } from "@/services/company.service";
import { Industry } from "@/services/industries.services";
import { FormField } from "../reusables/FormFields";
import { countries } from "countries-list";
import { useAuth } from "@/context/AuthContext";

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
        message: "Please enter a valid website URL (e.g., https://www.example.com)",
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
  // Extract country code from phone number if isoCountryCode is not set
  const getInitialCountryCode = () => {
    if (company.isoCountryCode) {
      return company.isoCountryCode.toUpperCase();
    }

    // Try to extract from phone number
    if (company.contact_phone) {
      try {
        const phoneNumber = parsePhoneNumber(company.contact_phone);
        if (phoneNumber && phoneNumber.country) {
          return phoneNumber.country;
        }
      } catch (error) {
        console.log("Could not parse phone number for country detection", error);
      }
    }

    return "";
  };

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
      isoCountryCode: getInitialCountryCode(),
      address: company.address ?? "",
      company_logo_url: company.company_logo_url ?? "",
    },
  });

  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompanyDetails();
  const { setUser, fetchUserProfile } = useAuth();

  const [companyLogo, setCompanyLogo] = useState(company.company_logo_url || null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const onSubmit = async (data: EditCompanyFormData) => {
    if (isUploadingImage) {
      toast.info("Please wait for the logo upload to finish before updating.");
      return;
    }
    const countryData = countries[data.isoCountryCode as keyof typeof countries];
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
        onSuccess: async () => {
          toast.info("Company profile updated successfully!");

          // Fetch fresh user profile to update sidebar
          const freshUser = await fetchUserProfile();
          if (freshUser) {
            setUser(freshUser);
          }

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
    setIsUploadingImage(true);
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
    } finally {
      setIsUploadingImage(false);
    }
  };

  const isPending = isUpdating || isUploadingImage;

  return (
    <div className="fixed inset-0 z-60 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-4xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition cursor-pointer"
        >
          <CircleX size={28} />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Company Information</h2>

        <div className="flex items-center gap-4 mb-8">
          <div className="relative w-20 h-20">
            <Image
              src={companyLogo || company.company_logo_url || "/images/image.png"}
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

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Company Name" {...register("name")} error={errors.name} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
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
                      label: `${i.name} (${i.sector.name})`,
                    }))}
                    value={
                      selectedOption
                        ? {
                            value: selectedOption.id,
                            label: `${selectedOption.name} (${selectedOption.sector?.name})`,
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
              <p className="text-red-500 text-sm mt-1">{errors.industryId.message}</p>
            )}
          </div>

          <FormField
            label="Email"
            type="email"
            {...register("contact_email")}
            error={errors.contact_email}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <Controller
              name="contact_phone"
              control={control}
              render={({ field }) => {
                const countryCode = (watch("isoCountryCode") ||
                  getInitialCountryCode()) as CountryCode;
                return (
                  <PhoneInput
                    {...field}
                    defaultCountry={countryCode}
                    className={`rounded-md border px-3 py-2 w-full focus-within:ring-2 [&_input]:border-none [&_input]:outline-none [&_input]:shadow-none [&_input]:bg-transparent ${
                      errors.contact_phone
                        ? "border-red-500"
                        : "border-gray-300 focus-within:ring-green-500"
                    }`}
                    labels={en}
                  />
                );
              }}
            />
            {errors.contact_phone && (
              <p className="text-red-500 text-sm mt-1">{errors.contact_phone.message}</p>
            )}
          </div>

          <FormField label="Website" {...register("website")} error={errors.website} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <Controller
              name="isoCountryCode"
              control={control}
              render={({ field }) => {
                // Ensure we always have a valid country code
                const currentValue = field.value || getInitialCountryCode();
                const selectedCountry = currentValue ? currentValue.toUpperCase() : "";

                return (
                  <ReactFlagsSelect
                    selected={selectedCountry}
                    onSelect={(code) => {
                      const upperCode = code.toUpperCase();
                      field.onChange(upperCode);
                      // Only clear phone if country actually changed
                      if (upperCode !== selectedCountry) {
                        setValue("contact_phone", "");
                      }
                    }}
                    searchable
                    placeholder="Select your country"
                    fullWidth
                    showSelectedLabel
                    showOptionLabel
                    className="w-full"
                    selectButtonClassName={`w-full h-12 rounded-lg border px-3 text-left ${
                      errors.isoCountryCode ? "border-red-500" : "border-neutral-200"
                    }`}
                  />
                );
              }}
            />

            {errors.isoCountryCode && (
              <p className="text-red-500 text-sm mt-1">{errors.isoCountryCode.message}</p>
            )}
          </div>

          <FormField label="Platform Users Count" value={companyUsersCount} disabled />

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
              className="border bg-white border-primary  text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50 cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary  hover:bg-teal-600 text-white px-6 py-2 rounded-md text-sm cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Please wait..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
