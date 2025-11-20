import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Strategy } from "@/types/strategies.types";
import { Checkbox } from "../ui/checkbox";
import { rulesStyle } from "./AddStrategyDialog";

interface StrategyRulesProps {
    strategy: Strategy;
}

export default function StrategyRules({ strategy }: StrategyRulesProps) {
    return (
        <div className="flex flex-col md:flex-row w-full px-2">
            <div className="flex-1">
                <h1 className="py-4 text-neutral-500">
                    Open position rules:
                </h1>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Priority</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {strategy.openPositionRules.map((rule) => (
                            <TableRow key={rule.id}>
                                <TableCell className="w-[5%]">
                                    <Checkbox disabled />
                                </TableCell>
                                <TableCell className="w-[60%] md:w-[70%]">
                                    {rule.rule}
                                </TableCell>
                                <TableCell className="w-[30%] md:w-[25%]">
                                    <div
                                        className={`
                                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium select-none
                                            ${rulesStyle[rule.priority]}
                                        `}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${rule.priority === 'high' ? 'bg-rose-500' :
                                                rule.priority === 'medium' ? 'bg-amber-500' :
                                                    'bg-emerald-500'
                                            }`} />
                                        {rule.priority.charAt(0).toUpperCase() + rule.priority.slice(1)} Priority
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex-1">
                <h1 className="py-4 text-neutral-500">
                    Close position rules:
                </h1>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Priority</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {strategy.closePositionRules.map((rule) => (
                            <TableRow key={rule.id}>
                                <TableCell className="w-[5%]">
                                    <Checkbox disabled />
                                </TableCell>
                                <TableCell className="w-[60%] md:w-[70%]">
                                    {rule.rule}
                                </TableCell>
                                <TableCell className="w-[30%] md:w-[25%]">
                                    <div
                                        className={`
                                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium select-none
                                            ${rulesStyle[rule.priority]}
                                        `}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${rule.priority === 'high' ? 'bg-rose-500' :
                                                rule.priority === 'medium' ? 'bg-amber-500' :
                                                    'bg-emerald-500'
                                            }`} />
                                        {rule.priority.charAt(0).toUpperCase() + rule.priority.slice(1)} Priority
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}