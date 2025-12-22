import { TradeDisplayItem } from "@/features/calendar/getClosedTradesForDay";
import { Trades } from "@/types";

interface TradeListProps {
    trades?: Trades[];
    displayItems?: TradeDisplayItem[];
    title: string;
    type: "open" | "closed";
}

export const TradeList = ({ trades, displayItems, title, type }: TradeListProps) => {
    // Convert trades to display items if displayItems not provided
    const items: TradeDisplayItem[] = displayItems || (trades || []).map((t) => ({
        id: t.id,
        symbolName: t.symbolName,
        positionType: t.positionType,
        quantity: t.quantity,
        entryPrice: t.entryPrice,
        result: Number(t.result) || 0,
        isPartialClose: false,
        originalTrade: t,
    }));

    if (items.length === 0) return null;

    return (
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-200">
                <h4 className="text-sm font-medium text-zinc-700">
                    {title}
                </h4>
                <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                    {items.length}
                </span>
            </div>
            
            {/* Body */}
            <div className="divide-y divide-zinc-100 max-h-[200px] overflow-y-auto">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 transition-colors"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <span
                                className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded text-white font-medium uppercase ${
                                    item.positionType === "sell" ? "bg-sell" : "bg-buy"
                                }`}
                            >
                                {item.positionType === "buy" ? "L" : "S"}
                            </span>
                            <span className="font-medium text-sm text-zinc-700 truncate">
                                {item.symbolName}
                            </span>
                            {item.isPartialClose && (
                                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                                    Partial
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                            {/* Quantity */}
                            <div className="text-right">
                                <span className="text-xs text-zinc-400">Qty</span>
                                <p className="font-medium text-zinc-600 text-xs">
                                    {item.quantity ?? "-"}
                                </p>
                            </div>

                            {/* Entry Price (Open) or Result (Closed) */}
                            <div className="text-right min-w-[50px]">
                                <span className="text-xs text-zinc-400">
                                    {type === "open" ? "Entry" : "P/L"}
                                </span>
                                <p className={`font-medium text-xs ${
                                    type === "closed"
                                        ? item.result >= 0 ? "text-buy" : "text-sell"
                                        : "text-zinc-700"
                                }`}>
                                    {type === "closed" && item.result >= 0 ? "+" : ""}
                                    {Number(type === "open" ? item.entryPrice : item.result).toLocaleString("de-DE")}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

