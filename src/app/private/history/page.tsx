"use client";

import { sortTrades } from "@/features/history/sortTrades";
import { useAppSelector } from "@/redux/store";
import { Trades } from "@/types";
import { useEffect, useState } from "react";

import { getCapital } from "@/server/actions/user";
import { OpenTradesTable } from "@/components/history/OpenTradesTable";
import { CloseTradesTable } from "@/components/history/CloseTradesTable";

// Helper to calculate remaining quantity for a trade
const getRemainingQty = (trade: Trades): number => {
    const originalQty = Number(trade.quantity) || 0;
    const closeEvents = trade.closeEvents || [];
    const soldQty = closeEvents.reduce((sum, event) => sum + (event.quantitySold || 0), 0);
    return originalQty - soldQty;
};

// Helper to calculate total P/L from closeEvents
const getPartialClosesTotal = (trade: Trades): number => {
    const closeEvents = trade.closeEvents || [];
    return closeEvents.reduce((sum, event) => sum + (event.result || 0), 0);
};

export default function Page() {
    const [sortedTrades, setSortedTrades] = useState<Trades[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [startCapital, setStartCapital] = useState<string | null>(null);

    const trades = useAppSelector((state) => state.tradeRecords.listOfTrades);
    const filteredTrades = useAppSelector(
        (state) => state.history.filteredTrades
    );

    const sortBy = useAppSelector((state) => state.history.sortBy);
    const timeframe = useAppSelector((state) => state.history.timeframe);

    const activeTab = useAppSelector((state) => state.history.activeTab);

    const tradesToSort = filteredTrades || trades || [];

    useEffect(() => {
        async function fetchData() {
            const response = await getCapital();
            if (response && typeof response === "string") {
                setStartCapital(response);
            }
        }

        fetchData();
    }, []);

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
    }, [sortBy, timeframe, trades, filteredTrades]);

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
            const aMinutes = a.closeTime ? a.closeTime.split(":").reduce((h, m) => Number(h) * 60 + Number(m), 0) : 0;
            const bMinutes = b.closeTime ? b.closeTime.split(":").reduce((h, m) => Number(h) * 60 + Number(m), 0) : 0;
            return bMinutes - aMinutes;
        });

    // Open trades: no closeDate OR have remaining quantity
    const openTrades = sortedTrades.filter((trade) => {
        const isNotClosed = !trade.closeDate || trade.closeDate === "";
        return isNotClosed;
    });

    // Trades with partial closes that are still open (for showing in open section with partial badge)
    const openTradesWithRemainingQty = openTrades.map(trade => ({
        ...trade,
        remainingQty: getRemainingQty(trade),
        hasPartialCloses: (trade.closeEvents?.length || 0) > 0,
    }));

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
                    <CloseTradesTable trades={closedTrades} startCapital={startCapital} total={total} />
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
