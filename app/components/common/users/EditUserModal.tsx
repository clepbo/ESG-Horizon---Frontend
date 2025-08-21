"use client";
import { useState, useEffect } from "react";
import { CircleX, Info } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import PhotoUploadButton from "./PhotoUploadButton";
import BackButton from "../../ui/reusables/BackButton";
import { User } from "@/services/user.service";
import { companyService } from "@/services/company.service";
import { toast } from "react-toastify";

interface EditUserModalProps {
    user: User;
    onClose: () => void;
    onSave: (updatedUser: User) => void;
}

export default function EditUserModal({
    user,
    onClose,
    onSave,
}: EditUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState(user.first_name || "");
    const [lastName, setLastName] = useState(user.last_name || "");
    const [email, setEmail] = useState(user.email || "");
    const [phoneNumber, setPhoneNumber] = useState(user.phone_number || "");
    const [roleName, setRoleName] = useState(user.role?.name || "");
    const [userImage, setUserImage] = useState<string | null>(null);

    useEffect(() => {
        setFirstName(user.first_name || "");
        setLastName(user.last_name || "");
        setEmail(user.email || "");
        setPhoneNumber(user.phone_number || "");
        setRoleName(user.role?.name || "");
        setUserImage(null);
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const updatedUser: User = {
                ...user,
                first_name: firstName,
                last_name: lastName,
                email,
                phone_number: phoneNumber,
                role: { ...user.role, name: roleName },
                profile_photo_url: userImage || user.profile_photo_url,
            };

            const savedUser = await companyService.editUser(
                updatedUser.id,
                updatedUser
            );
            toast.info("User updated successfully");
            onSave(savedUser);
            onClose();
        } catch (error) {
            console.error("Failed to update user:", error);
            alert("Failed to update user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
            <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-5xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition"
                >
                    <CircleX size={28} />
                </button>

                <BackButton />

                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Personal Information
                </h2>

                {/* Avatar + Upload */}
                <div className="flex items-center gap-4 mb-8 relative w-max">
                    <Image
                        src={
                            userImage ||
                            user.profile_photo_url ||
                            "/images/image.png"
                        }
                        alt="User Avatar"
                        width={72}
                        height={72}
                        className="rounded-full object-cover border border-gray-200"
                        unoptimized
                    />
                    <PhotoUploadButton
                        onUpload={(file) => {
                            const imageUrl = URL.createObjectURL(file);
                            setUserImage(imageUrl);
                        }}
                    />
                </div>

                {/* Editable Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="First Name"
                        value={firstName}
                        onChange={setFirstName}
                        required
                    />
                    <InputField
                        label="Last Name"
                        value={lastName}
                        onChange={setLastName}
                        required
                    />
                    <InputField
                        label="Email"
                        value={email}
                        onChange={setEmail}
                        required
                    />
                    <InputField
                        label="Phone Number"
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        required
                    />
                    <InputField
                        label="Role"
                        value={roleName}
                        onChange={setRoleName}
                        required
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 mt-10">
                    <button
                        onClick={onClose}
                        className="border border-green-300 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-green-500 text-white px-6 py-2 rounded-md text-sm hover:bg-green-600"
                    >
                        {loading ? "Saving.." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function InputField({
    label,
    value,
    onChange,
    required = false,
    info,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    info?: string;
}) {
    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
                <label className="flex items-center text-sm font-medium text-gray-800 mb-1">
                    <span>{label}</span>
                    {info ? (
                        <div className="group relative ml-1 cursor-pointer">
                            <Info className="w-4 h-4 text-gray-500" />
                            <div className="absolute left-5 top-1 z-10 hidden w-max rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
                                {info}
                            </div>
                        </div>
                    ) : required ? (
                        <span className="ml-1 text-red-500">*</span>
                    ) : null}
                </label>
            </div>

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={clsx(
                    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition",
                    "text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-esg-green",
                    "hover:shadow-sm"
                )}
            />
        </div>
    );
}
