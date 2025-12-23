"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { months } from "@/data/data";
import { newTradeFormSchema } from "@/zodSchema/schema";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
} from "../ui/select";
import { CustomFieldsSection } from "./CustomFieldsSection";

interface OpenDetailsTabProps {
    form: UseFormReturn<z.infer<typeof newTradeFormSchema>>;
    openDate: Date | undefined;
    setOpenDate: (date: Date | undefined) => void;
    symbolLabels: string[];
    day?: dayjs.Dayjs | undefined;
    userFieldNames: string[];
    onFieldNamesChange?: () => void;
}

export const OpenDetailsTab = ({
    form,
    openDate,
    setOpenDate,
    symbolLabels,
    day,
    userFieldNames,
    onFieldNamesChange
}: OpenDetailsTabProps) => {
    const { register, control, setValue, formState: { errors } } = form;

    return (
        <div className="flex flex-col gap-4">
            {/* Date and Time Section */}
            <div className="border border-zinc-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-700 mb-3">When did you open?</h3>
                <div className="flex gap-4">
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="open-date" className="text-sm text-zinc-600">
                                Date
                            </Label>
                            {errors.openDate && (
                                <span className="text-xs text-red-500">
                                    {errors.openDate.message}
                                </span>
                            )}
                        </div>

                        {day == undefined ? (
                            <Controller
                                name="openDate"
                                control={control}
                                render={({ field }) => (
                                    <Popover modal={true}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className="justify-start text-left font-normal text-sm">
                                                <CalendarIcon className="h-4 w-4" />
                                                {openDate ? (
                                                    format(openDate, "dd MMM yyyy")
                                                ) : (
                                                    <span className="text-zinc-400">Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Calendar
                                                mode="single"
                                                selected={openDate}
                                                onSelect={(date) => {
                                                    setOpenDate(date);
                                                    field.onChange(date?.toISOString());
                                                }}
                                                defaultMonth={new Date()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                        ) : (
                            <Input
                                disabled
                                className="text-sm"
                                placeholder={`${day.date()} ${months[day.month()].slice(0, 3)} ${day.year()}`}
                            />
                        )}
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="open-time" className="text-sm text-zinc-600">
                                Time
                            </Label>
                            <span className="text-xs text-zinc-400">
                                (optional)
                            </span>
                        </div>
                        <Input
                            type="time"
                            id="open-time"
                            className="w-full text-sm"
                            {...register("openTime")}
                        />
                    </div>
                </div>
            </div>

            {/* Trade Info Section */}
            <div className="border border-zinc-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-700 mb-3">Trade details</h3>
                
                {/* Symbol Name */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="symbolName" className="text-sm text-zinc-600">
                            Symbol
                        </Label>
                        {errors.symbolName ? (
                            <span className="text-xs text-red-500">
                                {errors.symbolName.message}
                            </span>
                        ) : (
                            <span className="text-xs text-zinc-400">
                                e.g. BTC, AAPL
                            </span>
                        )}
                    </div>
                    <Controller
                        name="symbolName"
                        control={control}
                        render={({ field }) => (
                            <div className="flex gap-2">
                                <Input
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Type symbol"
                                    type="text"
                                    className="w-2/3 text-sm"
                                />
                                <Select onValueChange={field.onChange}>
                                    <SelectTrigger className="w-1/3 text-sm">
                                        <div className="text-zinc-400">
                                            Or select
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {symbolLabels.map((label) => (
                                                <SelectItem key={label} value={label}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />
                </div>

                {/* Position Type */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <Label className="text-sm text-zinc-600">Position</Label>
                        {errors.positionType ? (
                            <span className="text-xs text-red-500">
                                {errors.positionType.message}
                            </span>
                        ) : (
                            <span className="text-xs text-zinc-400">
                                Click to toggle
                            </span>
                        )}
                    </div>
                    <Controller
                        name="positionType"
                        control={control}
                        render={({ field }) => (
                            <div
                                className={`h-[40px] ${field.value === "buy" ? "bg-buy" : "bg-sell"
                                    } rounded-md cursor-pointer flex items-center justify-center transition-colors`}
                                onClick={() =>
                                    field.value === "buy"
                                        ? setValue("positionType", "sell")
                                        : setValue("positionType", "buy")
                                }>
                                <p className="text-white font-medium text-sm">
                                    {field.value === "buy" ? "Buy (Long)" : "Sell (Short)"}
                                </p>
                            </div>
                        )}
                    />
                </div>

                {/* Entry Price and Quantity */}
                <div className="flex gap-4">
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="entryPrice" className="text-sm text-zinc-600">
                                Entry price
                            </Label>
                            {errors.entryPrice && (
                                <span className="text-xs text-red-500">
                                    {errors.entryPrice.message}
                                </span>
                            )}
                        </div>
                        <Input
                            type="number"
                            id="entryPrice"
                            step="any"
                            placeholder="0.00"
                            className="w-full text-sm"
                            {...register("entryPrice")}
                        />
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="quantity" className="text-sm text-zinc-600">
                                Quantity
                            </Label>
                            {errors.quantity && (
                                <span className="text-xs text-red-500">
                                    {errors.quantity.message}
                                </span>
                            )}
                        </div>
                        <Input
                            type="number"
                            id="quantity"
                            step="any"
                            placeholder="0"
                            className="w-full text-sm"
                            {...register("quantity")}
                        />
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="border border-zinc-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-zinc-700">
                        Notes
                    </Label>
                    <span className="text-xs text-zinc-400">
                        optional
                    </span>
                </div>
                <textarea
                    id="notes"
                    rows={2}
                    placeholder="Add any notes about this trade..."
                    className="w-full outline-none rounded-md border border-zinc-200 px-3 py-2 resize-none text-sm focus:border-zinc-400 transition-colors"
                    {...register("notes")}
                />
            </div>

            {/* Custom Fields Section */}
            <CustomFieldsSection 
                form={form} 
                fieldKey="openOtherDetails"
                userFieldNames={userFieldNames}
                onFieldNamesChange={onFieldNamesChange}
            />
        </div>
    );
};