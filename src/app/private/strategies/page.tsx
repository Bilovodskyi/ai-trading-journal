"use client";

import { CustomButton } from "@/components/CustomButton";
import CustomLoading from "@/components/CustomLoading";
import AddStrategyDialog from "@/components/strategies/AddStrategyDialog";
import SearchStrategy from "@/components/strategies/SearchStrategy";
import SlidingTabs from "@/components/strategies/SlidingTabs";
import StrategyPageClientSideRenderig from "@/components/strategies/StrategyPageClientSideRenderig";
import { getAllStrategies } from "@/server/actions/strategies";
import {
    GetStrategiesError,
    GetStrategiesResult,
    GetStrategiesSuccess,
} from "@/types/strategies.types";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

function isGetStrategiesSuccess(
    result: GetStrategiesResult
): result is GetStrategiesSuccess {
    return result.success === true && "strategies" in result;
}

function isGetStrategiesError(
    result: GetStrategiesResult
): result is GetStrategiesError {
    return result.success === false && "error" in result;
}

export default function StrategiesPage() {
    const { userId } = useAuth();
    const [strategies, setStrategies] = useState<GetStrategiesResult | null>(null);
    const [hideAll, setHideAll] = useState(false);

    useEffect(() => {
        if (userId) {
            getAllStrategies(userId).then(setStrategies);
        }
    }, [userId]);

    if (!userId) return <div>Please sign in</div>;
    if (!strategies) return <div className="flex h-full items-center justify-center">
        <CustomLoading />
    </div>

    if (isGetStrategiesError(strategies)) {
        // Check if it's the profile completion error
        if (strategies.error.includes("complete your profile")) {
            return (
                <div className="flex flex-col h-full items-center justify-center space-y-4 px-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-semibold">Complete Your Profile First</h2>
                        <p className="text-gray-600 max-w-md">
                            To create and manage trading strategies, you need to complete your profile by adding your starting capital.
                        </p>
                    </div>
                    <Link href="/private/statistics">
                        <CustomButton isBlack={true}>
                            Go to Statistics & Add Capital
                        </CustomButton>
                    </Link>
                </div>
            );
        }
        return <div>Error loading strategies: {strategies.error}</div>;
    }

    if (!isGetStrategiesSuccess(strategies)) {
        return <div>Unexpected response format.</div>;
    }
    return (
        <div className="flex flex-col h-full">
            <div className="px-2 md:px-8 pt-6 pb-0 border-b border-neutral-200 md:space-y-4 2xl:space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-neutral-100 rounded-xl">
                            <Image
                                src="/main-logo.png"
                                width={40}
                                height={40}
                                alt="Logo"
                                className="w-10 h-10"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Trading Strategies</h1>
                            <p className="text-sm text-neutral-500 mt-1">Manage and track your trading rules</p>
                        </div>
                    </div>
                    <AddStrategyDialog />
                </div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between">
                    <SlidingTabs />

                    <div className="flex items-center gap-4 mb-2 md:mb-0">
                        <SearchStrategy />
                        <CustomButton isBlack={false} onClick={() => setHideAll(!hideAll)}>
                            {hideAll ? "Show all" : "Hide all"}
                        </CustomButton>
                    </div>

                </div>
            </div>
            <StrategyPageClientSideRenderig
                strategies={strategies.strategies}
                hideAll={hideAll}
            />
        </div >
    );
}
