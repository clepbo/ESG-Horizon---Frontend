

import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function SuccessModal({ isOpen, onClose, onContinue }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-primary text-white">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16" />
          </div>
          <DialogTitle className="text-2xl font-semibold text-center">
            Your Emission Target Has Been
          </DialogTitle>
          <DialogDescription className="text-xl font-semibold text-center text-white">
            Set Successfully!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center pt-4">
          <CustomButton
            onClick={onContinue}
            className="px-8 py-2 bg-white text-primary"
          >
            Continue
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}