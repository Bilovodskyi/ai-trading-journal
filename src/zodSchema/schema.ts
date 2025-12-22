import { z } from "zod";

const ruleSchema = z.object({
    id: z.string(),
    rule: z.string(),
    satisfied: z.boolean(),
    priority: z.enum(["low", "medium", "high"]),
});

const closeEventSchema = z.object({
    id: z.string(),
    date: z.string(),
    time: z.string(),
    quantitySold: z.number(),
    sellPrice: z.number(),
    result: z.number(),
});

export const newTradeFormSchema = z.object({
    positionType: z.string().min(1, { message: "Position Type is required." }),
    openDate: z.string().min(1, { message: "Open date is required." }),
    openTime: z.string().min(1, { message: "Open time is required." }),
    closeDate: z.string().optional(),
    closeTime: z.string().optional(),
    isActiveTrade: z.boolean().default(true),
    deposit: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true;
            return /^[0-9]+(\.[0-9]+)?$/.test(val);
        }, {
            message: "Only positive numbers are allowed.",
        }),

    result: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true; // Allow empty for optional field
            return /^-?[0-9]+(\.[0-9]+)?$/.test(val);
        }, {
            message: "Only numbers are allowed.",
        }),
    instrumentName: z.string().optional(),
    symbolName: z.string().min(1, { message: "Symbol name is required." }),
    entryPrice: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true;
            return /^[0-9]+(\.[0-9]+)?$/.test(val);
        }, {
            message: "Only positive numbers are allowed.",
        }),
    totalCost: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true;
            return /^[0-9]+(\.[0-9]+)?$/.test(val);
        }, {
            message: "Only positive numbers are allowed.",
        }),
    quantity: z
        .string()
        .optional()
        .refine((val) => {
            if (val == null || val === "") return true;
            const num = Number(val);
            return Number.isFinite(num);
        }, {
            message: "Enter a valid number.",
        }),
    sellPrice: z
        .string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true;
            return /^[0-9]+(\.[0-9]+)?$/.test(val);
        }, {
            message: "Only positive numbers are allowed.",
        }),
    quantitySold: z
        .string()
        .optional()
        .refine((val) => {
            if (val == null || val === "") return true;
            const num = Number(val);
            return Number.isFinite(num);
        }, {
            message: "Enter a valid number.",
        }),

    strategyName: z.string().optional(),
    strategyId: z.string().optional().nullable(),
    appliedOpenRules: z.array(ruleSchema).optional().default([]),
    appliedCloseRules: z.array(ruleSchema).optional().default([]),
    closeEvents: z.array(closeEventSchema).optional().default([]),
    openOtherDetails: z.record(z.string(), z.string()).optional().default({}),
    closeOtherDetails: z.record(z.string(), z.string()).optional().default({}),
    notes: z.string().optional(),
    rating: z
        .number()
        .max(5, { message: "Rating cannot be more than 5" })
        .default(0),
});

export const addCapitalFormSchema = z.object({
    capital: z
        .string()
        .min(1, { message: "Deposit is required." })
        .regex(/^[0-9]+$/, { message: "Only positive numbers are allowed." }),
});
