"use client";

import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";

import { Trades } from "@/types";
import { DialogClose, DialogTitle, DialogHeader, DialogDescription } from "../ui/dialog";
import { CustomButton } from "../CustomButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { useTradeForm } from "./hooks/useTradeForm";
import { OpenDetailsTab } from "./OpenDetailsTab";
import { CloseDetailsTab } from "./CloseDetailsTab";
import { StrategyTab } from "./StrategyTab";
import { getCustomFieldNames } from "@/server/actions/user";

interface TradeDialogProps {
    editMode?: boolean;
    existingTrade?: Trades;
    day?: dayjs.Dayjs | undefined;
    onRequestClose?: () => void;
    initialTab?: "open-details" | "close-details" | "strategy";
}

export const TradeDialog = ({
    editMode = false,
    existingTrade,
    day,
    onRequestClose,
    initialTab = "open-details",
}: TradeDialogProps) => {
    const tradeForm = useTradeForm({
        editMode,
        existingTrade,
        day,
        onRequestClose,
    });

    // State for custom field names
    const [openFieldNames, setOpenFieldNames] = useState<string[]>([]);
    const [closeFieldNames, setCloseFieldNames] = useState<string[]>([]);

    // Fetch custom field names on mount
    const fetchFieldNames = useCallback(async () => {
        const result = await getCustomFieldNames();
        if (!("error" in result)) {
            setOpenFieldNames(result.openFields);
            setCloseFieldNames(result.closeFields);
        }
    }, []);

    useEffect(() => {
        fetchFieldNames();
    }, [fetchFieldNames]);

    return (
        <form
            onSubmit={tradeForm.form.handleSubmit(tradeForm.onSubmit, (errors) => {
                console.log("Form validation errors:", errors);
            })}
            className="sm:max-w-[460px] flex flex-col flex-1 h-full overflow-hidden">

            <DialogHeader className="mb-4 shrink-0">
                <DialogTitle className="text-center text-[1.4rem]">
                    {editMode ? "Edit Trade" : "Add a New Trade"}
                </DialogTitle>
                <DialogDescription className="text-center text-[.85rem] text-tertiary">
                    Fill in the details below. Open trades appear on the calendar in blue.
                </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue={initialTab} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <TabsList className="grid w-full grid-cols-3 mb-4 shrink-0">
                    <TabsTrigger value="open-details">Open</TabsTrigger>
                    <TabsTrigger value="close-details">Close</TabsTrigger>
                    <TabsTrigger value="strategy">Strategy</TabsTrigger>
                </TabsList>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                    <TabsContent value="open-details" className="mt-0 data-[state=inactive]:hidden">
                        <OpenDetailsTab
                            form={tradeForm.form}
                            openDate={tradeForm.openDate}
                            setOpenDate={tradeForm.setOpenDate}
                            symbolLabels={tradeForm.symbolLabels}
                            day={day}
                            userFieldNames={openFieldNames}
                            onFieldNamesChange={fetchFieldNames}
                        />
                    </TabsContent>

                    <TabsContent value="close-details" className="mt-0 data-[state=inactive]:hidden">
                        <CloseDetailsTab
                            form={tradeForm.form}
                            openDate={tradeForm.openDate}
                            closeDate={tradeForm.closeDate}
                            setCloseDate={tradeForm.setCloseDate}
                            userFieldNames={closeFieldNames}
                            onFieldNamesChange={fetchFieldNames}
                            closeEvents={existingTrade?.closeEvents || []}
                        />
                    </TabsContent>

                    <TabsContent value="strategy" className="mt-0 data-[state=inactive]:hidden">
                        <StrategyTab
                            form={tradeForm.form}
                            strategies={tradeForm.localStrategies}
                            selectedStrategyId={tradeForm.selectedStrategyId}
                            checkedOpenRules={tradeForm.checkedOpenRules}
                            checkedCloseRules={tradeForm.checkedCloseRules}
                            onStrategyChange={tradeForm.handleStrategyChange}
                            onOpenRuleToggle={tradeForm.handleOpenRuleToggle}
                            onCloseRuleToggle={tradeForm.handleCloseRuleToggle}
                        />
                    </TabsContent>
                </div>
            </Tabs>

            {/* Fixed footer with buttons - outside Tabs to stick to bottom */}
            <div className="shrink-0 pt-4 mt-auto border-t border-zinc-200 bg-white">
                <div className="flex gap-4 justify-end">
                    <DialogClose asChild>
                        <CustomButton isBlack={false}>Cancel</CustomButton>
                    </DialogClose>
                    <CustomButton
                        isBlack
                        type="submit"
                        disabled={tradeForm.submittingTrade}>
                        {editMode ? "Update Trade" : "Add Trade"}
                    </CustomButton>
                </div>
            </div>
        </form>
    );
};