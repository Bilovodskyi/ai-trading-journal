"use client";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
    TableFooter,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { sortTrades } from "@/features/history/sortTrades";
import { useAppSelector } from "@/redux/store";
import { Trades } from "@/types";
import { useEffect, useState } from "react";

import { MdDelete, MdStar } from "react-icons/md";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { LiaHandPointer } from "react-icons/lia";
import { PiCalendarDotsThin } from "react-icons/pi";

import { getCapital } from "@/server/actions/user";
import { Moon, Sun } from "lucide-react";
import { isInMorningRange } from "@/features/history/isInMorningRange";
import Image from "next/image";
import { FollowedStrategyPie } from "@/components/history/FollowedStrategyPie";
import EditTrade from "@/components/history/EditTrade";
import { useDeleteTrade } from "@/hooks/useDeleteTrade";
import { StrategyRules } from "@/components/trade-dialog/StrategyRules";

export default function Page() {
    const [sortedTrades, setSortedTrades] = useState<Trades[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [startCapital, setStartCapital] = useState<string | null>(null);
    const [strategyDialogOpen, setStrategyDialogOpen] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState<Trades | null>(null);

    const trades = useAppSelector((state) => state.tradeRecords.listOfTrades);
    const filteredTrades = useAppSelector(
        (state) => state.history.filteredTrades
    );

    const sortBy = useAppSelector((state) => state.history.sortBy);
    const timeframe = useAppSelector((state) => state.history.timeframe);
    const { strategies: localStrategies } = useAppSelector(
        (state) => state.strategies
    );

    const { handleDeleteTradeRecord } = useDeleteTrade();

    const tradesToSort = filteredTrades || trades || [];

    useEffect(() => {
        async function fetchData() {
            const response = await getCapital();
            if (response && typeof response === "string") {
                setStartCapital(response);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        const result = sortTrades({
            sortBy,
            timeframe,
            tradesToSort,
        });
        const reducedTotal = result.reduce(
            (acc, cur) => acc + Number(cur.result),
            0
        );
        setSortedTrades(result);
        setTotal(reducedTotal);
    }, [sortBy, timeframe, trades, filteredTrades]);



    const handleCountPercentage = (trade: Trades) => {
        const appliedCloseRules = trade.appliedCloseRules || [];
        const appliedOpenRules = trade.appliedOpenRules || [];
        const strategy = localStrategies.find(s => s.id === trade.strategyId);
        const totalCloseRulesOverall = strategy?.closePositionRules.length || 0;
        const totalOpenRulesOverall = strategy?.openPositionRules.length || 0;
        const totalRulesOverall = totalCloseRulesOverall + totalOpenRulesOverall;
        const totalRulesFollowed = appliedCloseRules.length + appliedOpenRules.length;
        const percentage = (totalRulesFollowed / totalRulesOverall) * 100;
        return percentage;
    };

    const handleStrategyClick = (trade: Trades) => {
        setSelectedTrade(trade);
        setStrategyDialogOpen(true);
    };

    if (sortedTrades.length === 0) {
        return (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-500">
                No trades found - create one to get started
            </div>
        );
    }

    return (
        <div className="flex flex-col md:h-full">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[10%]">Instrument</TableHead>
                        <TableHead className="w-[5%] max-md:hidden">
                            Type
                        </TableHead>
                        <TableHead className="w-[10%]">Open date</TableHead>
                        <TableHead className="w-[7.5%] max-md:hidden">
                            Open time
                        </TableHead>
                        <TableHead className="w-[10%]">Close date</TableHead>
                        <TableHead className="w-[7.5%] max-md:hidden">
                            Close time
                        </TableHead>
                        <TableHead className="w-[10%] max-md:hidden">
                            Deposit{" "}
                            <p className="text-[.75rem]">(% of capital)</p>
                        </TableHead>
                        <TableHead className="w-[10%]">Result</TableHead>
                        <TableHead className="w-[5%] max-md:hidden">
                            Note
                        </TableHead>
                        <TableHead className="text-center w-[5%]">
                            Strategy
                        </TableHead>
                        <TableHead className="text-center w-[10%]">
                            Rating
                        </TableHead>
                        <TableHead className="text-center w-[5%]">
                            Edit
                        </TableHead>
                        <TableHead className="text-center w-[5%]">
                            Delete
                        </TableHead>
                    </TableRow>
                </TableHeader>
            </Table>
            <div className="flex-1 overflow-auto">
                <Table>
                    <TableBody>
                        {sortedTrades.map((trade) => (
                            <TableRow key={trade.id}>
                                <TableCell className="font-medium w-[10%]">
                                    {trade.instrumentName}
                                </TableCell>
                                <TableCell className="w-[5%] max-md:hidden">
                                    <p
                                        className={`bg-${trade.positionType === "sell"
                                            ? "sell"
                                            : "buy"
                                            } w-fit px-2 rounded-md text-white text-[.8rem]`}>
                                        {trade.positionType}
                                    </p>
                                </TableCell>
                                <TableCell className="w-[10%] text-neutral-500">
                                    <div className="flex gap-2 items-center">
                                        <PiCalendarDotsThin className="max-md:hidden" />
                                        {new Intl.DateTimeFormat("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        }).format(new Date(trade.openDate))}
                                    </div>
                                </TableCell>
                                <TableCell className="w-[7.5%] max-md:hidden text-neutral-500">
                                    <div className="flex gap-2 items-center">
                                        {isInMorningRange(trade.openTime) ? (
                                            <Sun className="h-3" />
                                        ) : (
                                            <Moon className="h-3" />
                                        )}
                                        {trade.openTime}
                                    </div>
                                </TableCell>
                                <TableCell className="w-[10%] text-neutral-500">
                                    <div className="flex gap-2 items-center">
                                        <PiCalendarDotsThin className="max-md:hidden" />
                                        {new Intl.DateTimeFormat("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        }).format(new Date(trade.closeDate))}
                                    </div>
                                </TableCell>
                                <TableCell className="w-[7.5%] max-md:hidden text-neutral-500">
                                    <div className="flex gap-2 items-center">
                                        {isInMorningRange(trade.closeTime) ? (
                                            <Sun className="h-3" />
                                        ) : (
                                            <Moon className="h-3" />
                                        )}
                                        {trade.closeTime}
                                    </div>
                                </TableCell>
                                <TableCell className="w-[10%] max-md:hidden">
                                    <div className="flex gap-2 items-center">
                                        {Number(trade.deposit).toLocaleString(
                                            "de-DE"
                                        )}
                                        <div className="text-xs text-neutral-400">
                                            (
                                            {startCapital && +startCapital !== 0
                                                ? `${Math.round(
                                                    (Number(trade.deposit) /
                                                        Number(
                                                            startCapital
                                                        )) *
                                                    100
                                                )}%`
                                                : "no capital"}
                                            )
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell
                                    className={`w-[10%] max-md:text-end pr-8 md:pr-0 ${Number(trade.result) >= 0
                                        ? "text-buy"
                                        : "text-sell"
                                        }`}>
                                    <div className="flex gap-2 items-center">
                                        {Number(trade.result) >= 0 ? (
                                            <FaArrowTrendUp className="text-[1rem]" />
                                        ) : (
                                            <FaArrowTrendDown />
                                        )}
                                        {Number(trade.result).toLocaleString(
                                            "de-DE"
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="w-[5%] max-md:hidden">
                                    {trade.notes && (
                                        <HoverCard>
                                            <HoverCardTrigger>
                                                <div className="w-fit flex gap-1 items-center bg-blue-400 cursor-pointer rounded-full p-2 text-[0.75rem] text-white">
                                                    <LiaHandPointer className="text-[1rem]" />
                                                </div>
                                            </HoverCardTrigger>
                                            <HoverCardContent>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src="/logo.svg"
                                                            height={20}
                                                            width={20}
                                                            alt="logo"
                                                        />
                                                        <h1 className="text-neutral-400">
                                                            @tradejournal.one
                                                        </h1>
                                                    </div>
                                                    <div className="py-2">
                                                        {trade.notes}
                                                    </div>
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
                                    )}
                                </TableCell>
                                <TableCell className="w-[5%]">
                                    {(startCapital &&
                                        (trade.appliedCloseRules &&
                                            trade.appliedCloseRules.length >
                                            0 ||
                                            (trade.appliedOpenRules &&
                                                trade.appliedOpenRules
                                                    .length > 0))) && (
                                            <div onClick={() => handleStrategyClick(trade)}>
                                                <FollowedStrategyPie percentage={handleCountPercentage(trade)} />
                                            </div>
                                        )}
                                </TableCell>
                                <TableCell className="w-[10%]">

                                    <div className="w-full flex-center">
                                        {[...Array(5)].map((_, i) => (
                                            <MdStar
                                                key={i}
                                                className={`${trade.rating && trade.rating > i
                                                    ? "text-yellow-500"
                                                    : "text-neutral-400"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="w-[5%] text-center">
                                    <EditTrade trade={trade} />
                                </TableCell>
                                <TableCell className="w-[5%] ">
                                    <MdDelete
                                        onClick={() =>
                                            handleDeleteTradeRecord(
                                                trade.id,
                                                trade.result,
                                                trade.closeDate
                                            )
                                        }
                                        className="text-[1.2rem] text-sell cursor-pointer w-full"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Table>
                <TableFooter className="sticky bottom-0 right-0 left-0 bg-white w-full text-[1rem] px-2 py-1 mt-auto">
                    <TableRow className="flex justify-between">
                        <TableCell>Total</TableCell>
                        <TableCell>{total.toLocaleString("de-DE")}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>

            {/* Strategy Rules Dialog */}
            <Dialog open={strategyDialogOpen} onOpenChange={setStrategyDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Applied Strategy Rules - {selectedTrade && localStrategies.find(s => s.id === selectedTrade.strategyId)?.strategyName}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedTrade && selectedTrade.strategyId && (
                        <StrategyRules
                            strategy={localStrategies.find(s => s.id === selectedTrade.strategyId)!}
                            checkedOpenRules={selectedTrade.appliedOpenRules?.map(rule => rule.id) || []}
                            checkedCloseRules={selectedTrade.appliedCloseRules?.map(rule => rule.id) || []}
                            onOpenRuleToggle={() => { }} // Disabled for display-only
                            onCloseRuleToggle={() => { }} // Disabled for display-only
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
