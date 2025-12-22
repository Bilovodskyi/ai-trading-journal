"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

import { newTradeFormSchema } from "@/zodSchema/schema";
import { createNewTradeRecord, updateTradeRecord } from "@/server/actions/trades";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
    setMonthViewSummary,
    setTotalOfParticularYearSummary,
    setYearViewSummary,
    updateListOfTrades,
    updateTradeDetailsForEachDay,
    updateTradeInList,
} from "@/redux/slices/tradeRecordsSlice";
import { setIsDialogOpen } from "@/redux/slices/calendarSlice";
import { Trades } from "@/types";

interface UseTradeFormProps {
    editMode?: boolean;
    existingTrade?: Trades;
    day?: dayjs.Dayjs | undefined;
    onRequestClose?: () => void;
}

export const useTradeForm = ({ editMode = false, existingTrade, day, onRequestClose }: UseTradeFormProps) => {
    const [openDate, setOpenDate] = useState<Date>();
    const [closeDate, setCloseDate] = useState<Date>();
    const [symbolLabels, setSymbolLabels] = useState<string[]>([]);
    const [submittingTrade, setSubmittingTrade] = useState(false);
    const [selectedStrategyId, setSelectedStrategyId] = useState<string>("");
    const [checkedOpenRules, setCheckedOpenRules] = useState<string[]>([]);
    const [checkedCloseRules, setCheckedCloseRules] = useState<string[]>([]);

    const router = useRouter();
    const dispatch = useAppDispatch();
    const trades = useAppSelector((state) => state.tradeRecords.listOfTrades);
    const { strategies: localStrategies } = useAppSelector((state) => state.strategies);

    const form = useForm<z.infer<typeof newTradeFormSchema>>({
        resolver: zodResolver(newTradeFormSchema),
        defaultValues: editMode && existingTrade ? {
            positionType: existingTrade.positionType || "buy",
            openDate: existingTrade.openDate,
            openTime: existingTrade.openTime || "12:30",
            closeDate: existingTrade.closeDate || "",
            closeTime: existingTrade.closeTime || "",
            isActiveTrade: existingTrade.isActiveTrade ?? true,
            deposit: existingTrade.deposit || "",
            instrumentName: existingTrade.instrumentName || "",
            symbolName: existingTrade.symbolName || "",
            entryPrice: existingTrade.entryPrice || "",
            totalCost: existingTrade.totalCost || "",
            quantity: existingTrade.quantity || "",
            sellPrice: existingTrade.sellPrice || "",
            quantitySold: existingTrade.quantitySold || "",
            strategyName: existingTrade.strategyName || "",
            strategyId: existingTrade.strategyId || null,
            appliedOpenRules: existingTrade.appliedOpenRules || [],
            appliedCloseRules: existingTrade.appliedCloseRules || [],
            closeEvents: existingTrade.closeEvents || [],
            openOtherDetails: existingTrade.openOtherDetails || {},
            closeOtherDetails: existingTrade.closeOtherDetails || {},
            result: existingTrade.result || "",
            notes: existingTrade.notes || "",
            rating: existingTrade.rating || 0,
        } : {
            positionType: "buy",
            openDate: undefined,
            openTime: "12:30",
            closeDate: "",
            closeTime: "",
            isActiveTrade: true,
            deposit: "",
            instrumentName: "",
            symbolName: "",
            entryPrice: "",
            totalCost: "",
            quantity: "",
            sellPrice: "",
            quantitySold: "",
            strategyName: "",
            strategyId: null,
            appliedOpenRules: [],
            appliedCloseRules: [],
            closeEvents: [],
            openOtherDetails: {},
            closeOtherDetails: {},
            result: "",
            notes: "",
            rating: 0,
        },
    });

    const handleOpenRuleToggle = (ruleId: string, rule: unknown) => {
        const updatedCheckedRules = checkedOpenRules.includes(ruleId)
            ? checkedOpenRules.filter(id => id !== ruleId)
            : [...checkedOpenRules, ruleId];

        setCheckedOpenRules(updatedCheckedRules);

        // Mark parameter as intentionally unused
        void rule;

        const selectedStrategy = localStrategies.find(s => s.id === selectedStrategyId);
        if (selectedStrategy) {
            const appliedRules = selectedStrategy.openPositionRules.filter(r =>
                updatedCheckedRules.includes(r.id)
            );
            form.setValue("appliedOpenRules", appliedRules);
        }
    };

    const handleCloseRuleToggle = (ruleId: string, rule: unknown) => {
        const updatedCheckedRules = checkedCloseRules.includes(ruleId)
            ? checkedCloseRules.filter(id => id !== ruleId)
            : [...checkedCloseRules, ruleId];

        setCheckedCloseRules(updatedCheckedRules);

        // Mark parameter as intentionally unused
        void rule;

        const selectedStrategy = localStrategies.find(s => s.id === selectedStrategyId);
        if (selectedStrategy) {
            const appliedRules = selectedStrategy.closePositionRules.filter(r =>
                updatedCheckedRules.includes(r.id)
            );
            form.setValue("appliedCloseRules", appliedRules);
        }
    };

    const handleStrategyChange = (value: string) => {
        form.setValue("strategyName", value);
        const selectedStrategy = localStrategies.find(s => s.strategyName === value);
        const strategyId = selectedStrategy?.id || "";
        setSelectedStrategyId(strategyId);
        form.setValue("strategyId", strategyId || null);
        // Reset checked rules when strategy changes
        setCheckedOpenRules([]);
        setCheckedCloseRules([]);
        form.setValue("appliedOpenRules", []);
        form.setValue("appliedCloseRules", []);
    };

    // Submit handler
    const onSubmit = async (tradeData: z.infer<typeof newTradeFormSchema>) => {
        setSubmittingTrade(true);

        // Normalize close fields: if closeDate provided but closeTime missing, default to 12:30
        const hasCloseDate = Boolean(tradeData.closeDate && tradeData.closeDate.trim() !== "");
        const baseData = { ...tradeData };
        if (hasCloseDate && (!baseData.closeTime || baseData.closeTime.trim() === "")) {
            baseData.closeTime = "12:30";
        }

        // Require result if closeDate is provided
        if (hasCloseDate) {
            const res = baseData.result?.trim();
            if (!res) {
                toast.error("Please provide a result when setting a close date.");
                setSubmittingTrade(false);
                return;
            }
        }

        // Calculate remaining quantity (original quantity - already sold in closeEvents)
        const originalQty = Number(existingTrade?.quantity || baseData.quantity) || 0;
        // Use form's closeEvents (from baseData) which is synced with Redux, not stale prop
        const existingCloseEvents = baseData.closeEvents || existingTrade?.closeEvents || [];
        const alreadySoldQty = existingCloseEvents.reduce((sum, event) => sum + (event.quantitySold || 0), 0);
        const remainingQty = originalQty - alreadySoldQty;
        const currentSoldQty = Number(baseData.quantitySold) || 0;

        // Determine if this is a partial close
        const isPartialClose = editMode && existingTrade && hasCloseDate && currentSoldQty > 0 && currentSoldQty < remainingQty;

        let updatedTradeData = { ...baseData };

        if (isPartialClose) {
            // PARTIAL CLOSE: Add to closeEvents array, keep trade open
            const newCloseEvent = {
                id: uuidv4(),
                date: baseData.closeDate || "",
                time: baseData.closeTime || "12:30",
                quantitySold: currentSoldQty,
                sellPrice: Number(baseData.sellPrice) || 0,
                result: Number(baseData.result) || 0,
            };

            updatedTradeData = {
                ...baseData,
                closeEvents: [...existingCloseEvents, newCloseEvent],
                // Clear close fields to keep trade open
                closeDate: "",
                closeTime: "",
                sellPrice: "",
                quantitySold: "",
                result: "",
                isActiveTrade: true,
            };

            toast.success(`Partial close recorded! ${remainingQty - currentSoldQty} units remaining.`);
        } else {
            // FULL CLOSE or regular update
            updatedTradeData = {
                ...baseData,
                isActiveTrade: !baseData.closeDate || baseData.closeDate === ""
            };
        }

        try {
            let result;
            if (editMode && existingTrade) {
                result = await updateTradeRecord(updatedTradeData, existingTrade.id);

                if (result?.error) {
                    toast.error("There was an error updating your trade!");
                    return;
                }

                // Calculate differences for Redux state updates
                const oldResult = Number(existingTrade.result);
                const newResult = Number(updatedTradeData.result);
                const resultDifference = newResult - oldResult;

                // Only update statistics if trade has a closeDate (is closed)
                if (updatedTradeData.closeDate && updatedTradeData.closeDate !== "") {
                    const [stringDay, month, year] = new Date(updatedTradeData.closeDate)
                        .toLocaleDateString("en-GB")
                        .split("/");
                    const numericMonth = parseInt(month, 10);
                    const convertedMonthView = `${stringDay}-${month}-${year}`;
                    const convertedYearView = `${numericMonth}-${year}`;

                    // Only update summaries if result changed and is not undefined
                    if (resultDifference !== 0 && updatedTradeData.result !== undefined) {
                        dispatch(setMonthViewSummary({
                            month: convertedMonthView,
                            value: resultDifference,
                        }));
                        dispatch(setYearViewSummary({
                            year: convertedYearView,
                            value: resultDifference,
                        }));
                        dispatch(setTotalOfParticularYearSummary({
                            year: year,
                            value: resultDifference,
                        }));
                    }
                }

                // Update the trade in the list
                dispatch(updateTradeInList({
                    id: existingTrade.id,
                    ...updatedTradeData,
                }));

                // Refresh server data to sync across all pages
                router.refresh();

                toast.success("Trade updated successfully!");
            } else {
                const customId = uuidv4();
                result = await createNewTradeRecord(updatedTradeData, customId);

                if (result?.error) {
                    toast.error("There was an error saving your trade!");
                    return;
                }

                // Only update statistics if trade has a closeDate (is closed)
                if (updatedTradeData.closeDate && updatedTradeData.closeDate !== "") {
                    const [stringDay, month, year] = new Date(updatedTradeData.closeDate)
                        .toLocaleDateString("en-GB")
                        .split("/");
                    const numericMonth = parseInt(month, 10);
                    const convertedMonthView = `${stringDay}-${month}-${year}`;
                    const convertedYearView = `${numericMonth}-${year}`;

                    // Guard against undefined results before dispatching
                    const resultValue = Number(updatedTradeData.result);
                    if (!isNaN(resultValue)) {
                        dispatch(setMonthViewSummary({
                            month: convertedMonthView,
                            value: resultValue,
                        }));
                        dispatch(setYearViewSummary({
                            year: convertedYearView,
                            value: resultValue,
                        }));
                        dispatch(setTotalOfParticularYearSummary({
                            year: year,
                            value: resultValue,
                        }));
                        dispatch(updateTradeDetailsForEachDay({
                            date: convertedMonthView,
                            result: resultValue,
                            value: 1,
                        }));
                    }
                }

                // Always update the trade list (for both open and closed trades)
                dispatch(updateListOfTrades({
                    id: customId,
                    ...updatedTradeData,
                }));

                // Refresh server data to sync across all pages
                router.refresh();

                toast.success("A new record has been created!");
            }

            // Close dialog: close calendar dialog via Redux, and optionally parent-controlled dialog via callback
            const dayKey = day !== undefined ? day.format("DD-MM-YYYY") : "any";
            dispatch(setIsDialogOpen({ key: dayKey, value: false }));
            if (onRequestClose) {
                onRequestClose();
            }
        } catch {
            toast.error("An unexpected error occurred!");
        } finally {
            setSubmittingTrade(false);
        }
    };

    // Effects
    useEffect(() => {
        if (day && !editMode) {
            const convertedDate = day.toDate().toISOString();
            form.setValue("openDate", convertedDate);
            setOpenDate(day.toDate());
        }
        if (trades) {
            setSymbolLabels([
                ...new Set(
                    trades
                        .map(t => t.symbolName?.trim())
                        .filter((s): s is string => typeof s === "string" && s.trim() !== "")
                ),
            ])
        }
    }, [day, trades, editMode, form]);

    // Initialize edit mode data
    useEffect(() => {
        if (editMode && existingTrade) {
            // Set strategy ID and rules if trade has strategy
            if (existingTrade.strategyId) {
                setSelectedStrategyId(existingTrade.strategyId);
                // Set checked rules based on applied rules
                if (existingTrade.appliedOpenRules) {
                    setCheckedOpenRules(existingTrade.appliedOpenRules.map(rule => rule.id));
                }
                if (existingTrade.appliedCloseRules) {
                    setCheckedCloseRules(existingTrade.appliedCloseRules.map(rule => rule.id));
                }
            }

            // Set dates for date pickers
            if (existingTrade.openDate) {
                setOpenDate(new Date(existingTrade.openDate));
            }
            if (existingTrade.closeDate) {
                setCloseDate(new Date(existingTrade.closeDate));
            }
        }
    }, [editMode, existingTrade]);

    return {
        // Form
        form,
        onSubmit,
        submittingTrade,

        // Dates
        openDate,
        setOpenDate,
        closeDate,
        setCloseDate,

        // Instruments
        symbolLabels,

        // Strategy
        selectedStrategyId,
        localStrategies,
        handleStrategyChange,

        // Rules
        checkedOpenRules,
        checkedCloseRules,
        handleOpenRuleToggle,
        handleCloseRuleToggle,

        // Form values
        rating: form.watch("rating"),

        // Mode
        editMode,
    };
};