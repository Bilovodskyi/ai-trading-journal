"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { ReportCard } from "./ReportCard";
import { ArrowUp } from "lucide-react";

import { Category, ReportType } from "@/types/tradeAI.types";
import { toast } from "sonner";
import CustomLoading from "../CustomLoading";
import AutoResizeTextarea from "@/features/archive/AutoResizeTextarea";
import { useAppSelector } from "@/redux/store";

type GeneratedReportType = {
    report: ReportType;

    selectCategory: Category;
    setReport: Dispatch<SetStateAction<ReportType | null>>;
    setTokens: Dispatch<SetStateAction<number | undefined>>;
};

export default function GeneratedReport({
    report,
    selectCategory,
    setReport,
    setTokens,
}: GeneratedReportType) {
    const [followUpQuestionInput, setFollowUpQuestionInput] = useState("");

    const trades = useAppSelector((state) => state.tradeRecords.listOfTrades);

    const [loading, setLoading] = useState({
        moneyManagement: false,
        instruments: false,
        timeManagement: false,
    });

    const filteredDataForAICall = trades?.map(
        ({ result, instrumentName, openTime }) => ({
            result,
            instrumentName,
            openTime,
        })
    );

    const prevResponse: Record<Category, string> = {
        moneyManagement: JSON.stringify(report?.moneyManagement),
        instruments: JSON.stringify(report?.instruments),
        timeManagement: JSON.stringify(report?.timeManagement),
    };

    const handleFollowUpWithAQuestion = async () => {
        if (selectCategory && report) {
            setLoading((prev) => {
                return {
                    ...prev,
                    [selectCategory]: true,
                };
            });
            const tempQuestionStorage = followUpQuestionInput;
            setFollowUpQuestionInput("");
            try {
                setReport((prevReport) => {
                    if (
                        prevReport === null ||
                        prevReport[selectCategory] === null
                    ) {
                        return null;
                    }

                    return {
                        ...prevReport,
                        [selectCategory]: [
                            ...prevReport[selectCategory],
                            { type: "user", content: [tempQuestionStorage] },
                        ],
                    };
                });
                const res = await fetch("/api/follow-up-claude", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        trades: filteredDataForAICall,
                        followUpQuestion: tempQuestionStorage,
                        prevResponse: prevResponse[selectCategory],
                    }),
                });

                if (!res.ok) {
                    const errorMessage = await res.json();
                    throw new Error(errorMessage.error);
                }

                const data = await res.json();

                const claudeReport = JSON.parse(data.content[0].text);

                setReport((prevReport) => {
                    if (
                        prevReport === null ||
                        prevReport[selectCategory] === null
                    ) {
                        return null;
                    }

                    return {
                        ...prevReport,
                        [selectCategory]: [
                            ...prevReport[selectCategory],
                            {
                                type: "system",
                                content: [...claudeReport.answer],
                            },
                        ],
                    };
                });

                setTokens((prev) => (prev ?? 0) - 2);
                toast.success("You've spent 2 tokens!");
            } catch (err) {
                if (err instanceof Error) {
                    toast.error(err.message);
                    console.log(err.message);
                } else {
                    toast.error("Error occured! Try again later!");
                    console.log(err);
                }
            } finally {
                setLoading((prev) => {
                    return {
                        ...prev,
                        [selectCategory]: false,
                    };
                });
            }
        }
    };
    return (
        <>
            <div className="h-full w-full overflow-scroll">
                {report && selectCategory === "moneyManagement" && (
                    <ReportCard
                        items={report.moneyManagement}
                        loading={loading.moneyManagement}
                    />
                )}
                {report && selectCategory === "instruments" && (
                    <ReportCard
                        items={report.instruments}
                        loading={loading.instruments}
                    />
                )}
                {report &&
                    selectCategory === "timeManagement" &&
                    (report.timeManagement !== null ? (
                        <ReportCard
                            items={report.timeManagement}
                            loading={loading.timeManagement}
                        />
                    ) : (
                        <div className="flex-">
                            <div className="min-h-[100px] h-[calc(100%-62px)] flex flex-col gap-2 items-center justify-center">
                                <CustomLoading />
                                <p className="text-center">
                                    This part might take longer, since it uses
                                    advanced reasoning.
                                </p>
                            </div>
                        </div>
                    ))}
            </div>
            <div className="w-full flex flex-col items-center justify-center mt-4 px-4 xl:px-0">
                <div className="backdrop-blur-2xl rounded-2xl border border-gray-200 shadow-sm w-full max-w-3xl overflow-hidden absolute bottom-0 md:bottom-4 min-h-[120px] flex justify-between flex-col ">
                    <AutoResizeTextarea
                        value={followUpQuestionInput}
                        onChange={(e) =>
                            setFollowUpQuestionInput(e.target.value)
                        }
                        placeholder="Follow up with a question to Claude."
                    />

                    {selectCategory && followUpQuestionInput.length > 0 && (
                        <button
                            onClick={handleFollowUpWithAQuestion}
                            className="absolute top-3 right-3 bg-[#da7756] p-2 rounded-xl">
                            <ArrowUp className="h-[18px] w-[18px] text-white" />
                        </button>
                    )}
                    <div className="flex gap-2 items-center">
                        <p className="p-3">
                            Claude{" "}
                            <span className="text-zinc-500">4.5 sonnet</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
