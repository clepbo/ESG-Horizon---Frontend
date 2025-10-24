import { useEffect, useState } from "react";

export function useFormattedNumber(initialValue: string | number = "") {
  const [rawValue, setRawValue] = useState(String(initialValue));
  const [displayValue, setDisplayValue] = useState("");

  // Format any time rawValue changes
  useEffect(() => {
    if (!rawValue) {
      setDisplayValue("");
    } else {
      const num = Number(rawValue);
      if (!isNaN(num)) {
        setDisplayValue(new Intl.NumberFormat("en-US").format(num));
      }
    }
  }, [rawValue]);

  const handleChange = (input: string) => {
    const stripped = input.replace(/,/g, "");
    if (/^\d*$/.test(stripped)) {
      setRawValue(stripped);
    }
  };

  return { rawValue, displayValue, handleChange, setRawValue };
}