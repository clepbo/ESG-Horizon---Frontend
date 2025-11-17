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

export default function ReportPage() {
  return (
    <section className="grid ">
      <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4 my-4">
        <SearchInput
          placeholder="Search Reports..."
          value={""}
          onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
            throw new Error(`Function not implemented. ${e}`);
          }}
        />

        <Select>
          <SelectTrigger className="">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
              <SelectItem value="grapes">Grapes</SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="col-span-2">
          <DateRangeInput />
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
