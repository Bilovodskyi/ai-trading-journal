"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { newTradeFormSchema } from "@/zodSchema/schema";
import { Strategy } from "@/types/strategies.types";
import { Rule } from "@/types/dbSchema.types";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { StrategyRules } from "./StrategyRules";

interface StrategyTabProps {
    form: UseFormReturn<z.infer<typeof newTradeFormSchema>>;
    strategies: Strategy[];
    selectedStrategyId: string;
    checkedOpenRules: string[];
    checkedCloseRules: string[];
    onStrategyChange: (value: string) => void;
    onOpenRuleToggle: (ruleId: string, rule: Rule) => void;
    onCloseRuleToggle: (ruleId: string, rule: Rule) => void;
}

export const StrategyTab = ({
    form,
    strategies,
    selectedStrategyId,
    checkedOpenRules,
    checkedCloseRules,
    onStrategyChange,
    onOpenRuleToggle,
    onCloseRuleToggle,
}: StrategyTabProps) => {
    const { control, formState: { errors } } = form;
    const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);

    return (
        <div className="flex flex-col gap-4">
            {/* Strategy Selection */}
            <div className="border border-zinc-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="strategyName" className="text-sm font-medium text-zinc-700">
                        Select Strategy
                    </Label>
                    <span className="text-xs text-zinc-400">
                        optional
                    </span>
                </div>
                
                {strategies.length === 0 ? (
                    <div className="rounded-md border border-dashed border-zinc-300 p-3 text-sm text-zinc-500 text-center">
                        No strategies yet. Create one in the strategies page.
                    </div>
                ) : (
                    <Controller
                        name="strategyName"
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    onStrategyChange(value);
                                }}
                                value={selectedStrategy?.strategyName || field.value}
                            >
                                <SelectTrigger className="w-full text-sm">
                                    <SelectValue placeholder="Select a strategy" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {strategies.map((strategy) => (
                                            <SelectItem
                                                key={strategy.id}
                                                value={strategy.strategyName}>
                                                {strategy.strategyName}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                    />
                )}
                {errors.strategyName && (
                    <p className="text-red-500 text-xs mt-1">
                        {errors.strategyName.message}
                    </p>
                )}
            </div>

            {/* Strategy Rules */}
            {selectedStrategy && (
                <div className="border border-zinc-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-zinc-700 mb-3">
                        Checklist for &quot;{selectedStrategy.strategyName}&quot;
                    </h3>
                    <StrategyRules
                        strategy={selectedStrategy}
                        checkedOpenRules={checkedOpenRules}
                        checkedCloseRules={checkedCloseRules}
                        onOpenRuleToggle={onOpenRuleToggle}
                        onCloseRuleToggle={onCloseRuleToggle}
                    />
                </div>
            )}
        </div>
    );
};