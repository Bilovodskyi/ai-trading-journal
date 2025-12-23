"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Plus, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import { newTradeFormSchema } from "@/zodSchema/schema";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { addCustomFieldName, removeCustomFieldName } from "@/server/actions/user";

type FormType = z.infer<typeof newTradeFormSchema>;
type CustomFieldsKey = "openOtherDetails" | "closeOtherDetails";

interface CustomFieldsSectionProps {
    form: UseFormReturn<FormType>;
    fieldKey: CustomFieldsKey;
    title?: string;
    userFieldNames: string[]; // Field names from user settings
    onFieldNamesChange?: () => void; // Callback to refresh field names
}

export const CustomFieldsSection = ({ 
    form, 
    fieldKey,
    title = "Custom Fields",
    userFieldNames,
    onFieldNamesChange
}: CustomFieldsSectionProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newFieldName, setNewFieldName] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    const { watch, setValue } = form;
    const otherDetails = watch(fieldKey) || {};

    // Determine field type from fieldKey
    const fieldType = fieldKey === "openOtherDetails" ? "open" : "close";

    // Merge user field names with existing trade values
    const allFieldNames = [...new Set([...userFieldNames, ...Object.keys(otherDetails)])];

    const handleAddField = async () => {
        const trimmedName = newFieldName.trim();
        if (!trimmedName) return;
        
        // Check if field already exists
        if (allFieldNames.includes(trimmedName)) {
            setNewFieldName("");
            return;
        }

        setIsAdding(true);
        try {
            // Add to user settings
            const result = await addCustomFieldName(fieldType, trimmedName);
            if (result.success) {
                // Add to form with empty value
                setValue(fieldKey, {
                    ...otherDetails,
                    [trimmedName]: "",
                }, { shouldDirty: true });
                
                setNewFieldName("");
                onFieldNamesChange?.();
            }
        } catch (error) {
            console.error("Failed to add field:", error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveField = async (fieldName: string) => {
        setIsRemoving(fieldName);
        try {
            // Remove from user settings
            const result = await removeCustomFieldName(fieldType, fieldName);
            if (result.success) {
                // Remove from form values using Object.entries filter
                const rest = Object.fromEntries(
                    Object.entries(otherDetails).filter(([key]) => key !== fieldName)
                );
                setValue(fieldKey, rest, { shouldDirty: true });
                onFieldNamesChange?.();
            }
        } catch (error) {
            console.error("Failed to remove field:", error);
        } finally {
            setIsRemoving(null);
        }
    };

    const handleUpdateFieldValue = (fieldName: string, value: string) => {
        setValue(fieldKey, {
            ...otherDetails,
            [fieldName]: value,
        }, { shouldDirty: true });
    };

    return (
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
            {/* Header - clickable to expand/collapse */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-700">
                        {title}
                    </span>
                    {allFieldNames.length > 0 && (
                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                            {allFieldNames.length}
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-zinc-500" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                )}
            </button>

            {/* Expandable content */}
            {isExpanded && (
                <div className="p-4 space-y-4">
                    {/* Existing fields */}
                    {allFieldNames.length > 0 && (
                        <div className="space-y-2">
                            {allFieldNames.map((fieldName) => (
                                <div key={fieldName} className="flex items-center gap-2">
                                    <div className="flex-1 flex gap-2 items-center">
                                        <Label className="w-1/3 text-sm text-zinc-600 truncate">
                                            {fieldName}:
                                        </Label>
                                        <div className="w-2/3">
                                            <Input
                                                value={otherDetails[fieldName] || ""}
                                                onChange={(e) => handleUpdateFieldValue(fieldName, e.target.value)}
                                                placeholder="Enter value"
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveField(fieldName)}
                                        disabled={isRemoving === fieldName}
                                        className="h-8 w-8 text-zinc-400 hover:text-red-500 shrink-0"
                                    >
                                        {isRemoving === fieldName ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <X className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add new field */}
                    <div className="pt-2 border-t border-zinc-100">
                        <Label className="text-xs text-zinc-500 mb-2 block">
                            Add new field
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                value={newFieldName}
                                onChange={(e) => setNewFieldName(e.target.value)}
                                placeholder="Field name (e.g., Fees, Commission)"
                                className="flex-1 text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddField();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddField}
                                disabled={!newFieldName.trim() || isAdding}
                                className="shrink-0"
                            >
                                {isAdding ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Help text */}
                    {allFieldNames.length === 0 && (
                        <p className="text-xs text-zinc-400">
                            Add custom fields to track additional details. They&apos;ll appear on all new trades.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
