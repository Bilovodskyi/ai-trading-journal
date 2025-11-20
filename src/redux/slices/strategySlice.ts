import { Strategy } from "@/types/strategies.types";
import { createSlice } from "@reduxjs/toolkit";

type strategyState = {
    strategies: Strategy[];
    searchQuery: string;
    activeTab: "history" | "rules";
};

const initialState: strategyState = {
    strategies: [],
    searchQuery: "",
    activeTab: "rules",
};

const strategiesSlice = createSlice({
    name: "strategies",
    initialState,
    reducers: {
        setStrategyState: (state, action) => {
            state.strategies = action.payload;
        },
        addStrategyToTheState: (state, action) => {
            state.strategies.push(action.payload);
        },
        deleteLocalStrategy: (state, action) => {
            const { id } = action.payload;

            state.strategies = state.strategies.filter(
                (strategy) => strategy.id !== id
            );
        },
        editStrategyInTheState: (state, action) => {
            const { id, openPositionRules, closePositionRules, strategyName, description } = action.payload;
            state.strategies = state.strategies.map(strategy =>
                strategy.id === id
                    ? {
                        ...strategy,
                        openPositionRules,
                        closePositionRules,
                        strategyName,
                        description,
                    }
                    : strategy
            );
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
    },
});

export const { setStrategyState, addStrategyToTheState, deleteLocalStrategy, editStrategyInTheState, setSearchQuery, setActiveTab } =
    strategiesSlice.actions;

export default strategiesSlice.reducer;
