import { Trades } from "@/types";
import { helperFunctionSP500vsYourReturns } from "./helperFunctionSP500vsYourReturns";

export const getOtherDataForGridPageTwo = (
    trades: Trades[],
    capital: string | undefined
) => {
    if (!capital || trades.length === 0) {
        return {
            chartOne: {
                capitalChanges: [],
                dateLabels: [],
                sp500Alternative: [],
            },
            chartTwo: {
                topTrades: [],
            },
            chartThree: {
                results: [],
                dates: [],
            },
            chartFour: [],
        };
    }
    const [capitalChanges, dateLabels, sp500Alternative] =
        helperFunctionSP500vsYourReturns(trades, capital);

    const topTrades = getTopTrades(trades);

    const closedTrades = trades.filter(
        (trade): trade is Trades & { closeDate: string } =>
            Boolean(trade.closeDate)
    );

    const topTenTrades = [...closedTrades]
        .sort((a, b) => Number(b.result) - Number(a.result))
        .slice(0, 11);

    const results = topTenTrades.map((trade) => Number(trade.result));
    const dates = topTenTrades
        .filter((trade) => trade.closeDate)
        .map((trade) => trade.closeDate.split("T")[0]);

    const convertedTopInstruments = topTrades
        .filter((trade) => trade.label !== "Other")
        .map((trade) => trade.label);

    const topInstrumentsByDay = getTopInstrumentsByDay(
        trades,
        convertedTopInstruments
    );

    return {
        chartOne: {
            capitalChanges,
            dateLabels,
            sp500Alternative,
        },
        chartTwo: {
            topTrades,
        },
        chartThree: {
            results,
            dates,
        },
        chartFour: [
            {
                data: Object.values(
                    topInstrumentsByDay[0] || { "No data": Array(7).fill(0) }
                )[0],
                color: "#9999FF",
                label: Object.keys(
                    topInstrumentsByDay[0] || { "No data": Array(7).fill(0) }
                )[0],
            },
            {
                data: Object.values(
                    topInstrumentsByDay[1] || { "No data": Array(7).fill(0) }
                )[0],
                color: "#FAC666",
                label: Object.keys(
                    topInstrumentsByDay[1] || { "No data": Array(7).fill(0) }
                )[0],
            },
            {
                data: Object.values(
                    topInstrumentsByDay[2] || { "No data": Array(7).fill(0) }
                )[0],
                color: "#E16540",
                label: Object.keys(
                    topInstrumentsByDay[2] || { "No data": Array(7).fill(0) }
                )[0],
            },
        ],
    };
};

const getTopTrades = (trades: Trades[]) => {
    const topTrades: { [key: string]: number } = {};
    for (let i = 0; i < trades.length; i++) {
        const name = trades[i].symbolName;
        if (topTrades[name]) {
            topTrades[name] += 1;
        } else {
            topTrades[name] = 1;
        }
    }

    const entries = Object.entries(topTrades).sort((a, b) => b[1] - a[1]);

    const topThree = entries.slice(0, 3);

    const sumTopThree = topThree.reduce((sum, [, count]) => sum + count, 0);

    const otherCount = trades.length - sumTopThree;

    const resultArray = topThree.map(([label, value], idx) => {
        return {
            id: idx,
            value: value,
            label: label,
        };
    });
    resultArray.push({
        id: 3,
        value: otherCount,
        label: "Other",
    });

    return resultArray;
};

function getTopInstrumentsByDay(
    trades: Trades[],
    topInstruments: string[]
): { [instrument: string]: number[] }[] {
    const instrumentData: { [instrument: string]: number[] } = {};
    topInstruments.forEach((instrument) => {
        instrumentData[instrument] = Array(7).fill(0);
    });

    trades
        .filter((trade): trade is Trades & { closeDate: string } =>
            Boolean(trade.closeDate)
        )
        .forEach((trade) => {
            const date = new Date(trade.closeDate);
            const dayIndex = date.getUTCDay();

            if (topInstruments.includes(trade.symbolName)) {
                instrumentData[trade.symbolName][dayIndex]++;
            }
        });

    const result = Object.entries(instrumentData).map(([instrument, data]) => ({
        [instrument]: data,
    }));

    return result;
}
