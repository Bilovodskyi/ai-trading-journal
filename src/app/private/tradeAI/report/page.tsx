"use client";

import React, { useEffect, useRef } from "react";

import { getAIReport } from "@/features/ai/getAiReport";
import { useAppSelector } from "@/redux/store";

import { checkIfUserHasTokens } from "@/server/actions/user";
import { ApiResponse, ReportType } from "@/types/tradeAI.types";

import { useState } from "react";
import { toast } from "sonner";
import ReportPage from "@/components/tradeAI/ReportPage";

export default function Report() {
    const trades = useAppSelector((state) => state.tradeRecords.listOfTrades);

    const [tokens, setTokens] = useState<number | undefined>();
    const [report, setReport] = useState<ReportType | null>(null);
    const hasFetched = useRef(false);

    const filteredDataForAICall = trades?.map(
        ({ result, symbolName, openTime }) => ({
            result,
            symbolName,
            openTime,
        })
    );

    useEffect(() => {
        if (hasFetched.current) return;
        if (!trades || trades.length < 3) {
            toast.error(
                "You don’t have enough trades. You must have at least 3 trades to get the report!"
            );
            return;
        }

        hasFetched.current = true;
        const fetchReport = async () => {
            try {
                const checkTokens = await checkIfUserHasTokens();

                if (!checkTokens.success) {
                    toast.error(checkTokens.message ?? "Token check failed");
                    return;
                }

                if (!checkTokens.tokens) {
                    toast.error(
                        "You don't have enough tokens for this operation. Go to the tokens page to check your balance."
                    );
                    return;
                }

                setTokens(checkTokens.tokens - 1);

                const localReport = getAIReport(trades);
                setReport({
                    moneyManagement: [
                        {
                            type: "system",
                            content: localReport.moneyManagement,
                        },
                    ],
                    instruments: [
                        { type: "system", content: localReport.instruments },
                    ],
                    timeManagement: null,
                });

                const res = await fetch("/api/claude", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ trades: filteredDataForAICall }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error);
                }

                const claudeReport: ApiResponse = await res.json();

                setReport((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        timeManagement: [
                            {
                                type: "system",
                                content: [
                                    ...claudeReport.claudeComments
                                        .generalObservations,
                                    ...claudeReport.claudeComments
                                        .recommendations,
                                ],
                            },
                        ],
                    };
                });

                toast.success("You've spent 1 token!");
            } catch (err) {
                const msg =
                    err instanceof Error
                        ? err.message
                        : "Error occurred! Try again later!";
                toast.error(msg);
                console.error(err);
            }
        };

        fetchReport();
    }, [trades]);

    return (
        <ReportPage
            tokens={tokens}
            goBackButton="Trade AI"
            report={report}
            setReport={setReport}
            setTokens={setTokens}
        />
    );
}
