import { Rule } from "./dbSchema.types";

export type Strategy = {
    id: string;
    strategyName: string;
    description: string | null;
    openPositionRules: Rule[];
    closePositionRules: Rule[];
};

export type GetStrategiesSuccess = {
    success: boolean;
    strategies: Strategy[];
};

export type GetStrategiesError = {
    success: boolean;
    error: string;
};

export type GetStrategiesResult = GetStrategiesSuccess | GetStrategiesError;

type DeleteStrategyFromDBSuccess = {
    success: true;
};

type DeleteStrategyFromDBError = {
    success: false;
    error: string;
};

export type DeleteStrategyFromDBResult =
    | DeleteStrategyFromDBSuccess
    | DeleteStrategyFromDBError;
