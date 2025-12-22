"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { newTradeFormSchema } from "@/zodSchema/schema";
import { CloseEvent } from "@/types/dbSchema.types";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { StarRating } from "../calendar/StarRating";
import { useAutoCalcResult } from "./hooks/useAutoCalcResult";
import { CustomFieldsSection } from "./CustomFieldsSection";

interface CloseDetailsTabProps {
    form: UseFormReturn<z.infer<typeof newTradeFormSchema>>;
    openDate: Date | undefined;
    closeDate: Date | undefined;
    setCloseDate: (date: Date | undefined) => void;
    userFieldNames: string[];
    onFieldNamesChange?: () => void;
    closeEvents?: CloseEvent[];
}

export const CloseDetailsTab = ({
    form,
    openDate,
    closeDate,
    setCloseDate,
    userFieldNames,
    onFieldNamesChange,
    closeEvents = []
}: CloseDetailsTabProps) => {
    const { register, control, formState: { errors }, setValue, watch } = form;
    
    // Auto-calculate result from entry/exit prices
    const { setUserModifiedResult } = useAutoCalcResult(form);
    
    // Watch values for UI display and validation
    const quantityValue = watch("quantity");
    const quantitySoldValue = watch("quantitySold");
    const closeDateValue = watch("closeDate");
    const resultValue = watch("result");

    // Calculate remaining quantity from closeEvents
    const originalQty = Number(quantityValue) || 0;
    const alreadySoldQty = closeEvents.reduce((sum, event) => sum + (event.quantitySold || 0), 0);
    const remainingQty = originalQty - alreadySoldQty;
    const hasPartialCloses = closeEvents.length > 0;

    // Prefill quantitySold with remaining quantity if empty
    useEffect(() => {
        const currentQuantitySold = watch("quantitySold");
        if ((!currentQuantitySold || currentQuantitySold.trim() === "") && remainingQty > 0) {
            setValue("quantitySold", String(remainingQty), { shouldDirty: false, shouldValidate: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remainingQty]);
    
    // Validate quantitySold doesn't exceed remaining quantity
    const quantitySoldNum = Number(quantitySoldValue) || 0;
    const isPartialClose = quantitySoldNum > 0 && quantitySoldNum < remainingQty;
    const exceedsQuantity = quantitySoldNum > remainingQty && remainingQty > 0;

    // Check if both closeDate and result are filled (for showing warning)
    const hasCloseDate = closeDateValue && closeDateValue.trim() !== "";
    const hasResult = resultValue && resultValue.trim() !== "";
    const missingFields = (hasCloseDate && !hasResult) || (!hasCloseDate && hasResult);

    return (
        <div className="flex flex-col gap-4">
            {/* Warning message about required fields */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="text-xs">
                    <p className="font-medium">To close this trade, you need both:</p>
                    <ul className="mt-1 space-y-0.5 list-disc list-inside text-amber-700">
                        <li>Close Date</li>
                        <li>Result (Profit/Loss)</li>
                    </ul>
                    {hasPartialCloses && (
                        <p className="mt-2 text-amber-600">
                            This trade has partial closes. Remaining: <span className="font-medium">{remainingQty}</span> units
                        </p>
                    )}
                </div>
            </div>

            {/* Date and Time Section */}
            <div className="border border-zinc-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-700 mb-3">When did you close?</h3>
                <div className="flex gap-4">
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="close-date" className="text-sm text-zinc-600">
                                Date
                            </Label>
                            {errors.closeDate && (
                                <span className="text-xs text-red-500">
                                    {errors.closeDate.message}
                                </span>
                            )}
                        </div>
                        <Controller
                            name="closeDate"
                            control={control}
                            render={({ field }) => (
                                <Popover modal={true}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className="justify-start text-left font-normal text-sm">
                                            <CalendarIcon className="h-4 w-4" />
                                            {closeDate ? (
                                                format(closeDate, "dd MMM yyyy")
                                            ) : (
                                                <span className="text-zinc-400">Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Calendar
                                            mode="single"
                                            selected={closeDate}
                                            onSelect={(date) => {
                                                setCloseDate(date);
                                                field.onChange(date?.toISOString());
                                                // If user picks a date but no closeTime set, default to 12:30
                                                const currentCloseTime = form.getValues("closeTime");
                                                if (!currentCloseTime || currentCloseTime.trim() === "") {
                                                    form.setValue("closeTime", "12:30");
                                                }
                                            }}
                                            disabled={
                                                openDate &&
                                                ((date) =>
                                                    date < new Date(openDate.toISOString()))
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="close-time" className="text-sm text-zinc-600">
                                Time
                            </Label>
                            <span className="text-xs text-zinc-400">
                                (optional)
                            </span>
                        </div>
                        <Input
                            type="time"
                            id="close-time"
                            className="w-full text-sm"
                            {...register("closeTime")}
                        />
                    </div>
                </div>
            </div>

            {/* Exit Details Section */}
            <div className="border border-zinc-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-700 mb-3">Exit details</h3>
                
                {/* Sell Price and Quantity Sold */}
                <div className="flex gap-4 mb-4">
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="sellPrice" className="text-sm text-zinc-600">
                                Exit price
                            </Label>
                            {errors.sellPrice && (
                                <span className="text-xs text-red-500">
                                    {errors.sellPrice.message}
                                </span>
                            )}
                        </div>
                        <Input
                            type="number"
                            id="sellPrice"
                            step="any"
                            placeholder="0.00"
                            className="w-full text-sm"
                            {...register("sellPrice")}
                        />
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="quantitySold" className="text-sm text-zinc-600">
                                Qty sold
                            </Label>
                            {errors.quantitySold ? (
                                <span className="text-xs text-red-500">
                                    {errors.quantitySold.message}
                                </span>
                            ) : exceedsQuantity ? (
                                <span className="text-xs text-orange-500">
                                    Exceeds qty
                                </span>
                            ) : isPartialClose ? (
                                <span className="text-xs text-blue-500 font-medium">
                                    Partial close
                                </span>
                            ) : (
                                <span className="text-xs text-zinc-400">
                                    (for partial)
                                </span>
                            )}
                        </div>
                        <Input
                            type="number"
                            id="quantitySold"
                            step="any"
                            placeholder="0"
                            className="w-full text-sm"
                            {...register("quantitySold")}
                        />
                    </div>
                </div>

                {/* Result - using Controller to properly handle value updates */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="result" className="text-sm text-zinc-600">
                            Profit / Loss
                        </Label>
                        {errors.result ? (
                            <span className="text-xs text-red-500">
                                {errors.result.message}
                            </span>
                        ) : (
                            <span className="text-xs text-zinc-400">
                                Auto-calculated
                            </span>
                        )}
                    </div>
                    <Controller
                        name="result"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="number"
                                id="result"
                                step="any"
                                className="w-full text-sm"
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                placeholder="+100 or -50"
                                onFocus={() => setUserModifiedResult()}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Rating Section */}
            <div className="border border-zinc-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="rating" className="text-sm font-medium text-zinc-700">
                        Rate this trade
                    </Label>
                    <span className="text-xs text-zinc-400">
                        optional
                    </span>
                </div>
                <StarRating setValue={setValue} rating={form.watch("rating")} />
            </div>

            {/* Custom Fields Section */}
            <CustomFieldsSection 
                form={form} 
                fieldKey="closeOtherDetails"
                userFieldNames={userFieldNames}
                onFieldNamesChange={onFieldNamesChange}
            />
        </div>
    );
};
