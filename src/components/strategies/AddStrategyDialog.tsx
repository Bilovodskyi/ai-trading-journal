"use client";

import React, { useEffect, useState } from "react";
import {
    DialogTitle,
    DialogHeader,
    DialogClose,
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogDescription,
} from "../ui/dialog";
import { Pencil, Plus } from "lucide-react";
import { Rule } from "@/types/dbSchema.types";
import { v4 as uuidv4 } from "uuid";

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import NewRuleForDialog from "./NewRuleForDialog";
import { CustomButton } from "../CustomButton";
import { editStrategy, saveStrategy } from "@/server/actions/strategies";
import { useUser } from "@clerk/nextjs";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useAppDispatch } from "@/redux/store";
import { addStrategyToTheState, editStrategyInTheState } from "@/redux/slices/strategySlice";
import { Label } from "../ui/label";

export const rulesStyle = {
    low: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    medium: "bg-amber-100 text-amber-700 border border-amber-200",
    high: "bg-rose-100 text-rose-700 border border-rose-200",
};

export default function AddStrategyDialog({
    openPositionRulesEditing,
    closePositionRulesEditing,
    strategyNameEditing,
    descriptionEditing,
    idEditing,
}: {
    openPositionRulesEditing?: Rule[];
    closePositionRulesEditing?: Rule[];
    strategyNameEditing?: string;
    descriptionEditing?: string | null;
    idEditing?: string;
}) {
    const [openPositionRules, setOpenPositionRules] = useState<Rule[]>([]);
    const [closePositionRules, setClosePositionRules] = useState<Rule[]>([]);
    const [strategyName, setStrategyName] = useState("");
    const [description, setDescription] = useState("");

    const [submittingNewStrategy, setSubmittingNewStrategy] = useState(false);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { user } = useUser();

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (strategyNameEditing && openPositionRulesEditing && closePositionRulesEditing) {
            setStrategyName(strategyNameEditing);
            setDescription(descriptionEditing || "");
            setOpenPositionRules(openPositionRulesEditing);
            setClosePositionRules(closePositionRulesEditing);
        }
    }, [strategyNameEditing, descriptionEditing, openPositionRulesEditing, closePositionRulesEditing]);

    const handleCreateNewRule = ({ type }: { type: "open" | "close" }) => {
        const randomId = uuidv4();
        const newRule = {
            id: randomId,
            priority: "medium" as const,
            satisfied: false,
            rule: "New Rule",
        };

        if (type === "open") {
            setOpenPositionRules((prev) => [...prev, newRule]);
        } else {
            setClosePositionRules((prev) => [...prev, newRule]);
        }
    };

    const handleChangePriority = ({
        id,
        type,
    }: {
        id: string;
        type: "open" | "close";
    }) => {
        const updateRules = (prevRules: Rule[]) =>
            prevRules.map((rule) => {
                if (rule.id === id) {
                    let nextPriority: Rule["priority"];
                    if (rule.priority === "low") {
                        nextPriority = "medium";
                    } else if (rule.priority === "medium") {
                        nextPriority = "high";
                    } else {
                        nextPriority = "low";
                    }
                    return { ...rule, priority: nextPriority };
                }
                return rule;
            });

        if (type === "open") {
            setOpenPositionRules(updateRules);
        } else {
            setClosePositionRules(updateRules);
        }
    };

    const handleChangeRuleName = ({
        id,
        type,
        newName,
    }: {
        id: string;
        type: "open" | "close";
        newName: string;
    }) => {
        const updateRules = (prevRules: Rule[]) =>
            prevRules.map((rule) => {
                if (rule.id === id) {
                    return { ...rule, rule: newName };
                }
                return rule;
            });

        if (type === "open") {
            setOpenPositionRules(updateRules);
        } else {
            setClosePositionRules(updateRules);
        }
    };

    const handleDeleteRule = ({
        id,
        type,
    }: {
        id: string;
        type: "open" | "close";
    }) => {
        if (type === "open") {
            setOpenPositionRules((prevRules) =>
                prevRules.filter((rule) => rule.id !== id)
            );
        } else {
            setClosePositionRules((prevRules) =>
                prevRules.filter((rule) => rule.id !== id)
            );
        }
    };

    const createStrategy = async (e: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        const newId = uuidv4();
        if (strategyName.length === 0) {
            toast.error("Strategy name is required");
        } else if (
            closePositionRules.length === 0 &&
            openPositionRules.length === 0
        ) {
            toast.error("You must provide at least 1 rule");
        } else {
            setSubmittingNewStrategy(true);
            try {
                const result = await saveStrategy({
                    openPositionRules,
                    closePositionRules,
                    userId: user?.id ?? "",
                    id: newId,
                    strategyName,
                    description,
                });

                if (result?.success) {
                    dispatch(
                        addStrategyToTheState({
                            openPositionRules,
                            closePositionRules,
                            id: newId,
                            strategyName,
                            description,
                        })
                    );

                    toast.success("New strategy has been saved successfully!");
                    setIsDialogOpen(false);
                    setStrategyName("");
                    setDescription("");
                    setOpenPositionRules([]);
                    setClosePositionRules([]);
                } else {
                    toast.error(result?.error || "Failed to save strategy");
                }
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(error.message);
                    console.log(error.message);
                } else {
                    console.log(error);
                    toast.error("Unexpected error occured. Try again later");
                }
            } finally {
                setSubmittingNewStrategy(false);
            }
        }
    };

    const handleEditStrategy = async (e: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        if (strategyName.length === 0) {
            toast.error("Strategy name is required");
        } else if (
            closePositionRules.length === 0 &&
            openPositionRules.length === 0
        ) {
            toast.error("You must provide at least 1 rule");
        } else if (strategyName === strategyNameEditing && description === (descriptionEditing || "") && openPositionRules === openPositionRulesEditing && closePositionRules === closePositionRulesEditing) {
            toast.error("No changes made");
        } else {
            setSubmittingNewStrategy(true);
            try {
                const result = await editStrategy({
                    openPositionRules,
                    closePositionRules,
                    userId: user?.id ?? "",
                    strategyName,
                    description,
                    id: idEditing ?? "",
                });

                if (result?.success) {
                    dispatch(
                        editStrategyInTheState({
                            openPositionRules,
                            closePositionRules,
                            id: idEditing ?? "",
                            strategyName,
                            description,
                        })
                    );
                    toast.success("Strategy edited successfully!");
                    setIsDialogOpen(false);
                } else {
                    toast.error(result?.error || "Failed to edit strategy");
                }
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(error.message);
                    console.log(error.message);
                } else {
                    console.log(error);
                    toast.error("Unexpected error occured. Try again later");
                }
            } finally {
                setSubmittingNewStrategy(false);
            }
        }
    }


    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                {strategyNameEditing ? (
                    <div className="p-2 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer">
                        <Pencil size={16} className="text-neutral-600" />
                    </div>
                ) : (
                    <button className="flex gap-2 items-center text-sm font-medium border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-all px-4 py-2 rounded-lg shadow-sm bg-white">
                        <Plus size={16} />
                        New Strategy
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
                <div className="p-6 pb-4 border-b border-neutral-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-neutral-900">
                            {strategyNameEditing ? "Edit Strategy" : "Create New Strategy"}
                        </DialogTitle>
                        <DialogDescription className="text-neutral-500 mt-1.5">
                            Define your trading rules to maintain discipline and consistency.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="strategyName" className="text-sm font-medium text-neutral-700">
                            Strategy Name
                        </Label>
                        <Input
                            id="strategyName"
                            type="text"
                            placeholder="E.g., &quot;MACD cross above signal line on 4h chart&quot;"
                            value={strategyName}
                            onChange={(e) => setStrategyName(e.target.value)}
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-neutral-700">
                            Description <span className="text-neutral-400 font-normal">(Optional)</span>
                        </Label>
                        <textarea
                            id="description"
                            placeholder="Describe your strategy's goals, timeframe, or key indicators..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        />
                    </div>

                    <Tabs defaultValue="open" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-10 bg-neutral-100 p-1 rounded-lg mb-6">
                            <TabsTrigger 
                                value="open"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
                            >
                                Open Rules
                            </TabsTrigger>
                            <TabsTrigger 
                                value="close"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
                            >
                                Close Rules
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="open" className="mt-0 space-y-4 outline-none">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-neutral-900">
                                    Entry Conditions
                                </h3>
                                <button
                                    onClick={() => handleCreateNewRule({ type: "open" })}
                                    className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-md hover:bg-emerald-50"
                                >
                                    <Plus size={14} />
                                    Add Rule
                                </button>
                            </div>
                            
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-neutral-50">
                                        <TableRow className="hover:bg-neutral-50 border-b-neutral-100">
                                            <TableHead className="w-[55%] font-medium text-neutral-600 h-10">Rule Description</TableHead>
                                            <TableHead className="w-[30%] font-medium text-neutral-600 h-10">Priority</TableHead>
                                            <TableHead className="w-[15%] h-10"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {openPositionRules.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-24 text-center text-neutral-500 text-sm">
                                                    No rules added yet. Click &quot;Add Rule&quot; to start.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            openPositionRules.map((rule) => (
                                                <NewRuleForDialog
                                                    key={rule.id}
                                                    rule={rule}
                                                    handleChangePriority={() =>
                                                        handleChangePriority({
                                                            id: rule.id,
                                                            type: "open",
                                                        })
                                                    }
                                                    handleChangeRuleName={(newName: string) =>
                                                        handleChangeRuleName({
                                                            id: rule.id,
                                                            type: "open",
                                                            newName,
                                                        })
                                                    }
                                                    handleDeleteRule={() =>
                                                        handleDeleteRule({
                                                            id: rule.id,
                                                            type: "open",
                                                        })
                                                    }
                                                />
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        <TabsContent value="close" className="mt-0 space-y-4 outline-none">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-neutral-900">
                                    Exit Conditions
                                </h3>
                                <button
                                    onClick={() => handleCreateNewRule({ type: "close" })}
                                    className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-md hover:bg-emerald-50"
                                >
                                    <Plus size={14} />
                                    Add Rule
                                </button>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-neutral-50">
                                        <TableRow className="hover:bg-neutral-50 border-b-neutral-100">
                                            <TableHead className="w-[55%] font-medium text-neutral-600 h-10">Rule Description</TableHead>
                                            <TableHead className="w-[30%] font-medium text-neutral-600 h-10">Priority</TableHead>
                                            <TableHead className="w-[15%] h-10"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {closePositionRules.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-24 text-center text-neutral-500 text-sm">
                                                    No rules added yet. Click &quot;Add Rule&quot; to start.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            closePositionRules.map((rule) => (
                                                <NewRuleForDialog
                                                    key={rule.id}
                                                    rule={rule}
                                                    handleChangePriority={() =>
                                                        handleChangePriority({
                                                            id: rule.id,
                                                            type: "close",
                                                        })
                                                    }
                                                    handleChangeRuleName={(newName: string) =>
                                                        handleChangeRuleName({
                                                            id: rule.id,
                                                            type: "close",
                                                            newName,
                                                        })
                                                    }
                                                    handleDeleteRule={() =>
                                                        handleDeleteRule({
                                                            id: rule.id,
                                                            type: "close",
                                                        })
                                                    }
                                                />
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="p-6 pt-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3">
                    <DialogClose asChild>
                        <CustomButton isBlack={false} className="h-10 px-6">
                            Cancel
                        </CustomButton>
                    </DialogClose>
                    <CustomButton
                        isBlack
                        type="submit"
                        disabled={submittingNewStrategy}
                        onClick={strategyNameEditing ? handleEditStrategy : createStrategy}
                        className="h-10 px-6"
                    >
                        {strategyNameEditing ? "Save Changes" : "Create Strategy"}
                    </CustomButton>
                </div>
            </DialogContent>
        </Dialog>
    );
}
