"use client";
import { getMonth } from "@/features/calendar/getTime";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import dayjs from "dayjs";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "../ui/hover-card";

import { setIsDialogOpen } from "@/redux/slices/calendarSlice";
import { TradeDialog } from "../trade-dialog";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { getPlural } from "@/lib/utils";
import { TradeList } from "./TradeList";
import { useEffect, useState } from "react";
import { getJournalDates } from "@/server/actions/journal";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function MonthView() {
    const { month, year } = useAppSelector((state) => state.calendar.monthView);
    const trades = useAppSelector(
        (state) => state.tradeRecords.monthViewSummary
    );
    const isDialogOpen = useAppSelector((state) => state.calendar.isDialogOpen);

    const tradeDetailsForEachDay = useAppSelector(
        (state) => state.tradeRecords.tradeDetailsForEachDay
    );
    const allTrades =
        useAppSelector((state) => state.tradeRecords.listOfTrades) ?? [];

    const [journalDates, setJournalDates] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchJournalDates = async () => {
            const dates = await getJournalDates();
            // Convert YYYY-MM-DD to DD-MM-YYYY to match calendar format
            const formattedDates = new Set(
                dates.map((date) => dayjs(date).format("DD-MM-YYYY"))
            );
            setJournalDates(formattedDates);
        };
        fetchJournalDates();
    }, []);

    const currentMonth = getMonth(month, year);

    const dispatch = useAppDispatch();

    const toggleDialog = (dayKey: string, open: boolean) => {
        dispatch(setIsDialogOpen({ key: dayKey, value: open }));
    };

    console.log(trades);

    return (
        <div
            className={`grid grid-cols-7 grid-rows-${currentMonth.length} h-full w-full`}>
            {currentMonth.map((week, i) => (
                <div key={i} className="grid grid-cols-7 col-span-7 row-span-1">
                    {week.map((day, j) => {
                        const dayKey = day.format("DD-MM-YYYY");
                        const hasJournalEntry = journalDates.has(dayKey);
                        const openTradesCount = allTrades.filter(
                            (trade) =>
                                (!trade.closeDate || trade.closeDate === "") &&
                                dayjs(trade.openDate).format("DD-MM-YYYY") ===
                                    day.format("DD-MM-YYYY")
                        ).length;
                        return (
                            <Sheet
                                key={j}
                                open={!!isDialogOpen[dayKey]}
                                onOpenChange={(open) =>
                                    toggleDialog(dayKey, open)
                                }>
                                <SheetTrigger asChild>
                                    <div
                                        className={`relative cursor-pointer border-[0.5px] ${
                                            // Check if there are trades for this day
                                            tradeDetailsForEachDay[
                                                day.format("DD-MM-YYYY")
                                            ] !== undefined
                                                ? "border-white"
                                                : "border-zinc-200"
                                        }  flex flex-col items-center ${
                                            // Show styling only if trades exist for this day
                                            tradeDetailsForEachDay[
                                                day.format("DD-MM-YYYY")
                                            ] !== undefined
                                                ? trades[
                                                      day.format("DD-MM-YYYY")
                                                  ] !== undefined
                                                    ? trades[
                                                          day.format(
                                                              "DD-MM-YYYY"
                                                          )
                                                      ] > 0
                                                        ? "bg-buyLight"
                                                        : trades[
                                                              day.format(
                                                                  "DD-MM-YYYY"
                                                              )
                                                          ] < 0
                                                        ? "bg-sellLight"
                                                        : "bg-neutral-100"
                                                    : "bg-neutral-100" // trades sum to 0 but trades exist
                                                : "" // no trades at all
                                        }`}>
                                        {i === 0 && <p>{day.format("ddd")}</p>}

                                        <p
                                            className={`${
                                                day.format("DD-MM-YY") ===
                                                dayjs().format("DD-MM-YY")
                                                    ? "w-8 h-8 flex-center rounded-full bg-purple-300"
                                                    : "pt-[4px]"
                                            }`}>
                                            {day.date() === 1
                                                ? day.format("MMM D")
                                                : day.format("D")}
                                        </p>
                                        {tradeDetailsForEachDay[
                                            day.format("DD-MM-YYYY")
                                        ] !== undefined && (
                                            <div className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex md:hidden gap-2 items-center">
                                                <p
                                                    className={`md:text-[1rem] pt-4 md:pt-0 ${
                                                        trades[
                                                            day.format(
                                                                "DD-MM-YYYY"
                                                            )
                                                        ] !== undefined
                                                            ? trades[
                                                                  day.format(
                                                                      "DD-MM-YYYY"
                                                                  )
                                                              ] > 0
                                                                ? "text-buy"
                                                                : trades[
                                                                      day.format(
                                                                          "DD-MM-YYYY"
                                                                      )
                                                                  ] < 0
                                                                ? "text-sell"
                                                                : "text-neutral-600"
                                                            : "text-neutral-600" // fallback when trades sum to 0
                                                    }`}>
                                                    {trades[
                                                        day.format("DD-MM-YYYY")
                                                    ] !== undefined
                                                        ? trades[
                                                              day.format(
                                                                  "DD-MM-YYYY"
                                                              )
                                                          ].toLocaleString(
                                                              "de-DE"
                                                          )
                                                        : "0"}
                                                </p>
                                            </div>
                                        )}
                                        {tradeDetailsForEachDay[
                                            day.format("DD-MM-YYYY")
                                        ] === undefined &&
                                            openTradesCount > 0 && (
                                                <HoverCard>
                                                    <HoverCardTrigger asChild>
                                                        <div className="absolute bottom-2 shrink-0 px-3 py-1 text-[.7rem] hidden md:flex justify-center items-center rounded-full calendar-banner-shadow bg-blue-200 no-wrap">
                                                            Open{" "}
                                                            {getPlural(
                                                                openTradesCount,
                                                                "trade",
                                                                "trades"
                                                            )}{" "}
                                                            :{openTradesCount}
                                                        </div>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent className="w-[420px]">
                                                        <TradeList
                                                            trades={allTrades.filter(
                                                                (t) =>
                                                                    (!t.closeDate || t.closeDate === "") &&
                                                                    dayjs(t.openDate).format("DD-MM-YYYY") ===
                                                                    day.format("DD-MM-YYYY")
                                                            )}
                                                            title="Open Trades"
                                                            type="open"
                                                        />
                                                    </HoverCardContent>
                                                </HoverCard>
                                            )}
                                        {tradeDetailsForEachDay[
                                            day.format("DD-MM-YYYY")
                                        ] !== undefined && (
                                            <HoverCard>
                                                <HoverCardTrigger asChild>
                                                    <div className="hidden md:flex gap-1 absolute bottom-2">
                                                        {openTradesCount >
                                                            0 && (
                                                            <div className="shrink-0 px-3 py-1 text-[.7rem] flex-center rounded-full calendar-banner-shadow no-wrap bg-blue-100">
                                                                Open{" "}
                                                                {getPlural(
                                                                    openTradesCount,
                                                                    "trade",
                                                                    "trades"
                                                                )}{" "}
                                                                :
                                                                {
                                                                    openTradesCount
                                                                }
                                                            </div>
                                                        )}
                                                        <div
                                                            className={`hidden md:flex shrink-0 px-3 py-1 text-[.7rem] flex-center rounded-full calendar-banner-shadow no-wrap ${
                                                                trades[
                                                                    day.format(
                                                                        "DD-MM-YYYY"
                                                                    )
                                                                ] !==
                                                                    undefined &&
                                                                trades[
                                                                    day.format(
                                                                        "DD-MM-YYYY"
                                                                    )
                                                                ] > 0
                                                                    ? "bg-buyWithOpacity"
                                                                    : "bg-sellWithOpacity"
                                                            }`}>
                                                            <div className="text-[.7rem] flex items-center gap-2">
                                                                Total:
                                                                {trades[
                                                                    day.format(
                                                                        "DD-MM-YYYY"
                                                                    )
                                                                ] !== undefined
                                                                    ? trades[
                                                                          day.format(
                                                                              "DD-MM-YYYY"
                                                                          )
                                                                      ].toLocaleString(
                                                                          "de-DE"
                                                                      )
                                                                    : "0"}
                                                            </div>
                                                        </div>
                                                        {hasJournalEntry && (
                                                            <Link
                                                                href={`/private/journal/${day.format("YYYY/MM/DD")}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="shrink-0 p-2 text-[.7rem] flex-center rounded-full calendar-banner-shadow bg-orange-200 hover:bg-orange-300 transition-colors no-wrap gap-1.5">
                                                                <FileText className="h-3 w-3" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-[420px] space-y-4">
                                                    <TradeList
                                                        trades={allTrades.filter(
                                                            (t) =>
                                                                dayjs(t.closeDate).format("DD-MM-YYYY") ===
                                                                day.format("DD-MM-YYYY")
                                                        )}
                                                        title="Closed Trades"
                                                        type="closed"
                                                    />
                                                    <TradeList
                                                        trades={allTrades.filter(
                                                            (t) =>
                                                                (!t.closeDate || t.closeDate === "") &&
                                                                dayjs(t.openDate).format("DD-MM-YYYY") ===
                                                                day.format("DD-MM-YYYY")
                                                        )}
                                                        title="Open Trades"
                                                        type="open"
                                                    />
                                                </HoverCardContent>
                                            </HoverCard>
                                        )}
                                        {tradeDetailsForEachDay[
                                            day.format("DD-MM-YYYY")
                                        ] === undefined &&
                                            openTradesCount === 0 &&
                                            hasJournalEntry && (
                                                <Link
                                                    href={`/private/journal/${day.format("YYYY/MM/DD")}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="absolute bottom-2 shrink-0 p-2 text-[.7rem] hidden md:flex justify-center items-center rounded-full calendar-banner-shadow bg-orange-200 hover:bg-orange-300 transition-colors no-wrap gap-1.5">
                                                    <FileText className="h-3 w-3" />
                                                </Link>
                                            )}
                                    </div>
                                </SheetTrigger>
                                <SheetContent className="">
                                    <TradeDialog day={day} />
                                </SheetContent>
                            </Sheet>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
