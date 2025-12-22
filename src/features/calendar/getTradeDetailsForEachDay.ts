import { Trades } from "@/types";

type TradeDetails = { result: number; win: number; lost: number };

function getDateKey(date: Date): string {
    return date.toLocaleDateString("en-GB").split("/").join("-");
}

function addTradeToDay(
    acc: { [key: string]: TradeDetails },
    dateKey: string,
    pnlResult: number
) {
    if (acc[dateKey]) {
        acc[dateKey] = {
            result: acc[dateKey].result + 1,
            win: pnlResult >= 0 ? acc[dateKey].win + 1 : acc[dateKey].win,
            lost: pnlResult < 0 ? acc[dateKey].lost + 1 : acc[dateKey].lost,
        };
    } else {
        acc[dateKey] = {
            result: 1,
            win: pnlResult >= 0 ? 1 : 0,
            lost: pnlResult < 0 ? 1 : 0,
        };
    }
}

export function getTradeDetailsForEachDay(data: Trades[]): {
    [key: string]: TradeDetails;
} {
    return data.reduce(
        (acc: { [key: string]: TradeDetails }, trade) => {
            // Process partial closes (closeEvents) - each on its own date
            if (trade.closeEvents && trade.closeEvents.length > 0) {
                for (const event of trade.closeEvents) {
                    if (!event.date || !Number.isFinite(event.result)) continue;
                    const eventDate = new Date(event.date);
                    const dateKey = getDateKey(eventDate);
                    addTradeToDay(acc, dateKey, event.result);
                }
            }

            // Process final close (if trade is fully closed with closeDate and result)
            if (trade.closeDate) {
                const numericResult = Number(trade.result);
                if (Number.isFinite(numericResult) && numericResult !== 0) {
                    const closeDate = new Date(trade.closeDate);
                    const dateKey = getDateKey(closeDate);
                    addTradeToDay(acc, dateKey, numericResult);
                }
            }

            return acc;
        },
        {}
    );
}

