"use client";

import { sortTrades } from "@/features/history/sortTrades";
import { useAppSelector } from "@/redux/store";
import { Trades } from "@/types";
import { useEffect, useState } from "react";

import { OpenTradesTable } from "@/components/history/OpenTradesTable";
import { CloseTradesTable } from "@/components/history/CloseTradesTable";

// Helper to calculate total P/L from closeEvents
const getPartialClosesTotal = (trade: Trades): number => {
    const closeEvents = trade.closeEvents || [];
    return closeEvents.reduce((sum, event) => sum + (event.result || 0), 0);
};

export default function Page() {
    const [sortedTrades, setSortedTrades] = useState<Trades[]>([]);
    const [total, setTotal] = useState<number>(0);

    const trades = useAppSelector((state) => state.tradeRecords.listOfTrades);
    const filteredTrades = useAppSelector(
        (state) => state.history.filteredTrades
    );

    const sortBy = useAppSelector((state) => state.history.sortBy);
    const timeframe = useAppSelector((state) => state.history.timeframe);

    const activeTab = useAppSelector((state) => state.history.activeTab);

    const tradesToSort = filteredTrades || trades || [];

    useEffect(() => {
        const result = sortTrades({
            sortBy,
            timeframe,
            tradesToSort,
        });
        
        // Calculate total: closed trades result + partial close results
        let reducedTotal = 0;
        result.forEach((trade) => {
            // Add final close result if fully closed
            if (trade.closeDate && trade.closeDate !== "") {
                reducedTotal += Number(trade.result || 0);
            }
            // Add partial close results
            reducedTotal += getPartialClosesTotal(trade);
        });
        
        setSortedTrades(result);
        setTotal(reducedTotal);
    }, [sortBy, timeframe, tradesToSort]);

    // Fully closed trades: have closeDate
    const closedTrades = sortedTrades
        .filter((trade): trade is Trades & { closeDate: string; closeTime: string; result: string } =>
            Boolean(trade.closeDate && trade.closeDate !== "" &&
                trade.closeTime && trade.closeTime !== "" &&
                trade.result && trade.result !== ""))
        // Ensure closed trades are sorted by closeDate (newest first)
        .sort((a, b) => {
            const dateDiff = new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime();
            if (dateDiff !== 0) return dateDiff;
            // If same date, sort by time
            const parseTime = (time: string) => {
                const parts = time.split(":");
                return Number(parts[0] || 0) * 60 + Number(parts[1] || 0);
            };
            const aMinutes = a.closeTime ? parseTime(a.closeTime) : 0;
            const bMinutes = b.closeTime ? parseTime(b.closeTime) : 0;
            return bMinutes - aMinutes;
        });

    // Open trades: no closeDate OR have remaining quantity
    const openTrades = sortedTrades.filter((trade) => {
        const isNotClosed = !trade.closeDate || trade.closeDate === "";
        return isNotClosed;
    });

    if (closedTrades.length === 0 && openTrades.length === 0) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="border border-zinc-200 rounded-lg p-8 text-center">
                    <p className="text-zinc-500 mb-2">No trades found</p>
                    <p className="text-sm text-zinc-400">Add some trades to see your history</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-0">
            {activeTab === "openTrades" && (
                openTrades.length > 0 ? (
                    <OpenTradesTable trades={openTrades} />
                ) : (
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="border border-zinc-200 rounded-lg p-8 text-center">
                            <p className="text-zinc-500 mb-2">No open trades</p>
                            <p className="text-sm text-zinc-400">All your positions are closed</p>
                        </div>
                    </div>
                )
            )}

            {activeTab === "closedTrades" && (
                closedTrades.length > 0 ? (
                    <CloseTradesTable trades={closedTrades} total={total} />
                ) : (
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="border border-zinc-200 rounded-lg p-8 text-center">
                            <p className="text-zinc-500 mb-2">No closed trades</p>
                            <p className="text-sm text-zinc-400">Complete some trades to see your results</p>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
