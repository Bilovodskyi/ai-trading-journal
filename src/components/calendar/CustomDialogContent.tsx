"use client";

import { DialogClose, DialogTitle, DialogHeader } from "../ui/dialog";

import { months } from "@/data/data";
import { CustomButton } from "../CustomButton";

import { format } from "date-fns";

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
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
    SelectValue,
} from "../ui/select";

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { zodResolver } from "@hookform/resolvers/zod";

import { Controller, useForm } from "react-hook-form";
import { newTradeFormSchema } from "@/zodSchema/schema";
import { z } from "zod";
import { createNewTradeRecord } from "@/server/actions/trades";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
    setMonthViewSummary,
    setTotalOfParticularYearSummary,
    setYearViewSummary,
    updateListOfTrades,
    updateTradeDetailsForEachDay,
} from "@/redux/slices/tradeRecordsSlice";
import { setIsDialogOpen } from "@/redux/slices/calendarSlice";

import { v4 as uuidv4 } from "uuid";
import { StarRating } from "./StarRating";

const priorityColors = {
    high: "bg-sellWithOpacity text-sell",
    medium: "bg-yellow-400 text-yellow-600 bg-opacity-50",
    low: "bg-buyWithOpacity text-buy",
};

export default function CustomDialogContent({
    day,
}: {
    day: dayjs.Dayjs | undefined;
}) {
    const [openDate, setOpenDate] = useState<Date>();
    const [closeDate, setCloseDate] = useState<Date>();
    const [instrumentLabels, setInstrumentLabels] = useState<string[]>([]);
    const [submittingNewTrade, setSubmittingNewTrade] = useState(false);
    const [selectedStrategyId, setSelectedStrategyId] = useState<string>("");
    const [checkedOpenRules, setCheckedOpenRules] = useState<string[]>([]);
    const [checkedCloseRules, setCheckedCloseRules] = useState<string[]>([]);

    const trades = useAppSelector((state) => state.tradeRecords.listOfTrades);
    const { strategies: localStrategies } = useAppSelector(
        (state) => state.strategies
    );

    const dispatch = useAppDispatch();

    // Helper functions for rule checkbox handling
    const handleOpenRuleToggle = (ruleId: string, rule: any) => {
        const updatedCheckedRules = checkedOpenRules.includes(ruleId)
            ? checkedOpenRules.filter(id => id !== ruleId)
            : [...checkedOpenRules, ruleId];

        setCheckedOpenRules(updatedCheckedRules);

        const selectedStrategy = localStrategies.find(s => s.id === selectedStrategyId);
        if (selectedStrategy) {
            const appliedRules = selectedStrategy.openPositionRules.filter(r =>
                updatedCheckedRules.includes(r.id)
            );
            setValue("appliedOpenRules", appliedRules);
        }
    };

    const handleCloseRuleToggle = (ruleId: string, rule: any) => {
        const updatedCheckedRules = checkedCloseRules.includes(ruleId)
            ? checkedCloseRules.filter(id => id !== ruleId)
            : [...checkedCloseRules, ruleId];

        setCheckedCloseRules(updatedCheckedRules);

        const selectedStrategy = localStrategies.find(s => s.id === selectedStrategyId);
        if (selectedStrategy) {
            const appliedRules = selectedStrategy.closePositionRules.filter(r =>
                updatedCheckedRules.includes(r.id)
            );
            setValue("appliedCloseRules", appliedRules);
        }
    };

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<z.infer<typeof newTradeFormSchema>>({
        resolver: zodResolver(newTradeFormSchema),
        defaultValues: {
            positionType: "buy",
            openDate: undefined,
            openTime: "12:30",
            closeDate: undefined,
            closeTime: "12:30",
            deposit: "",
            instrumentName: "",
            strategyName: "",
            strategyId: null,
            appliedOpenRules: [],
            appliedCloseRules: [],
            result: "",
            notes: "",
            rating: 0,
        },
    });

    async function onSubmit(newTrade: z.infer<typeof newTradeFormSchema>) {
        setSubmittingNewTrade(true);
        const customId = uuidv4();
        const data = await createNewTradeRecord(newTrade, customId);
        if (data?.error) {
            setSubmittingNewTrade(false);
            return toast.error("There was an error saving your event!");
        } else {
            const [stringDay, month, year] = new Date(newTrade.closeDate)
                .toLocaleDateString("en-GB")
                .split("/");
            const numericMonth = parseInt(month, 10);
            const convertedMonthView = `${stringDay}-${month}-${year}`;
            const convertedYearView = `${numericMonth}-${year}`;
            dispatch(
                setMonthViewSummary({
                    month: convertedMonthView,
                    value: Number(newTrade.result),
                })
            );
            dispatch(
                setYearViewSummary({
                    year: convertedYearView,
                    value: Number(newTrade.result),
                })
            );
            dispatch(
                setTotalOfParticularYearSummary({
                    year: year,
                    value: Number(newTrade.result),
                })
            );
            dispatch(
                updateListOfTrades({
                    id: customId,
                    ...newTrade,
                })
            );
            dispatch(
                updateTradeDetailsForEachDay({
                    date: convertedMonthView,
                    result: Number(newTrade.result),
                    value: 1,
                })
            );

            toast.success("A new record has been created!");
            const dayKey = day !== undefined ? day.format("DD-MM-YYYY") : "any";
            dispatch(setIsDialogOpen({ key: dayKey, value: false }));
            setSubmittingNewTrade(false);
        }
    }

    useEffect(() => {
        if (day) {
            const convertedDate = day.toDate().toISOString();
            setValue("closeDate", convertedDate);
        }
        setInstrumentLabels([
            ...new Set(trades?.map((trade) => trade.instrumentName)),
        ]);
    }, [day, trades]);

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="sm:max-w-[460px] flex flex-col">
            {/* <div className="w-full flex justify-center mb-2 max-md:hidden">
                <Image src="/logo.svg" alt="logo" width={40} height={40} />
            </div> */}
            <DialogHeader className="mb-6">
                <DialogTitle className="text-center text-[1.4rem]">
                    Add a New Trade
                </DialogTitle>

                {/* <DialogDescription className="bg-secondary px-4 py-2 rounded-xl max-md:hidden text-black">
                    Important! The more data you add, the better you can refine
                    your strategy, improve future outcomes, and enhance
                    AI-powered analysis.
                </DialogDescription> */}
            </DialogHeader>
            <Tabs defaultValue="account">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="strategy">Strategy</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="flex flex-col gap-2">
                    <div className="mb-2 flex gap-4">
                        <div className="flex flex-col flex-1 gap-1">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="close-time" className="mb-1">
                                    Open date:
                                </Label>
                                {errors.openDate && (
                                    <span className="mb-1 text-[.75rem] text-red-500">
                                        {errors.openDate.message}
                                    </span>
                                )}
                            </div>

                            <Controller
                                name="openDate"
                                control={control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className="justify-start text-left font-normal max-md:text-[.75rem]">
                                                <CalendarIcon />
                                                {openDate ? (
                                                    format(
                                                        openDate,
                                                        "dd MMM yyyy"
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Calendar
                                                mode="single"
                                                selected={openDate}
                                                onSelect={(date) => {
                                                    setOpenDate(date);
                                                    field.onChange(
                                                        date?.toISOString()
                                                    );
                                                }}
                                                disabled={
                                                    day &&
                                                    ((date) =>
                                                        date >
                                                        new Date(
                                                            day.toISOString()
                                                        ))
                                                }
                                                defaultMonth={
                                                    day
                                                        ? new Date(
                                                            day?.year(),
                                                            day?.month()
                                                        )
                                                        : new Date()
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                        </div>
                        <div className="flex flex-col flex-1 gap-1">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="open-time" className="mb-1">
                                    Open time:
                                </Label>
                                <span className="text-[.75rem] text-black/50">
                                    (default time)
                                </span>
                            </div>
                            <Input
                                type="time"
                                id="open-time"
                                className="w-full max-md:text-[.75rem]"
                                {...register("openTime")}
                            />
                        </div>
                    </div>
                    <div className="mb-2 flex gap-4">
                        <div className="flex flex-col flex-1 gap-1">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="close-time" className="mb-1">
                                    Close date:
                                </Label>
                                {errors.closeDate && (
                                    <span className="mb-1 text-[.75rem] text-red-500">
                                        {errors.closeDate.message}
                                    </span>
                                )}
                            </div>
                            {day == undefined ? (
                                <Controller
                                    name="closeDate"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className="justify-start text-left font-normal max-md:text-[.75rem]">
                                                    <CalendarIcon />
                                                    {closeDate ? (
                                                        format(
                                                            closeDate,
                                                            "dd MMM yyyy"
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <Calendar
                                                    mode="single"
                                                    selected={closeDate}
                                                    onSelect={(date) => {
                                                        setCloseDate(date);
                                                        field.onChange(
                                                            date?.toISOString()
                                                        );
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            ) : (
                                <Input
                                    disabled
                                    className="max-md:text-[.75rem]"
                                    placeholder={`${day.date()} ${months[
                                        day.month()
                                    ].slice(0, 3)} ${day.year()}`}
                                />
                            )}
                        </div>
                        <div className="flex flex-col flex-1 gap-1">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="close-time" className="mb-1">
                                    Close time:
                                </Label>
                                <span className="text-[.75rem] text-black/50">
                                    (default time)
                                </span>
                            </div>

                            <Input
                                type="time"
                                id="close-time"
                                className="w-full max-md:text-[.75rem]"
                                {...register("closeTime")}
                            />
                        </div>
                    </div>
                    <div className="mb-2 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="instrumentName" className="mb-1">
                                Instrument name or Symbol/Ticker:
                            </Label>

                            {errors.instrumentName ? (
                                <span className="mb-1 text-[.75rem] text-red-500">
                                    {errors.instrumentName.message}
                                </span>
                            ) : (
                                <span className="mb-1 text-[.75rem] text-black/50">
                                    (e.g. Bitcoin or BTC)
                                </span>
                            )}
                        </div>
                        <Controller
                            name="instrumentName"
                            control={control}
                            render={({ field }) => (
                                <div className="flex gap-2">
                                    <Input
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Type manually"
                                        type="text"
                                        className="w-2/3 max-md:text-[.75rem]"
                                    />
                                    <Select onValueChange={field.onChange}>
                                        <SelectTrigger className="w-1/3">
                                            <div className="text-zinc-500">
                                                Or select
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {instrumentLabels.map(
                                                    (label) => (
                                                        <SelectItem
                                                            key={label}
                                                            value={label}>
                                                            {label}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />
                    </div>
                    <div className="mb-2 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <Label className="mb-1">Position type:</Label>
                            {errors.positionType ? (
                                <span className="mb-1 text-[.75rem] text-red-500">
                                    {errors.positionType.message}
                                </span>
                            ) : (
                                <span className="mb-1 text-[.75rem] text-black/50">
                                    (Click to change)
                                </span>
                            )}
                        </div>
                        <Controller
                            name="positionType"
                            control={control}
                            render={({ field }) => (
                                <div
                                    className={`h-[40px] ${field.value === "buy"
                                        ? "bg-buy"
                                        : "bg-sell"
                                        } rounded-md cursor-pointer flex-center`}
                                    onClick={() =>
                                        field.value === "buy"
                                            ? setValue("positionType", "sell")
                                            : setValue("positionType", "buy")
                                    }>
                                    <p className="text-white">
                                        {field.value === "buy" ? "Buy" : "Sell"}
                                    </p>
                                </div>
                            )}
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="mb-2 flex flex-col flex-1 gap-1">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="deposit" className="mb-1">
                                    Deposit:
                                </Label>
                                {errors.deposit ? (
                                    <span className="mb-1 text-[.75rem] text-red-500">
                                        {errors.deposit.message}
                                    </span>
                                ) : (
                                    <span className="mb-1 text-[.75rem] text-black/50">
                                        (Only num.)
                                    </span>
                                )}
                            </div>
                            <Input
                                type="number"
                                id="deposit"
                                className="w-full max-md:text-[.75rem]"
                                {...register("deposit")}
                            />
                        </div>
                        <div className="mb-2 flex flex-col flex-1 gap-1">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="result" className="mb-1">
                                    Result:
                                </Label>
                                {errors.result ? (
                                    <span className="mb-1 text-[.75rem] text-red-500">
                                        {errors.result.message}
                                    </span>
                                ) : (
                                    <span className="mb-1 text-[.75rem] text-black/50">
                                        (Only num.)
                                    </span>
                                )}
                            </div>
                            <Input
                                type="number"
                                id="result"
                                className="w-full max-md:text-[.75rem]"
                                {...register("result")}
                            />
                        </div>
                    </div>

                    <div className="mb-2 flex flex-col gap-2">
                        <Label htmlFor="rating" className="mb-1">
                            Rate your trade:{" "}
                            <span className="ml-2 text-[.75rem] text-black/50">
                                (default 0)
                            </span>
                        </Label>
                        <StarRating setValue={setValue} />
                    </div>
                    <div className="mb-4 flex flex-col gap-1">
                        <Label htmlFor="notes" className="mb-1">
                            Notes (optional):
                        </Label>
                        <textarea
                            id="notes"
                            rows={2}
                            className="w-full outline-none rounded-md border border-zinc-200 px-3 py-1 resize-none text-[0.9rem]"
                            {...register("notes")}
                        />
                    </div>

                    <div className="flex gap-6 justify-end">
                        <DialogClose asChild>
                            <CustomButton isBlack={false}>Cancel</CustomButton>
                        </DialogClose>
                        <CustomButton
                            isBlack
                            type="submit"
                            disabled={submittingNewTrade}>
                            Add Trade
                        </CustomButton>
                    </div>
                </TabsContent>
                <TabsContent value="strategy">
                    <div className="mb-4 flex flex-col gap-1">
                        <Label htmlFor="strategyName" className="mb-1">
                            Strategy (optional):
                        </Label>
                        <Controller
                            name="strategyName"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        const selectedStrategy = localStrategies.find(s => s.strategyName === value);
                                        const strategyId = selectedStrategy?.id || "";
                                        setSelectedStrategyId(strategyId);
                                        setValue("strategyId", strategyId || null);
                                        // Reset checked rules when strategy changes
                                        setCheckedOpenRules([]);
                                        setCheckedCloseRules([]);
                                        setValue("appliedOpenRules", []);
                                        setValue("appliedCloseRules", []);
                                    }}
                                    value={field.value}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a strategy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {localStrategies.map((strategy) => (
                                                <SelectItem
                                                    key={strategy.id}
                                                    value={strategy.strategyName}>
                                                    {strategy.strategyName}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.strategyName && (
                            <p className="text-red-500 text-sm">
                                {errors.strategyName.message}
                            </p>
                        )}
                    </div>

                    {/* Display strategy rules when strategy is selected */}
                    {selectedStrategyId && (() => {
                        const selectedStrategy = localStrategies.find(s => s.id === selectedStrategyId);
                        if (!selectedStrategy) return null;

                        return (
                            <div className="mb-6 space-y-4 py-8">
                                {/* Open Position Rules */}
                                {selectedStrategy.openPositionRules.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-sm">
                                            Open Position Rules
                                        </h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead></TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Priority</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedStrategy.openPositionRules.map((rule) => (
                                                    <TableRow key={rule.id}>
                                                        <TableCell className="w-[5%]">
                                                            <Checkbox
                                                                checked={checkedOpenRules.includes(rule.id)}
                                                                onCheckedChange={() => handleOpenRuleToggle(rule.id, rule)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="w-[70%]">
                                                            {rule.rule}
                                                        </TableCell>
                                                        <TableCell className="w-[25%]">
                                                            <div
                                                                className={`${priorityColors[rule.priority]
                                                                    } px-3 p-1 rounded-lg w-fit flex-center`}>
                                                                &bull; {rule.priority}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}

                                {/* Close Position Rules */}
                                {selectedStrategy.closePositionRules.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-sm">
                                            Close Position Rules
                                        </h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead></TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Priority</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedStrategy.closePositionRules.map((rule) => (
                                                    <TableRow key={rule.id}>
                                                        <TableCell className="w-[5%]">
                                                            <Checkbox
                                                                checked={checkedCloseRules.includes(rule.id)}
                                                                onCheckedChange={() => handleCloseRuleToggle(rule.id, rule)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="w-[70%]">
                                                            {rule.rule}
                                                        </TableCell>
                                                        <TableCell className="w-[25%]">
                                                            <div
                                                                className={`${priorityColors[rule.priority]
                                                                    } px-3 p-1 rounded-lg w-fit flex-center`}>
                                                                &bull; {rule.priority}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <div className="flex gap-6 justify-end">
                        <DialogClose asChild>
                            <CustomButton isBlack={false}>Cancel</CustomButton>
                        </DialogClose>
                        <CustomButton
                            isBlack
                            type="submit"
                            disabled={submittingNewTrade}>
                            Add Trade
                        </CustomButton>
                    </div>
                </TabsContent>
            </Tabs>
        </form>
    );
}
