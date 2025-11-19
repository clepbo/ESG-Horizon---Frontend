import { useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import Reportcard from "@/app/components/common/reports/Reportcard";
import SearchInput from "@/app/components/ui/reusables/SearchInput";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import DateRangeInput from "./DateRangeInput";
import { CustomDateInput } from "./DateInput";

export default function ReportPage() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  return (
    <section className="grid ">
      <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4 my-4">
        <div className="col-span-2">
          <SearchInput
            placeholder="Search Reports..."
            value={""}
            onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
              throw new Error(`Function not implemented. ${e}`);
            }}
          />
        </div>

        <Select>
          <SelectTrigger className="w-auto rounded p-3 border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort by</SelectLabel>
              <SelectItem value="apple">Date(Newest/Oldest)</SelectItem>
              <SelectItem value="banana">Date(Oldest/Newest) </SelectItem>
              <SelectItem value="blueberry">Progress(Highest/Lowest) </SelectItem>
              <SelectItem value="blueberry">Progress(Lowest/Highest) </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className=" rounded border border-gray-300 flex items-center col-span-1 w-auto">
          {/* <DateRangeInput /> */}
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText=" Start Date"
            calendarIconClassName="text-gray-400"
            className={`${startDate ? "text-black" : "text-gray-400"} max-w-28`}
            showIcon
            onFocus={(e) => e.target.style.outline = 'none'}
            onBlur={(e) => e.target.style.outline = ''}
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText=" End Date"
            calendarIconClassName="text-gray-400"
            className={` ${endDate ? "text-black" : "text-gray-400"} max-w-28`}
            showIcon

            onFocus={(e) => e.target.style.outline = 'none'}
            onBlur={(e) => e.target.style.outline = ''}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Reportcard key={index} />
        ))}
      </div>
    </section>
  );
}
