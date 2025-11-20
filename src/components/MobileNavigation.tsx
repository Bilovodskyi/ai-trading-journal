"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { SiClaude } from "react-icons/si";

export default function MobileNavigation() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="md:hidden">
            <div onClick={() => setIsOpen(true)}>
                <span className="w-[25px] h-[2px] block my-[6px] bg-black"></span>
                <span className="w-[25px] h-[2px] block my-[6px] bg-black"></span>
                <span className="w-[25px] h-[2px] block my-[6px] bg-black"></span>
            </div>
            <div
                className={`${!isOpen ? "hidden" : ""
                    } absolute top-0 left-0 right-0 bg-white w-full z-50 h-full`}>
                <div className="flex justify-between p-[18px] items-center">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo.svg"
                            alt="logo"
                            width={42}
                            height={42}
                        />
                        <p className="font-semibold text-[1.5rem] ml-2">
                            Journal
                        </p>

                        <p className="font-semibold text-[1.5rem]">&</p>
                        <SiClaude size={24} className="text-[#da7756]" />
                    </div>
                    <X onClick={() => setIsOpen(false)} />
                </div>
                <div
                    className="flex gap-1 mobile-nav-link items-center"
                    onClick={() => setIsOpen(false)}>
                    <Link href="/private/calendar" className="w-full py-4">
                        <p className="leading-none text-[1.5rem]">Calendar</p>
                    </Link>
                </div>
                <div
                    className="flex gap-1 mobile-nav-link items-center"
                    onClick={() => setIsOpen(false)}>
                    <Link href="/private/history" className="w-full py-4">
                        <p className="leading-none text-[1.5rem]">History</p>
                    </Link>
                </div>
                <div
                    className="flex gap-1 mobile-nav-link items-center"
                    onClick={() => setIsOpen(false)}>
                    <Link href="/private/statistics" className="w-full py-4">
                        <p className="leading-none text-[1.5rem]">Statistics</p>
                    </Link>
                </div>
                <div
                    className="flex gap-1 mobile-nav-link items-center"
                    onClick={() => setIsOpen(false)}>
                    <Link href="/private/strategies" className="w-full py-4">
                        <p className="leading-none text-[1.5rem]">Strategies</p>
                    </Link>
                </div>
                <div
                    className="flex gap-1 mobile-nav-link items-center"
                    onClick={() => setIsOpen(false)}>
                    <Link href="/private/journal" className="w-full py-4">
                        <p className="leading-none text-[1.5rem]">Journal</p>
                    </Link>
                </div>
                <div
                    className="flex gap-1 mobile-nav-link items-center"
                    onClick={() => setIsOpen(false)}>
                    <Link href="/private/tradeAI" className="w-full py-4">
                        <p className="leading-none text-[1.5rem]">TradeAI</p>
                    </Link>
                </div>
                <div
                    className="flex gap-1 mobile-nav-link items-center"
                    onClick={() => setIsOpen(false)}>
                    <Link href="/private/tokens" className="w-full py-4">
                        <p className="leading-none text-[1.5rem]">Tokens</p>
                    </Link>
                </div>
                <div
                    className="flex gap-1 mobile-nav-link items-center"
                    onClick={() => setIsOpen(false)}>
                    <Link
                        href="/private/reports-history"
                        className="w-full py-4">
                        <p className="leading-none text-[1.5rem]">Archive</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
