import { Card } from "@/app/components/ui/card";
import { IoShieldOutline } from "react-icons/io5";

export default function SocialStepFour() {
  return (
    <Card className="w-full shadow flex gap-4 p-4 border-0 justify-start items-start">
      <div className="mt-2">
        <span className="flex items-center rounded-md gap-2 bg-gray-100 w-fit p-2">
          <IoShieldOutline className="w-5 h-5" />
        </span>
      </div>

      <div className="w-full flex flex-col justify-start gap-4">
        <h6 className="py-2 "> Community Risk Management </h6>
        <p className="text-sm text-gray-500">
          Our community risk management process identifies potential social impacts early in the
          project lifecycle. We utilize a participatory approach to develop mitigation strategies,
          ensuring community voices are heared and respected.
        </p>
      </div>
    </Card>
  );
}
