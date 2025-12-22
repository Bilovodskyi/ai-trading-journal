"use client";

import { useState } from "react";
import { MdStar } from "react-icons/md";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { BookOpen, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";

import { Trades } from "@/types";
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

export const CloseTradesTable = ({
    trades,
    startCapital,
    total,
}: CloseTradesTableProps) => {
    const [strategyDialogOpen, setStrategyDialogOpen] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState<ClosedTrade | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tradeToDelete, setTradeToDelete] = useState<ClosedTrade | null>(null);
    const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

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
        const totalRulesOverall = totalCloseRulesOverall + totalOpenRulesOverall;
        const totalRulesFollowed = appliedCloseRules.length + appliedOpenRules.length;
        const percentage = (totalRulesFollowed / totalRulesOverall) * 100;
        return percentage;
    };

    const handleStrategyClick = (trade: ClosedTrade) => {
        setSelectedTrade(trade);
        setStrategyDialogOpen(true);
    };

    const toggleExpanded = (tradeId: string) => {
        setExpandedTradeId(expandedTradeId === tradeId ? null : tradeId);
    };

    if (!trades || trades.length === 0) {
        return (
            <div className="border border-zinc-200 rounded-lg p-8 text-center text-zinc-500">
                No closed trades yet
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 pt-4">
            {/* Summary Card */}
            <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-zinc-500">Total Trades</p>
                        <p className="text-2xl font-semibold text-zinc-700">{trades.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-zinc-500">Net P/L</p>
                        <p className={`text-2xl font-semibold ${total >= 0 ? "text-buy" : "text-sell"}`}>
                            {total >= 0 ? "+" : ""}{total.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Trades List */}
            <div className="border border-zinc-200 rounded-lg">
                {/* Header - Fixed */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-zinc-50 border-b border-zinc-200 text-sm font-medium text-zinc-600">
                    <div className="col-span-5 md:col-span-2">Symbol</div>
                    <div className="col-span-2 hidden md:block text-center">Open → Close</div>
                    <div className="col-span-2 hidden md:block text-center">Entry → Exit</div>
                    <div className="col-span-1 hidden md:block text-center">Qty</div>
                    <div className="col-span-4 md:col-span-2 text-center">Result</div>
                    <div className="col-span-1 hidden md:block text-center">Rating</div>
                    <div className="col-span-3 md:col-span-2 text-right">Actions</div>
                </div>

                {/* Body - Scrollable */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {trades.map((trade) => {
                        const closeEvents = trade.closeEvents || [];
                        const hasPartials = closeEvents.length > 0;
                        const isExpanded = expandedTradeId === trade.id;

                        // Calculate totals from all partial closes + final close
                        const partialQty = closeEvents.reduce((sum, e) => sum + (e.quantitySold || 0), 0);
                        const partialResult = closeEvents.reduce((sum, e) => sum + (e.result || 0), 0);
                        const finalQty = Number(trade.quantitySold) || Number(trade.quantity) || 0;
                        const finalResult = Number(trade.result) || 0;
                        
                        // Total = partials + final close
                        const totalQty = hasPartials ? partialQty + finalQty : finalQty;
                        const totalResult = hasPartials ? partialResult + finalResult : finalResult;

                        // Calculate weighted average sell price for partial trades
                        let avgSellPrice = Number(trade.sellPrice) || 0;
                        if (hasPartials && totalQty > 0) {
                            const partialWeightedSum = closeEvents.reduce((sum, e) => sum + ((e.sellPrice || 0) * (e.quantitySold || 0)), 0);
                            const finalWeightedSum = (Number(trade.sellPrice) || 0) * finalQty;
                            avgSellPrice = (partialWeightedSum + finalWeightedSum) / totalQty;
                        }

                        // Create all close events including the final close for display
                        const allCloseEvents = hasPartials ? [
                            ...closeEvents,
                            // Add final close as the last event
                            {
                                id: `${trade.id}-final`,
                                date: trade.closeDate,
                                time: trade.closeTime || "",
                                quantitySold: finalQty,
                                sellPrice: Number(trade.sellPrice) || 0,
                                result: finalResult,
                                isFinal: true, // Mark this as the final close
                            }
                        ] : [];

                        return (
                            <div key={trade.id} className="border-b border-zinc-100 last:border-b-0">
                                {/* Main Row */}
                                <div
                                    className={`grid grid-cols-12 gap-2 px-4 py-3 hover:bg-zinc-50 transition-colors items-center ${hasPartials ? 'cursor-pointer' : ''}`}
                                    onClick={() => hasPartials && toggleExpanded(trade.id)}
                                >
                                    {/* Symbol & Type */}
                                    <div className="col-span-5 md:col-span-2 flex items-center gap-1.5">
                                        {hasPartials && (
                                            <button className="shrink-0 text-zinc-400">
                                                {isExpanded ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                        <span
                                            className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded text-white font-medium uppercase ${
                                                trade.positionType === "sell" ? "bg-sell" : "bg-buy"
                                            }`}
                                        >
                                            {trade.positionType === "buy" ? "L" : "S"}
                                        </span>
                                        <span className="font-medium text-sm text-zinc-700 truncate">
                                            {trade.symbolName}
                                        </span>
                                        {hasPartials && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium shrink-0">
                                                Partial
                                            </span>
                                        )}
                                    </div>

                                    {/* Open → Close Date */}
                                    <div className="col-span-2 hidden md:flex items-center justify-center gap-1 text-sm">
                                        <span className="text-zinc-400">
                                            {new Intl.DateTimeFormat("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "2-digit",
                                            }).format(new Date(trade.openDate))}
                                        </span>
                                        <span className="text-zinc-300">→</span>
                                        <span className="text-zinc-600">
                                            {new Intl.DateTimeFormat("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "2-digit",
                                            }).format(new Date(trade.closeDate))}
                                        </span>
                                    </div>

                                    {/* Entry → Exit Price */}
                                    <div className="col-span-2 hidden md:flex items-center justify-center gap-1 text-sm">
                                        <span className="text-zinc-400">{trade.entryPrice}</span>
                                        <span className="text-zinc-300">→</span>
                                        {hasPartials ? (
                                            <span className="text-zinc-700 flex items-center gap-0.5">
                                                {avgSellPrice.toFixed(2)}
                                                <span className="text-[10px] px-1.5 rounded bg-amber-100 text-amber-700 font-medium shrink-0">avg</span>
                                            </span>
                                        ) : (
                                            <span className="text-zinc-700">{trade.sellPrice}</span>
                                        )}
                                    </div>

                                    {/* Quantity - show total for trades with partials */}
                                    <div className="col-span-1 hidden md:block text-center text-sm text-zinc-600">
                                        {totalQty}
                                    </div>

                                    {/* Result - show total for trades with partials */}
                                    <div className="col-span-4 md:col-span-2 flex items-center justify-center gap-1">
                                        {totalResult >= 0 ? (
                                            <FaArrowTrendUp className="text-buy text-xs" />
                                        ) : (
                                            <FaArrowTrendDown className="text-sell text-xs" />
                                        )}
                                        <span
                                            className={`text-sm font-medium ${
                                                totalResult >= 0 ? "text-buy" : "text-sell"
                                            }`}
                                        >
                                            {totalResult >= 0 ? "+" : ""}
                                            {totalResult.toLocaleString("de-DE")}
                                        </span>
                                    </div>

                                    {/* Rating */}
                                    <div className="col-span-1 hidden md:flex justify-center">
                                        {trade.rating && trade.rating > 0 ? (
                                            <div className="flex items-center gap-0.5">
                                                <MdStar className="text-yellow-400 text-sm" />
                                                <span className="text-xs text-zinc-600">{trade.rating}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-zinc-300">-</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                         {/* Strategy */}
                                        {trade.strategyId && (
                                            <button
                                                onClick={() => handleStrategyClick(trade)}
                                                className="hidden md:block p-1.5 rounded hover:bg-zinc-100 transition-colors shrink-0"
                                            >
                                                <FollowedStrategyPie
                                                    percentage={handleCountPercentage(trade)}
                                                />
                                            </button>
                                        )}
                                        {/* Notes */}
                                        {trade.notes && (
                                            <HoverCard>
                                                <HoverCardTrigger className="p-1.5 rounded hover:bg-zinc-100 transition-colors">
                                                    <BookOpen className="w-4 h-4 text-zinc-400 hover:text-zinc-600" />
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-64">
                                                    <p className="text-sm text-zinc-600">{trade.notes}</p>
                                                </HoverCardContent>
                                            </HoverCard>
                                        )}

                                        {/* Custom Fields */}
                                        {((trade.openOtherDetails && Object.keys(trade.openOtherDetails).length > 0) ||
                                          (trade.closeOtherDetails && Object.keys(trade.closeOtherDetails).length > 0)) && (
                                            <HoverCard>
                                                <HoverCardTrigger className="p-1.5 rounded hover:bg-zinc-100 transition-colors">
                                                    <svg className="w-4 h-4 text-zinc-400 hover:text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                                        <line x1="9" y1="9" x2="15" y2="9" />
                                                        <line x1="9" y1="13" x2="15" y2="13" />
                                                        <line x1="9" y1="17" x2="12" y2="17" />
                                                    </svg>
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-72">
                                                    <div className="space-y-3">
                                                        {trade.openOtherDetails && Object.keys(trade.openOtherDetails).length > 0 && (
                                                            <div>
                                                                <h4 className="text-xs font-medium text-zinc-500 uppercase mb-1">Open Details</h4>
                                                                <div className="space-y-1">
                                                                    {Object.entries(trade.openOtherDetails).map(([key, value]) => (
                                                                        <div key={key} className="flex justify-between text-sm">
                                                                            <span className="text-zinc-500">{key}:</span>
                                                                            <span className="text-zinc-700 font-medium">{value}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {trade.closeOtherDetails && Object.keys(trade.closeOtherDetails).length > 0 && (
                                                            <div>
                                                                <h4 className="text-xs font-medium text-zinc-500 uppercase mb-1">Close Details</h4>
                                                                <div className="space-y-1">
                                                                    {Object.entries(trade.closeOtherDetails).map(([key, value]) => (
                                                                        <div key={key} className="flex justify-between text-sm">
                                                                            <span className="text-zinc-500">{key}:</span>
                                                                            <span className="text-zinc-700 font-medium">{value}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        )}

                                        {/* Edit */}
                                        <EditTrade
                                            existingTrade={trade}
                                            initialTab="close-details"
                                            trigger={
                                                <button className="p-1.5 rounded hover:bg-zinc-100 transition-colors">
                                                    <Pencil className="w-4 h-4 text-zinc-400 hover:text-zinc-600" />
                                                </button>
                                            }
                                        />

                                        {/* Delete */}
                                        <button
                                            onClick={() => {
                                                setTradeToDelete(trade);
                                                setDeleteDialogOpen(true);
                                            }}
                                            className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Partial Closes Section */}
                                {hasPartials && isExpanded && (
                                    <div className="bg-zinc-50 border-t border-zinc-100 px-4 py-3">
                                        <h4 className="text-xs font-medium text-zinc-500 uppercase mb-2">
                                            Close History ({allCloseEvents.length} {allCloseEvents.length === 1 ? 'event' : 'events'})
                                        </h4>
                                        <div className="space-y-1">
                                            {allCloseEvents.map((event, index: number) => (
                                                <div 
                                                    key={event.id || index}
                                                    className="grid grid-cols-12 gap-2 py-2 text-sm bg-white rounded px-3 border border-zinc-100"
                                                >
                                                    {/* Date & Time */}
                                                    <div className="col-span-3 flex items-center gap-1.5 text-zinc-600">
                                                        {new Intl.DateTimeFormat("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                        }).format(new Date(event.date))}
                                                        <span className="text-xs text-zinc-400">{event.time}</span>
                                                        {'isFinal' in event && event.isFinal && (
                                                            <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                                                                Final
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Sell Price */}
                                                    <div className="col-span-3 text-zinc-600">
                                                        <span className="text-xs text-zinc-400">@ </span>
                                                        {event.sellPrice}
                                                    </div>

                                                    {/* Quantity */}
                                                    <div className="col-span-2 text-zinc-600">
                                                        <span className="text-xs text-zinc-400">Qty: </span>
                                                        {event.quantitySold}
                                                    </div>

                                                    {/* Result */}
                                                    <div className="col-span-4 flex items-center gap-1 justify-end">
                                                        {event.result >= 0 ? (
                                                            <FaArrowTrendUp className="text-buy text-xs" />
                                                        ) : (
                                                            <FaArrowTrendDown className="text-sell text-xs" />
                                                        )}
                                                        <span className={`font-medium ${
                                                            event.result >= 0 ? "text-buy" : "text-sell"
                                                        }`}>
                                                            {event.result >= 0 ? "+" : ""}
                                                            {event.result.toLocaleString("de-DE")}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Strategy Rules Dialog */}
            <Dialog open={strategyDialogOpen} onOpenChange={setStrategyDialogOpen}>
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
                                selectedTrade.appliedOpenRules?.map((rule) => rule.id) || []
                            }
                            checkedCloseRules={
                                selectedTrade.appliedCloseRules?.map((rule) => rule.id) || []
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
