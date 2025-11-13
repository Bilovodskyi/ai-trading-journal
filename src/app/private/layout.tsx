import { getAllTradeRecords } from "@/server/actions/trades";
import { getAllStrategies } from "@/server/actions/strategies";
import PrivateLayoutClient from "@/components/private-layout/PrivateLayoutClient";
import { auth } from "@clerk/nextjs/server";
import { Strategy } from "@/types/strategies.types";

export default async function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    const tradeRecords = await getAllTradeRecords();

    // Load strategies alongside trades
    let strategies: Strategy[] = [];
    if (userId) {
        const strategiesResult = await getAllStrategies(userId);
        if (strategiesResult && "strategies" in strategiesResult) {
            strategies = strategiesResult.strategies;
        }
    }

    return (
        <PrivateLayoutClient
            initialTradeRecords={tradeRecords}
            initialStrategies={strategies}>
            {children}
        </PrivateLayoutClient>
    );
}
