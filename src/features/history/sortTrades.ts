import { Trades, sortTradesFunctionType } from "@/types";

function timeStringToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

export const sortTrades = ({
    sortBy = "closeDate",
    timeframe = "allHistory",
    tradesToSort,
}: sortTradesFunctionType): Trades[] => {
    const now = new Date();
    let filtered: Trades[] = tradesToSort;

    if (timeframe !== "allHistory") {
        filtered = tradesToSort.filter((trade): trade is Trades & { closeDate: string } =>
            Boolean(trade.closeDate)
        ).filter((trade) => {
            const closeDate = new Date(trade.closeDate);

            switch (timeframe) {
                case "today": {
                    return (
                        closeDate.getDate() === now.getDate() &&
                        closeDate.getMonth() === now.getMonth() &&
                        closeDate.getFullYear() === now.getFullYear()
                    );
                }

                case "thisWeek": {
                    const oneWeekAgo = new Date(now);
                    oneWeekAgo.setDate(now.getDate() - 7);
                    return closeDate >= oneWeekAgo && closeDate <= now;
                }

                case "thisMonth": {
                    const startOfMonth = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        1
                    );
                    return closeDate >= startOfMonth && closeDate <= now;
                }
            }
        });
    }
    const sortedTrades = [...filtered].sort((a, b) => {
        switch (sortBy) {
            case "symbolName":
            case "positionType":
                return (a[sortBy] || "").localeCompare(b[sortBy] || "");

            case "openDate":
            case "closeDate": {
                // First compare the date
                const aDate = sortBy === "openDate" ? a.openDate : a.closeDate;
                const bDate = sortBy === "openDate" ? b.openDate : b.closeDate;

                // Skip if date is missing
                if (!aDate || !bDate) return 0;

                const compareDates =
                    new Date(bDate).getTime() -
                    new Date(aDate).getTime();

                // If they differ, return the date comparison
                if (compareDates !== 0) {
                    return compareDates;
                }

                // Otherwise, compare by time
                const aTime = sortBy === "openDate" ? a.openTime : a.closeTime;
                const bTime = sortBy === "openDate" ? b.openTime : b.closeTime;

                // Skip if time is missing
                if (!aTime || !bTime) return 0;

                return (
                    timeStringToMinutes(bTime) -
                    timeStringToMinutes(aTime)
                );
            }
            case "result":
                return Number(b[sortBy]) - Number(a[sortBy]);

            default:
                return 0;
        }
    });

    return sortedTrades;
};
