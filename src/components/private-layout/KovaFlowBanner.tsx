"use client";

import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";

const DISMISSED_KEY = "kovaflow-banner-dismissed";

/**
 * Tells signed-in users that this journal has a successor, KovaFlow.
 * Hidden until mounted so a user who closed it never sees it flash;
 * closing it is remembered in this browser only.
 */
export default function KovaFlowBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            setVisible(localStorage.getItem(DISMISSED_KEY) !== "1");
        } catch {
            setVisible(true);
        }
    }, []);

    if (!visible) return null;

    const dismiss = () => {
        setVisible(false);
        try {
            localStorage.setItem(DISMISSED_KEY, "1");
        } catch {
            // Storage blocked: it simply shows again next visit.
        }
    };

    return (
        <div className="flex items-center gap-3 px-3 md:px-6 py-2.5 md:mb-2 md:rounded-2xl bg-[#80C957] text-[#1C2425] text-sm">
            <p className="flex-1 leading-snug">
                <span className="font-semibold">TradeJournal has a new version: KovaFlow.</span>{" "}
                <span className="hidden md:inline">
                    Rebuilt from scratch, with exchange sync. New accounts get 3 months of Pro free.
                </span>
            </p>
            <a
                href="https://kovaflow.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 whitespace-nowrap rounded-full bg-[#1C2425] px-3 py-1 font-medium text-white hover:opacity-90">
                Open KovaFlow <ArrowRight className="h-4 w-4" />
            </a>
            <button
                type="button"
                onClick={dismiss}
                aria-label="Close"
                className="rounded-full p-1 hover:bg-black/10">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
