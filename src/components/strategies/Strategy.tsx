"use client";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { Strategy } from "@/types/strategies.types";
import { ChevronDown } from "lucide-react";
import DeleteStrategyButton from "./DeleteStrategyButton";
import AddStrategyDialog from "./AddStrategyDialog";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/store";
import StrategyRules from "./StrategyRules";
import StrategyHistory from "./StrategyHistory";



export default function StrategyCard({
    strategy,
    hideAll = false
}: {
    strategy: Strategy;
    hideAll?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(true);

    // Get activeTab from Redux
    const activeTab = useAppSelector((state) => state.strategies.activeTab);

    // Handle hideAll changes
    useEffect(() => {
        setIsOpen(!hideAll);
    }, [hideAll]);

    return (
        <Accordion
            type="single"
            collapsible
            className="w-full"
            value={isOpen ? "item-1" : ""}
            onValueChange={(value) => setIsOpen(value === "item-1")}
        >
            <AccordionItem value="item-1">
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-[rgb(245,245,245)] ">
                    <AccordionTrigger className="hover:no-underline py-0 pr-4">
                        <div className="flex gap-4 items-center text-left">
                            <div className="p-2 bg-white rounded-lg border border-neutral-200 shadow-sm">
                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-neutral-500" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-neutral-900">{strategy.strategyName}</span>
                                {strategy.description && (
                                    <span className="text-sm text-neutral-500 font-normal line-clamp-1">{strategy.description}</span>
                                )}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <div className="flex gap-6 items-center mr-4">
                        <AddStrategyDialog
                            openPositionRulesEditing={strategy.openPositionRules}
                            closePositionRulesEditing={strategy.closePositionRules}
                            strategyNameEditing={strategy.strategyName}
                            descriptionEditing={strategy.description}
                            idEditing={strategy.id}
                        />
                        <DeleteStrategyButton strategy={strategy} />
                    </div>
                </div>
                <AccordionContent className="flex gap-12">
                    {activeTab === "rules" ? (
                        <StrategyRules strategy={strategy} />
                    ) : (
                        <StrategyHistory strategy={strategy} />
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
