"use client";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/app/components/ui/button";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { FormField } from "@/app/components/ui/reusables/FormFields";
import { industriesService } from "@/services/industries.services";
import Select from "react-select";
import PhoneInput from "react-phone-number-input";
import type { CountryCode } from "libphonenumber-js";
import "react-phone-number-input/style.css";
import ReactFlagsSelect from "react-flags-select";
import { parsePhoneNumberWithError } from "libphonenumber-js";

const organizationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(1, "Please select your industry"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z
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
  website: z.string().url("Please enter a valid website URL").or(z.string().min(0)),
  registrationNumber: z.string().optional(),
  isoCountryCode: z.string().min(2, "Country is required"),
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
    control,
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      isoCountryCode: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState<CountryCode | undefined>(undefined);

  const [isTransitioning, setIsTransitioning] = useState(false);
  // const [industries, setIndustries] = useState<Industry[]>([]);
  const [industryOptions, setIndustryOptions] = useState<{ value: number; label: string }[]>([]);

  // --- Auto-detect country from browser ---
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const code = (data?.country_code as CountryCode) || "NG";
        setCountry(code);
        setValue("isoCountryCode", code);
      })
      .catch(() => {
        setCountry("US");
        setValue("isoCountryCode", "NG");
      });
  }, [setValue]);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const data = await industriesService.getIndustries();
        setIndustryOptions(
          data.map((i) => ({
            value: i.id,
            label: `${i.industry} (${i.sector})`,
          }))
        );
      } catch (error) {
        console.error("Failed to load industries:", error);
      }
    };
    fetchIndustries();
  }, []);

  const onSubmit = async (data: OrganizationFormData) => {
    setLoading(true);

    try {
      await onNext(data);
      setIsTransitioning(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Submission failed";
      toast.error(errorMessage);
      setError("root", { message: errorMessage });
      setIsTransitioning(false);
    } finally {
      //   setLoading(false);
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

          <Controller
            name="industry"
            control={control}
            render={({ field }) => {
              const selectedOption =
                industryOptions.find((opt) => opt.value === Number(field.value)) || null;

              return (
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <Select
                    placeholder="Select an industry"
                    options={industryOptions}
                    value={selectedOption}
                    onChange={(option) => field.onChange(option?.value.toString() ?? "")}
                    isClearable
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderColor: "#d1d5db",
                        boxShadow: "none",
                        "&:hover": {
                          borderColor: "#9ca3af",
                        },
                        borderRadius: "0.375rem",
                        minHeight: "3rem",
                      }),
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 9999,
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: "#6b7280",
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: "#111827",
                      }),
                    }}
                  />
                  {errors.industry && (
                    <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Company Email"
            required
            type="email"
            {...register("contactEmail")}
            error={errors.contactEmail}
            placeholder="info@company.com"
          />
          <div>
            <label className="block text-sm font-medium mb-1">
              Company Phone <span className="text-red-500">*</span>
            </label>
            <Controller
              name="contactPhone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  defaultCountry={country}
                  international
                  withCountryCallingCode
                  className={`w-full rounded-lg border px-3 py-2 text-base [&>input]:outline-none ${
                    errors.contactPhone
                      ? "border-red-500"
                      : "border-neutral-500 focus:outline-none focus:ring-primary"
                  }`}
                />
              )}
            />
            {errors.contactPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
            )}
          </div>
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
            {...register("registrationNumber")}
            // error={errors.registrationNumber}
            placeholder="CAC Registration Number"
          />
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="isoCountryCode"
            control={control}
            render={() => (
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <ReactFlagsSelect
                  selected={watch("isoCountryCode") || ""}
                  onSelect={(code) => {
                    setValue("isoCountryCode", code);
                    setCountry(code as CountryCode);
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
                      : "border-neutral-200 focus:outline-none"
                  }`}
                />
                {errors.isoCountryCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.isoCountryCode.message}</p>
                )}
              </div>
            )}
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
          className="w-full h-12 hover:cursor-pointer bg-[var(--color-primary)]  hover:bg-teal-700 text-white rounded-lg font-medium"
          disabled={loading || isTransitioning}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </div>
          ) : isTransitioning ? (
            "Redirecting..."
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </div>
  );
};
