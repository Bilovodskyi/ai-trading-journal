"use client";

import { useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { newTradeFormSchema } from "@/zodSchema/schema";

type FormType = z.infer<typeof newTradeFormSchema>;

function toNum(value?: string): number | undefined {
    if (value == null) return undefined;
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
}

export function useAutoCalcResult(form: UseFormReturn<FormType>) {
    const { watch, setValue, getValues } = form;

    const entryPrice = watch("entryPrice");
    const sellPrice = watch("sellPrice");
    const quantitySold = watch("quantitySold");
    const quantity = watch("quantity");
    const positionType = watch("positionType");

    // Track if user has manually modified the result
    const userModifiedResultRef = useRef<boolean>(false);
    // Debounce timer reference
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reset user modified flag when closing fields change
    const resetUserModified = () => {
        userModifiedResultRef.current = false;
    };

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }

        // If user has manually modified the result, don't auto-calculate
        if (userModifiedResultRef.current) {
            return;
        }

        debounceRef.current = setTimeout(() => {
            const entry = toNum(entryPrice);
            const exit = toNum(sellPrice);
            
            // Use quantitySold if available, otherwise fall back to quantity
            let qty = toNum(quantitySold);
            if (qty == null) {
                qty = toNum(quantity);
            }

            // Only calculate if all three values are present
            if (entry == null || exit == null || qty == null) {
                return;
            }

            // Calculate result: (sellPrice - entryPrice) * quantitySold
            // For buy positions: positive when sell > entry (profit)
            // For sell positions: positive when entry > sell (profit on short)
            const priceDiff = exit - entry;
            const multiplier = positionType === "buy" ? 1 : -1;
            const result = priceDiff * qty * multiplier;

            // Round to 2 decimal places
            const resultStr = result.toFixed(2);
            const currentResult = getValues("result");
            
            if (currentResult !== resultStr) {
                setValue("result", resultStr, { shouldDirty: true, shouldValidate: true });
            }
        }, 300); // Reduced debounce for faster feedback

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [entryPrice, sellPrice, quantitySold, quantity, positionType, setValue, getValues]);

    return {
        setUserModifiedResult: () => {
            userModifiedResultRef.current = true;
        },
        resetUserModified,
    };
}

export default useAutoCalcResult;
