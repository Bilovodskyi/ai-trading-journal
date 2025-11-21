"use client";

import { CustomButton } from "@/components/CustomButton";
import CustomLoading from "@/components/CustomLoading";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    addRemoveFavorite,
    deleteReportFromDB,
    getReports,
} from "@/server/actions/archive";
import { ReportsEntry } from "@/types/tradeAI.types";
import { useUser } from "@clerk/nextjs";
import { Bot, ChevronLeft, ChevronRight, MessageSquare, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
    const { user } = useUser();
    const [reports, setReports] = useState<ReportsEntry[]>();
    const [sorted, setSorted] = useState<string>();
    const [showOnlyFavorite, setShowOnlyFavorite] = useState(false);
    const [paginatedReports, setPaginatedReports] = useState<ReportsEntry[]>();

    const [currentPage, setCurrentPage] = useState(1);
    const reportsPerPage = 9;
    const [totalPages, setTotalPages] = useState(0);

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getReports(user?.id);
                if (data?.success) {
                    setReports(data.reports);
                }
            } catch (err) {
                console.log(err);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        if (!reports) {
            setPaginatedReports([]);
            setTotalPages(0);
            return;
        }

        let filteredReports = [...reports];

        if (showOnlyFavorite) {
            filteredReports = filteredReports.filter(
                (report) => report.isFavorite
            );
        }

        if (sorted === "asc") {
            filteredReports.sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            );
        } else if (sorted === "desc") {
            filteredReports.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );
        }

        const newTotalPages = Math.ceil(
            filteredReports.length / reportsPerPage
        );
        setTotalPages(newTotalPages);

        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (newTotalPages === 0) {
            setCurrentPage(1);
        }

        const startIndex = (currentPage - 1) * reportsPerPage;
        const endIndex = startIndex + reportsPerPage;
        setPaginatedReports(filteredReports.slice(startIndex, endIndex));
    }, [reports, showOnlyFavorite, sorted, currentPage, reportsPerPage]);

    const addDeleteFavorite = async (id: string) => {
        if (!reports) return;
        await addRemoveFavorite(id);
        setReports(
            reports.map((report) =>
                report.reportId === id
                    ? { ...report, isFavorite: !report.isFavorite }
                    : report
            )
        );
    };

    const deleteReport = async (id: string) => {
        if (!reports) return;
        try {
            const response = await deleteReportFromDB(id);
            if (response?.success) {
                setReports((prevReports) =>
                    prevReports
                        ? prevReports.filter((report) => report.reportId !== id)
                        : []
                );
                toast.success("Report deleted successfully!");
            } else {
                toast.error(response?.error);
                console.log(response?.error);
            }
        } catch (err) {
            toast.error("Server error. Try again later!");
            console.log(err);
        }
    };

    return (
        <div className="flex flex-col gap-8 2xl:gap-12 py-8 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto w-full h-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-zinc-900">Reports History</h1>
                    <p className="text-zinc-500 text-sm max-w-xl">
                        View your saved AI analysis reports. Pick up where you left off or review past insights.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <CustomButton
                        isBlack={false}
                        onClick={() => setShowOnlyFavorite((prev) => !prev)}>
                        <div className="flex gap-2 items-center justify-center px-2">
                            <Star
                                size={16}
                                className={showOnlyFavorite ? "fill-yellow-400 text-yellow-400" : "text-zinc-700"}
                            />
                            <span className={showOnlyFavorite ? "text-zinc-900 font-medium" : "text-zinc-600"}>
                                Favorites
                            </span>
                        </div>
                    </CustomButton>
                    <Select
                        value={sorted}
                        onValueChange={(value) => setSorted(value)}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-white border-zinc-200">
                            <SelectValue placeholder="Sort by time" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="desc">Newest first</SelectItem>
                                <SelectItem value="asc">Oldest first</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedReports ? (
                    paginatedReports.map((report) => (
                        <Link
                            href={`/private/reports-history/${report.reportId}`}
                            key={report.reportId}
                            className="group relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-md border border-zinc-200 overflow-hidden transition-all duration-200"
                        >
                            {/* Window Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/80 backdrop-blur-sm rounded-t-2xl">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            addDeleteFavorite(report.reportId);
                                        }}
                                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200 group/star"
                                    >
                                        <Star
                                            size={14}
                                            className={`transition-colors ${report.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-zinc-400 group-hover/star:text-yellow-400"}`}
                                        />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            deleteReport(report.reportId);
                                        }}
                                        className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-all duration-200 text-zinc-400"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-zinc-900 text-lg leading-tight">AI Analysis Report</h3>
                                        <p className="text-xs text-zinc-400 mt-1.5 font-medium uppercase tracking-wide">
                                            {new Date(report.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                            <span className="mx-1.5">•</span>
                                            {new Date(report.createdAt).toLocaleTimeString(undefined, {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2.5 text-sm text-zinc-600 bg-zinc-50 px-3 py-2.5 rounded-lg border border-zinc-100">
                                    <MessageSquare size={16} className="text-zinc-400" />
                                    <span className="font-medium">{report.numberOfMessages}</span>
                                    <span className="text-zinc-400">messages in conversation</span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full flex items-center justify-center min-h-[300px]">
                        <CustomLoading />
                    </div>
                )}
                
                {paginatedReports?.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center min-h-[400px] text-zinc-500 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                            <Bot size={32} className="text-zinc-300" />
                        </div>
                        <p className="text-lg font-medium text-zinc-900">No reports found</p>
                        <p className="text-sm text-zinc-400 mt-1">Start a new analysis to see it here.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pb-8">
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className={`flex gap-2 items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === 1
                                ? "text-zinc-300 cursor-not-allowed"
                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        }`}>
                        <ChevronLeft size={16} />
                        Previous
                    </button>
                    <span className="text-sm font-medium text-zinc-900 bg-zinc-100 px-3 py-1 rounded-md">
                        {currentPage} <span className="text-zinc-400 mx-1">/</span> {totalPages}
                    </span>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`flex gap-2 items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === totalPages
                                ? "text-zinc-300 cursor-not-allowed"
                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        }`}>
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
