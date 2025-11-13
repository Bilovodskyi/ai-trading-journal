"use client";

import Image from "next/image";
import { useState } from "react";
import { MdDelete, MdStar } from "react-icons/md";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { PiCalendarDotsThin } from "react-icons/pi";
import { BookOpen, Moon, Sun } from "lucide-react";

import { Trades } from "@/types";
import { isInMorningRange } from "@/features/history/isInMorningRange";
import { FollowedStrategyPie } from "@/components/history/FollowedStrategyPie";
import EditTrade from "@/components/history/EditTrade";
import { useDeleteTrade } from "@/hooks/useDeleteTrade";
import { useAppSelector } from "@/redux/store";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import DeleteTradeDialog from "@/components/history/DeleteTradeDialog";
import { StrategyRules } from "@/components/trade-dialog/StrategyRules";

type ClosedTrade = Trades & {
    closeDate: string;
    closeTime: string;
    result: string;
};

type CloseTradesTableProps = {
    trades: ClosedTrade[];
    startCapital: string | null;
    total: number;
};

const INSTRUMENT_LABELS = [
    { name: "Crypto", shortcut: "CRY" },
    { name: "Forex", shortcut: "FX" },
    { name: "Stock", shortcut: "STO" },
    { name: "Index", shortcut: "IDX" },
    { name: "Commodity", shortcut: "CMD" },
    { name: "Bond", shortcut: "BND" },
    { name: "ETF", shortcut: "ETF" },
    { name: "Option", shortcut: "OPT" },
    { name: "Other", shortcut: "OTHER" },
];

const getInstrumentLabel = (instrument: string | undefined) => {
    if (!instrument) return "OTHER";
    return INSTRUMENT_LABELS.find(
        (label) => label.name.toLowerCase() === instrument.toLowerCase()
    )?.shortcut;
};

export const CloseTradesTable = ({
    trades,
    startCapital,
    total,
}: CloseTradesTableProps) => {
    const [strategyDialogOpen, setStrategyDialogOpen] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState<ClosedTrade | null>(
        null
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tradeToDelete, setTradeToDelete] = useState<ClosedTrade | null>(
        null
    );

    const { strategies: localStrategies } = useAppSelector(
        (state) => state.strategies
    );
    const { handleDeleteTradeRecord } = useDeleteTrade();

    const handleCountPercentage = (trade: ClosedTrade) => {
        const appliedCloseRules = trade.appliedCloseRules || [];
        const appliedOpenRules = trade.appliedOpenRules || [];
        const strategy = localStrategies.find((s) => s.id === trade.strategyId);
        const totalCloseRulesOverall = strategy?.closePositionRules.length || 0;
        const totalOpenRulesOverall = strategy?.openPositionRules.length || 0;
        const totalRulesOverall =
            totalCloseRulesOverall + totalOpenRulesOverall;
        const totalRulesFollowed =
            appliedCloseRules.length + appliedOpenRules.length;
        const percentage = (totalRulesFollowed / totalRulesOverall) * 100;
        return percentage;
    };

    const handleStrategyClick = (trade: ClosedTrade) => {
        setSelectedTrade(trade);
        setStrategyDialogOpen(true);
    };

    if (!trades || trades.length === 0) {
        return (
            <div className="p-4 text-center text-zinc-500">
                No closed trades
            </div>
        );
    }

    console.log(trades);
    return (
        <div className="flex flex-col md:h-full mt-2">
            {/* Grid Header */}
            <div className="grid grid-cols-5 md:grid-cols-40 gap-1 p-2 items-center border-b bg-muted/50 font-medium text-sm sticky top-0 bg-white z-20">
                <div className="col-span-1 md:col-span-2 text-left">Symbol</div>
                <div className="hidden md:block md:col-span-2 text-center">
                    Instrument
                </div>
                <div className="hidden md:block md:col-span-2 text-center">
                    Type
                </div>
                <div className="hidden md:block md:col-span-4 text-center">
                    Open date
                </div>
                <div className="hidden md:block md:col-span-2 text-center">
                    Open time
                </div>
                <div className="col-span-1 md:col-span-4 text-center">
                    Close date
                </div>
                <div className="hidden md:block md:col-span-2 text-center">
                    Close time
                </div>
                <div className="hidden md:block md:col-span-4 text-center">
                    Open/Close price
                </div>
                <div className="hidden md:block md:col-span-2 text-center">
                    Quantity
                </div>
                <div className="hidden md:block md:col-span-3 text-center">
                    Deposit <p className="text-[.75rem]">(% of capital)</p>
                </div>
                <div className="col-span-1 md:col-span-2 text-center">
                    Result
                </div>
                <div className="hidden md:block md:col-span-2 text-center">
                    Cost
                </div>
                <div className="hidden md:block md:col-span-2 text-center">
                    Strategy
                </div>
                <div className="hidden md:block md:col-span-4 text-center">
                    Rating
                </div>
                <div className="hidden md:block md:col-span-1 text-center">
                    Note
                </div>
                <div className="col-span-1 md:col-span-1 text-center">Edit</div>
                <div className="col-span-1 md:col-span-1 text-center">
                    Delete
                </div>
            </div>

            {/* Grid Body */}
            <div className="flex-1 overflow-auto">
                {trades.map((trade) => (
                    <div
                        key={trade.id}
                        className="grid grid-cols-5 md:grid-cols-40 gap-1 p-2 border-b hover:bg-muted/30 transition-colors items-center">
                        {/* Symbol */}
                        <div className="col-span-1 md:col-span-2 truncate">
                            {trade.symbolName}
                        </div>

                        {/* Instrument */}
                        <div className="hidden md:block md:col-span-2 text-center">
                            <div className="border border-zinc-300 rounded-md px-2 py-1 text-xs inline-block">
                                {getInstrumentLabel(trade.instrumentName)}
                            </div>
                        </div>

                        {/* Type */}
                        <div className="hidden md:block md:col-span-2 text-center">
                            <p
                                className={`bg-${
                                    trade.positionType === "sell"
                                        ? "sell"
                                        : "buy"
                                } 
                                         w-fit px-2 py-1 rounded-md text-white text-xs mx-auto`}>
                                {trade.positionType}
                            </p>
                        </div>

                        {/* Open Date */}
                        <div className="hidden md:block md:col-span-4 text-center text-neutral-500">
                            <div className="flex gap-1 items-center justify-center">
                                <PiCalendarDotsThin className="max-md:hidden" />
                                <span className="text-sm">
                                    {new Intl.DateTimeFormat("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    }).format(new Date(trade.openDate))}
                                </span>
                            </div>
                        </div>

                        {/* Open Time */}
                        <div className="hidden md:block md:col-span-2 text-center text-neutral-500">
                            <div className="flex gap-1 items-center justify-center">
                                {isInMorningRange(trade.openTime) ? (
                                    <Sun className="h-3 w-3" />
                                ) : (
                                    <Moon className="h-3 w-3" />
                                )}
                                <span className="text-sm">
                                    {trade.openTime}
                                </span>
                            </div>
                        </div>

                        {/* Close Date */}
                        <div className="col-span-1 md:col-span-4 text-center text-neutral-500">
                            <div className="flex gap-1 items-center justify-center">
                                <PiCalendarDotsThin className="max-md:hidden" />
                                <span className="text-sm">
                                    {new Intl.DateTimeFormat("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    }).format(new Date(trade.closeDate))}
                                </span>
                            </div>
                        </div>

                        {/* Close Time */}
                        <div className="hidden md:block md:col-span-2 text-center text-neutral-500">
                            <div className="flex gap-1 items-center justify-center">
                                {isInMorningRange(trade.closeTime) ? (
                                    <Sun className="h-3 w-3" />
                                ) : (
                                    <Moon className="h-3 w-3" />
                                )}
                                <span className="text-sm">
                                    {trade.closeTime}
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="hidden md:block md:col-span-4 text-center text-sm flex-col gap-1">
                            <span className="text-neutral-500">
                                {trade.entryPrice}
                            </span>
                            <span className="">→ {trade.sellPrice}</span>
                        </div>

                        {/* Quantity */}
                        <div className="hidden md:block md:col-span-2 text-center text-sm truncate">
                            {trade.quantity}
                        </div>

                        {/* Deposit */}
                        <div className="hidden md:block md:col-span-3">
                            <div className="flex flex-col gap-1 text-center">
                                <span className="text-sm font-medium">
                                    {Number(trade.deposit).toLocaleString(
                                        "de-DE"
                                    )}
                                </span>
                                <span className="text-sm text-neutral-400">
                                    (
                                    {startCapital && +startCapital !== 0
                                        ? `${Math.round(
                                              (Number(trade.deposit) /
                                                  Number(startCapital)) *
                                                  100
                                          )}%`
                                        : "no capital"}
                                    )
                                </span>
                            </div>
                        </div>

                        {/* Result */}
                        <div
                            className={`col-span-1 md:col-span-2 text-center ${
                                Number(trade.result) >= 0
                                    ? "text-buy"
                                    : "text-sell"
                            }`}>
                            <div className="flex gap-1 items-center justify-center">
                                {Number(trade.result) >= 0 ? (
                                    <FaArrowTrendUp className="text-sm" />
                                ) : (
                                    <FaArrowTrendDown className="text-sm" />
                                )}
                                <span className="text-sm font-medium">
                                    {Number(trade.result).toLocaleString(
                                        "de-DE"
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Cost */}
                        <div className="hidden md:block md:col-span-2 text-center text-xs">
                            {trade.totalCost}
                        </div>

                        {/* Strategy */}
                        <div className="hidden md:block md:col-span-2 text-center z-10">
                            {startCapital &&
                                ((trade.appliedCloseRules &&
                                    trade.appliedCloseRules.length > 0) ||
                                    (trade.appliedOpenRules &&
                                        trade.appliedOpenRules.length > 0)) && (
                                    <div
                                        onClick={() =>
                                            handleStrategyClick(trade)
                                        }
                                        className="cursor-pointer">
                                        <FollowedStrategyPie
                                            percentage={handleCountPercentage(
                                                trade
                                            )}
                                        />
                                    </div>
                                )}
                        </div>

                        {/* Rating */}
                        <div className="hidden md:block md:col-span-4 text-center">
                            <div className="flex items-center justify-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <MdStar
                                        key={i}
                                        className={`text-sm ${
                                            trade.rating && trade.rating > i
                                                ? "text-yellow-500"
                                                : "text-neutral-400"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Note */}
                        <div className="hidden md:block md:col-span-1 text-center">
                            {trade.notes && (
                                <HoverCard>
                                    <HoverCardTrigger className="flex items-center justify-center">
                                        <BookOpen className="w-4 h-4 text-gray-600 hover:text-gray-800 cursor-pointer" />
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    src="/logo.svg"
                                                    height={20}
                                                    width={20}
                                                    alt="logo"
                                                />
                                                <h1 className="text-neutral-400">
                                                    @tradejournal.one
                                                </h1>
                                            </div>
                                            <div className="py-2">
                                                {trade.notes}
                                            </div>
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            )}
                        </div>

                        {/* Edit */}
                        <div className="col-span-1 text-center">
                            <EditTrade trade={trade} />
                        </div>

                        {/* Delete */}
                        <div className="col-span-1 text-center">
                            <MdDelete
                                onClick={() => {
                                    setTradeToDelete(trade);
                                    setDeleteDialogOpen(true);
                                }}
                                className="text-lg text-sell cursor-pointer hover:text-red-600 transition-colors mx-auto"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid Footer */}
            <div className="sticky bottom-0 right-0 left-0 bg-white w-full border-t p-4 mt-auto">
                <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>{total.toLocaleString("de-DE")}</span>
                </div>
            </div>

            {/* Strategy Rules Dialog */}
            <Dialog
                open={strategyDialogOpen}
                onOpenChange={setStrategyDialogOpen}>
                <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Applied Strategy Rules -{" "}
                            {selectedTrade &&
                                localStrategies.find(
                                    (s) => s.id === selectedTrade.strategyId
                                )?.strategyName}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedTrade && selectedTrade.strategyId && (
                        <StrategyRules
                            strategy={
                                localStrategies.find(
                                    (s) => s.id === selectedTrade.strategyId
                                )!
                            }
                            checkedOpenRules={
                                selectedTrade.appliedOpenRules?.map(
                                    (rule) => rule.id
                                ) || []
                            }
                            checkedCloseRules={
                                selectedTrade.appliedCloseRules?.map(
                                    (rule) => rule.id
                                ) || []
                            }
                            onOpenRuleToggle={() => {}}
                            onCloseRuleToggle={() => {}}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Trade Confirmation Dialog */}
            <DeleteTradeDialog
                isOpen={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                message={`Do you want to delete this trade${
                    tradeToDelete ? ` "${tradeToDelete.symbolName}"` : ""
                }?`}
                onConfirm={async () => {
                    if (!tradeToDelete) return;
                    if (tradeToDelete.closeDate && tradeToDelete.result) {
                        await handleDeleteTradeRecord(
                            tradeToDelete.id,
                            tradeToDelete.result,
                            tradeToDelete.closeDate
                        );
                    }
                    setTradeToDelete(null);
                }}
            />
        </div>
    );
};

export default CloseTradesTable;
