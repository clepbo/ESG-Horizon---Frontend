import { Card } from "@/app/components/ui/card";
import React from "react";
import { FaArrowRight } from "react-icons/fa";

interface Props {
  title: string;
  pillar: string;
  score: React.ReactElement | string;
  amount: React.ReactElement | string;
  footer: string;
  icon: React.ReactElement;
  iconBg: string;
  iconText: string;
  borderColor: string;
  scoreBg?: string;
  scoreColor?: string;
}

export default function EsgAssignmrntReportCard({
  pillar,
  title,
  score,
  amount,
  footer,
  icon,
  iconBg,
  iconText,
  scoreBg,
  borderColor,
  scoreColor,
}: Props) {
  return (
    <Card
      className={`p-4 grid gap-4 border-t-2`}
      style={{
        borderTopColor: borderColor,
      }}
    >
      <div className="flex items-center justify-between w-full">
        <span
          className={` p-3 rounded-md`}
          style={{
            backgroundColor: iconBg,
            color: iconText,
          }}
        >
          {/* <FaLeaf className='text-green-600 text-2xl' /> */}
          {icon}
        </span>
        <FaArrowRight />
      </div>
      <h6 className=""> {pillar} </h6>
      <hr className="text-gray-200" />
      <div className="flex items-center justify-between">
        <text className="">{title}</text>
        <span
          className=" flex items-center gap-2 rounded-2xl text-sm p-1"
          style={{
            backgroundColor: scoreBg,
            color: scoreColor,
          }}
        >
          {/* <FaArrowDown /> */}
          {score}
        </span>
      </div>

      <h5 className="font-bold">{amount}</h5>
      <small className="">{footer}</small>
    </Card>
  );
}
