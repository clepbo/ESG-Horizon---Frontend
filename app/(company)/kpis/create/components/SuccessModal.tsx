import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import CustomDialog from "@/app/components/ui/reusables/CustomDialog";

import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function SuccessModal({ isOpen, onClose, onContinue }: SuccessModalProps) {
  return (
    <CustomDialog open={isOpen} onOpenChange={onClose} title="">
      <div className="w-full bg-primary flex flex-col gap-3 text-white border-0 shadow-2xl overflow-hidden">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-16 w-16" />
          </div>
          <div className="text-2xl font-semibold text-center">Your Emission Target Has Been</div>
          <div className="text-xl font-semibold text-center text-white">Set Successfully!</div>
        </div>

        <div className="flex justify-center pt-4 pb-2">
          <CustomButton
            onClick={onContinue}
            className="px-8 bg-white text-primary hover:bg-gray-100 transition-colors"
          >
            Continue
          </CustomButton>
        </div>
      </div>
    </CustomDialog>
  );
}
