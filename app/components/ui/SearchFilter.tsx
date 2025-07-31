"use client";

import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";
import { Fragment } from "react";

type SelectFilterProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

export default function SelectFilter({
  value,
  onChange,
  options,
}: SelectFilterProps) {
  return (
    <div className="relative w-[140px] text-sm cursor-pointer">
      <Listbox value={value} onChange={onChange}>
        {({ open }: { open: boolean }) => (
          <div className="relative">
            <Listbox.Button className="w-full bg-white rounded-md py-2 pl-3 pr-9 text-left shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary relative">
              {value}
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                {open ? (
                  <ChevronUp className="w-4 h-4 transition-transform duration-200" />
                ) : (
                  <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                )}
              </span>
            </Listbox.Button>

            <Transition
              as={Fragment}
              show={open}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-gray-200 overflow-auto focus:outline-none">
                {options.map((option) => (
                  <Listbox.Option
                    key={option}
                    value={option}
                    className={({ active }: { active: boolean }) =>
                      clsx(
                        "cursor-pointer select-none px-4 py-2",
                        active ? "bg-gray-100 text-black" : "text-gray-900"
                      )
                    }
                  >
                    {option}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  );
}
