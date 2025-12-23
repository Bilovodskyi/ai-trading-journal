"use client";

import { useState } from "react";
import { BookOpen, Trash2, ArrowRightCircle, ChevronDown, ChevronRight } from "lucide-react";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

import { Trades } from "@/types";
import { CloseEvent } from "@/types/dbSchema.types";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { TradeDialog } from "../trade-dialog";
import DeleteTradeDialog from "./DeleteTradeDialog";
import { useDeleteOpenTrade } from "@/hooks/useDeleteOpenTrade";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";

type OpenTradesTableProps = {
    trades: Trades[];
};

// Helper to calculate remaining quantity
const getRemainingQty = (trade: Trades): number => {
    const originalQty = Number(trade.quantity) || 0;
    const closeEvents = trade.closeEvents || [];
    const soldQty = closeEvents.reduce((sum, event) => sum + (event.quantitySold || 0), 0);
    return originalQty - soldQty;
};

// Helper to calculate partial close total P/L
const getPartialClosesTotal = (trade: Trades): number => {
    const closeEvents = trade.closeEvents || [];
    return closeEvents.reduce((sum, event) => sum + (event.result || 0), 0);
};

export const OpenTradesTable = ({ trades }: OpenTradesTableProps) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tradeToDelete, setTradeToDelete] = useState<Trades | null>(null);
    const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);
    const [openSheetTradeId, setOpenSheetTradeId] = useState<string | null>(null);
    const { handleDeleteOpenTrade } = useDeleteOpenTrade();

    const toggleExpanded = (tradeId: string) => {
        setExpandedTradeId(expandedTradeId === tradeId ? null : tradeId);
    };

    if (!trades || trades.length === 0) {
        return (
            <div className="border border-zinc-200 rounded-lg p-8 text-center text-zinc-500">
                No open trades yet
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 pt-4">
            {/* Summary Card */}
            <div className="border border-zinc-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-zinc-500">Open Positions</p>
                        <p className="text-2xl font-semibold text-zinc-700">{trades.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-zinc-500">Status</p>
                        <p className="text-lg font-medium text-blue-600">Active</p>
                    </div>
                </div>
            </div>

            {/* Trades List */}
            <div className="border border-zinc-200 rounded-lg">
                {/* Header - Fixed */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-zinc-50 border-b border-zinc-200 text-sm font-medium text-zinc-600">
                    <div className="col-span-7 md:col-span-3">Symbol</div>
                    <div className="col-span-2 hidden md:block text-center">Date</div>
                    <div className="col-span-2 hidden md:block text-center">Entry Price</div>
                    <div className="col-span-1 hidden md:block text-center">Qty</div>
                    <div className="col-span-5 md:col-span-4 text-right">Actions</div>
                </div>

                {/* Body - Scrollable */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {trades.map((trade) => {
                        const closeEvents = trade.closeEvents || [];
                        const hasPartials = closeEvents.length > 0;
                        const isExpanded = expandedTradeId === trade.id;
                        const remainingQty = getRemainingQty(trade);
                        const partialTotal = getPartialClosesTotal(trade);

                        return (
                            <div key={trade.id} className="border-b border-zinc-100 last:border-b-0">
                                {/* Main Row */}
                                <div
                                    className={`grid grid-cols-12 gap-2 px-4 py-3 hover:bg-zinc-50 transition-colors items-center ${hasPartials ? 'cursor-pointer' : ''}`}
                                    onClick={() => hasPartials && toggleExpanded(trade.id)}
                                >
                                    {/* Symbol & Type */}
                                    <div className="col-span-7 md:col-span-3 flex items-center gap-1.5">
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

                                    {/* Date */}
                                    <div className="col-span-2 hidden md:block text-center text-sm text-zinc-500">
                                        {new Intl.DateTimeFormat("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                        }).format(new Date(trade.openDate))}
                                    </div>

                                    {/* Entry Price */}
                                    <div className="col-span-2 hidden md:block text-center text-sm text-zinc-700">
                                        {trade.entryPrice}
                                    </div>

                                    {/* Quantity - show remaining if partial */}
                                    <div className="col-span-1 hidden md:block text-center text-sm text-zinc-600">
                                        {hasPartials ? (
                                            <span className="text-amber-600 font-medium">{remainingQty}</span>
                                        ) : (
                                            trade.quantity
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-5 md:col-span-4 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
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
                                        {trade.openOtherDetails && Object.keys(trade.openOtherDetails).length > 0 && (
                                            <HoverCard>
                                                <HoverCardTrigger className="p-1.5 rounded hover:bg-zinc-100 transition-colors">
                                                    <svg className="w-4 h-4 text-zinc-400 hover:text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                                        <line x1="9" y1="9" x2="15" y2="9" />
                                                        <line x1="9" y1="13" x2="15" y2="13" />
                                                        <line x1="9" y1="17" x2="12" y2="17" />
                                                    </svg>
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-64">
                                                    <h4 className="text-xs font-medium text-zinc-500 uppercase mb-2">Custom Details</h4>
                                                    <div className="space-y-1">
                                                        {Object.entries(trade.openOtherDetails).map(([key, value]) => (
                                                            <div key={key} className="flex justify-between text-sm">
                                                                <span className="text-zinc-500">{key}:</span>
                                                                <span className="text-zinc-700 font-medium">{value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        )}

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

                                        {/* Close Position */}
                                        <Sheet 
                                            open={openSheetTradeId === trade.id} 
                                            onOpenChange={(open) => setOpenSheetTradeId(open ? trade.id : null)}
                                        >
                                            <SheetTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="ml-2 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                                >
                                                    <ArrowRightCircle className="w-3.5 h-3.5" />
                                                    Close
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent>
                                                <TradeDialog
                                                    editMode={true}
                                                    existingTrade={trade}
                                                    initialTab="close-details"
                                                    onRequestClose={() => setOpenSheetTradeId(null)}
                                                />
                                            </SheetContent>
                                        </Sheet>
                                    </div>
                                </div>

                                {/* Expanded Partial Closes Section */}
                                {hasPartials && isExpanded && (
                                    <div className="bg-zinc-50 border-t border-zinc-100 px-4 py-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-medium text-zinc-500 uppercase">
                                                Partial Close History ({closeEvents.length} {closeEvents.length === 1 ? 'event' : 'events'})
                                            </h4>
                                            <span className={`text-xs font-medium ${partialTotal >= 0 ? 'text-buy' : 'text-sell'}`}>
                                                Total: {partialTotal >= 0 ? '+' : ''}{partialTotal.toLocaleString("de-DE")}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {closeEvents.map((event: CloseEvent, index: number) => (
                                                <div 
                                                    key={event.id || index}
                                                    className="grid grid-cols-12 gap-2 py-2 text-sm bg-white rounded px-3 border border-zinc-100"
                                                >
                                                    {/* Date & Time */}
                                                    <div className="col-span-3 text-zinc-600">
                                                        {new Intl.DateTimeFormat("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                        }).format(new Date(event.date))}
                                                        <span className="ml-1 text-xs text-zinc-400">{event.time}</span>
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

            {/* Delete Trade Confirmation Dialog */}
            <DeleteTradeDialog
                isOpen={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                message={`Do you want to delete this open trade${
                    tradeToDelete ? ` "${tradeToDelete.symbolName}"` : ""
                }?`}
                onConfirm={async () => {
                    if (!tradeToDelete) return;
                    await handleDeleteOpenTrade(tradeToDelete.id);
                    setDeleteDialogOpen(false);
                    setTradeToDelete(null);
                }}
            />
        </div>
    );
};

export default OpenTradesTable;
