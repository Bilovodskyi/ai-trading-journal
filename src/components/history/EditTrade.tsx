"use client";

import { useEffect, useState, ReactNode } from "react";
import { MdEdit } from "react-icons/md";
import { TradeDialog } from "../trade-dialog";
import { Trades } from "@/types";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

interface EditTradeProps {
    trade?: Trades;
    existingTrade?: Trades;
    initialTab?: "open-details" | "close-details" | "strategy";
    trigger?: ReactNode;
}

export default function EditTrade({ 
    trade, 
    existingTrade, 
    initialTab = "open-details",
    trigger 
}: EditTradeProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Support both prop names for backwards compatibility
    const tradeData = existingTrade || trade;

    // Close dialog when TradeDialog requests it
    useEffect(() => {
        const onClose = () => setIsOpen(false);
        document.addEventListener("trade-dialog:request-close", onClose);
        return () => document.removeEventListener("trade-dialog:request-close", onClose);
    }, []);

    if (!tradeData) return null;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <button className="p-2 md:hover:text-zinc-900 md:hover:bg-zinc-200 rounded-md transition-colors">
                        <MdEdit className="w-4 h-4 text-gray-600 hover:text-gray-800" />
                    </button>
                )}
            </SheetTrigger>
            <SheetContent className="">
                <TradeDialog
                    editMode={true}
                    existingTrade={tradeData}
                    day={undefined}
                    initialTab={initialTab}
                    onRequestClose={() => setIsOpen(false)}
                />
            </SheetContent>
        </Sheet>
    );
}