"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import Image from "next/image";
import { SiClaude } from "react-icons/si";
import MobileNavigation from "@/components/MobileNavigation";
import { useAppDispatch } from "@/redux/store";
import {
    setInitialMonthViewSummary,
    setInitialTotalOfParticularYearSummary,
    setInitialYearViewSummary,
    setListOfTrades,
    setTradeDetailsForEachDay,
} from "@/redux/slices/tradeRecordsSlice";
import { setStrategyState } from "@/redux/slices/strategySlice";
import { Trades } from "@/types";
import { Strategy } from "@/types/strategies.types";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { BsJournalCheck } from "react-icons/bs";
import { LuChartSpline } from "react-icons/lu";
import { VscHistory } from "react-icons/vsc";
import { PiStrategyLight } from "react-icons/pi";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { VscFolderLibrary } from "react-icons/vsc";
import { getTradeSummary } from "@/features/calendar/getTradeSummary";
import { getTradeDetailsForEachDay } from "@/features/calendar/getTradeDetailsForEachDay";

interface PrivateLayoutClientProps {
    children: ReactNode;
    initialTradeRecords: Trades[];
    initialStrategies: Strategy[];
}

export default function PrivateLayoutClient({
    children,
    initialTradeRecords,
    initialStrategies,
}: PrivateLayoutClientProps) {
    const { user } = useUser();
    const dispatch = useAppDispatch();
    const [isMounted, setIsMounted] = useState(false);

    const monthViewTrades = useMemo(
        () => getTradeSummary("day", initialTradeRecords),
        [initialTradeRecords]
    );
    const yearViewTrades = useMemo(
        () => getTradeSummary("month", initialTradeRecords),
        [initialTradeRecords]
    );
    const particularYearTrades = useMemo(
        () => getTradeSummary("year", initialTradeRecords),
        [initialTradeRecords]
    );
    const tradeDetailsForEachDay = useMemo(
        () => getTradeDetailsForEachDay(initialTradeRecords),
        [initialTradeRecords]
    );

    useEffect(() => {
        setIsMounted(true);

        if (initialTradeRecords?.length > 0) {
            dispatch(setListOfTrades(initialTradeRecords));
        }

        // Initialize strategies in Redux
        if (initialStrategies?.length > 0) {
            dispatch(setStrategyState(initialStrategies));
        }

        if (Object.keys(monthViewTrades).length > 0) {
            dispatch(setInitialMonthViewSummary(monthViewTrades));
        }

        if (Object.keys(yearViewTrades).length > 0) {
            dispatch(setInitialYearViewSummary(yearViewTrades));
        }

        if (Object.keys(particularYearTrades).length > 0) {
            dispatch(
                setInitialTotalOfParticularYearSummary(particularYearTrades)
            );
        }
        if (Object.keys(tradeDetailsForEachDay).length > 0) {
            dispatch(setTradeDetailsForEachDay(tradeDetailsForEachDay));
        }
    }, [
        dispatch,
        initialTradeRecords,
        initialStrategies,
        monthViewTrades,
        yearViewTrades,
        particularYearTrades,
        tradeDetailsForEachDay,
    ]);

    const getUserDisplayName = () => {
        if (!user) return "";
        return (
            user.firstName ??
            (user.username ?? "").charAt(0).toLocaleUpperCase() +
                (user.username ?? "").slice(1)
        );
    };

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="flex flex-col h-svh md:h-screen bg-darkPrimary md:p-2">
                <header className="px-3 md:px-6 py-3 flex items-center justify-between bg-white md:rounded-t-3xl border-b md:border border-zinc-200">
                    <MobileNavigation />
                    <div className="hidden md:flex gap-2 items-center">
                        <Image
                            src="/logo.svg"
                            alt="logo"
                            width={30}
                            height={30}
                        />
                        <p className="font-semibold text-[1rem] max-md:hidden">
                            Journal
                        </p>

                        <p className="font-semibold text-[1rem] max-md:hidden">
                            &
                        </p>
                        <SiClaude size={24} className="text-[#da7756]" />
                    </div>
                    <div className="hidden md:flex gap-4">
                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem className="px-4 py-2 text-[.85rem] text-zinc-700 rounded-md transition-colors hover:bg-zinc-100">
                                    <Link href="/private/calendar">
                                        Calendar{" "}
                                    </Link>
                                </NavigationMenuItem>
                                {/* <NavigationMenuItem className="px-4 py-2 text-[.85rem] text-zinc-700 rounded-md transition-colors hover:bg-zinc-100">
                                    <Link href="/private/history">History</Link>
                                </NavigationMenuItem>
                                <NavigationMenuItem className="px-4 py-2 text-[.85rem] text-zinc-700 rounded-md transition-colors hover:bg-zinc-100">
                                    <Link href="/private/statistics">
                                        Statistics
                                    </Link>
                                </NavigationMenuItem> */}
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="text-[.85rem] text-zinc-700">
                                        Analytics
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                            <Link
                                                href="/private/history"
                                                className="hover:bg-zinc-100 px-3 py-2 rounded-md cursor-pointer">
                                                <div className="flex gap-2 items-center">
                                                    <VscHistory />
                                                    <h1>History</h1>
                                                </div>
                                                <span className="leading-none text-[.85rem] text-zinc-400">
                                                    Access your full trading
                                                    history, make edits or
                                                    deletions
                                                </span>
                                            </Link>
                                            <Link
                                                href="/private/strategies"
                                                className="hover:bg-zinc-100 px-3 py-2 rounded-md cursor-pointer">
                                                <div className="flex gap-2 items-center">
                                                    <PiStrategyLight />
                                                    <h1>Strategies</h1>
                                                </div>
                                                <span className="leading-none text-[.85rem] text-zinc-400">
                                                    Create custom strategies to
                                                    help you stay in control.
                                                </span>
                                            </Link>
                                            <Link
                                                href="/private/statistics"
                                                className="hover:bg-zinc-100 px-3 py-2 rounded-md cursor-pointer">
                                                <div className="flex gap-2 items-center">
                                                    <LuChartSpline />
                                                    <h1>Statistics</h1>
                                                </div>
                                                <span className="leading-none text-[.85rem] text-zinc-400">
                                                    Detailed charts that show
                                                    your performance
                                                </span>
                                            </Link>
                                            <Link
                                                href="/private/journal"
                                                className="hover:bg-zinc-100 px-3 py-2 rounded-md cursor-pointer">
                                                <div className="flex gap-2 items-center">
                                                    <BsJournalCheck />
                                                    <h1>Journal</h1>
                                                </div>
                                                <span className="leading-none text-[.85rem] text-zinc-400">
                                                    Journal your thoughts.
                                                    Summarize your days, weeks,
                                                    and months.
                                                </span>
                                            </Link>
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="text-[.85rem] text-zinc-700">
                                        Report AI
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                            <li className="row-span-3">
                                                <NavigationMenuLink asChild>
                                                    <div className="test flex h-full w-full select-none flex-col justify-end rounded-md p-6">
                                                        <div className="mb-2 mt-4 text-lg text-white">
                                                            Report AI
                                                        </div>
                                                        <p className="leading-5 text-[.85rem] text-zinc-100">
                                                            Powerful tool to
                                                            improve your results
                                                            with AI. Powered by
                                                            Claude 4.5 Sonnet.
                                                        </p>
                                                    </div>
                                                </NavigationMenuLink>
                                            </li>
                                            <li className="hover:bg-zinc-100 px-3 py-2 rounded-md cursor-pointer">
                                                <Link href="/private/tradeAI">
                                                    <div className="flex gap-2 items-center">
                                                        <SiClaude className="text-[#da7756]" />
                                                        <h1>Report AI</h1>
                                                    </div>
                                                    <span className="leading-none text-[.85rem] text-zinc-400">
                                                        Generate an AI-powered
                                                        report.
                                                    </span>
                                                </Link>
                                            </li>
                                            <li className="hover:bg-zinc-100 px-3 py-2 rounded-md cursor-pointer">
                                                <Link href="/private/tokens">
                                                    <div className="flex gap-2 items-center">
                                                        <RiMoneyDollarCircleLine />
                                                        <h1>Tokens</h1>
                                                    </div>
                                                    <span className="leading-none text-[.85rem] text-zinc-400">
                                                        Get more tokens.
                                                    </span>
                                                </Link>
                                            </li>
                                            <li className="hover:bg-zinc-100 px-3 py-2 rounded-md cursor-pointer">
                                                <Link href="/private/reports-history">
                                                    <div className="flex gap-2 items-center">
                                                        <VscFolderLibrary />
                                                        <h1>Archive</h1>
                                                    </div>
                                                    <span className="leading-none text-[.85rem] text-zinc-400">
                                                        View the history of your
                                                        reports.
                                                    </span>
                                                </Link>
                                            </li>
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="text-[.85rem] text-zinc-700">
                                        Ecosystem
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                            <Link
                                                href="https://www.investsquid.com"
                                                target="_blank"
                                                className="hover:bg-zinc-100 px-3 py-2 rounded-md cursor-pointer">
                                                <div className="flex gap-4 items-center">
                                                    <h1>AI Investor</h1>
                                                    <ExternalLink className="h-4" />
                                                </div>
                                                <span className="leading-none text-[.85rem] text-zinc-400">
                                                    Use AI and advanced
                                                    algorithms to pick the right
                                                    investments
                                                </span>
                                            </Link>

                                            <Link
                                                href="/private/feedback"
                                                className="hover:bg-zinc-100 px-3 py-2 rounded-md">
                                                <div className="flex gap-2 items-center">
                                                    <h1>Feedback</h1>
                                                </div>
                                                <span className="leading-none text-[.85rem] text-zinc-400">
                                                    Help us improve the app.
                                                </span>
                                            </Link>
                                            <Link
                                                href="https://github.com/Bilovodskyi/ai-trade-journal"
                                                target="_blank"
                                                className="hover:bg-zinc-100 px-3 py-2 rounded-md">
                                                <div className="flex gap-2 items-center">
                                                    <h1>Give a ⭐ on GitHub</h1>
                                                    <FaGithub />
                                                </div>
                                                <span className="leading-none text-[.85rem] text-zinc-400">
                                                    Support the project — give
                                                    it a star on GitHub.
                                                </span>
                                            </Link>
                                            <li className="hover:bg-zinc-100 px-3 py-2 rounded-md">
                                                <div className="flex gap-4 items-center">
                                                    <h1>Articles</h1>
                                                    <span className="text-[.8rem] bg-gradient-to-r from-emerald-400 to-blue-300 text-transparent bg-clip-text">
                                                        Coming soon...
                                                    </span>
                                                </div>
                                                <span className="leading-none text-[.85rem] text-zinc-400">
                                                    Learn and share your
                                                    knowledge with others.
                                                </span>
                                            </li>
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        {isMounted ? (
                            <>
                                Hi, {getUserDisplayName()}
                                <UserButton />
                            </>
                        ) : (
                            <>
                                <span className="opacity-0">User</span>
                                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                            </>
                        )}
                    </div>
                </header>
                <div className="flex-1 bg-white md:rounded-b-3xl border border-zinc-200 border-t-0 overflow-scroll 2xl:overflow-hidden">
                    {children}
                </div>
            </div>
        </>
    );
}
