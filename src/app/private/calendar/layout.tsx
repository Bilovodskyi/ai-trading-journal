"use client";

import { ReactNode, useEffect, useState } from "react";
import {
    MdOutlineKeyboardArrowRight,
    MdOutlineKeyboardArrowLeft,
} from "react-icons/md";

import { CustomButton } from "@/components/CustomButton";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
    setCalendarType,
    setIsDialogOpen,
    setMonthView,
    setYearView,
} from "@/redux/slices/calendarSlice";
import dayjs from "dayjs";
import { months } from "@/data/data";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CustomDialogContent from "@/components/calendar/CustomDialogContent";

export default function CalendarLayout({ children }: { children: ReactNode }) {
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const { month, year } = useAppSelector((state) => state.calendar.monthView);
    const yearView = useAppSelector((state) => state.calendar.yearView);
    const calendarView = useAppSelector((state) => state.calendar.calendarType);
    const isDialogOpen = useAppSelector((state) => state.calendar.isDialogOpen);

    const currentMonth = dayjs().month();
    const currentYear = dayjs().year();

    const monthTradeSummaryForMonthView = useAppSelector(
        (state) => state.tradeRecords.yearViewSummary
    );

    const monthViewTotal =
        monthTradeSummaryForMonthView[`${(month ?? currentMonth) + 1}-${year}`];

    const yearTradeSummaryForYearView = useAppSelector(
        (state) => state.tradeRecords.totalOfParticularYearSummary
    );

    useEffect(() => {
        if (
            monthTradeSummaryForMonthView !== undefined &&
            yearTradeSummaryForYearView !== undefined
        ) {
            setIsDataLoaded(true);
        }
    }, [monthTradeSummaryForMonthView, yearTradeSummaryForYearView]);

    const yearViewTotal = yearTradeSummaryForYearView[yearView ?? currentYear];

    const dispatch = useAppDispatch();

    const handleNextMonth = () => {
        if (month === undefined || year === undefined) {
            if (currentMonth === 11) {
                dispatch(setMonthView({ month: 0, year: currentYear + 1 }));
            } else {
                dispatch(
                    setMonthView({ month: currentMonth + 1, year: currentYear })
                );
            }
        } else {
            if (month === 11) {
                dispatch(setMonthView({ month: 0, year: year + 1 }));
            } else {
                dispatch(setMonthView({ month: month + 1, year: year }));
            }
        }
    };

    const handlePrevMonth = () => {
        if (month === undefined || year === undefined) {
            if (currentMonth === 0) {
                dispatch(setMonthView({ month: 11, year: currentYear - 1 }));
            } else {
                dispatch(
                    setMonthView({ month: currentMonth - 1, year: currentYear })
                );
            }
        } else {
            if (month === 0) {
                dispatch(setMonthView({ month: 11, year: year - 1 }));
            } else {
                dispatch(setMonthView({ month: month - 1, year: year }));
            }
        }
    };

    const handleNextYear = () => {
        if (yearView === undefined) {
            dispatch(setYearView(currentYear + 1));
        } else {
            dispatch(setYearView(yearView + 1));
        }
    };

    const handlePrevYear = () => {
        if (yearView === undefined) {
            dispatch(setYearView(currentYear - 1));
        } else {
            dispatch(setYearView(yearView - 1));
        }
    };

    const handleReturnToToday = () => {
        dispatch(setMonthView({ month: currentMonth, year: currentYear }));
        dispatch(setYearView(currentYear));
    };

    if (!isDataLoaded) {
        return (
            <div className="flex-center h-screen">
                <div className="running-algorithm">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div
                className={`px-3 md:px-6 flex items-center justify-between py-4 md:py-2 border-b border-zinc-200 ${
                    calendarView === "Month" ? "max-md:flex-col" : ""
                }  gap-4`}>
                <div className="flex items-center justify-between max-md:w-full gap-4 md:gap-5">
                    <div
                        className={`flex gap-3 ${
                            calendarView === "Year" ? "max-md:hidden" : ""
                        }`}>
                        <Dialog
                            open={!!isDialogOpen["any"]}
                            onOpenChange={(open) =>
                                dispatch(
                                    setIsDialogOpen({
                                        key: "any",
                                        value: open,
                                    })
                                )
                            }>
                            <DialogTrigger asChild>
                                <CustomButton isBlack>New</CustomButton>
                            </DialogTrigger>
                            <DialogContent>
                                <CustomDialogContent day={undefined} />
                            </DialogContent>
                        </Dialog>
                        <CustomButton
                            onClick={handleReturnToToday}
                            isBlack={false}>
                            Today
                        </CustomButton>

                        <CustomButton
                            isBlack={false}
                            onClick={
                                calendarView === "Month"
                                    ? handlePrevMonth
                                    : handlePrevYear
                            }>
                            <MdOutlineKeyboardArrowLeft className="text-[1.3rem]" />
                        </CustomButton>
                        <CustomButton
                            isBlack={false}
                            onClick={
                                calendarView === "Month"
                                    ? handleNextMonth
                                    : handleNextYear
                            }>
                            <MdOutlineKeyboardArrowRight className="text-[1.3rem]" />
                        </CustomButton>
                    </div>
                    <div>
                        {calendarView === "Month" ? (
                            <p className="text-center md:text-start">{`${
                                months[month ?? currentMonth]
                            } ${year ?? currentYear}`}</p>
                        ) : (
                            <p>{yearView ?? currentYear}</p>
                        )}
                    </div>
                </div>
                <div className="flex max-md:justify-between max-md:w-full md:gap-5 items-center">
                    <div className="md:ml-2 md:px-4 py-2">
                        {calendarView === "Month"
                            ? monthViewTotal && (
                                  <p>Total capital change: {monthViewTotal}</p>
                              )
                            : yearViewTotal && (
                                  <p>Total capital change: {yearViewTotal}</p>
                              )}
                    </div>
                    <Select
                        value={calendarView}
                        onValueChange={(value) => {
                            dispatch(setCalendarType(value));
                            dispatch(
                                setMonthView({
                                    month: currentMonth,
                                    year: currentYear,
                                })
                            );
                            dispatch(setYearView(currentYear));
                        }}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="Year">Year</SelectItem>
                                <SelectItem value="Month">Month</SelectItem>
                                {/* <SelectItem value="Day">Day</SelectItem> */}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <section className="flex-1 max-md:overflow-auto">
                {children}
            </section>
        </div>
    );
}
