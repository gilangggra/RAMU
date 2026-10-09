"use client";

import React, { forwardRef, useState } from "react";
import { formatCurrencyInput, normalizeCurrencyOnBlur, parseCurrencyToNumber } from "@/lib/currency";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onValueChange?: (formatted: string, numeric: number) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onBlur,
      onValueChange,
      placeholder = "Rp 2.500.000",
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalVal, setInternalVal] = useState(
      defaultValue !== undefined ? formatCurrencyInput(defaultValue) : ""
    );

    const currentValue = isControlled ? value : internalVal;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const formatted = formatCurrencyInput(raw);
      if (!isControlled) {
        setInternalVal(formatted);
      }
      if (onChange) {
        onChange(formatted);
      }
      if (onValueChange) {
        onValueChange(formatted, parseCurrencyToNumber(formatted));
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const formatted = normalizeCurrencyOnBlur(raw);
      if (!isControlled && raw !== formatted) {
        setInternalVal(formatted);
      }
      if (raw !== formatted && onChange) {
        onChange(formatted);
        if (onValueChange) {
          onValueChange(formatted, parseCurrencyToNumber(formatted));
        }
      }
      if (onBlur) {
        onBlur(e);
      }
    };

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={currentValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
