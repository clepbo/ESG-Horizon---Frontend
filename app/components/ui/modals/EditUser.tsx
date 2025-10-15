"use client";

import { useState } from "react";
import { CircleX, Camera } from "lucide-react";
import Image from "next/image";
import { InputField } from "@/app/components/common/forms/FormField";
import { User, userService } from "@/services/user.service";
import { toast } from "react-toastify";
import { formatRoleName } from "@/lib/utils";
import { uploadService } from "@/services/upload.service";
import { useAuth } from "@/context/AuthContext";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import en from "react-phone-number-input/locale/en.json";

export default function EditUserModal({
    user,
    onClose,
    onUpdate,
}: {
    user: User;
    onClose: () => void;
    onUpdate: (updatedUser: User) => void;
}) {
    const [formData, setFormData] = useState<User>(user);
    const [userImage, setUserImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { setUser, fetchUserProfile } = useAuth();

    const [phoneNumber, setPhoneNumber] = useState<string | undefined>(
        user.phone_number
    );

    const handleChange = (field: keyof User, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const payload = {
                ...formData,
                profile_photo_url: userImage || formData.profile_photo_url,
                phone_number: phoneNumber,
            };
            await userService.editCurrent(payload as Partial<User>);
            const freshUser = await fetchUserProfile();
            if (freshUser) {
                setUser(freshUser);
                onUpdate(freshUser);
            }
            toast.success("Profile Updated Successfully!");
        } catch (error) {
            console.error("Error updating user profile:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
            <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-4xl">
                {/* Close Icon */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition cursor-pointer"
                >
                    <CircleX size={28} />
                </button>

                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Personal Information
                </h2>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative w-20 h-20">
                        <Image
                            src={
                                userImage ||
                                formData.profile_photo_url ||
                                "/images/image.png"
                            }
                            alt="User Avatar"
                            width={80}
                            height={80}
                            className="rounded-full object-cover border border-gray-200"
                        />
                        <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 border cursor-pointer hover:bg-gray-50">
                            <Camera className="w-4 h-4 text-gray-600" />
                            <input
                                type="file"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        try {
                                            setLoading(true); // show spinner

                                            // Upload file to backend → Cloudinary (via uploadService)
                                            const uploaded =
                                                await uploadService.uploadImage(
                                                    file
                                                );

                                            if (uploaded) {
                                                // Save Cloudinary URL in state
                                                setUserImage(uploaded.url);

                                                // Update formData so payload has correct image
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    profile_photo_url:
                                                        uploaded.url,
                                                }));

                                                toast.success(
                                                    "Image Added, Click Update to Continue"
                                                );
                                            } else {
                                                toast.error(
                                                    "Failed to upload profile photo. Please try again."
                                                );
                                            }
                                        } catch (err) {
                                            toast.error(
                                                "Failed to upload profile photo"
                                            );
                                            console.error(err);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }
                                }}
                            />
                        </label>
                    </div>
                    <span className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full">
                        {formatRoleName(formData.role?.name || "")}
                    </span>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="First Name"
                        value={formData.first_name}
                        onChange={(v) => handleChange("first_name", v)}
                    />
                    <InputField
                        label="Last Name"
                        value={formData.last_name}
                        onChange={(v) => handleChange("last_name", v)}
                    />
                    <InputField
                        label="Email"
                        value={formData.email}
                        onChange={(v) => handleChange("email", v)}
                        disabled={true}
                    />
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <PhoneInput
                            placeholder="Enter phone number"
                            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={phoneNumber}
                            onChange={(value) => setPhoneNumber(value)}
                            labels={en}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 mt-10">
                    <button
                        onClick={onClose}
                        className="border border-teal-500 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50 cursor-pointer"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="bg-[var(--color-primary)]  hover:bg-teal-600 text-white px-6 py-2 rounded-md text-sm  cursor-pointer disabled:opacity-50"
                    >
                        {loading ? "Please wait..." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
}
