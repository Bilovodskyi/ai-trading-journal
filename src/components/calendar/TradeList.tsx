import { Trades } from "@/types";

interface TradeListProps {
    trades: Trades[];
    title: string;
    type: "open" | "closed";
}

export const TradeList = ({ trades, title, type }: TradeListProps) => {
    if (trades.length === 0) return null;

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2">
                <h4 className="text-sm font-semibold text-zinc-700">
                    {title} <span className="text-zinc-400 font-normal">({trades.length})</span>
                </h4>
            </div>
            <div className="space-y-1 max-h-[240px] overflow-y-auto pr-1">
                {trades.map((t) => (
                    <div
                        key={t.id}
                        className="group flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <span
                                className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-md text-white font-medium uppercase tracking-wider ${t.positionType === "sell"
                                        ? "bg-sell"
                                        : "bg-buy"
                                    }`}
                            >
                                {t.positionType}
                            </span>
                            <span className="font-medium text-sm text-zinc-700 truncate">
                                {t.symbolName}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                            {/* Deposit (shown for both) */}
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-zinc-400 uppercase tracking-wide">Deposit</span>
                                <span className="font-medium text-zinc-600">
                                    {Number(t.deposit).toLocaleString("de-DE")}
                                </span>
                            </div>

                            {/* Entry Price (Open) or Result (Closed) */}
                            <div className="flex flex-col items-end min-w-[60px]">
                                <span className="text-[10px] text-zinc-400 uppercase tracking-wide">
                                    {type === "open" ? "Entry" : "Result"}
                                </span>
                                <span className={`font-medium ${type === "closed"
                                        ? Number(t.result) >= 0 ? "text-buy" : "text-sell"
                                        : "text-zinc-900"
                                    }`}>
                                    {Number(type === "open" ? t.entryPrice : t.result).toLocaleString("de-DE")}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
