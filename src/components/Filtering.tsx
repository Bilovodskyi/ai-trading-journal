"use client";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import {
    setFilteredTrades,
    setSortBy,
    setTimeframe,
    setActiveTab,
} from "@/redux/slices/historyPageSlice";
import { CustomButton } from "./CustomButton";
import { DatePickerWithRange } from "./history/DatePicker";
import { DateRange } from "react-day-picker";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export default function Filtering({
    isStatisticsPage,
}: {
    isStatisticsPage: boolean;
}) {
    const [instrumentLabels, setInstrumentLabels] = useState<string[]>([]);
    const [removedItems, setRemovedItems] = useState<string[]>([]);

    const [dateRange, setDateRange] = useState<DateRange | null>(null);

    const trades = useAppSelector((state) => state.tradeRecords.listOfTrades);
    const sortBy = useAppSelector((state) => state.history.sortBy);
    const timeframe = useAppSelector((state) => state.history.timeframe);
    const activeTab = useAppSelector((state) => state.history.activeTab);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (trades) {
            setInstrumentLabels([
                ...new Set(
                    trades
                        .map(t => t.symbolName?.trim())
                        .filter((s): s is string => typeof s === "string" && s.trim() !== "")
                ),
            ])
        }
        dispatch(setFilteredTrades(trades));
    }, [trades]);

    useEffect(() => {
        if (!trades || trades.length === 0) return;

        if (dateRange === null) {
            if (trades) {
                setInstrumentLabels([
                    ...new Set(
                        trades
                            .map(t => t.symbolName?.trim())
                            .filter((s): s is string => typeof s === "string" && s.trim() !== "")
                    ),
                ])
            }
            setRemovedItems([]);
            dispatch(setFilteredTrades(trades));
            return;
        }

        const filteredTrades = trades.filter((trade) => {
            if (dateRange?.from === undefined || dateRange?.to === undefined || trade.closeDate === undefined)
                return;
            const closeDate = new Date(trade.closeDate);

            return (
                closeDate.getTime() >= dateRange.from.getTime() &&
                closeDate.getTime() <= dateRange.to.getTime()
            );
        });

        const newLabels = [
            ...new Set(filteredTrades.map((t) => t.symbolName).filter((s): s is string => typeof s === "string" && s.trim() !== "")),
        ];

        setInstrumentLabels(newLabels);
        setRemovedItems([]);
        dispatch(setFilteredTrades(filteredTrades));
    }, [trades, dateRange]);

    const removeInstrumentFromList = (instrument: string) => {
        const updatedLabels = instrumentLabels.filter(
            (item) => item !== instrument
        );
        setInstrumentLabels(updatedLabels);
        setRemovedItems((prev) => [...prev, instrument]);

        const filtered = (trades ?? []).filter((trade) => {
            const sym = trade.symbolName?.trim();
            if (!sym || !updatedLabels.includes(sym)) return false;

            if (!dateRange?.from || !dateRange.to || !trade.closeDate) return true;

            const closeDate = new Date(trade.closeDate).getTime();
            return (
                closeDate >= dateRange.from.getTime() &&
                closeDate <= dateRange.to.getTime()
            );
        });
        dispatch(setFilteredTrades(filtered));
    };

    const addInstrumentToTheList = (instrument: string) => {
        const updatedLabels = [...instrumentLabels, instrument];
        setInstrumentLabels(updatedLabels);
        setRemovedItems((prev) => prev.filter((item) => item !== instrument));
        const filtered = trades?.filter((trade) => {
            const sym = trade.symbolName?.trim();
            if (!sym || !updatedLabels.includes(sym)) return false;

            if (!dateRange?.from || !dateRange.to || trade.closeDate === undefined) return true;

            const closeDate = new Date(trade.closeDate).getTime();
            return (
                closeDate >= dateRange.from.getTime() &&
                closeDate <= dateRange.to.getTime()
            );
        });
        dispatch(setFilteredTrades(filtered));
    };
    return (
        <div className="px-3 md:px-6 flex max-md:flex-col max-md:gap-3 items-center justify-between py-3 md:py-1 2xlpy-2 border-b border-zinc-200 max-md:overflow-hidden">
            <div
                className={`flex gap-2 w-full ${isStatisticsPage ? "w-full" : "md:w-1/2"
                    } md:flex-wrap overflow-auto p-1`}>
                {removedItems.length > 0 && (
                    <Select
                        onValueChange={(value) =>
                            addInstrumentToTheList(value)
                        }>
                        <SelectTrigger className="md:w-[160px]">
                            <SelectValue placeholder="Add instrument" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {removedItems.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                )}
                {instrumentLabels.map((instrument) => (
                    <CustomButton key={instrument} isBlack={false}>
                        <div
                            onClick={() => removeInstrumentFromList(instrument)}
                            className="flex gap-1 items-center text-[.85rem]">
                            {instrument}
                            <IoClose className="text-[1rem]" />
                        </div>
                    </CustomButton>
                ))}
            </div>

            {!isStatisticsPage && (
                <div className="flex max-md:flex-col gap-2 md:gap-4 max-md:w-full">
                    <div className="flex items-center">
                        <Tabs
                            value={activeTab === "openTrades" ? "open-trades" : "close-trades"}
                            onValueChange={(value) =>
                                dispatch(setActiveTab(value === "open-trades" ? "openTrades" : "closedTrades"))
                            }>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="open-trades">Open</TabsTrigger>
                                <TabsTrigger value="close-trades">Closed</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <DatePickerWithRange
                        setDateRangeForFiltering={setDateRange}
                    />
                    <div className="flex items-center max-md:justify-between gap-4">
                        <Select
                            value={sortBy}
                            onValueChange={(value) =>
                                dispatch(setSortBy(value))
                            }>
                            <SelectTrigger className="max-md:flex-1 md:w-[120px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="symbolName">
                                        Symbol
                                    </SelectItem>
                                    <SelectItem value="positionType">
                                        Type
                                    </SelectItem>
                                    <SelectItem value="closeDate">
                                        Close date
                                    </SelectItem>
                                    <SelectItem value="openDate">
                                        Open date
                                    </SelectItem>
                                    <SelectItem value="result">
                                        Result
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select
                            value={timeframe}
                            onValueChange={(value) =>
                                dispatch(setTimeframe(value))
                            }>
                            <SelectTrigger className="max-md:flex-1 md:w-[120px]">
                                <SelectValue placeholder="All history" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="thisWeek">
                                        Last 7 days
                                    </SelectItem>
                                    <SelectItem value="thisMonth">
                                        This month
                                    </SelectItem>
                                    <SelectItem value="allHistory">
                                        All history
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    );
}
