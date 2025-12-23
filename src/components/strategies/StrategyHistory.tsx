"use client";
import { Strategy } from "@/types/strategies.types";
import { Trades } from "@/types";
import { useAppSelector } from "@/redux/store";
import { CloseTradesTable } from "@/components/history/CloseTradesTable";

interface StrategyHistoryProps {
    strategy: Strategy;
}

export default function StrategyHistory({ strategy }: StrategyHistoryProps) {
    // Get trades from Redux and filter by strategy
    const allTrades = useAppSelector((state) => state.tradeRecords.listOfTrades);
    const strategyTrades = allTrades?.filter(trade => trade.strategyId === strategy.id) || [];

    const closedTrades = strategyTrades.filter((trade): trade is Trades & { closeDate: string; closeTime: string; result: string } =>
        Boolean(trade.closeDate && trade.closeDate !== "" &&
            trade.closeTime && trade.closeTime !== "" &&
            trade.result && trade.result !== "")
    );

    const total = closedTrades.reduce((acc, cur) => acc + Number(cur.result || 0), 0);

    return (
        <div className="w-full">
            <h1 className="py-4 text-neutral-500">
                Closed trades using {strategy.strategyName} ({closedTrades.length} trades):
            </h1>
            {closedTrades.length > 0 ? (
                <CloseTradesTable trades={closedTrades} total={total} />
            ) : (
                <div className="text-center text-gray-500 py-8">
                    No closed trades found for this strategy
                </div>
            )}
        </div>
    );
}