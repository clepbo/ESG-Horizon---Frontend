import { useEffect, useState, useCallback, useMemo } from "react";

export function useFormattedNumber(initialValue: string | number = "") {
  const [rawValue, setRawValue] = useState(String(initialValue));
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (!rawValue) {
      setDisplayValue("");
    } else {
      // If input ends with a decimal point or is just a decimal point, show as-is
      if (rawValue.endsWith(".") || rawValue === ".") {
        setDisplayValue(rawValue);
      } else {
        const num = Number(rawValue);
        if (!isNaN(num)) {
          // For decimal numbers, preserve them; for whole numbers, add commas
          if (rawValue.includes(".")) {
            const [whole, decimal] = rawValue.split(".");
            const formattedWhole = new Intl.NumberFormat("en-US").format(Number(whole));
            setDisplayValue(`${formattedWhole}.${decimal}`);
          } else {
            setDisplayValue(new Intl.NumberFormat("en-US").format(num));
          }
        }
      }
    }
  }, [rawValue]);

  const handleChange = useCallback((input: string) => {
    const stripped = input.replace(/,/g, "");
    if (/^\d*\.?\d*$/.test(stripped)) {
      setRawValue(stripped);
    }
  }, []);

  return useMemo(
    () => ({ rawValue, displayValue, handleChange, setRawValue }),
    [rawValue, displayValue, handleChange]
  );
}
