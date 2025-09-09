import { Rule } from "./dbSchema.types";

export type Trades = {
    notes: string | undefined;
    id: string;
    result?: string;
    openDate: string;
    closeDate?: string;
    positionType: string;
    openTime: string;
    closeTime?: string;
    isActiveTrade: boolean;
    deposit: string;
    instrumentName: string;
    symbolName: string;
    entryPrice?: string;
    totalCost?: string;
    quantity?: string;
    sellPrice?: string;
    quantitySold?: string;
    rating: number | null;
    strategyId?: string | null;
    strategyName?: string;
    appliedOpenRules?: Rule[] | null;
    appliedCloseRules?: Rule[] | null;
};

export type SortByType =
    | "instrumentName"
    | "positionType"
    | "openDate"
    | "closeDate"
    | "result";

export type TimeframeType = "allHistory" | "today" | "thisWeek" | "thisMonth";
export type sortTradesFunctionType = {
    sortBy?: SortByType;
    timeframe?: TimeframeType;
    tradesToSort: Trades[];
};