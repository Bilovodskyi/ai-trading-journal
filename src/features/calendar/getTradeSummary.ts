import { Trades } from "@/types";

function getDateKey(date: Date, groupBy: "day" | "month" | "year" | "total"): string {
    if (groupBy === "year") {
        return date.getFullYear().toString();
    } else if (groupBy === "month") {
        const month = (date.getMonth() + 1).toString();
        const year = date.getFullYear().toString();
        return `${month}-${year}`;
    } else if (groupBy === "day") {
        return date.toLocaleDateString("en-GB").split("/").join("-");
    } else {
        return "total";
    }
}

function addToAccumulator(acc: { [key: string]: number }, key: string, value: number) {
    if (acc[key]) {
        acc[key] += value;
    } else {
        acc[key] = value;
    }
}

export function getTradeSummary(
    groupBy: "day" | "month" | "year" | "total",
    data: Trades[]
): { [key: string]: number } {
    return data.reduce((acc: { [key: string]: number }, trade) => {
        // Process partial closes (closeEvents) - each on its own date
        if (trade.closeEvents && trade.closeEvents.length > 0) {
            for (const event of trade.closeEvents) {
                if (!event.date || !Number.isFinite(event.result)) continue;
                const eventDate = new Date(event.date);
                const dateKey = getDateKey(eventDate, groupBy);
                addToAccumulator(acc, dateKey, event.result);
            }
        }

        // Process final close (if trade is fully closed with closeDate and result)
        if (trade.closeDate) {
            const numericResult = Number(trade.result);
            if (Number.isFinite(numericResult) && numericResult !== 0) {
                const closeDate = new Date(trade.closeDate);
                const dateKey = getDateKey(closeDate, groupBy);
                addToAccumulator(acc, dateKey, numericResult);
            }
        }

        return acc;
    }, {});
}
