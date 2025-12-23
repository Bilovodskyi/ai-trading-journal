import { Trades } from "@/types";
import dayjs from "dayjs";

// A unified display item for the calendar TradeList - can be a trade or a partial close
export interface TradeDisplayItem {
    id: string;
    symbolName: string;
    positionType: string;
    quantity?: string | number;
    entryPrice?: string;
    result: number;
    isPartialClose: boolean;
    // Reference to the original trade (for opening the edit dialog)
    originalTrade: Trades;
}

/**
 * Get all close events (partial + final) that happened on a specific day
 */
export function getClosedTradesForDay(
    allTrades: Trades[],
    dayKey: string // format: "DD-MM-YYYY"
): TradeDisplayItem[] {
    const items: TradeDisplayItem[] = [];

    for (const trade of allTrades) {
        // Check partial closes (closeEvents)
        if (trade.closeEvents && trade.closeEvents.length > 0) {
            for (const event of trade.closeEvents) {
                if (!event.date) continue;
                const eventDayKey = dayjs(event.date).format("DD-MM-YYYY");
                if (eventDayKey === dayKey) {
                    items.push({
                        id: `${trade.id}-${event.id}`,
                        symbolName: trade.symbolName,
                        positionType: trade.positionType,
                        quantity: event.quantitySold,
                        entryPrice: trade.entryPrice,
                        result: event.result,
                        isPartialClose: true,
                        originalTrade: trade,
                    });
                }
            }
        }

        // Check final close
        if (trade.closeDate) {
            const closeDayKey = dayjs(trade.closeDate).format("DD-MM-YYYY");
            if (closeDayKey === dayKey) {
                const numericResult = Number(trade.result);
                // Only include if there's a valid result (non-zero for trades with partials)
                if (Number.isFinite(numericResult) && numericResult !== 0) {
                    // Determine if this is a partial close (has closeEvents but still closing remaining)
                    const hasPartials = trade.closeEvents && trade.closeEvents.length > 0;
                    items.push({
                        id: trade.id,
                        symbolName: trade.symbolName,
                        positionType: trade.positionType,
                        quantity: trade.quantitySold || trade.quantity,
                        entryPrice: trade.entryPrice,
                        result: numericResult,
                        isPartialClose: hasPartials || false, // Mark as partial if it had previous partials
                        originalTrade: trade,
                    });
                }
            }
        }
    }

    return items;
}

/**
 * Get trades that are final closes (fully closed trades) on a specific day
 * This is used for the legacy TradeList that expects Trades[]
 */
export function getFinalClosedTradesForDay(
    allTrades: Trades[],
    dayKey: string
): Trades[] {
    return allTrades.filter((t) => {
        if (!t.closeDate) return false;
        const closeDayKey = dayjs(t.closeDate).format("DD-MM-YYYY");
        return closeDayKey === dayKey;
    });
}
