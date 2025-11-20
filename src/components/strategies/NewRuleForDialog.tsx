"use client";

import { TableRow, TableCell } from "@/components/ui/table";

import { rulesStyle } from "./AddStrategyDialog";
import { Rule } from "@/types/dbSchema.types";
import { Trash2, X, Check, Pencil } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";

type NewRuleForDialogProps = {
    rule: Rule;
    handleChangePriority: () => void;
    handleDeleteRule: () => void;
    handleChangeRuleName: (newName: string) => void;
};

export default function NewRuleForDialog({
    rule,
    handleChangePriority,
    handleChangeRuleName,
    handleDeleteRule,
}: NewRuleForDialogProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(rule.rule || "");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditingName && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditingName]);

    const handleSaveNewName = (e?: React.MouseEvent | React.KeyboardEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        const trimmedName = newName.trim();
        if (newName === rule.rule) {
            setIsEditingName(false);
        } else if (trimmedName.length > 0) {
            handleChangeRuleName(trimmedName);
            setIsEditingName(false);
        } else {
            toast.error("Rule description cannot be empty.");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSaveNewName(e);
        } else if (e.key === "Escape") {
            setNewName(rule.rule || "");
            setIsEditingName(false);
        }
    };

    return (
        <TableRow className="group hover:bg-neutral-50 border-b-neutral-100 transition-colors">
            <TableCell className="py-3">
                {isEditingName ? (
                    <div className="flex items-center gap-2 w-full">
                        <Input
                            ref={inputRef}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            type="text"
                            placeholder="Enter rule description"
                            className="h-8 text-sm"
                        />
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleSaveNewName}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                title="Save"
                            >
                                <Check size={14} />
                            </button>
                            <button
                                onClick={() => {
                                    setNewName(rule.rule || "");
                                    setIsEditingName(false);
                                }}
                                className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                                title="Cancel"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => setIsEditingName(true)}
                        className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-md hover:bg-neutral-100 transition-colors group/text"
                    >
                        <span className="text-sm text-neutral-700 truncate max-w-[280px]">
                            {rule.rule}
                        </span>
                        <Pencil size={12} className="opacity-0 group-hover/text:opacity-100 text-neutral-400" />
                    </div>
                )}
            </TableCell>

            <TableCell className="py-3">
                <div 
                    onClick={handleChangePriority}
                    className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all select-none
                        ${rulesStyle[rule.priority]}
                        hover:opacity-90 active:scale-95
                    `}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                        rule.priority === 'high' ? 'bg-rose-500' : 
                        rule.priority === 'medium' ? 'bg-amber-500' : 
                        'bg-emerald-500'
                    }`} />
                    {rule.priority.charAt(0).toUpperCase() + rule.priority.slice(1)} Priority
                </div>
            </TableCell>

            <TableCell className="py-3 text-right">
                <button
                    onClick={handleDeleteRule}
                    className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete Rule"
                >
                    <Trash2 size={16} />
                </button>
            </TableCell>
        </TableRow>
    );
}
